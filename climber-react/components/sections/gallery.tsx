"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useInView, useTransform, useScroll } from "framer-motion";

// Fundo claro (creme) — mesmo tom do About, respiro entre o escuro do
// Menu e o resto da página. Texto escuro em cima, mesma tinta do About.
const BG = "#EDE7DC";
const INK = "#151008";
const RULE_COLOR = "rgba(60,40,30,0.15)";

const EASE_LAYER: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

const REVEAL_STAGGER = 0.09;
const REVEAL_DURATION = 0.9;

function GalleryPhoto({
  src,
  sizes,
  index,
  sectionInView,
  style,
  children,
}: {
  src: string;
  sizes: string;
  index: number;
  sectionInView: boolean;
  style: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden" style={style}>
      {/* Reveal: fade + sobe 30px + de-zoom leve (1.05->1), em cascata
          (ambiente primeiro, stagger de 90ms por índice) — disparado UMA
          vez pra seção inteira (sectionInView), não por foto. */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, y: 30, scale: 1.05 }}
        animate={sectionInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: REVEAL_DURATION, ease: EASE_LAYER, delay: index * REVEAL_STAGGER }}
      >
        {/* Hover: escala interna independente (1 -> 1.04) — camada
            própria pra não conflitar com o scale do reveal acima. */}
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
}

const TITLE_LINES = ["WHERE IT ALL", "HAPPENS"];

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  // Único gatilho pra seção inteira — cada foto do mosaico entra em
  // cascata a partir dele (delay = index * REVEAL_STAGGER em cada uma),
  // não um useInView por foto.
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
      style={{ backgroundColor: BG }}
    >
      <div
        className="mx-auto w-full max-w-[1400px] px-8 sm:px-16"
        style={{ paddingTop: "14vh", paddingBottom: "14vh" }}
      >
        <div ref={titleRef} style={{ marginBottom: "6vh" }}>
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

        {/* Mosaico denso: grid CSS de 12 colunas, 3 linhas de altura
            explícita (não "auto"/fr) — é isso que garante zero espaço
            morto: ambiente ocupa colunas 1-7 atravessando as linhas 1-2,
            e como o grid usa linhas de tamanho FIXO, essa altura bate
            exatamente com flatwhite (linha 1) + gap + cappuccino (linha
            2) empilhadas ao lado — sem sobra, sem precisar calcular nada
            na mão (diferente da tentativa anterior com margins soltas).
            space-4 fecha a composição numa faixa larga (1-12) na linha 3.
            gap:16px uniforme entre TODAS as células. */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
            gridTemplateRows: "42vh 42vh 20vh",
            gap: "16px",
          }}
        >
          <GalleryPhoto
            src="/images/gallery/ambiente.jpg"
            sizes="58vw"
            index={0}
            sectionInView={sectionInView}
            style={{ gridColumn: "1 / 8", gridRow: "1 / 3" }}
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
            src="/images/gallery/flatwhite.png"
            sizes="34vw"
            index={1}
            sectionInView={sectionInView}
            style={{ gridColumn: "8 / 13", gridRow: "1 / 2" }}
          />

          <GalleryPhoto
            src="/images/gallery/cappuccino.png"
            sizes="34vw"
            index={2}
            sectionInView={sectionInView}
            style={{ gridColumn: "8 / 13", gridRow: "2 / 3" }}
          />

          <GalleryPhoto
            src="/images/gallery/space-4.jpg"
            sizes="100vw"
            index={3}
            sectionInView={sectionInView}
            style={{ gridColumn: "1 / 13", gridRow: "3 / 4" }}
          />
        </div>
      </div>
    </section>
  );
}
