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
          da faixa de conteúdo real durante TODO o pin (voids (1)), e o
          scrub em si — 150vh de scroll só pra uma animação que no mobile
          mal se nota — é o "oceano vazio" (2) antes do menu.
          Sem tocar a altura BASE (150vh, usada pelo useScroll pra medir
          scrollYProgress no desktop): !important aqui só entra no media
          query, então a medição do desktop (getBoundingClientRect lê o
          elemento renderizado, não o valor da prop) nunca muda >=768px.
          No mobile, colapsa #pour pra 1px (mesma magnitude já usada pelo
          filho sticky logo abaixo — nunca 0, framer-motion faria
          progress = (scrollY-start)/(end-start) com denominador zero) —
          o scrub acontece, só que em 1px de distância de scroll: settled
          vira true no primeiro pixel rolado, então a versão animada
          nunca fica visível de fato, e #pour-static (already correto,
          só precisa perder seu próprio height:100vh fixo — ver abaixo)
          assume quase instantaneamente. O backdrop de segurança
          (bg-black 100vh, existe só pra tapar frestas durante o PIN no
          desktop) fica desnecessário com o pin colapsado — escondido
          direto pra eliminar até o flash de um frame. */}
      <style>{`
        @media (max-width: 768px) {
          .pour-scrub-wrapper {
            height: 1px !important;
          }
          .pour-safety-backdrop {
            display: none !important;
          }
          .pour-static-frame {
            height: auto !important;
            padding-bottom: 8vh !important;
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
            <div
              className="absolute left-1/2 w-full -translate-x-1/2 -translate-y-1/2"
              style={{ top: "50vh" }}
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
                    GPU-composited. */}
                <motion.div
                  className="absolute inset-0 overflow-hidden bg-black"
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
              </div>
            </div>
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
        <section
          id="pour-static"
          ref={pourStaticRef}
          className="pour-static-frame relative flex w-full items-center justify-center"
          style={{ height: "100vh", backgroundColor: "#1C1614" }}
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
              className="absolute overflow-hidden bg-black"
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
          </div>
        </section>
    </>
  );
}
