"use client";

import { motion, type Transition } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion, useIsDesktop } from "./hooks";

type LineRevealProps = {
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  /** true = anima ao montar (hero); false = anima ao entrar na viewport */
  onMount?: boolean;
  delay?: number;
};

const EASE: Transition["ease"] = [0.16, 1, 0.3, 1];

// Cada linha é pré-composta pelo autor do copy (mesma quebra aprovada no
// mockup), não quebrada em tempo de execução — evita depender de um
// SplitText/medição de DOM que este projeto não tem instalado.
// Cada linha vive num contêiner com overflow hidden; só a linha (transform:
// translateY) anima, nunca a altura do contêiner.
export function LineReveal({
  lines,
  as = "h2",
  className = "",
  lineClassName = "",
  onMount = false,
  delay = 0,
}: LineRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const Tag = as;

  // Fase 29 (emergência): mesma regra do StaggerGroup/StaggerItem — abaixo
  // de 769px nunca depende de whileInView (IntersectionObserver) pra ficar
  // visível. onMount=true (hero) já não passa por aqui de qualquer forma
  // (Hero é Server Component com reveal em CSS puro); isto cobre os usos
  // com whileInView (headline do manifesto).
  if (reducedMotion || !isDesktop) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className={`block ${lineClassName}`}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.09, delayChildren: delay },
    },
  };

  const line = {
    hidden: { y: "110%" },
    show: {
      y: "0%",
      transition: { duration: 0.9, ease: EASE },
    },
  };

  return (
    <Tag className={className}>
      <motion.span
        className="block"
        variants={container}
        initial="hidden"
        {...(onMount
          ? { animate: "show" }
          : { whileInView: "show", viewport: { once: true, amount: 0.6 } })}
      >
        {lines.map((text, i) => (
          <span key={i} className={`block overflow-hidden ${lineClassName}`}>
            <motion.span className="block" variants={line}>
              {text}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
