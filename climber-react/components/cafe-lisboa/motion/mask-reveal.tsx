"use client";

import type { CSSProperties, ReactNode } from "react";

type MaskRevealProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** mantidos na assinatura só pra não quebrar os chamadores existentes
      (gallery-grid.tsx) — sem efeito nenhum, ver nota da Fase 29 abaixo. */
  index?: number;
  maskColor?: string;
};

// Fase 29 (emergência): o wipe animado (retângulo cobrindo a foto, scaleY
// 1->0 disparado por whileInView) saiu inteiramente. No desktop já era
// no-op desde a Fase 19 (o clip-path+scale de PhotoReveal assumiu a entrada
// das fotos lá); no mobile era o ÚNICO reveal ativo — e um whileInView que
// não disparasse (por qualquer motivo: layout, timing, navegador) deixava
// a foto para sempre coberta pelo retângulo da máscara, sem nenhum jeito
// de recuperar. Regra desta fase: nenhum elemento abaixo de 769px pode
// depender de IntersectionObserver pra ficar visível — então este
// componente vira um wrapper estático em qualquer tamanho de tela.
export function MaskReveal({ children, className = "", style }: MaskRevealProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {children}
    </div>
  );
}
