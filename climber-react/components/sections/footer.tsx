"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Mais escuro que Reviews/Visit (#1C1614) — degrau sutil de fim de página,
// os dois tons são próximos o bastante pra não precisar de gradiente de
// emenda (diferente da transição creme -> escuro lá em cima).
const BG = "#141010";
const CREAM = "#EDE7DC";
const MUTED = "#6b5f52";
const LINK_COLOR = "#5a4f42";

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });

  return (
    <footer id="footer" ref={ref} className="w-full" style={{ backgroundColor: BG }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-8 sm:px-16 md:flex-row md:items-center md:justify-between"
        style={{ paddingTop: "6vh", paddingBottom: "6vh" }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "1.5rem",
              color: CREAM,
            }}
          >
            THE ROOM
          </div>
          <div
            className="uppercase"
            style={{
              marginTop: "0.6rem",
              fontFamily: "var(--font-archivo)",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              color: MUTED,
            }}
          >
            Est. 2019 · 100% Arabica · Dublin
          </div>
        </div>

        <div
          className="flex items-center gap-6"
          style={{ fontFamily: "var(--font-archivo)", fontSize: "0.7rem", color: LINK_COLOR }}
        >
          <a href="#" className="transition-colors duration-300 hover:text-[#EDE7DC]">
            Instagram
          </a>
          <span>·</span>
          <a href="mailto:hello@theroom.ie" className="transition-colors duration-300 hover:text-[#EDE7DC]">
            hello@theroom.ie
          </a>
          <span>·</span>
          <span>© 2026</span>
        </div>
      </motion.div>
    </footer>
  );
}
