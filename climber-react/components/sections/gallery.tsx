"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

// Fundo claro (creme) — mesmo tom do About, respiro entre o escuro do
// Menu e o resto da página. Texto escuro em cima, mesma tinta do About.
const BG = "#EDE7DC";
const INK = "#151008";
const RULE_COLOR = "rgba(60,40,30,0.15)";

// Reveal de entrada de cada foto: cortina clip-path abrindo de baixo pra
// cima (mesma mecânica de about.tsx) + de-zoom simultâneo da imagem.
const REVEAL_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const REVEAL_DURATION = 1.2;
const REVEAL_SCALE_FROM = 1.2;

// A imagem interna é ~130% da altura da moldura (aqui 134%, uma folga
// pequena acima do pedido pra sobrar 2pp de margem contra arredondamento
// sub-pixel do navegador — sem isso os dois extremos do parallax medium
// (±15%) tocariam a borda da moldura exatos, zero folga) — o excedente
// (17% em cima, 17% embaixo) é o espaço que o parallax usa pra deslizar
// sem nunca expor fundo vazio. transform:translateY(%) no CSS/Framer é
// relativo à altura do PRÓPRIO elemento (134% da moldura), não à moldura
// — por isso a conversão: um deslocamento pedido em % da MOLDURA vira
// %/1.34 no elemento em si.
const OVERSCAN_HEIGHT_PERCENT = 134;
const OVERSCAN_EDGE_PERCENT = (OVERSCAN_HEIGHT_PERCENT - 100) / 2;
function frameToElementPercent(framePercent: number) {
  return (framePercent * 100) / OVERSCAN_HEIGHT_PERCENT;
}

interface PhotoSpec {
  src: string;
  // Intensidade do parallax em % RELATIVA À MOLDURA (a foto grande é mais
  // discreta, -8%/+8%; as médias são mais fortes, -15%/+15% — dá
  // profundidade/ritmo, nem todas se movem igual).
  parallax: number;
  sizes: string;
}

function GalleryPhoto({
  photo,
  aspectRatio,
}: {
  photo: PhotoSpec;
  aspectRatio: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { amount: 0.2, once: true });

  // Parallax contínuo: enquanto a moldura atravessa a viewport (do
  // instante em que o TOPO dela toca o FUNDO da tela até o instante em
  // que a BASE dela toca o TOPO da tela — ou seja, o trajeto inteiro em
  // que ela está, mesmo que parcialmente, visível), a imagem desliza por
  // dentro. A moldura em si (este ref) nunca se move — só a imagem.
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const edge = frameToElementPercent(photo.parallax);
  const y = useTransform(scrollYProgress, [0, 1], [`-${edge}%`, `${edge}%`]);

  const frameStyle: CSSProperties = { aspectRatio };

  return (
    <div ref={frameRef} className="relative w-full overflow-hidden" style={frameStyle}>
      {/* Cortina: abre de baixo pra cima, mesma linguagem do About. */}
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={{ clipPath: inView ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
        transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
      >
        {/* Camada de-zoom (reveal, dispara uma vez) + parallax (contínuo,
            ligado a scroll) — as duas MOTION VALUES (scale e y) convivem
            no mesmo elemento sem conflito, o Framer compõe num único
            transform. */}
        <motion.div
          className="absolute inset-x-0"
          style={{
            top: `-${OVERSCAN_EDGE_PERCENT}%`,
            height: `${OVERSCAN_HEIGHT_PERCENT}%`,
            y,
          }}
          initial={{ scale: REVEAL_SCALE_FROM }}
          animate={{ scale: inView ? 1 : REVEAL_SCALE_FROM }}
          transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
        >
          <Image src={photo.src} alt="" fill sizes={photo.sizes} className="object-cover" />
        </motion.div>
      </motion.div>
    </div>
  );
}

const LARGE_PHOTO: PhotoSpec = { src: "/images/gallery/1.jpg", parallax: 8, sizes: "58vw" };
const MEDIUM_PHOTOS: PhotoSpec[] = [
  { src: "/images/gallery/2.jpg", parallax: 15, sizes: "40vw" },
  { src: "/images/gallery/3.jpg", parallax: 15, sizes: "20vw" },
  { src: "/images/gallery/4.jpg", parallax: 15, sizes: "20vw" },
];

export function Gallery() {
  const titleRef = useRef<HTMLDivElement>(null);
  // Parallax sutil do título: sobe -6% conforme a seção inteira atravessa
  // a tela (mesmo alcance de scroll do container, não só do título).
  const { scrollYProgress: sectionProgress } = useScroll({
    target: titleRef,
    offset: ["start end", "end start"],
  });
  const titleY = useTransform(sectionProgress, [0, 1], ["0%", "-6%"]);

  return (
    <section id="gallery" className="w-full" style={{ backgroundColor: BG }}>
      <div
        className="mx-auto w-full max-w-[1400px] px-8 sm:px-16"
        style={{ paddingTop: "14vh", paddingBottom: "14vh" }}
      >
        <div ref={titleRef} style={{ marginBottom: "8vh" }}>
          <span
            className="block font-mono uppercase"
            style={{ fontSize: "0.7rem", letterSpacing: "0.35em", color: INK, opacity: 0.45 }}
          >
            (The Space)
          </span>
          <div className="mt-4 h-px w-full" style={{ backgroundColor: RULE_COLOR }} />
          <motion.h2
            className="mt-6 uppercase"
            style={{
              fontFamily: "var(--font-archivo)",
              fontSize: "clamp(2.4rem, 4.5vw, 4.5rem)",
              lineHeight: 0.95,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: INK,
              y: titleY,
            }}
          >
            Where It All Happens
          </motion.h2>
        </div>

        {/* Composição assimétrica: 1 foto grande (58%) + 3 médias (42%,
            uma em cima ocupando a largura toda, duas embaixo lado a
            lado) — ritmo editorial, não um grid uniforme. */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[58fr_42fr] md:gap-x-[6%]">
          <GalleryPhoto photo={LARGE_PHOTO} aspectRatio="4 / 5" />
          <div className="flex flex-col gap-8">
            <GalleryPhoto photo={MEDIUM_PHOTOS[0]} aspectRatio="4 / 3" />
            <div className="grid grid-cols-2 gap-8">
              <GalleryPhoto photo={MEDIUM_PHOTOS[1]} aspectRatio="1 / 1" />
              <GalleryPhoto photo={MEDIUM_PHOTOS[2]} aspectRatio="1 / 1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
