"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView, useTransform, useScroll } from "framer-motion";

// Fundo claro (creme) — mesmo tom do About, respiro entre o escuro do
// Menu e o resto da página. Texto escuro em cima, mesma tinta do About.
const BG = "#EDE7DC";
const INK = "#151008";
const RULE_COLOR = "rgba(60,40,30,0.15)";

const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

// Reveal em cascata (mesma linguagem do SOBRE NÓS): cortina clip-path
// abrindo de baixo pra cima + de-zoom simultâneo, com stagger curto entre
// as 4 fotos — disparado UMA VEZ pela seção inteira (não por foto), não
// pelo scroll de cada uma isoladamente.
const REVEAL_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const REVEAL_DURATION = 1.2;
const REVEAL_SCALE_FROM = 1.15;
const REVEAL_STAGGER = 0.09;

function GalleryPhoto({
  src,
  sizes,
  index,
  sectionInView,
  className,
  children,
}: {
  src: string;
  sizes: string;
  index: number;
  sectionInView: boolean;
  className: string;
  children?: React.ReactNode;
}) {
  const delay = index * REVEAL_STAGGER;

  return (
    // Container com overflow:hidden e ALTURA FIXA (vem do grid, ver
    // <style> abaixo) — essa é a correção do bug de scroll travando no
    // hover: o container NUNCA muda de tamanho, só o conteúdo dentro
    // dele anima. Antes (versão masonry), o container em si era
    // dimensionado pelo conteúdo (sem `fill`), o que deixava a hierarquia
    // de camadas instável durante o hover em imagens grandes — voltando
    // pro padrão `fill` + moldura de tamanho fixo, o hover é puramente
    // cosmético (GPU, transform/filter) e nunca mexe em layout.
    <div className={`relative overflow-hidden ${className}`}>
      {/* Cortina: abre de baixo pra cima. */}
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={{ clipPath: sectionInView ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
        transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE, delay }}
      >
        {/* De-zoom do reveal (scale 1.15 -> 1), dispara junto com a
            cortina, mesmo delay. */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: REVEAL_SCALE_FROM }}
          animate={{ scale: sectionInView ? 1 : REVEAL_SCALE_FROM }}
          transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE, delay }}
        >
          {/* Hover: camada PRÓPRIA, só a <img> (via este wrapper) cresce
              — o container (overflow-hidden acima) fica exatamente do
              mesmo tamanho o tempo todo, então o zoom nunca vaza nem
              empurra o layout, e o scroll do mouse sobre a foto nunca é
              capturado por nada. Só reage à foto sob o cursor
              (whileHover é escopado ao próprio elemento). */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1, filter: "brightness(1)" }}
            whileHover={{ scale: 1.05, filter: "brightness(1.06)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image src={src} alt="" fill sizes={sizes} className="object-cover object-center" />
          </motion.div>
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
}

const TITLE_LINES = ["WHERE IT ALL", "HAPPENS"];

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  // Gatilho ÚNICO pra seção inteira — cada foto entra em cascata a partir
  // dele (delay = index * REVEAL_STAGGER em cada uma), não um useInView
  // por foto.
  const sectionInView = useInView(sectionRef, { amount: 0.2, once: true });

  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { amount: 0.4, once: true });

  // Parallax sutil do título: sobe -6% conforme a seção inteira atravessa
  // a tela (mantido como já estava).
  const { scrollYProgress: sectionProgress } = useScroll({
    target: titleRef,
    offset: ["start end", "end start"],
  });
  const titleY = useTransform(sectionProgress, [0, 1], ["0%", "-6%"]);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: BG, paddingBottom: "10vh" }}
    >
      {/* Título: continua dentro do container centralizado/com padding
          (não faz parte do full-bleed) — mantido como estava. */}
      <div
        className="mx-auto w-full max-w-[1400px] px-8 sm:px-16"
        style={{ paddingTop: "14vh", paddingBottom: "6vh" }}
      >
        <div ref={titleRef}>
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
      </div>

      {/* Grid editorial full-bleed: FORA do container com max-width/
          padding acima, direto como filho da section (que não tem
          padding horizontal nenhum) — encosta em x=0 e x=100vw.

          2 colunas (58/42) x 3 linhas de altura FIXA mas generosa —
          croissant 34vh e espresso 30vh (altas o bastante pra mostrar a
          xícara/croissant inteiros com object-fit:cover, não é um
          recorte apertado), ambiente atravessa as duas primeiras linhas
          (grid-row 1/3, altura = croissant+gap+espresso automaticamente,
          garantido pelo grid) e a faixa da carrotcake (380px) atravessa
          a largura toda na 3ª linha — alta o bastante pra mostrar a
          fatia de bolo inteira. Composição inteira ~100vh: as 4 fotos
          convivem juntas na tela, não uma por vez.

          Mobile (<768px): mesma lista em coluna única, alturas variadas
          mas generosas (60/50/45/55vh). <style> com media query porque
          inline style não suporta @media. */}
      <style>{`
        .space-grid {
          display: grid;
          grid-template-columns: 58fr 42fr;
          grid-template-rows: 34vh 30vh 380px;
          gap: 12px;
        }
        .space-grid .space-ambiente { grid-column: 1 / 2; grid-row: 1 / 3; }
        .space-grid .space-croissant { grid-column: 2 / 3; grid-row: 1 / 2; }
        .space-grid .space-espresso { grid-column: 2 / 3; grid-row: 2 / 3; }
        .space-grid .space-carrotcake { grid-column: 1 / 3; grid-row: 3 / 4; }
        @media (max-width: 767px) {
          .space-grid {
            grid-template-columns: 1fr;
            grid-template-rows: 60vh 50vh 45vh 55vh;
            gap: 10px;
          }
          .space-grid .space-ambiente,
          .space-grid .space-croissant,
          .space-grid .space-espresso,
          .space-grid .space-carrotcake {
            grid-column: 1 / 2;
          }
          .space-grid .space-ambiente { grid-row: 1 / 2; }
          .space-grid .space-croissant { grid-row: 2 / 3; }
          .space-grid .space-espresso { grid-row: 3 / 4; }
          .space-grid .space-carrotcake { grid-row: 4 / 5; }
        }
      `}</style>
      <div className="space-grid">
        <GalleryPhoto
          src="/images/gallery/ambiente.jpg"
          sizes="(max-width: 767px) 100vw, 58vw"
          index={0}
          sectionInView={sectionInView}
          className="space-ambiente"
        >
          {/* Legenda sobre gradiente de legibilidade, canto inferior
              esquerdo — mesma linguagem do caption do About. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{
              height: "25%",
              background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 flex items-center gap-1"
            style={{
              padding: "1.5vw",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              color: BG,
              fontWeight: 400,
            }}
          >
            <span>↳</span>
            <span>the room, 07:00</span>
          </div>
        </GalleryPhoto>

        <GalleryPhoto
          src="/images/gallery/croissant.png"
          sizes="(max-width: 767px) 100vw, 42vw"
          index={1}
          sectionInView={sectionInView}
          className="space-croissant"
        />
        <GalleryPhoto
          src="/images/gallery/espresso.png"
          sizes="(max-width: 767px) 100vw, 42vw"
          index={2}
          sectionInView={sectionInView}
          className="space-espresso"
        />
        <GalleryPhoto
          src="/images/gallery/carrotcake.png"
          sizes="100vw"
          index={3}
          sectionInView={sectionInView}
          className="space-carrotcake"
        />
      </div>
    </section>
  );
}
