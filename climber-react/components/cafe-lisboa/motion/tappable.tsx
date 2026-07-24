"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { useMemo, type ElementType, type ReactNode } from "react";
import { usePrefersReducedMotion } from "./hooks";

// Feedback de toque padrão do site: escala 0.97 + opacidade 0.7 em QUALQUER
// elemento tocável (item de cardápio, foto do mosaico, aba, CTA). Um só
// lugar define os dois números — não duplica whileTap em cada seção.
// motion.create() é criado uma vez por tag (useMemo) — chamá-lo a cada
// render criaria um tipo de componente novo a cada vez e remontaria o DOM.
type TappableProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
} & Omit<HTMLMotionProps<"button">, "children" | "className">;

export function Tappable({ as = "button", children, className = "", ...rest }: TappableProps) {
  const reducedMotion = usePrefersReducedMotion();
  const MotionTag = useMemo(() => motion.create(as), [as]);

  return (
    <MotionTag
      className={className}
      whileTap={reducedMotion ? undefined : { scale: 0.97, opacity: 0.7 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
