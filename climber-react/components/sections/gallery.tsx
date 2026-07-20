"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView, useTransform, useScroll } from "framer-motion";

// Fundo claro (creme) — mesmo tom do About, respiro entre o escuro do
// Menu e o resto da página. Texto escuro em cima, mesma tinta do About.
const BG = "#EDE7DC";
const INK = "#151008";
const RULE_COLOR = "rgba(60,40,30,0.15)";

const EASE_LAYER: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

// Cada foto revela sozinha, lenta (1.2s — dá pra apreciar) — e mesmo que
// duas entrem geometricamente perto uma da outra (o mosaico inteiro cabe
// numa tela só), o stagger de 0.25s por índice garante que a animação de
// uma nunca começa junto com a da anterior.
const REVEAL_DURATION = 1.2;
const REVEAL_STAGGER = 0.25;

function GalleryPhoto({
  src,
  sizes,
  index,
  className,
  children,
}: {
  src: string;
  sizes: string;
  index: number;
  className: string;
  children?: React.ReactNode;
}) {
  // Gatilho POR FOTO (não da seção inteira): cada uma revela quando ELA
  // MESMA entra na viewport, conforme a pessoa rola — no mobile isso
  // funciona igual, cada foto dispara sozinha conforme o dedo rola.
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Reveal: fade + sobe 50px + de-zoom leve (0.94->1), 1.2s, ease
          [0.16,1,0.3,1] — lento e visível, não um pop instantâneo. */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, y: 50, scale: 0.94 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: REVEAL_DURATION, ease: EASE_LAYER, delay: index * REVEAL_STAGGER }}
      >
        {/* Hover: zoom (1 -> 1.06) + leve clareamento (brightness 1 ->
            1.08), 0.6s ease-out — camada própria pra não conflitar com o
            scale do reveal acima. Só reage a ESTA foto (whileHover é
            escopado ao próprio elemento, não propaga pras vizinhas). No
            mobile isso simplesmente nunca dispara (sem ponteiro de
            hover) — não precisa de nenhum tratamento especial. */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1, filter: "brightness(1)" }}
          whileHover={{ scale: 1.06, filter: "brightness(1.08)" }}
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
    <section id="gallery" className="relative w-full" style={{ backgroundColor: BG, paddingBottom: "10vh" }}>
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

      {/* Mosaico full-bleed: FORA do container com max-width/padding
          acima, direto como filho da section (que não tem padding
          horizontal nenhum) — a coluna da ambiente encosta em x=0 e a
          coluna direita encosta em x=100vw.

          Desktop: grid de 2 colunas (58/42) x 3 linhas. As linhas 1-2 são
          alturas FIXAS mas DIFERENTES (34vh/21vh — croissant "vertical
          alta" bem maior que espresso "baixa", zigue-zague editorial, não
          dois retângulos iguais); ambiente atravessa as duas (grid-row
          1/3), então a altura dela bate EXATA com croissant+gap+espresso
          empilhados — zero espaço morto, garantido pelo próprio grid, sem
          calcular nada na mão. A 3ª linha (220px fixos, largura total
          1/3) é a faixa da carrotcake — alta o bastante pra não esmagar
          a foto, ao contrário da tentativa anterior.

          Mobile (<768px): a MESMA lista de 4 fotos vira uma coluna só,
          mas com alturas DIFERENTES por foto (60/50/40/55vh) — ritmo
          editorial na vertical, não "todas do mesmo tamanho empilhadas"
          (isso pareceria amador). <style> com media query porque inline
          style não suporta @media. */}
      <style>{`
        .space-mosaic {
          display: grid;
          grid-template-columns: 58fr 42fr;
          grid-template-rows: 34vh 21vh 220px;
          gap: 12px;
        }
        .space-mosaic .space-ambiente { grid-column: 1 / 2; grid-row: 1 / 3; }
        .space-mosaic .space-croissant { grid-column: 2 / 3; grid-row: 1 / 2; }
        .space-mosaic .space-espresso { grid-column: 2 / 3; grid-row: 2 / 3; }
        .space-mosaic .space-carrotcake { grid-column: 1 / 3; grid-row: 3 / 4; }
        @media (max-width: 767px) {
          .space-mosaic {
            grid-template-columns: 1fr;
            grid-template-rows: 60vh 50vh 40vh 55vh;
            gap: 10px;
          }
          .space-mosaic .space-ambiente,
          .space-mosaic .space-croissant,
          .space-mosaic .space-espresso,
          .space-mosaic .space-carrotcake {
            grid-column: 1 / 2;
          }
          .space-mosaic .space-ambiente { grid-row: 1 / 2; }
          .space-mosaic .space-croissant { grid-row: 2 / 3; }
          .space-mosaic .space-espresso { grid-row: 3 / 4; }
          .space-mosaic .space-carrotcake { grid-row: 4 / 5; }
        }
      `}</style>
      <div className="space-mosaic">
        <GalleryPhoto
          src="/images/gallery/ambiente.jpg"
          sizes="(max-width: 767px) 100vw, 58vw"
          index={0}
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
          className="space-croissant"
        />
        <GalleryPhoto
          src="/images/gallery/espresso.png"
          sizes="(max-width: 767px) 100vw, 42vw"
          index={2}
          className="space-espresso"
        />
        <GalleryPhoto
          src="/images/gallery/carrotcake.png"
          sizes="100vw"
          index={3}
          className="space-carrotcake"
        />
      </div>
    </section>
  );
}
