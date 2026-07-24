"use client";

import { motion, type Transition } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "./hooks";

const EASE: Transition["ease"] = [0.16, 1, 0.3, 1];

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul";
};

// Contêiner: dispara o stagger dos StaggerItem filhos quando entra na
// viewport. Usar um StaggerGroup por bloco (lista do cardápio, grade de
// preços, etc.) — não um só pra página inteira.
export function StaggerGroup({
  children,
  className = "",
  stagger = 0.08,
  as = "div",
}: StaggerGroupProps) {
  const reducedMotion = usePrefersReducedMotion();
  const MotionTag = as === "ul" ? motion.ul : motion.div;

  if (reducedMotion) {
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
  const MotionTag = as === "li" ? motion.li : motion.div;

  if (reducedMotion) {
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
