"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Primeira seção escura depois do creme do THE SPACE — mesmo tom exato do
// Menu (#1C1614), pra Reviews/Visit lerem como UM MESMO bloco escuro
// contínuo (zero corte entre elas).
const BG = "#1C1614";
const SEAM_FROM = "#EDE7DC";
const CREAM = "#EDE7DC";
const GOLD = "#C89B6A";
const PHRASE_COLOR = "#3a2f26";
const MUTED = "#8a7d6a";
const ORNAMENT_COLOR = "#a89a7e";
const RULE_COLOR = "rgba(237,231,220,0.08)";

const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

// A emenda com o creme do THE SPACE virou o PALCO da frase editorial (ver
// PhraseSeam abaixo) em vez de um gradiente vazio — o gradiente fica
// concentrado nos últimos ~30% da faixa, então o bloco inteiro (label,
// ornamento, frase, assinatura) cai sobre creme sólido (texto escuro lê
// perfeito) e só DEPOIS dele o fundo escurece pra receber o "(What They
// Say)". Label/ornamento/assinatura são a MOLDURA editorial que ancora a
// frase — sem eles ela flutuava sozinha no vazio ("cara de Canva").
const PHRASE_LINES = ["Coffee, made", "with intention"];

interface Review {
  quote: string;
  attribution: string;
}

const REVIEWS: Review[] = [
  { quote: "Best flat white in Dublin. The room feels like home.", attribution: "SARAH M. · ★★★★★" },
  { quote: "I come here every morning before work. It's a ritual.", attribution: "JAMES O. · ★★★★★" },
  { quote: "Beautiful space, better coffee. The pastel de nata is unreal.", attribution: "CLARA D. · ★★★★★" },
];

// Wrapper reutilizado pros 4 blocos da moldura (label, ornamento, frase,
// assinatura): overflow hidden fora + y:100%->0% dentro, cascata 0.1s de
// cima pra baixo, mesma curva do resto do site.
function MaskBlock({
  children,
  delay,
  inView,
}: {
  children: React.ReactNode;
  delay: number;
  inView: boolean;
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: inView ? "0%" : "100%" }}
        transition={{ duration: 0.7, ease: EASE_POWER3_OUT, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-5">
      <span style={{ width: 78, height: 1, backgroundColor: ORNAMENT_COLOR }} />
      <span style={{ color: ORNAMENT_COLOR, fontSize: "1.3rem" }}>✦</span>
      <span style={{ width: 78, height: 1, backgroundColor: ORNAMENT_COLOR }} />
    </div>
  );
}

// Bloco editorial (label/ornamento/frase/assinatura) em fundo creme SÓLIDO
// — sem gradiente por trás dele, então a legibilidade nunca é questão. A
// transição creme->escuro vira uma faixa CURTA e separada logo abaixo (ver
// GRADIENT_STRIP_HEIGHT), decidida em vez de esticada por metade da tela.
const GRADIENT_STRIP_HEIGHT = "9vh";

function PhraseSeam() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });

  return (
    <>
      <div className="relative w-full" style={{ backgroundColor: SEAM_FROM, paddingTop: "5vh", paddingBottom: "5vh" }}>
        <div ref={ref} className="mx-auto flex w-full flex-col items-center px-8 sm:px-16">
          <MaskBlock delay={0} inView={inView}>
            <span
              className="block text-center uppercase"
              style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", letterSpacing: "0.4em", color: MUTED }}
            >
              ( Our Philosophy )
            </span>
          </MaskBlock>

          <div style={{ marginTop: "3vh", marginBottom: "3vh" }}>
            <MaskBlock delay={0.1} inView={inView}>
              <Ornament />
            </MaskBlock>
          </div>

          <h2
            className="text-center"
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontStyle: "italic",
              // Cap no máximo (6rem) igual ao título do SOBRE NÓS — não
              // ultrapassa as outras seções, só ganha mais presença no
              // meio-campo (min/vw maiores) do que a versão anterior.
              fontSize: "clamp(3.3rem, 6.3vw, 6rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              maxWidth: "16ch",
              color: PHRASE_COLOR,
            }}
          >
            {PHRASE_LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: inView ? "0%" : "100%" }}
                  transition={{ duration: 0.8, ease: EASE_POWER3_OUT, delay: 0.2 + i * 0.1 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h2>

          <div style={{ marginTop: "4vh" }}>
            <MaskBlock delay={0.4} inView={inView}>
              <div style={{ width: 130, height: 1, backgroundColor: ORNAMENT_COLOR, margin: "0 auto" }} />
            </MaskBlock>
          </div>

          <div style={{ marginTop: "2vh" }}>
            <MaskBlock delay={0.45} inView={inView}>
              <span
                className="block text-center uppercase"
                style={{ fontFamily: "var(--font-archivo)", fontSize: "0.9rem", letterSpacing: "0.3em", color: MUTED }}
              >
                Est. 2019 · Dublin
              </span>
            </MaskBlock>
          </div>
        </div>
      </div>

      {/* Faixa curta e decidida — não um fade esticado por metade da
          tela. Fica FORA do bloco editorial (que é creme sólido), então
          não há texto nenhum sobre ela pra se preocupar com legibilidade. */}
      <div
        aria-hidden
        className="w-full"
        style={{ height: GRADIENT_STRIP_HEIGHT, background: `linear-gradient(to bottom, ${SEAM_FROM}, ${BG})` }}
      />
    </>
  );
}

export function Reviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.2, once: true });

  return (
    <section id="reviews" ref={sectionRef} className="w-full" style={{ backgroundColor: BG }}>
      <PhraseSeam />

      <div className="mx-auto w-full max-w-[1400px] px-8 sm:px-16" style={{ paddingTop: "6vh", paddingBottom: "4.5vh" }}>
        <div style={{ marginBottom: "8vh" }} className="overflow-hidden">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: inView ? "0%" : "100%" }}
            transition={{ duration: 0.7, ease: EASE_POWER3_OUT, delay: 0 }}
          >
            <span
              className="block font-mono uppercase"
              style={{ fontSize: "0.7rem", letterSpacing: "0.35em", color: GOLD, opacity: 0.9 }}
            >
              (What They Say)
            </span>
          </motion.div>
          <div className="mt-4 h-px w-full" style={{ backgroundColor: RULE_COLOR }} />
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
          {REVIEWS.map((r, i) => (
            <div key={r.attribution} className="overflow-hidden">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: inView ? "0%" : "100%" }}
                transition={{ duration: 0.7, ease: EASE_POWER3_OUT, delay: 0.08 + i * 0.12 }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-instrument-serif)",
                    fontStyle: "italic",
                    fontSize: "clamp(1.4rem, 2vw, 1.9rem)",
                    color: CREAM,
                    lineHeight: 1.4,
                  }}
                >
                  &ldquo;{r.quote}&rdquo;
                </p>
                <p
                  className="uppercase"
                  style={{
                    marginTop: "2vh",
                    fontFamily: "var(--font-archivo)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    color: MUTED,
                  }}
                >
                  — {r.attribution}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
