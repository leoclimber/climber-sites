"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Peso, não resistência: usamos "lerp" (suavização exponencial contínua
// por frame), não "duration + easing". O Lenis reinicia o tween de
// duration/easing do zero A CADA evento de wheel (this.animate.fromTo
// na fonte da lib) — combinado com uma curva front-loaded tipo
// exponential-out (~82% do percurso nos primeiros 25% do tempo), isso
// fazia a rolagem "grudar" quase instantânea atrás do cursor a cada
// frame numa rolada forte, sobrando só uma cauda imperceptível no fim.
// Resultado percebido: parecia pular sem inércia nenhuma, mesmo com a
// curva certa aplicada matematicamente. lerp evita o problema porque
// não tem tween com relógio próprio pra reiniciar — a cada frame ele
// só anda uma fração (frame-rate-independent) da distância até o alvo
// atual, então o alvo pode mudar a cada wheel event sem "resetar" nada;
// o resultado é o momentum contínuo real que "peso" pede. Valor mais
// baixo = mais lag/peso percebido; mais alto = mais responsivo/snappy.
//
// Sincronização: todos os efeitos do site (hero, imersão, iris wipe,
// sobre nós, THE POUR) são Framer Motion useScroll, que lê o scroll
// nativo do documento — não GSAP ScrollTrigger (não tem GSAP nesse
// projeto). Como o Lenis, no modo padrão, suaviza a posição de scroll
// REAL do documento (não usa transform num wrapper), o useScroll do
// Framer acompanha automaticamente — não precisa de nenhum
// "ScrollTrigger.update()" manual, o equivalente aqui é só manter o
// rAF do Lenis rodando.
// Soft-snap: "hero" e "imersão" são a MESMA zona de scrub (Hero é um único
// pin de 150vh — texto saindo 0-25%, imersão 3D 25-80%, iris wipe revelando
// Sobre Nós 80-100% — tudo contínuo, sem fronteira real entre eles). Os
// anchors de verdade são os 3 pontos onde uma zona de scrub começa/termina:
// topo do Hero, fim do Hero (Sobre Nós já revelado e assentado — mesmo
// ponto onde o pin do Hero solta), e topo do THE POUR (onde o pin do vídeo
// engata). Calculados via getBoundingClientRect em tempo real (não
// cacheados) porque dependem de vh e mudam com resize.
function getScrollAnchors() {
  const hero = document.getElementById("hero");
  const pour = document.getElementById("pour");
  if (!hero || !pour) return null;

  const vh = window.innerHeight;
  const heroTop = hero.getBoundingClientRect().top + window.scrollY;
  const pourTop = pour.getBoundingClientRect().top + window.scrollY;

  return {
    heroStart: heroTop, // progresso 0 do Hero (texto entrando)
    aboutSettled: heroTop + hero.offsetHeight - vh, // progresso 1 do Hero (Sobre Nós revelado, pin solta)
    pourStart: pourTop, // progresso 0 do Pour (vídeo no tamanho cheio, pin engata)
    pourSettled: pourTop + pour.offsetHeight - vh, // progresso 1 do Pour (vídeo já encolhido na moldura)
  };
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Snap OBRIGATÓRIO só em Sobre Nós: o reveal (stagger do título + foto)
// toca uma vez e dura ~2s — se uma rolada forte atravessar o ponto de
// assentamento, a pessoa perde o efeito de vez. THE POUR não precisa disso
// (vídeo em loop, não perde nada) e Hero/imersão não precisa (é scrub
// contínuo, não dá pra pular sem atravessar).
//
// Implementado com a própria trava do Lenis (`stop()`/`start()`), não
// reimplementando wheel/touch na mão: ao cruzar aboutSettled na direção de
// avanço, força a posição exata pra lá e chama `stop()` — o próprio
// onWheel/touch do Lenis já faz `if (isStopped) preventDefault(); return`
// internamente, então absorve QUALQUER wheel/swipe subsequente
// (mesmo o resto de uma inércia forte de swipe no celular) até destravar.
// Destrava assim que um gesto NOVO e DISTINTO começa: um `wheel` depois de
// um hiato de silêncio (heurística de "gesto novo" pro mouse/trackpad,
// que não tem um evento de início/fim nativo) ou um `touchstart` (que já
// é um limite de gesto inequívoco). Os listeners de rastreio usam
// capture:true pra rodar ANTES do listener do próprio Lenis no mesmo
// alvo (window), garantindo que o primeiro tick do gesto novo já destrave
// a tempo de ser processado.
//
// 400ms (não 200ms): medido que a CAUDA de uma rolada forte real — vários
// ticks de wheel emitidos pelo SO durante a desaceleração da inércia —
// pode ter gaps de até ~270ms entre ticks individuais antes de parar de
// vez. Um limiar curto demais destrava no meio da própria rolada que
// devia travar.
const WHEEL_GESTURE_GAP_MS = 400;

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.6,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Todo o resto deste efeito é sobre snapping (obrigatório em Sobre Nós,
    // soft nos outros limites) — puro efeito de movimento extra em cima do
    // scroll, então nada disso roda com prefers-reduced-motion. No modo
    // reduzido o Hero nem renderiza o overlay de Sobre Nós (ver hero.tsx),
    // então o conceito de "gate em aboutSettled" nem se aplica.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    }

    let aboutGateActive = false;
    let prevScroll = window.scrollY;

    function handleLenisScroll(l: Lenis) {
      const anchors = getScrollAnchors();
      if (!anchors) {
        prevScroll = l.scroll;
        return;
      }
      const { aboutSettled } = anchors;

      // Já travado: re-clampa em TODO emit subsequente, não só no que
      // disparou o gate. O toque em mobile processa touchmove/touchend de
      // forma síncrona fora do ciclo de rAF que dispara este 'scroll' —
      // numa rajada rápida, um touchend pode empurrar a posição um pouco
      // além de aboutSettled ANTES do emit que detectaria o cruzamento
      // rodar. Reforçar em todo emit (não só uma vez) fecha essa brecha:
      // qualquer vazamento é corrigido no próximo emit, não passa batido.
      if (aboutGateActive) {
        if (l.scroll !== aboutSettled) {
          lenis.scrollTo(aboutSettled, { immediate: true, force: true });
        }
        prevScroll = aboutSettled;
        return;
      }

      if (l.direction >= 0 && prevScroll < aboutSettled && l.scroll >= aboutSettled) {
        aboutGateActive = true;
        lenis.scrollTo(aboutSettled, { immediate: true, force: true });
        lenis.stop();
        prevScroll = aboutSettled;
        return;
      }

      prevScroll = l.scroll;
    }
    lenis.on("scroll", handleLenisScroll);

    let lastWheelTime = 0;
    function trackWheelGesture() {
      const now = performance.now();
      if (aboutGateActive && now - lastWheelTime > WHEEL_GESTURE_GAP_MS) {
        aboutGateActive = false;
        lenis.start();
      }
      lastWheelTime = now;
    }
    function trackTouchGesture() {
      if (aboutGateActive) {
        aboutGateActive = false;
        lenis.start();
      }
    }
    window.addEventListener("wheel", trackWheelGesture, {
      capture: true,
      passive: true,
    });
    window.addEventListener("touchstart", trackTouchGesture, {
      capture: true,
      passive: true,
    });

    // Soft-snap: só arma fora das zonas de scrub — dentro da imersão (Hero
    // inteiro, já que é um scrub só) e do encolhimento do vídeo (Pour), fica
    // completamente desarmado, a pessoa rola livre. Só corrige quando o
    // scroll assenta no "vão" de transição entre um pin e o outro — ali a
    // rolagem já é normal (não scrub), então empurrar pro limite mais
    // próximo (na direção em que a pessoa já estava indo) não atropela
    // nenhum efeito. THE POUR fica só com esse soft-snap (não é obrigatório
    // como Sobre Nós porque o vídeo é loop, não perde nada se pular).
    function onScrollEnd() {
      const anchors = getScrollAnchors();
      if (!anchors) return;
      const { heroStart, aboutSettled, pourStart, pourSettled } = anchors;
      const y = window.scrollY;

      const insideHeroScrub = y >= heroStart && y <= aboutSettled;
      const insidePourScrub = y >= pourStart && y <= pourSettled;
      if (insideHeroScrub || insidePourScrub) return;

      // Vão entre o fim do Hero (Sobre Nós assentado) e o início do Pour
      // (pin do vídeo engatando) — o único trecho "solto" entre as duas
      // zonas protegidas.
      if (y > aboutSettled && y < pourStart) {
        const target = lenis.direction >= 0 ? pourStart : aboutSettled;
        lenis.scrollTo(target, { duration: 0.9, easing: easeOutCubic });
      }
      // Antes do Hero ou depois do Pour: sem anchor pedido, não mexe.
    }
    window.addEventListener("scrollend", onScrollEnd);

    return () => {
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("wheel", trackWheelGesture, { capture: true });
      window.removeEventListener("touchstart", trackTouchGesture, {
        capture: true,
      });
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
