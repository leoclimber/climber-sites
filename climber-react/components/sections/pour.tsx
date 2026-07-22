"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

// Medido via scan de pixels em banco/cafe/galeria.jpg (múltiplas linhas
// cruzadas, não estimado): onde o conteúdo claro (rosa/branco/prata) da
// "tela" termina e a transição escura pro entorno começa. Essas % são
// relativas à IMAGEM (2560x1387), não ao viewport — por isso são
// constantes: o container-pai abaixo garante que a imagem nunca é
// cortada, então essa mesma % sempre cai no mesmo lugar visual.
// Ajuste: a medição original (onde o CONTEÚDO claro termina) deixava a
// fina faixa avermelhada do bezel físico visível entre o vídeo e a
// madeira — o pedido foi cobrir até TOCAR a madeira, eliminando essa
// faixa por completo. Topo/esquerda/direita confirmados corretos (não
// mexer). Base: +1.5pp de altura — ainda sobrava uma fina linha da
// moldura original embaixo, top/left/width intocados.
const FRAME = {
  top: 25.7, // %
  left: 32.3, // %
  width: 35.55, // %
  height: 42.55, // % (era 41.05 — +1.5pp só na base)
};

// Aspect ratio REAL da imagem (medido: 2560x1387 = 1.84571). NÃO é 16:9
// (1.77778) — usar 16:9 aqui esticaria/distorceria a foto, já que o
// container usa object-fit:fill (sem crop, sem preservar proporção
// sozinho). É essa correspondência exata que faz "a conta fechar".
const IMAGE_ASPECT = 2560 / 1387;

