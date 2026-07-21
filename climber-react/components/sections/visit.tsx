"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Mesmo tom exato de Reviews (#1C1614) — sem emenda nenhuma entre as duas
// seções, elas compartilham a mesma base escura (zero gradiente aqui).
const BG = "#1C1614";
const CREAM = "#EDE7DC";
const GOLD = "#C89B6A";
const ADDRESS_COLOR = "#b5a992";
const RULE_COLOR = "rgba(237,231,220,0.08)";

const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

const TITLE_LINES = ["COME SAY", "HELLO"];

const ADDRESS_LINES = ["12 Fade Street, Dublin 2", "Mon–Fri 7:00–18:00", "Sat–Sun 8:00–17:00"];

const MAP_QUERY = "12 Fade Street, Dublin 2, Ireland";
const MAP_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=15&output=embed`;

export function Visit() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.25, once: true });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInView = useInView(mapRef, { amount: 0.2, once: true });

  return (
    <section id="visit" ref={sectionRef} className="w-full" style={{ backgroundColor: BG }}>
      <div className="mx-auto w-full max-w-[1400px] px-8 sm:px-16" style={{ paddingTop: "5vh", paddingBottom: "16vh" }}>
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
              (Visit)
            </span>
          </motion.div>
          <div className="mt-4 h-px w-full" style={{ backgroundColor: RULE_COLOR }} />
        </div>

        <div className="flex flex-col gap-12 md:flex-row md:gap-[6%]">
          <div className="w-full md:w-[45%]">
            <h2
              className="uppercase"
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 800,
                fontSize: "clamp(2.8rem, 5vw, 5rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                color: CREAM,
              }}
            >
              {TITLE_LINES.map((line, i) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: "100%" }}
                    animate={{ y: inView ? "0%" : "100%" }}
                    transition={{ duration: 0.7, ease: EASE_POWER3_OUT, delay: 0.16 + i * 0.08 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h2>

            <div style={{ marginTop: "6vh" }} className="overflow-hidden">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: inView ? "0%" : "100%" }}
                transition={{ duration: 0.7, ease: EASE_POWER3_OUT, delay: 0.32 }}
              >
                {ADDRESS_LINES.map((line) => (
                  <p
                    key={line}
                    style={{
                      fontFamily: "var(--font-archivo)",
                      fontSize: "0.9rem",
                      color: ADDRESS_COLOR,
                      lineHeight: 1.8,
                    }}
                  >
                    {line}
                  </p>
                ))}
              </motion.div>
            </div>
          </div>

          <div ref={mapRef} className="h-[40vh] w-full md:h-[50vh] md:w-[50%]">
            <motion.iframe
              title="Map"
              src={MAP_SRC}
              loading="lazy"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={mapInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.9, ease: EASE_POWER3_OUT }}
              className="h-full w-full border-0"
              style={{ borderRadius: "4px", filter: "invert(0.9) hue-rotate(180deg)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
