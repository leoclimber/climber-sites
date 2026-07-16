"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
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

// Transição pro Menu: mesma lógica do iris wipe do hero (about.tsx) — a
// próxima seção nasce da anterior, não corta. Nos últimos 15% do scroll
// do Pour, uma cortina #1C1614 (mesmo fundo do Menu) sobe de baixo pra
// cima cobrindo a galeria. Usa laggedProgress (spring), não easedProgress
// (a curva quint é específica do encaixe do vídeo na moldura) — a cortina
// é um efeito à parte, scrub simples ligado ao scroll.
const MENU_TRANSITION_START = 0.85;
const MENU_TRANSITION_BG = "#1C1614";

export function Pour() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const start = useCoverStartInContainer();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
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

  const menuTransitionClip = useTransform(laggedProgress, (p) => {
    const t = Math.max(0, Math.min(1, (p - MENU_TRANSITION_START) / (1 - MENU_TRANSITION_START)));
    return `inset(${(1 - t) * 100}% 0 0 0)`;
  });

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
    // Sem ScrollTrigger pin real (Nothing também não usa) — pin feito do
    // mesmo jeito que hero/about: wrapper alto + sticky.
    <section id="pour" ref={containerRef} className="relative h-[250vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Container-pai: aspect-ratio REAL da imagem, width:100%,
            max-width:100vw, centralizado verticalmente. object-fit:fill
            (não cover) — a imagem nunca é cortada, então a % da moldura
            medida acima cai sempre no mesmo lugar visual, em qualquer
            tela. Sem overflow:hidden aqui: o vídeo (filho) precisa poder
            visualmente "vazar" pra fora dele no estado inicial pra cobrir
            o viewport inteiro quando o container fica mais baixo que
            100vh (letterbox). */}
        <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-full" style={{ aspectRatio: IMAGE_ASPECT }}>
            <Image
              src="/images/pour/galeria.jpg"
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: "fill" }}
            />

            {/* Vídeo: filho do mesmo container-pai, posição/tamanho
                estáticos em CSS (top:0,left:0,100%x100% — nunca anima).
                Só transform (translate+scale) anima, GPU-composited. */}
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

        {/* Cortina de transição pro Menu: nasce da própria seção, não
            corta — mesma lógica do iris wipe do hero. Cobre o viewport
            inteiro (irmã do container com aspect-ratio, que pode ficar
            letterboxed), não só a imagem. */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20"
          style={{ backgroundColor: MENU_TRANSITION_BG, clipPath: menuTransitionClip }}
        />
      </div>
    </section>
  );
}
