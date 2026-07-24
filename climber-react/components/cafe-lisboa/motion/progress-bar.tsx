"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// Indicador de progresso fixo. Anima scaleX (transform), nunca width —
// transformOrigin fixa a barra crescendo da esquerda, exatamente como uma
// largura cresceria, mas compositada pela GPU em vez de disparar layout.
export function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-[#8B4A2F]"
      style={{ scaleX }}
    />
  );
}
