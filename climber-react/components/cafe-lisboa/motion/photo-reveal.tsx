"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePrefersReducedMotion } from "./hooks";

type PhotoRevealProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** ms de atraso no gatilho — mosaico usa index*60, o resto fica em 0. */
  delayMs?: number;
  /** só o mosaico recebe o hover-zoom (pointer:fine); manifesto/fachada não. */
  hoverScale?: boolean;
  /** quadro ocupa o pai via position:absolute+inset:0 em vez de relative
      (facade-vertical.jpg em hours.tsx, onde o pai já é o <a> posicionado). */
  fill?: boolean;
};

// Sistema de entrada das fotos do DESKTOP (Fase 19) — substitui o wipe de
// retângulo do MaskReveal (que continua intocado, exclusivo do mobile, ver
// useIsDesktop em ./hooks). Só duas propriedades animam, as duas
// compositáveis (nunca disparam layout/paint): o QUADRO (este componente)
// vai de clip-path inset(100% 0 0 0) a inset(0% 0 0 0) — "descobre de baixo
// pra cima" sem nunca mudar de tamanho ou posição; a IMAGEM (wrapper
// .cl-photo-reveal-img, filho direto) vai de scale(1.12) a scale(1). As
// durações/curvas e o próprio disparo por IntersectionObserver (threshold
// 0.15, uma vez só) vivem inteiramente em CSS (app/cafe-lisboa/styles.css)
// gated por @media (min-width:769px) — o componente só adiciona/remove as
// classes de estado; zero JS decide COMO anima.
export function PhotoReveal({
  children,
  className = "",
  style,
  delayMs = 0,
  hoverScale = false,
  fill = false,
}: PhotoRevealProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true);
      setEntranceDone(true);
      return;
    }
    const el = frameRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const clipClasses = [
    "cl-photo-reveal-clip",
    revealed && "cl-revealed",
    entranceDone && "cl-photo-reveal-entrance-done",
    hoverScale && "cl-photo-reveal-hover",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    // frameRef é o elemento OBSERVADO pelo IntersectionObserver — precisa
    // ficar de fora do clip-path animado. Um elemento com
    // clip-path:inset(100%) (0% visível) é reportado pelo Chromium como
    // interseção ZERO mesmo estando geometricamente dentro da viewport —
    // observar o próprio elemento clipado é um deadlock (nunca "entra em
    // viewport" pra disparar a revelação que o tiraria do clip). Por isso
    // o clip-path vive num filho (.cl-photo-reveal-clip), nunca no nó
    // observado.
    <div
      ref={frameRef}
      className={`cl-photo-reveal-frame ${className}`}
      style={{
        position: fill ? "absolute" : "relative",
        ...(fill ? { inset: 0 } : {}),
        ["--cl-reveal-delay" as string]: `${delayMs}ms`,
        ...style,
      }}
    >
      <div
        className={clipClasses}
        onTransitionEnd={(e) => {
          if (e.propertyName === "clip-path") setEntranceDone(true);
        }}
      >
        <div className="cl-photo-reveal-img h-full w-full">{children}</div>
      </div>
    </div>
  );
}
