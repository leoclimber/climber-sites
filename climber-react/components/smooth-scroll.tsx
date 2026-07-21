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
// engata). Calculados via getBoundingClientRect (dependem de vh, por isso
// recalculados no resize, não hardcoded) — mas arredondados com Math.round:
// getBoundingClientRect() devolve sub-pixel (fração), enquanto o scrollY que
// o navegador de fato aplica depois de um scrollTo é sempre inteiro. Um
// anchor fracionário (ex: 3240.4) nunca é alcançável de verdade — o scroll
// assenta em 3240 ou 3241 e o gate never vê drift 0, ficando preso num
// "quase lá" que reaciona pra sempre (era a causa do RangeError de call
// stack: scrollTo(alvo fracionário) -> assenta arredondado -> drift pequeno
// mas != 0 -> corrige de novo -> emit -> mesmo drift -> loop infinito).
function computeScrollAnchors() {
  const hero = document.getElementById("hero");
  const pour = document.getElementById("pour");
  const menu = document.getElementById("menu");
  if (!hero || !pour || !menu) return null;

  const vh = window.innerHeight;
  const heroTop = hero.getBoundingClientRect().top + window.scrollY;
  const pourTop = pour.getBoundingClientRect().top + window.scrollY;
  const menuTop = menu.getBoundingClientRect().top + window.scrollY;

  return {
    heroStart: Math.round(heroTop), // progresso 0 do Hero (texto entrando)
    aboutSettled: Math.round(heroTop + hero.offsetHeight - vh), // progresso 1 do Hero (Sobre Nós revelado, pin solta)
    pourStart: Math.round(pourTop), // progresso 0 do Pour (vídeo no tamanho cheio, pin engata)
    // SEM "-vh" nem "-childHeight": o useScroll do Pour usa offset
    // ["start start","end start"] (ver pour.tsx) — progresso 1 acontece
    // quando o FUNDO da section toca o TOPO da viewport, ou seja,
    // scrollY == pourTop + pour.offsetHeight, exatamente onde o Menu
    // (próxima seção, fluxo normal) começa. Por isso bate exato com
    // menuStart logo abaixo (mesmo cálculo, mesmo número).
    pourSettled: Math.round(pourTop + pour.offsetHeight), // progresso 1 do Pour (vídeo já encolhido na moldura, pin solta)
    menuStart: Math.round(menuTop), // início real do conteúdo do Menu
  };
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Snap OBRIGATÓRIO em dois pontos: Sobre Nós (aboutSettled) e o fim do
// encolhimento do vídeo em THE POUR (pourSettled). Sobre Nós: o reveal
// (stagger do título + foto) toca uma vez e dura ~2s — se uma rolada forte
// atravessar o ponto de assentamento, a pessoa perde o efeito de vez.
// THE POUR: sem a âncora, uma rolada forte atravessa o encaixe do vídeo na
// moldura direto pro vão seguinte — a pessoa nunca registra que aquilo é
// um vídeo de verdade, só viu ele encolher e sumir. Precisa de um beat
// parado ali (chegou, viu que é vídeo) antes de seguir. Hero/imersão não
// precisa (é scrub contínuo, não dá pra pular sem atravessar).
//
// Implementado com a própria trava do Lenis (`stop()`/`start()`), não
// reimplementando wheel/touch na mão: ao cruzar o anchor na direção de
// avanço, força a posição exata pra lá e chama `stop()` — o próprio
// onWheel/touch do Lenis já faz `if (isStopped) preventDefault(); return`
// internamente, então absorve QUALQUER wheel/swipe subsequente
// (mesmo o resto de uma inércia forte de swipe no celular) até destravar.
// Só um anchor fica ativo por vez (estão em posições de scroll diferentes),
// por isso um único par de variáveis (gateActive/gateTarget) serve pros dois.
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

// Distingue um vazamento de corrida (touchend processa fora do ciclo de
// rAF que detecta o cruzamento, empurra a posição uns px além ANTES do
// gate travar de vez — medido até ~40px, mas o timing varia com o
// dispositivo/navegador, então não dá pra confiar numa janela de tempo)
// de um salto GRANDE e deliberado (scrollIntoView, link-âncora): esse
// é sempre uma distância grande. Abaixo do limiar -> corrida, re-clampa.
// Acima -> navegação de verdade, deixa passar e já destrava o gate.
const GATE_LEAK_THRESHOLD_PX = 200;

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
    //
    // TOUCH (pointer: coarse) também sai cedo, e por um motivo diferente:
    // por padrão (sem `syncTouch: true`, que não usamos) o Lenis NÃO
    // intercepta touch nenhum — ele deixa o scroll nativo do celular
    // acontecer direto e só observa a posição resultante (ver onNativeScroll
    // na lib). O `lenis.stop()` do gate abaixo, porém, faz TODO evento de
    // touch (não só o gesto que cruzou o anchor) levar preventDefault
    // enquanto isStopped for true — inclusive o scroll nativo. O
    // destravamento (trackTouchGesture em touchstart) foi desenhado e só
    // testado via wheel de mouse em Playwright desktop; touch real (dedo
    // fica apoiado atravessando um touchmove que cruza o anchor MEIO do
    // gesto, sem touchstart novo até o dedo levantar) tem uma janela onde a
    // rolagem trava de vez e não há teste automatizado cobrindo isso.
    // Em vez de tentar provar essa máquina de estado correta pra touch real
    // (que exigiria dispositivo físico, não só emulação), a saída segura é
    // não ativar o gate nele — mobile fica só com o Lenis base (scroll
    // nativo, já suave o bastante no dedo) sem nenhum stop()/start() custom.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion || isTouchDevice) {
      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    }

    // Cacheado, não recalculado a cada 'scroll' — getBoundingClientRect a
    // cada frame de scroll (potencialmente dezenas por segundo, inclusive
    // reentrante durante um snap, ver isSnapping abaixo) é caro à toa: a
    // posição documento dos anchors só muda com resize (vh) ou mudança de
    // layout, não com o próprio scroll. Recalcula no mount e no resize.
    let anchors = computeScrollAnchors();
    function refreshAnchors() {
      anchors = computeScrollAnchors();
    }
    window.addEventListener("resize", refreshAnchors);

    let gateActive = false;
    let gateTarget = 0;
    let prevScroll = window.scrollY;

    // Reentrância: TODO scrollTo (mesmo immediate) dispara um `emit()`
    // síncrono dentro da própria chamada, que re-invoca handleLenisScroll
    // ANTES de scrollTo retornar (stack: handleLenisScroll -> scrollTo ->
    // emit -> handleLenisScroll de novo). isSnapping é o guard que corta
    // esse reentro: enquanto um snap nosso está em curso, o handler nem
    // olha os anchors, só atualiza prevScroll e sai — nenhuma chamada de
    // scrollTo pode nascer de dentro de outra. Some junto com o Math.round
    // dos anchors (a causa raiz do loop: alvo fracionário vs. scrollY
    // sempre inteiro), mas fica como segunda trava — se algum outro drift
    // inesperado aparecer, ele não vira um novo RangeError.
    let isSnapping = false;
    let snapSafetyTimeout: ReturnType<typeof setTimeout> | undefined;

    function snapImmediate(target: number) {
      isSnapping = true;
      lenis.scrollTo(target, { immediate: true, force: true });
      isSnapping = false;
    }

    // Soft-snap (duration-based) roda em várias frames — precisa do
    // onComplete pra destravar no fim natural do glide, MAS se um novo
    // scroll do usuário interromper o tween no meio, o Lenis nunca chama
    // esse onComplete (o tween antigo é só substituído por um novo) —
    // sem o timeout de segurança, isSnapping ficaria travado true pra
    // sempre e o handler pararia de reagir a qualquer anchor depois disso.
    function snapSoft(target: number) {
      isSnapping = true;
      clearTimeout(snapSafetyTimeout);
      lenis.scrollTo(target, {
        duration: 0.9,
        easing: easeOutCubic,
        onComplete: () => {
          isSnapping = false;
        },
      });
      snapSafetyTimeout = setTimeout(() => {
        isSnapping = false;
      }, 1500);
    }

    function handleLenisScroll(l: Lenis) {
      if (isSnapping) {
        prevScroll = l.scroll;
        return;
      }
      if (!anchors) {
        prevScroll = l.scroll;
        return;
      }
      const { aboutSettled } = anchors;

      if (gateActive) {
        const drift = l.scroll - gateTarget;
        if (drift > 0 && drift < GATE_LEAK_THRESHOLD_PX) {
          // Vazamento pequeno (corrida do touchend) — corrige.
          snapImmediate(gateTarget);
          prevScroll = gateTarget;
          return;
        }
        if (drift >= GATE_LEAK_THRESHOLD_PX || drift < 0) {
          // Salto grande (navegação externa tipo scrollIntoView) ou já
          // voltou pra antes do anchor — não é a corrida que o gate
          // existe pra pegar. Deixa passar e destrava, senão o wheel/touch
          // ficaria preso num isStopped que essa navegação externa nunca
          // vai destravar sozinha.
          gateActive = false;
          lenis.start();
          prevScroll = l.scroll;
          return;
        }
        prevScroll = gateTarget;
        return;
      }

      // Único hard anchor: fim do Hero (Sobre Nós assentado). O anchor do
      // fim do encolhimento do vídeo em THE POUR (pourSettled) foi
      // removido de propósito — depois do encaixe, o Pour virou rolagem de
      // página comum (seção sobe e sai, ver pour.tsx #pour-static), então
      // travar o scroll ali contradiz o próprio pedido ("seção empurra
      // seção", sem transição/corte). Sem esse gate, a pessoa atravessa o
      // ponto de encaixe do vídeo na mesma rolada contínua, como em
      // qualquer transição normal entre seções.
      const hardAnchors = [aboutSettled];
      for (const anchor of hardAnchors) {
        if (l.direction >= 0 && prevScroll < anchor && l.scroll >= anchor) {
          gateActive = true;
          gateTarget = anchor;
          snapImmediate(anchor);
          lenis.stop();
          prevScroll = anchor;
          return;
        }
      }

      prevScroll = l.scroll;
    }
    lenis.on("scroll", handleLenisScroll);

    let lastWheelTime = 0;
    function trackWheelGesture() {
      const now = performance.now();
      if (gateActive && now - lastWheelTime > WHEEL_GESTURE_GAP_MS) {
        gateActive = false;
        lenis.start();
      }
      lastWheelTime = now;
    }
    function trackTouchGesture() {
      if (gateActive) {
        gateActive = false;
        lenis.start();
      }
    }
    // Teclado (PageDown/ArrowDown/Space/End/...) também conta como "gesto
    // novo" — sem isso, alguém navegando por teclado ficaria com o wheel
    // destravando mas o teclado nunca, uma inconsistência de acessibilidade
    // desnecessária.
    function trackKeyGesture() {
      if (gateActive) {
        gateActive = false;
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
    window.addEventListener("keydown", trackKeyGesture, {
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
      if (isSnapping || !anchors) return;
      const { heroStart, aboutSettled, pourStart, pourSettled } = anchors;
      const y = window.scrollY;

      const insideHeroScrub = y >= heroStart && y <= aboutSettled;
      const insidePourScrub = y >= pourStart && y <= pourSettled;
      if (insideHeroScrub || insidePourScrub) return;

      // Vão 1: fim do Hero (Sobre Nós assentado) -> início do Pour (pin do
      // vídeo engatando).
      if (y > aboutSettled && y < pourStart) {
        const target = lenis.direction >= 0 ? pourStart : aboutSettled;
        snapSoft(target);
        return;
      }
      // "Vão 2" (pourSettled -> menuStart) foi removido de propósito.
      // Depois do encaixe do vídeo (pourSettled), #pour-static (ver
      // pour.tsx) e #menu são só seções normais de página, uma embaixo da
      // outra, sem pin nenhum ali — é rolagem comum, exatamente como o
      // resto de qualquer site. Um soft-snap ali empurraria a pessoa por
      // cima de uma seção inteira sempre que a rolagem assentasse nesse
      // trecho, o que é o oposto de "seção empurra seção".
      // Antes do Hero ou depois do Menu: sem anchor pedido, não mexe.
    }
    window.addEventListener("scrollend", onScrollEnd);

    return () => {
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("resize", refreshAnchors);
      window.removeEventListener("wheel", trackWheelGesture, { capture: true });
      window.removeEventListener("touchstart", trackTouchGesture, {
        capture: true,
      });
      window.removeEventListener("keydown", trackKeyGesture, { capture: true });
      clearTimeout(snapSafetyTimeout);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