// O container-pai (aspect-ratio real da imagem, width:100vw) pode ficar
// mais baixo que 100vh dependendo do viewport — a imagem nunca é
// cortada, então sobra "letterbox" em cima/embaixo. O vídeo entra como
// filho desse mesmo container (não do viewport), então seu estado
// inicial "cobre 100vw x 100vh" precisa ser expresso em % relativas ao
// container — geometria pura (altura do container vs altura do
// viewport), não uma estimativa de corte como no método antigo.
function useCoverStartInContainer() {
  const [start, setStart] = useState({ top: 0, height: 100 });

  useEffect(() => {
    function compute() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const containerHeightPx = vw / IMAGE_ASPECT; // container width == vw sempre
      // +0.6% de overscan: garante cobertura total mesmo com qualquer
      // arredondamento sub-pixel entre o aspect-ratio nativo do CSS e
      // este cálculo em JS — sem isso um fiapo de fundo podia aparecer
      // na borda no estado inicial.
      const heightPct = (vh / containerHeightPx) * 100 + 0.6;
      const topPct = (100 - heightPct) / 2; // centralizado; negativo se container < viewport
      setStart({ top: topPct, height: heightPct });
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return start; // left e width do estado inicial são sempre 0 e 100 (container width == vw)
}

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
}

// #pour-static (ver return abaixo) fica montada desde o load, bem abaixo
// da dobra, por vários segundos até o scroll alcançar ela — vídeos
// <video autoplay> fora da viewport nessa situação ficam sujeitos ao
// throttling de decode que os navegadores aplicam a mídia invisível (não
// é um bug deste código: é o navegador suspendendo/nunca iniciando o
// decode de um <video> que nunca ficou visível). Resultado observado:
// autoplay "pega" no load mas o decode fica suspenso, e quando a moldura
// finalmente entra em cena o elemento mostra só o quadro preto inicial.
// Corrigido não confiando no autoplay passivo: observa a própria section
// com IntersectionObserver (threshold 0 — qualquer pedação visível conta)
// e chama play()/pause() explicitamente a cada mudança. play() enquanto
// visível (mesmo parcial) garante decode ativo bem antes/durante o tempo
// em que a moldura aparece; pause() só dispara quando a section sai
// INTEIRA da viewport (isIntersecting vira false), exatamente a regra
// pedida.
function usePlayWhileVisible<T extends HTMLElement>() {
  const sectionRef = useRef<T>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return { sectionRef, videoRef };
}

// Vídeo pinado (o que anima fullscreen->moldura): ao contrário do vídeo de
// #pour-static (montado uma vez só, pra sempre), este RE-MONTA toda vez
// que `settled` volta a false (ver comentário no gate lá em Pour()) — o
// pai desmonta/remonta o bloco inteiro via `{!settled && (...)}`, o que
// destrói o <video> antigo e cria um NOVO do zero a cada reversão de
// direção perto do encaixe. Um <video> recém-criado sofre o MESMO
// throttling de decode que o autoplay passivo already sofria em
// #pour-static (mesma causa, ver comentário de usePlayWhileVisible acima)
// — só que aqui "invisível" é o instante entre o elemento antigo morrer e
// o novo decodificar sozinho, lido como o vídeo "congelando" ao rolar de
// volta pra cima. Mesma correção: usePlayWhileVisible, chamado a partir
// de um componente PRÓPRIO (não dá pra chamar o hook condicionalmente
// dentro do `{!settled && ...}` do pai — violaria Rules of Hooks). Como
// ESTE componente inteiro monta/desmonta em uníssono com o <video>, seu
// useEffect roda do zero a cada remount, observando sempre o elemento
// ATUAL — nunca uma referência presa a um <video> já destruído.
function PinnedVideo({
  xPercent,
  yPercent,
  scaleX,
  scaleY,
}: {
  xPercent: MotionValue<string>;
  yPercent: MotionValue<string>;
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
}) {
  const { sectionRef, videoRef } = usePlayWhileVisible<HTMLDivElement>();

  return (
    <motion.div
      ref={sectionRef}
      className="pour-video-mask absolute inset-0 overflow-hidden bg-black"
      style={{
        x: xPercent,
        y: yPercent,
        scaleX,
        scaleY,
        z: 0,
        opacity: 1,
        transformOrigin: "0% 0%",
        willChange: "transform",
      }}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        style={{ opacity: 1, mixBlendMode: "normal" }}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/video/pour/pour-loop-mobile.mp4" media="(max-width: 767px)" />
        <source src="/video/pour/pour-loop.mp4" />
      </video>
    </motion.div>
  );
}

// Label "( THE ROOM )" acima da moldura e frase+linha+EST abaixo —
// compartilhados entre a versão PINADA (dentro do scrub) e a versão
// SETTLED (#pour-static), ambas em Pour() abaixo. `opacity` recebe
// SEMPRE `easedProgress` (a MESMA motion value que já controla o scale
// do vídeo, nunca um valor novo) — como o texto já está com opacity ~1
// bem ANTES de settled virar true (a mesma curva do vídeo encaixando),
// não existe mais "pop" de opacity na troca.
// Posicionamento: absolute, ANCORADO ÀS BORDAS do container-pai (a
// caixa aspect-ratio da imagem/vídeo — ver `relative` no pai em Pour()),
// não mais um wrapper flex-col compartilhando a centralização com a
// caixa. bottom/top:calc(100% + 6vh) é SEMPRE 6vh de distância da
// borda da caixa, ponto — não depende da altura total do conjunto nem
// de como o pai é centralizado (achado medindo: a versão anterior, com
// tudo dentro de um flex-col centralizado via translate-y:-50%,
// redistribuía o espaço livre de um jeito que não dava pra prever/
// controlar o respiro final). Com isso a caixa da imagem/vídeo em si
// fica NO MESMO LUGAR de antes de existir label/caption (label/caption
// são absolute, não contam pro tamanho do pai) — desktop (onde ambos
// são display:none) não muda nem um pixel, e o pinado/settled batem
// pixel a pixel no mesmo ponto de handoff, sem depender de math de
// centralização coletiva.
// display:none por padrão (inline, sempre aplicado) — só vira
// block/flex dentro do media query mobile (.pour-mobile-label/-caption
// em Pour()).
function PourLabel({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <div
      className="pour-mobile-label absolute inset-x-0 text-center uppercase"
      style={{ display: "none", bottom: "calc(100% + 6vh)" }}
    >
      <motion.span
        className="block"
        style={{
          fontFamily: "var(--font-archivo)",
          fontSize: "0.7rem",
          letterSpacing: "0.3em",
          color: "#C89B6A",
          opacity,
        }}
      >
        ( THE ROOM )
      </motion.span>
    </div>
  );
}

// Mesma ancoragem absolute (top:calc(100% + 6vh), 6vh fixos abaixo da
// borda de baixo da caixa) — previsível e mensurável, ao contrário do
// vão morto que sobrava com o flex-col centralizado da leva anterior.
function PourCaption({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <div
      className="pour-mobile-caption absolute inset-x-0 flex-col items-center text-center"
      style={{ display: "none", top: "calc(100% + 6vh)" }}
    >
      <motion.p
        style={{
          fontFamily: "var(--font-instrument-serif)",
          fontStyle: "italic",
          fontSize: "clamp(1.3rem, 5vw, 1.8rem)",
          color: "#EDE7DC",
          opacity,
        }}
      >
        Where every cup begins.
      </motion.p>
      <motion.div
        style={{ width: 60, height: 1, backgroundColor: "#C89B6A", marginTop: "3vh", opacity }}
      />
      <motion.span
        className="uppercase"
        style={{
          fontFamily: "var(--font-archivo)",
          fontSize: "0.65rem",
          letterSpacing: "0.25em",
          color: "#8a7d6a",
          marginTop: "2vh",
          opacity,
        }}
      >
        EST. 2019 · DUBLIN
      </motion.span>
    </div>
  );
}

export function Pour() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const start = useCoverStartInContainer();
  const { sectionRef: pourStaticRef, videoRef: pourStaticVideoRef } =
    usePlayWhileVisible<HTMLElement>();

  // offset ["start start", "end start"] (não "end end"): progresso 1 no
  // instante em que o FUNDO da section toca o TOPO da viewport — ou seja,
  // scrollY == wrapperTop + wrapperHeight, que é EXATAMENTE onde o Menu
  // (próxima seção, fluxo normal) começa. Com "end end" (fórmula antiga),
  // progresso 1 exige wrapperHeight = scrub + 1vh (pra um scrub de 150vh,
  // wrapperHeight teria que ser 250vh) — e o Menu, seguindo no fluxo
  // normal, só começa em wrapperTop+250vh, 100vh (1 viewport) DEPOIS do
  // progresso bater 1. Esse resto de 100vh é matemática pura da fórmula
  // "end end", não vem de sticky nem de childHeight nenhum — é por isso
  // que só trocar a altura do filho sticky nunca eliminava o vão (medido
  // em três tentativas diferentes). Com "end start", wrapperHeight=150vh
  // já entrega os dois: scrub de exatos 150vh E progresso 1 cai no mesmo
  // scrollY onde o Menu já está.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Emula o "scrub:3" do GSAP (lag numérico de suavização, não
  // scrub:true/instantâneo) via spring mole.
  const laggedProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 1,
  });

  const easedProgress = useTransform(laggedProgress, (p) =>
    easeInOutQuint(Math.max(0, Math.min(1, p)))
  );

  // Trava de exclusão mútua ADICIONAL (mobile), por cima do mount/
  // unmount via `settled` (que continua intocado, ver abaixo) — não
  // troca QUANDO o swap acontece, só reforça que NUNCA aparecem os
  // dois ao mesmo tempo. Motivo de existir: `settled` é estado React
  // (muda só depois de um re-render completar), enquanto estas duas
  // MotionValues são aplicadas direto no DOM pelo Framer a cada frame
  // de scroll, sem esperar o ciclo do React — fecham a janela onde,
  // numa rolada rápida, o React ainda não processou `settled=true` mas
  // o scroll já passou do ponto de encaixe (visto: as duas cenas
  // apareciam juntas por um instante, com "EST." duplicado, bem nessa
  // janela). display:none (não opacity) por pedido — remove a caixa do
  // render tree por completo, não só some visualmente, então não sobra
  // NADA pra um layer de GPU compor por engano por cima do outro.
  // Mesmo limiar (scrollYProgress>=1) do próprio `settled`, só que lido
  // direto da motion value crua, não do estado.
  const pinnedDisplay = useTransform(scrollYProgress, (p) => (p >= 1 ? "none" : "block"));
  const staticDisplay = useTransform(scrollYProgress, (p) => (p >= 1 ? "block" : "none"));

  // "settled" == scrollYProgress CRU (não o spring) bateu 1 == vídeo já
  // encaixado na moldura E o sticky (filho de 1px, ver return abaixo)
  // acabou de soltar. Descoberta medindo (não estimada), em duas etapas:
  // 1) só trocar a altura do filho sticky não adianta nada — quem decide
  //    onde o Menu começa é a altura da SECTION (fluxo normal), não a do
  //    filho; resolvido trocando o offset pra "end start" (ver acima).
  // 2) com a section do tamanho exato e o filho sticky encolhido a 1px
  //    (precisa ser ~0 pra ficar "grudado" pelos 150vh inteiros do
  //    scrub, não só uma fração), o conteúdo (imagem+vídeo), sendo
  //    position:absolute preso a ESSE filho, continua existindo e
  //    "deslizando" normalmente por cima do Menu depois que o filho
  //    solta — o filho em si é minúsculo, mas o conteúdo dentro dele não
  //    é, e ele não desaparece sozinho só porque o pin acabou. Resolvido
  //    desmontando o conteúdo (não só escondendo com opacity) no exato
  //    instante em que settled vira true: no frame anterior o vídeo já
  //    está 100% encaixado (é a ÚLTIMA coisa que devia aparecer mesmo),
  //    então tirar do DOM ali não cort a nada — só impede o resto de
  //    ficar visível deslizando por cima do Menu.
  const [settled, setSettled] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p >= 1) setSettled(true);
    else if (p < 0.98) setSettled(false);
  });
  useEffect(() => {
    setSettled(scrollYProgress.get() >= 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Interpola em % relativas ao container-pai (aspect-ratio real da
  // imagem) do estado "cobre 100vw/100vh" (calculado, pode passar de
  // 0-100% de propósito — cobre além do container quando ele é
  // letterboxed) até a moldura medida.
  // Mesmo +0.6% de overscan no eixo horizontal, mesma razão: garante
  // cobertura total de borda a borda no estado inicial.
  const top = useTransform(easedProgress, [0, 1], [start.top, FRAME.top]);
  const left = useTransform(easedProgress, [0, 1], [-0.3, FRAME.left]);
  const width = useTransform(easedProgress, [0, 1], [100.6, FRAME.width]);
  const height = useTransform(easedProgress, [0, 1], [start.height, FRAME.height]);

  // transform:scale (não width/height) por performance — GPU-composited,
  // sem recalcular layout a cada frame. translate(left,top) + scale
  // compõem a posição/tamanho exatos a partir da caixa base 100%x100%,
  // com transform-origin:0 0 (topo-esquerda fixo).
  const scaleX = useTransform(width, (w) => w / 100);
  const scaleY = useTransform(height, (h) => h / 100);
  const xPercent = useMotionTemplate`${left}%`;
  const yPercent = useMotionTemplate`${top}%`;

  if (prefersReducedMotion) {
    return (
      <section id="pour" className="relative w-full overflow-hidden bg-black">
        <div className="relative w-full" style={{ aspectRatio: IMAGE_ASPECT }}>
          <Image
            src="/images/pour/galeria.jpg"
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "fill" }}
          />
          <div
            className="absolute overflow-hidden bg-black"
            style={{
              top: `${FRAME.top}%`,
              left: `${FRAME.left}%`,
              width: `${FRAME.width}%`,
              height: `${FRAME.height}%`,
            }}
          >
            <video className="h-full w-full object-cover" autoPlay muted loop playsInline>
              <source src="/video/pour/pour-loop-mobile.mp4" media="(max-width: 767px)" />
              <source src="/video/pour/pour-loop.mp4" />
            </video>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Mobile (<768px) só: no desktop, #pour precisa dos 150vh inteiros
          pra o scrub do vídeo rodar (ver useScroll acima) — mas a cena é
          uma imagem HORIZONTAL (2560x1387) que, numa tela estreita, sobra
          bem mais baixa que 100vh, deixando letterbox preto em cima/baixo
          da faixa de conteúdo real durante o pin. Uma leva anterior
          colapsava #pour pra 1px aqui — isso matava o vazio, mas também
          matava o RANGE de scroll: scrollYProgress ia de 0 a 1 em ~1px,
          então o vídeo "pulava" de fullscreen pra encaixado (e vice-versa
          ao inverter) em vez de encolher suave, porque não sobrava
          distância nenhuma pra a interpolação (useTransform em
          easedProgress, ver acima) rodar por cima.
          Correção: dar ao mobile um range PRÓPRIO (300vh — nem os 150vh
          do desktop, nem o 1px que pulava) — grande o bastante pra a
          mesma curva easeInOutQuint (ver função acima, intocada) ter
          distância de sobra pra interpolar gradual em qualquer velocidade
          de swipe, sem precisar do range gigante do desktop. O vazio
          preto ao redor da moldura durante o pin volta a existir (mesmo
          motivo de antes: cena horizontal em tela estreita) — esperado
          pra esta leva, fica pra encher com texto depois.
          Sem tocar a altura BASE (150vh, usada pelo useScroll pra medir
          scrollYProgress no desktop): !important aqui só entra no media
          query, então a medição do desktop (getBoundingClientRect lê o
          elemento renderizado, não o valor da prop) nunca muda >=768px. */}
      {/* BUG A (piscar preto<->#1C1614): no mobile, .pour-scrub-wrapper
          (bg-black, Tailwind), .pour-safety-backdrop (bg-black) e
          .pour-video-mask (bg-black — a caixa que veste o vídeo, tanto no
          PinnedVideo animado quanto no #pour-static assentado) ficavam
          pretos puros enquanto #pour-static (sempre #1C1614, nunca mudou)
          é a próxima coisa a aparecer assim que o pin solta — cruzar essa
          fronteira trocava de cor num frame só. Sem tocar as classes
          Tailwind em si (bg-black continua valendo pro desktop, que não
          pode mudar): só sobrescreve a COR aqui dentro do media query,
          então essas mesmas 3 caixas ficam #1C1614 desde o início no
          mobile — nunca há transição de cor nenhuma pra cruzar. */}
      <style>{`
        @media (max-width: 768px) {
          .pour-scrub-wrapper {
            height: 300vh !important;
            background-color: #1C1614 !important;
          }
          .pour-static-frame {
            min-height: 100vh !important;
          }
          .pour-safety-backdrop {
            background-color: #1C1614 !important;
            /* 100vh (prop original) e a altura REAL do viewport visível
               divergem nesse range (achado medindo, não estimado — mesma
               categoria de bug do .hero-sticky em globals.css: barra de
               endereço/toolbar do mobile some do cálculo de vh mas o
               valor não reflete o viewport JÁ recolhido). Sobra uma tira
               sem cobertura embaixo do backdrop onde #pour-static (que já
               está fisicamente presente ali, só esperando o scroll
               alcançar) aparecia visível por baixo, ANTES do pin soltar —
               achado só depois de encher o bloco pinado com o novo
               label/caption (mais alto que antes), que fez a tira
               descoberta coincidir com conteúdo de verdade em vez de
               vazio. 100dvh acompanha o viewport JÁ recolhido ao vivo,
               fecha a tira. */
            height: 100dvh !important;
          }
          .pour-video-mask {
            background-color: #1C1614 !important;
          }
          .pour-mobile-label {
            display: block !important;
          }
          .pour-mobile-caption {
            display: flex !important;
          }
        }
      `}</style>
      {/* Sem ScrollTrigger pin real (Nothing também não usa) — pin feito do
          mesmo jeito que hero/about: wrapper alto + sticky. Wrapper com a
          altura EXATA do scrub (150vh + 1px, ver offset acima) — sem sobra.
          Filho sticky de 1px (não h-screen): precisa ficar "grudado" pelos
          150vh inteiros do scrub, e o "range preso" de um sticky é sempre
          (altura-do-wrapper − altura-do-filho) — com wrapper=150vh, o filho
          só pode ser ~0 pra não cortar o scrub pela metade.

          z-10 explícito (achado medindo, não estimado): sem isso, o texto do
          Menu (seção estática normal, sem position) aparecia visível por
          cima da galeria/vídeo sempre que as duas caixas se sobrepunham na
          viewport durante o pin — mesmo a section aqui sendo position:
          relative. Explícito remove a ambiguidade, igual ao z-20 que hero.tsx
          já usa pro mesmo tipo de garantia. */}
      <section
        id="pour"
        ref={containerRef}
      className="pour-scrub-wrapper relative z-10 w-full bg-black"
      style={{ height: "calc(150vh + 1px)" }}
    >
      <div className="sticky top-0 w-full" style={{ height: "1px" }}>
        {/* Conteúdo inteiro desmonta no instante "settled" (ver hook
            acima) — não é só escondido (opacity/visibility): sendo
            position:absolute preso a este filho de 1px, se ficasse
            montado continuaria "deslizando" visível por cima do Menu
            pelos ~1000px da própria altura (achado medindo — é o que
            gerava o vão de novo, só que pela altura do CONTEÚDO em vez
            da do filho). Desmontar exatamente quando deixa de ser a
            última coisa que devia aparecer resolve os dois. */}
        {!settled && (
          <>
            {/* Fundo de segurança: 100vh cheios, independente do tamanho
                computado da imagem/aspect-ratio abaixo — sem isso,
                qualquer folga de meio-pixel entre a imagem letterboxed e
                a borda da viewport deixava passar uma fresta do Menu por
                baixo (achado medindo). */}
            <div className="pour-safety-backdrop absolute inset-x-0 top-0 bg-black" style={{ height: "100vh" }} />
            {/* Container-pai: aspect-ratio REAL da imagem, width:100%,
                max-width:100vw, centralizado verticalmente. object-fit:
                fill (não cover) — a imagem nunca é cortada, então a % da
                moldura medida acima cai sempre no mesmo lugar visual, em
                qualquer tela. Sem overflow:hidden em nenhum ancestor
                (achado medindo): clipa o conteúdo sticky à porção do
                PRÓPRIO BOX DO ANCESTOR que ainda resta "à frente" na
                viewport, não à viewport inteira — perto do fim do scrub
                isso cortava uma faixa preta crescente no topo da tela.
                top:50vh (não top-1/2 = 50%): centraliza relativo à
                ALTURA DA VIEWPORT, não à altura deste filho (1px — 50%
                de 1px não centraliza nada). Com o filho preso em top:0
                (viewport-top) durante o pin, 50vh bate no centro
                vertical da tela. */}
            {/* motion.div (não div comum): style.display recebe a
                MotionValue pinnedDisplay (ver Pour() acima) — trava de
                exclusão mútua adicional, frame-síncrona, por cima do
                mount/unmount via `settled` que já existia (intocado). */}
            <motion.div
              className="absolute left-1/2 w-full -translate-x-1/2 -translate-y-1/2"
              style={{ top: "50vh", display: pinnedDisplay }}
            >
              <div className="relative w-full" style={{ aspectRatio: IMAGE_ASPECT }}>
                <Image
                  src="/images/pour/galeria.jpg"
                  alt=""
                  fill
                  sizes="100vw"
                  style={{ objectFit: "fill" }}
                />

                {/* Vídeo: filho do mesmo container-pai, posição/tamanho
                    estáticos em CSS (top:0,left:0,100%x100% — nunca
                    anima). Só transform (translate+scale) anima,
                    GPU-composited. Componente próprio (PinnedVideo, ver
                    acima) só pelo play-management — nenhuma mudança na
                    lógica de scale/scrub em si, os mesmos xPercent/
                    yPercent/scaleX/scaleY calculados acima. */}
                <PinnedVideo
                  xPercent={xPercent}
                  yPercent={yPercent}
                  scaleX={scaleX}
                  scaleY={scaleY}
                />

                {/* Label/caption: absolute ANCORADOS ÀS BORDAS desta
                    mesma caixa (ver comentário em PourLabel/PourCaption
                    acima) — não contam pro tamanho da caixa, não mexem
                    no scale/scrub do vídeo. */}
                <PourLabel opacity={easedProgress} />
                <PourCaption opacity={easedProgress} />
              </div>
            </motion.div>
          </>
        )}
      </div>
      </section>

      {/* Depois que o vídeo encaixa na moldura (settled), a section acima
          desmonta seu conteúdo pinado e ESTA section (fluxo normal, sem
          sticky, sem position:fixed) assume — o mesmo enquadramento final
          (moldura na mesma posição/tamanho: FRAME.top/left/width/height,
          sem escala nenhuma), só que agora como bloco comum de página, que
          sobe e sai da tela rolando junto com o resto do scroll, "seção
          empurra seção" — exatamente como pedido: nada de pin residual
          aqui, nada de fade, é só a próxima seção da página. No instante
          da troca as duas versões ocupam pixel-a-pixel a mesma posição de
          tela (mesma centralização vertical, mesmo FRAME), então a troca
          de uma pra outra é imperceptível — não tem salto porque não tem
          diferença visual nenhuma entre "o frame pinado no último frame"
          e "o frame normal no primeiro frame".

          SEMPRE montada (não condicionada a `settled`), de propósito: essa
          section fica em fluxo normal logo depois de #pour (altura fixa,
          150vh+1px, que NÃO muda com settled) — enquanto o pin de #pour
          ainda está ativo, ela simplesmente fica abaixo da dobra, fora da
          viewport, exatamente como qualquer conteúdo de página ainda não
          alcançado pelo scroll. Monta/desmonta condicionalmente aqui
          mudava a ALTURA TOTAL do documento no exato instante em que o
          scroll cruza o ponto de encaixe — e mexer no tamanho do
          documento bem no meio de uma rolada ativa é o que fazia o Lenis
          (que cacheia o limite de scroll) entrar em conflito com a
          posição real, medido como o scroll "grudando" num valor ou
          pulando pra trás de forma imprevisível logo depois do encaixe. */}
        {/* Fundo #1C1614 (mesma cor do Menu, não preto puro): a caixa da
            imagem (aspect-ratio real) quase sempre sobra menor que 100vh,
            deixando letterbox em cima/embaixo — com bg-black essa faixa
            emendava com o Menu criando uma linha visível (preto puro vs.
            #1C1614 do Menu não são a mesma cor). Trocando pra #1C1614 aqui,
            a base dessa faixa funde sem costura na próxima seção. */}
        {/* z-index:0 explícito (defensivo, não muda nada — #pour já tem
            z-10 e cria seu próprio stacking context, que SEMPRE pinta
            acima de um irmão z-index:auto independente da ordem no DOM;
            deixar 0 aqui só documenta a garantia em vez de depender do
            "auto" implícito): #pour-static nunca pode pintar por cima do
            bloco pinado durante o scrub, mesmo num frame de timing
            estranho na troca do settled. */}
        <section
          id="pour-static"
          ref={pourStaticRef}
          className="pour-static-frame relative w-full"
          style={{ height: "100vh", backgroundColor: "#1C1614", zIndex: 0 }}
        >
          {/* MESMO truque do bloco pinado acima (top:50vh + translate:
              -50%, não flex items-center/justify-center como antes):
              ambos calculam a posição da moldura a partir do MESMO
              referencial ("50vh a partir do topo de uma caixa que, no
              instante exato da troca settled, está com o topo grudado no
              topo do viewport" — verdade tanto pro filho sticky de 1px
              do bloco pinado quanto pra ESTA section, já que scrollY ==
              pourStaticTop nesse instante é por definição onde a section
              começa). flex items-center centralizava dentro da altura
              TOTAL da section (que pode sobrar folga com min-height
              mobile) — um cálculo DIFERENTE do bloco pinado, e foi essa
              diferença que causava o desalinhamento lateral reportado na
              troca. Com os dois lados usando a mesma fórmula, a moldura
              cai no mesmo pixel nos dois estados, por construção. */}
          {/* motion.div: style.display recebe staticDisplay (ver Pour()
              acima) — a mesma trava de exclusão mútua do lado pinado,
              invertida (só aparece quando o pinado já sumiu). */}
          <motion.div
            className="absolute left-1/2 w-full -translate-x-1/2 -translate-y-1/2"
            style={{ top: "50vh", display: staticDisplay }}
          >
            <div className="relative w-full" style={{ aspectRatio: IMAGE_ASPECT }}>
              <Image
                src="/images/pour/galeria.jpg"
                alt=""
                fill
                sizes="100vw"
                style={{ objectFit: "fill" }}
              />
              <div
                className="pour-video-mask absolute overflow-hidden bg-black"
                style={{
                  top: `${FRAME.top}%`,
                  left: `${FRAME.left}%`,
                  width: `${FRAME.width}%`,
                  height: `${FRAME.height}%`,
                }}
              >
                <video
                  ref={pourStaticVideoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/video/pour/pour-loop-mobile.mp4" media="(max-width: 767px)" />
                  <source src="/video/pour/pour-loop.mp4" />
                </video>
              </div>

              <PourLabel opacity={easedProgress} />
              <PourCaption opacity={easedProgress} />
            </div>
          </motion.div>
        </section>
    </>
  );
}
