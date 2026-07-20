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
  width,
  height,
  sizes,
  index,
  className,
  children,
}: {
  src: string;
  width: number;
  height: number;
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
    <div ref={ref} className={`relative block w-full overflow-hidden ${className}`}>
      {/* Reveal: fade + sobe 50px + de-zoom leve (0.94->1), 1.2s, ease
          [0.16,1,0.3,1] — lento e visível, não um pop instantâneo. */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.94 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: REVEAL_DURATION, ease: EASE_LAYER, delay: index * REVEAL_STAGGER }}
      >
        {/* Hover: zoom (1 -> 1.06) + leve clareamento (brightness 1 ->
            1.08), 0.6s ease-out. O pai (div acima, overflow-hidden) tem o
            tamanho EXATO da imagem renderizada (masonry: sem crop, sem
            altura forçada) — então o zoom do hover fica contido dentro
            da própria moldura, não vaza nem empurra o layout ao redor.
            Só reage a ESTA foto (whileHover escopado ao próprio
            elemento). No mobile isso simplesmente nunca dispara (sem
            ponteiro de hover) — não precisa de tratamento especial. */}
        <motion.div
          initial={{ scale: 1, filter: "brightness(1)" }}
          whileHover={{ scale: 1.06, filter: "brightness(1.08)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* SEM `fill` + object-fit:cover (isso corta) — width/height
              reais da imagem-fonte + CSS width:100%/height:auto: a
              moldura assume a forma exata da foto, escalada
              proporcionalmente pra largura da coluna, mostrando 100% do
              conteúdo sempre. Funciona pra QUALQUER proporção de foto de
              cliente, não só paisagem 16:9 como estas 4. */}
          <Image
            src={src}
            width={width}
            height={height}
            alt=""
            sizes={sizes}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
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

      {/* Mosaico full-bleed masonry: FORA do container com max-width/
          padding acima, direto como filho da section (que não tem
          padding horizontal nenhum) — encosta em x=0 e x=100vw.

          Masonry de verdade (CSS multi-column, `columns`, não grid de
          alturas fixas): cada foto NUNCA é cortada — a moldura (a div
          com overflow-hidden em GalleryPhoto) assume a altura exata que
          a própria imagem resulta ao ser escalada pra largura da coluna
          (width:100%/height:auto), não uma altura imposta de fora. Isso
          é o que garante "funciona com qualquer foto de cliente,
          qualquer proporção" — não depende de nenhum número mágico de
          altura calibrado pra ESTAS 4 fotos específicas.

          ambiente usa column-span:all (quebra pra fora do fluxo de 2
          colunas, vira um item full-width sozinho) — é o jeito de dar
          peso visual maior a ela SEM cortar: continua na proporção
          natural dela, só que ocupando a largura toda em vez de meia
          coluna. As outras 3 (croissant/espresso/carrotcake) fluem no
          masonry de 2 colunas abaixo, cada uma na sua altura natural.

          gap: column-gap resolve o espaço HORIZONTAL entre colunas;
          margin-bottom em cada item resolve o espaço VERTICAL entre
          itens empilhados na mesma coluna (columns não tem row-gap).

          Mobile (<768px): columns:1 — todo o masonry vira uma pilha
          única na ordem natural do DOM (ambiente primeiro), cada foto
          ainda na proporção real dela (nada de altura forçada). */}
      <style>{`
        .space-masonry {
          columns: 2;
          column-gap: 12px;
        }
        .space-masonry > div {
          break-inside: avoid;
          margin-bottom: 12px;
        }
        .space-hero {
          column-span: all;
        }
        @media (max-width: 767px) {
          .space-masonry {
            columns: 1;
          }
        }
      `}</style>
      <div className="space-masonry">
        <GalleryPhoto
          src="/images/gallery/ambiente.jpg"
          width={5456}
          height={3056}
          sizes="100vw"
          index={0}
          className="space-hero"
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
          width={1200}
          height={672}
          sizes="(max-width: 767px) 100vw, 50vw"
          index={1}
          className="space-croissant"
        />
        <GalleryPhoto
          src="/images/gallery/espresso.png"
          width={1200}
          height={672}
          sizes="(max-width: 767px) 100vw, 50vw"
          index={2}
          className="space-espresso"
        />
        <GalleryPhoto
          src="/images/gallery/carrotcake.png"
          width={1200}
          height={672}
          sizes="(max-width: 767px) 100vw, 50vw"
          index={3}
          className="space-carrotcake"
        />
      </div>
    </section>
  );
}
