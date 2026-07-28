"use client";

import { motion, type Transition } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion, useIsDesktop } from "./hooks";

const EASE: Transition["ease"] = [0.16, 1, 0.3, 1];

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul";
};

// Fase 29 (emergência): o reveal (initial="hidden" + whileInView) rodava em
// QUALQUER largura de tela — se o whileInView não disparasse por qualquer
// motivo no mobile (layout, timing, navegador), o conteúdo ficava preso em
// opacity:0 pra sempre. Regra desta fase: nenhum elemento abaixo de 769px
// pode depender de IntersectionObserver pra ficar visível. !isDesktop cai
// no mesmo ramo estático do reducedMotion — nem monta o motion.* component,
// então nenhum observer chega a ser criado.
//
// Contêiner: dispara o stagger dos StaggerItem filhos quando entra na
// viewport (SÓ NO DESKTOP agora). Usar um StaggerGroup por bloco (lista do
// cardápio, grade de preços, etc.) — não um só pra página inteira.
export function StaggerGroup({
  children,
  className = "",
  stagger = 0.08,
  as = "div",
}: StaggerGroupProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const MotionTag = as === "ul" ? motion.ul : motion.div;

  if (reducedMotion || !isDesktop) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </MotionTag>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
};

export function StaggerItem({ children, className = "", as = "div" }: StaggerItemProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const MotionTag = as === "li" ? motion.li : motion.div;

  if (reducedMotion || !isDesktop) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </MotionTag>
  );
}
