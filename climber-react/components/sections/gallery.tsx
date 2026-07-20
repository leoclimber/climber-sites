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
// Independente por foto (useInView próprio de cada uma, não um trigger
// único de seção).
const REVEAL_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const REVEAL_DURATION = 1.3;
const REVEAL_SCALE_FROM = 1.2;
const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

// A imagem interna é ~135% da altura da moldura — o excedente (17.5% em
// cima, 17.5% embaixo) é o espaço que o parallax (e a leve respiração de
// escala da herói) usam pra deslizar sem NUNCA expor fundo vazio.
// transform:translateY(%) no CSS/Framer é relativo à altura do PRÓPRIO
// elemento (135% da moldura), não à moldura — por isso a conversão: um
// deslocamento pedido em % da MOLDURA vira %/1.35 no elemento em si.
const OVERSCAN_HEIGHT_PERCENT = 135;
const OVERSCAN_EDGE_PERCENT = (OVERSCAN_HEIGHT_PERCENT - 100) / 2;
function frameToElementPercent(framePercent: number) {
  return (framePercent * 100) / OVERSCAN_HEIGHT_PERCENT;
}

interface PhotoSpec {
  src: string;
  // Intensidade do parallax em % RELATIVA À MOLDURA (herói discreta,
  // detalhes mais fortes — dá profundidade/ritmo, nem todas se movem
  // igual).
  parallax: number;
  sizes: string;
  // Deslocamento lateral no reveal (só os detalhes têm personalidade
  // própria aqui — a herói entra reta, sem x).
  revealX?: number;
  // Respiração contínua de escala ligada a scroll (só a herói: 1 -> 1.05).
  breathingScaleTo?: number;
}

function GalleryPhoto({
  photo,
  aspectRatio,
  className,
}: {
  photo: PhotoSpec;
  aspectRatio: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { amount: 0.25, once: true });

  // Um único useScroll por foto alimenta DUAS motion values distintas:
  // y (parallax, todas as fotos) e scale (respiração, só a herói — pras
  // outras o range de saída é [1,1], um no-op). Vivem em camadas
  // SEPARADAS do scale de-zoom do reveal (que é outro motion value, esse
  // sim disparado uma vez por tempo) — um elemento não pode ter dois
  // "scale" ao mesmo tempo, por isso a divisão em camadas abaixo.
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const edge = frameToElementPercent(photo.parallax);
  const y = useTransform(scrollYProgress, [0, 1], [`-${edge}%`, `${edge}%`]);
  const breathingScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, photo.breathingScaleTo ?? 1]
  );

  const frameStyle: CSSProperties = { aspectRatio };

  return (
    <div
      ref={frameRef}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={frameStyle}
    >
      {/* Cortina: abre de baixo pra cima (mesma linguagem do About) +
          leve deslocamento lateral nos detalhes (x:40px->0) pra terem
          personalidade própria, não entrarem iguais à herói. */}
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(100% 0 0 0)", x: photo.revealX ?? 0 }}
        animate={{
          clipPath: inView ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
          x: inView ? 0 : photo.revealX ?? 0,
        }}
        transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
      >
        {/* Camada de respiração (scale, contínua/scroll) + parallax (y,
            contínua/scroll) — as duas convivem no mesmo elemento sem
            conflito, o Framer compõe num único transform. top/height são
            o overscan estático (não animam). */}
        <motion.div
          className="absolute inset-x-0"
          style={{
            top: `-${OVERSCAN_EDGE_PERCENT}%`,
            height: `${OVERSCAN_HEIGHT_PERCENT}%`,
            y,
            scale: breathingScale,
          }}
        >
          {/* Camada de-zoom do reveal (scale 1.2->1, dispara uma vez) —
              precisa ser um elemento PRÓPRIO porque a camada de cima já
              usa `scale` pra respiração contínua. */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: REVEAL_SCALE_FROM }}
            animate={{ scale: inView ? 1 : REVEAL_SCALE_FROM }}
            transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
          >
            <Image src={photo.src} alt="" fill sizes={photo.sizes} className="object-cover" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Foto-herói: o ambiente do café — domina a composição, não é close de
