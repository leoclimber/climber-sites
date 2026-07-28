"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { usePrefersReducedMotion, useIsDesktop } from "./hooks";

type MaskRevealProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** ordem no stagger de um grupo (mosaico) — cada slot atrasa +0.1s */
  index?: number;
  maskColor?: string;
};

// Revelação de foto por máscara: um retângulo sólido cobre a foto e encolhe
// com scaleY (transform-origin: top), 1 -> 0. Como a origem fica no topo, o
// retângulo desaparece começando pela base — a foto "descobre de baixo pra
// cima". Só `transform` anima; a foto por baixo não muda de tamanho,
// posição nem opacidade.
export function MaskReveal({
  children,
  className = "",
  style,
  index = 0,
  maskColor = "#FAF8F5",
}: MaskRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  // Fase 19 [SO DESKTOP]: no desktop este wipe vira no-op (ver useIsDesktop
  // em ./hooks) — o novo sistema de entrada por clip-path+scale
  // (motion/photo-reveal.tsx) assume a foto lá. Mobile nunca lê
  // isDesktop=true, então continua exatamente no ramo animado de sempre.
  const isDesktop = useIsDesktop();

  if (reducedMotion || isDesktop) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: maskColor, transformOrigin: "top" }}
        initial={{ scaleY: 1 }}
        whileInView={{ scaleY: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.8,
          ease: [0.65, 0, 0.35, 1],
          delay: index * 0.1,
        }}
      />
    </div>
  );
}
