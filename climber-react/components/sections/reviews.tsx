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
const ATTRIBUTION_COLOR = "#8a7d6a";
const RULE_COLOR = "rgba(237,231,220,0.08)";

const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

// A emenda com o creme do THE SPACE virou o PALCO da frase editorial (ver
// PhraseSeam abaixo) em vez de um gradiente vazio — o gradiente fica
// concentrado nos últimos ~35% da faixa, então a frase inteira cai sobre
// creme sólido (texto escuro lê perfeito) e só DEPOIS dela o fundo escurece
// pra receber o "(What They Say)".
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

function PhraseSeam() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, ${SEAM_FROM} 0%, ${SEAM_FROM} 62%, ${BG} 100%)`,
        paddingTop: "12vh",
        paddingBottom: "12vh",
      }}
    >
      <div ref={ref} className="mx-auto flex w-full justify-center px-8 sm:px-16">
        <h2
          className="text-center"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            fontStyle: "italic",
            fontSize: "clamp(3rem, 6vw, 6rem)",
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
                transition={{ duration: 0.8, ease: EASE_POWER3_OUT, delay: i * 0.1 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
}

export function Reviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.2, once: true });

  return (
    <section id="reviews" ref={sectionRef} className="w-full" style={{ backgroundColor: BG }}>
      <PhraseSeam />

      <div className="mx-auto w-full max-w-[1400px] px-8 sm:px-16" style={{ paddingTop: "6vh", paddingBottom: "18vh" }}>
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
                    fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)",
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
                    color: ATTRIBUTION_COLOR,
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