// produto. Discreta no parallax (-8%/+8%) mas com uma respiração de
// escala sutil (1 -> 1.05) pra dar vida sem chamar atenção demais.
const HERO_PHOTO: PhotoSpec = {
  src: "/images/gallery/ambiente.jpg",
  parallax: 8,
  sizes: "72vw",
  breathingScaleTo: 1.05,
};

// Detalhes: apoio atmosférico (xícaras em cena, não produto isolado),
// parallax mais forte que a herói pra dar profundidade — e cada um com
// intensidade levemente diferente entre si, pra não se moverem iguais.
const DETAIL_PHOTOS: PhotoSpec[] = [
  { src: "/images/gallery/flatwhite.png", parallax: 18, sizes: "24vw", revealX: 40 },
  { src: "/images/gallery/cappuccino.png", parallax: 14, sizes: "24vw", revealX: 40 },
];

const TITLE_LINES = ["WHERE IT ALL", "HAPPENS"];

export function Gallery() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { amount: 0.4, once: true });

  // Parallax sutil do título: sobe -6% conforme a seção inteira atravessa
  // a tela (mesmo alcance de scroll do container, não só do título).
  const { scrollYProgress: sectionProgress } = useScroll({
    target: titleRef,
    offset: ["start end", "end start"],
  });
  const titleY = useTransform(sectionProgress, [0, 1], ["0%", "-6%"]);

  return (
    <section id="gallery" className="relative w-full overflow-hidden" style={{ backgroundColor: BG }}>
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
          {/* Título: parallax contínuo (y ligado a scroll) na camada de
              fora + reveal por stagger de LINHA (máscara overflow-hidden,
              y 100%->0, 0.08s entre linhas) na camada de dentro — duas
              motion values de `y` diferentes não podem conviver no mesmo
              elemento, por isso a divisão em duas camadas. */}
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
            {TITLE_LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: titleInView ? "0%" : "100%" }}
                  transition={{ duration: 0.7, ease: EASE_POWER3_OUT, delay: i * 0.08 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h2>
        </div>

        {/* Composição assimétrica e hierárquica: a herói (ambiente do
            café) domina, sangrando até a borda ESQUERDA real da
            viewport (margin-left: calc(50% - 50vw), o mesmo truque de
            "breakout" que about.tsx usa do lado direito pra foto dele).
            Os dois detalhes ficam à direita, empilhados verticalmente
            com bastante espaço entre si — nunca lado a lado. */}
        <div className="relative flex items-start" style={{ minHeight: "88vh", gap: "4vw" }}>
          <div
            className="relative flex-shrink-0"
            style={{ width: "72vw", height: "88vh", marginLeft: "calc(50% - 50vw)" }}
          >
            <GalleryPhoto photo={HERO_PHOTO} aspectRatio="auto" className="h-full" />
            {/* Legenda sobre gradiente de legibilidade, canto inferior
                esquerdo — mesma linguagem do caption do About. */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0"
              style={{
                height: "30%",
                background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 flex items-center gap-1"
              style={{
                padding: "2vw",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                color: BG,
                fontWeight: 400,
              }}
            >
              <span>↳</span>
              <span>the room, 07:00</span>
            </div>
          </div>

          {/* Coluna de detalhes: tamanho/posição recalibrados pra ter
              presença de verdade (32vw x 38vh cada, não miniaturas) e
              formar um bloco coeso encostado na herói — topo do detalhe 1
              quase alinhado ao topo da herói (8vh, não 20vh), gap curto
              (6vh) até o detalhe 2. Juntos, a coluna ocupa ~90vh (8+38+6+
              38), quase a mesma altura da herói (88vh) — equilíbrio
              esquerda/direita real, não dois selos soltos no vazio. */}
          <div className="relative flex flex-1 flex-col">
            <div style={{ marginTop: "8vh", width: "32vw", height: "38vh" }}>
              <GalleryPhoto photo={DETAIL_PHOTOS[0]} aspectRatio="auto" className="h-full" />
            </div>
            <div style={{ marginTop: "6vh", width: "32vw", height: "38vh" }}>
              <GalleryPhoto photo={DETAIL_PHOTOS[1]} aspectRatio="auto" className="h-full" />
            </div>
            <p
              className="uppercase"
              style={{
                marginTop: "3vh",
                width: "32vw",
                textAlign: "left",
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                color: INK,
                opacity: 0.45,
              }}
            >
              Est. 2019 — Dublin
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
