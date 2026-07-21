"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";

// Primeira seção escura depois do creme do THE SPACE — mesmo tom exato do
// Menu (#1C1614), pra Reviews/Visit lerem como UM MESMO bloco escuro
// contínuo (zero corte entre elas). A emenda com o creme de cima é feita
// pelo gradiente no topo desta section (ver `SEAM_HEIGHT` abaixo), não por
// uma linha de cor sólida.
const BG = "#1C1614";
const SEAM_FROM = "#EDE7DC";
const CREAM = "#EDE7DC";
const GOLD = "#C89B6A";
const ATTRIBUTION_COLOR = "#8a7d6a";
const RULE_COLOR = "rgba(237,231,220,0.08)";

const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

const SEAM_HEIGHT = "18vh";
const ROTATE_INTERVAL_MS = 5000;
const FADE_DURATION = 0.8;

interface Review {
  quote: string;
  attribution: string;
}

const REVIEWS: Review[] = [
  { quote: "Best flat white in Dublin. The room feels like home.", attribution: "SARAH M. · GOOGLE ★★★★★" },
  { quote: "I come here every morning before work. The pour is a ritual.", attribution: "JAMES O. · GOOGLE ★★★★★" },
  { quote: "Beautiful space, better coffee. The pastel de nata is unreal.", attribution: "CLARA D. · GOOGLE ★★★★★" },
];

export function Reviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3, once: true });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % REVIEWS.length), ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const current = REVIEWS[index];

  return (
    <section id="reviews" ref={sectionRef} className="relative w-full" style={{ backgroundColor: BG }}>
      {/* Emenda com o creme do THE SPACE: gradiente, não linha de corte. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: SEAM_HEIGHT, background: `linear-gradient(to bottom, ${SEAM_FROM}, ${BG})` }}
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-8 sm:px-16" style={{ paddingTop: "20vh", paddingBottom: "18vh" }}>
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

        <div className="overflow-hidden">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: inView ? "0%" : "100%" }}
            transition={{ duration: 0.7, ease: EASE_POWER3_OUT, delay: 0.08 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: FADE_DURATION, ease: "easeInOut" }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-instrument-serif)",
                    fontStyle: "italic",
                    fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                    color: CREAM,
                    lineHeight: 1.3,
                    maxWidth: "20ch",
                  }}
                >
                  &ldquo;{current.quote}&rdquo;
                </p>
                <p
                  className="uppercase"
                  style={{
                    marginTop: "3vh",
                    fontFamily: "var(--font-archivo)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.2em",
                    color: ATTRIBUTION_COLOR,
                  }}
                >
                  — {current.attribution}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
