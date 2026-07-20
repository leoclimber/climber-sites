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
// Independente por foto (useInView próprio de cada uma) — revelam uma
// após a outra conforme o scroll desce, não todas juntas.
const REVEAL_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const REVEAL_DURATION = 1.3;
const REVEAL_SCALE_FROM = 1.15;
const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

// A imagem interna é 128% da altura da moldura — o excedente (14% em
// cima, 14% embaixo) é o espaço que o parallax (±8%) usa pra deslizar sem
// NUNCA expor fundo vazio (14% de folga de cada lado contra um
// deslocamento máximo de 8% — margem confortável).
// transform:translateY(%) no CSS/Framer é relativo à altura do PRÓPRIO
// elemento (128% da moldura), não à moldura — por isso a conversão: um
// deslocamento pedido em % da MOLDURA vira %/1.28 no elemento em si.
const OVERSCAN_HEIGHT_PERCENT = 128;
const OVERSCAN_EDGE_PERCENT = (OVERSCAN_HEIGHT_PERCENT - 100) / 2;
const PARALLAX_FRAME_PERCENT = 8;
const PARALLAX_ELEMENT_PERCENT = (PARALLAX_FRAME_PERCENT * 100) / OVERSCAN_HEIGHT_PERCENT;

interface PhotoSpec {
  src: string;
  sizes: string;
}

function GalleryPhoto({ photo, className }: { photo: PhotoSpec; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { amount: 0.25, once: true });

  // Parallax contínuo: enquanto a moldura atravessa a viewport (do
  // instante em que o TOPO dela toca o FUNDO da tela até o instante em
  // que a BASE dela toca o TOPO da tela), a imagem desliza por dentro. A
  // moldura em si (este ref) nunca se move — só a imagem.
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${PARALLAX_ELEMENT_PERCENT}%`, `${PARALLAX_ELEMENT_PERCENT}%`]
  );

  const frameStyle: CSSProperties = { position: "relative", overflow: "hidden", width: "100%" };

  return (
    <div ref={frameRef} className={className} style={frameStyle}>
      {/* Cortina: abre de baixo pra cima (mesma linguagem do About). */}
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={{ clipPath: inView ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
        transition={{ duration: REVEAL_DURATION, ease: REVEAL_EASE }}
      >
        {/* Camada de parallax (y, contínua/scroll) — top/height são o
            overscan estático (não animam). */}
        <motion.div
          className="absolute inset-x-0"
          style={{
            top: `-${OVERSCAN_EDGE_PERCENT}%`,
            height: `${OVERSCAN_HEIGHT_PERCENT}%`,
            y,
          }}
        >
          {/* Camada de-zoom do reveal (scale 1.15->1, dispara uma vez) —
              elemento PRÓPRIO porque a camada de cima já usa `y` (não
              conflita com scale, mas mantém a mesma separação em camadas
              usada no resto do site: cada motion value time-based numa
              camada, cada motion value scroll-linked noutra). */}
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

// As 4 fotos: ambiente é a mais importante (foto 1), as outras são apoio
// atmosférico — xícaras em cena, não produto isolado. Tamanhos e posições
// (largura/altura/alinhamento/margin-top) ficam definidos direto no JSX
// abaixo, não aqui, porque cada uma tem uma composição própria (ver
// comentário grande na seção de fotos).
const PHOTO_1: PhotoSpec = { src: "/images/gallery/ambiente.jpg", sizes: "55vw" };
const PHOTO_2: PhotoSpec = { src: "/images/gallery/flatwhite.png", sizes: "40vw" };
const PHOTO_3: PhotoSpec = { src: "/images/gallery/cappuccino.png", sizes: "45vw" };
const PHOTO_4: PhotoSpec = { src: "/images/gallery/space-4.jpg", sizes: "50vw" };

const TITLE_LINES = ["WHERE IT ALL", "HAPPENS"];

// Truque de "breakout" pra sangrar até a borda REAL da viewport (mesmo
// usado em about.tsx pro lado direito): com o pai centralizado via
// mx-auto, margin-{left,right}: calc(50% - 50vw) desloca a borda
// correspondente do elemento até x=0 ou x=100vw, independente da
// largura/padding do container — a álgebra cancela o termo do container,
// funciona pra qualquer largura de foto.
const BLEED_LEFT: CSSProperties = { marginLeft: "calc(50% - 50vw)" };
const BLEED_RIGHT: CSSProperties = { marginLeft: "auto", marginRight: "calc(50% - 50vw)" };

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

        {/* Sequência escalonada tipo revista editorial: 4 fotos em fluxo
            vertical NORMAL (bloco simples, sem grid/flex — cada uma numa
            linha, empilhadas por margin-top), tamanhos variados mas
            próximos (40-55vw), alternando esquerda/direita via o truque
            de sangria acima. Regra crítica: margin-top é sempre POSITIVO
            e maior que zero — nenhuma foto pode encostar/sobrepor a
            anterior, sempre sobra respiro vertical entre elas. */}
        <div className="relative">
          <div style={{ position: "relative", width: "55vw", height: "62vh", ...BLEED_LEFT }}>
            <GalleryPhoto photo={PHOTO_1} className="h-full" />
            {/* Legenda sobre gradiente de legibilidade, canto inferior
                esquerdo — mesma linguagem do caption do About. Absolute
                relativo a ESTE wrapper (position:relative acima), não à
                moldura interna da foto. */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0"
              style={{
                height: "15.5vh" /* 25% de 62vh */,
                background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
              }}
            />
            <div
              className="absolute bottom-0 flex items-center gap-1"
              style={{
                left: 0,
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

          <div style={{ width: "40vw", height: "48vh", marginTop: "6vh", ...BLEED_RIGHT }}>
            <GalleryPhoto photo={PHOTO_2} className="h-full" />
          </div>

          <div style={{ width: "45vw", height: "52vh", marginTop: "8vh", ...BLEED_LEFT }}>
            <GalleryPhoto photo={PHOTO_3} className="h-full" />
          </div>

          <div style={{ width: "50vw", height: "52vh", marginTop: "6vh", ...BLEED_RIGHT }}>
            <GalleryPhoto photo={PHOTO_4} className="h-full" />
          </div>

          <p
            className="uppercase"
            style={{
              marginTop: "4vh",
              width: "50vw",
              textAlign: "right",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              color: INK,
              opacity: 0.45,
              ...BLEED_RIGHT,
            }}
          >
            Est. 2019 — Dublin
          </p>
        </div>
      </div>
    </section>
  );
}
