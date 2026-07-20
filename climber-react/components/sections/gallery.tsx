"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView, useTransform, useScroll } from "framer-motion";

// Fundo claro (creme) — mesmo tom do About, respiro entre o escuro do
// Menu e o resto da página. Texto escuro em cima, mesma tinta do About.
const BG = "#EDE7DC";
const INK = "#151008";
const RULE_COLOR = "rgba(60,40,30,0.15)";

// Proporção REAL de cada foto-fonte (medida direto do arquivo, não
// estimada — ver public/images/gallery/): ambiente 5456x3056, as outras
// 4 (croissant, espresso, carrotcake, avocadotoast) são todas 1200x672.
// Usadas como aspect-ratio da própria moldura (ver GalleryPhoto) — como a
// moldura tem a MESMA proporção da foto, object-fit:cover não tem nada
// pra cortar (a imagem já cai exata) e não sobra faixa nenhuma. Zero
// corte, zero faixa, sempre — qualquer que seja a proporção da foto.
const AMBIENTE_RATIO = "5456 / 3056";
const ITEM_RATIO = "1200 / 672";

const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

// Reveal em cascata (mesma linguagem do SOBRE NÓS): cortina clip-path
// abrindo de baixo pra cima + de-zoom simultâneo, com stagger curto entre
// as 5 fotos — disparado UMA VEZ pela seção inteira (não por foto).
const REVEAL_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const REVEAL_DURATION = 1.2;
const REVEAL_SCALE_FROM = 1.12;
const REVEAL_STAGGER = 0.09;

function GalleryPhoto({
  src,
  aspectRatio,
  sizes,
  index,
  sectionInView,
  className,
  children,
}: {
  src: string;
  aspectRatio: string;
  sizes: string;
  index: number;
  sectionInView: boolean;
  className: string;
  children?: React.ReactNode;
}) {
  const delay = index * REVEAL_STAGGER;

  return (
    // Container com overflow:hidden e aspect-ratio IGUAL ao da foto — a
    // largura vem do grid/flex (ver <style> abaixo), a altura é
    // CONSEQUÊNCIA dessa largura via aspect-ratio (nunca uma vh fixa
    // arbitrária). Isso garante zero corte E zero faixa ao mesmo tempo: a
    // moldura tem exatamente a forma da foto. O container em si nunca
    // muda de tamanho no hover, só o conteúdo dentro dele anima
    // (puramente cosmético, GPU, nunca mexe em layout — é a correção do
    // bug de scroll travando).
    <div className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio }}>
      {/* Cortina: abre de baixo pra cima. */}
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={{ clipPath: sectionInView ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
        transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE, delay }}
      >
        {/* De-zoom do reveal (scale 1.12 -> 1), dispara junto com a
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
              capturado por nada. Só reage à foto sob o cursor. */}
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

      {/* Mosaico assimétrico full-bleed, 5 fotos: FORA do container com
          max-width/padding acima, direto como filho da section — encosta
          em x=0 e x=100vw.

          Por que 2 colunas com 2 itens empilhados em CADA uma (em vez de
          uma foto "grande" solta): como as 5 fotos-fonte têm quase a
          MESMA proporção (~1.786:1 — ver AMBIENTE_RATIO/ITEM_RATIO),
          duas fotos que dividem a MESMA largura sempre saem com a MESMA
          altura (largura/proporção = altura, proporção fixa). Ou seja,
          pra ter tamanhos REALMENTE diferentes sem cortar nada, cada
          "nível" de tamanho precisa da sua PRÓPRIA largura — daí a
          estrutura: coluna esquerda (43%) = ambiente + carrotcake
          empilhados (mesma largura, tamanho "médio-grande" entre si);
          coluna direita (57%) = croissant sozinho no topo (largura
          cheia da coluna, MAIOR peça do mosaico) + espresso/avocado
          lado a lado embaixo (dividem a largura da coluna ao meio,
          ficam bem menores). Resultado: 3 tamanhos visivelmente
          diferentes (croissant grande; ambiente/carrotcake médios;
          espresso/avocado pequenos, em par) — mosaico de verdade, não
          grade. As duas colunas fecham na MESMA altura total (43/57 foi
          calculado pra isso), sem espaço morto.

          Mobile (<768px): 1 coluna — as duas sub-colunas (esquerda e
          direita) e o par espresso/avocado (que também é seu próprio
          flex-row) todos colapsam pra largura total, empilhando as 5
          fotos na ordem do DOM, cada uma na proporção real dela. <style>
          com media query porque inline style não suporta @media. */}
      <style>{`
        .space-grid {
          display: grid;
          grid-template-columns: 43fr 57fr;
          gap: 12px;
          align-items: start;
        }
        .space-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .space-pair {
          display: flex;
          flex-direction: row;
          gap: 12px;
        }
        @media (max-width: 767px) {
          .space-grid {
            grid-template-columns: 1fr;
          }
          .space-pair {
            flex-direction: column;
          }
        }
      `}</style>
      <div className="space-grid">
        <div className="space-col">
          <GalleryPhoto
            src="/images/gallery/ambiente.jpg"
            aspectRatio={AMBIENTE_RATIO}
            sizes="(max-width: 767px) 100vw, 43vw"
            index={0}
            sectionInView={sectionInView}
            className=""
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
            src="/images/gallery/carrotcake.png"
            aspectRatio={ITEM_RATIO}
            sizes="(max-width: 767px) 100vw, 43vw"
            index={3}
            sectionInView={sectionInView}
            className=""
          />
        </div>

        <div className="space-col">
          <GalleryPhoto
            src="/images/gallery/croissant.png"
            aspectRatio={ITEM_RATIO}
            sizes="(max-width: 767px) 100vw, 57vw"
            index={1}
            sectionInView={sectionInView}
            className=""
          />

          <div className="space-pair">
            <GalleryPhoto
              src="/images/gallery/espresso.png"
              aspectRatio={ITEM_RATIO}
              sizes="(max-width: 767px) 100vw, 27vw"
              index={2}
              sectionInView={sectionInView}
              className=""
            />
            <GalleryPhoto
              src="/images/gallery/avocadotoast.png"
              aspectRatio={ITEM_RATIO}
              sizes="(max-width: 767px) 100vw, 27vw"
              index={4}
              sectionInView={sectionInView}
              className=""
            />
          </div>
        </div>
      </div>
    </section>
  );
}
