"use client";

import Image from "next/image";
import { useRef } from "react";
import { interpolate, useMotionValueEvent, useScroll } from "framer-motion";
import { usePrefersReducedMotion } from "./motion/hooks";
import { routineSteps } from "./data";

// Rodada 7: trocado o crossfade discreto (desktop) + carrossel snap (mobile)
// por UM scrub contínuo só, baseado em scroll nativo, nas duas telas — só o
// CSS de layout muda (lado a lado no desktop, empilhado no mobile). Rolagem
// nativa dentro de um wrapper alto já dá "para no meio se soltar no meio" e
// bidirecional de graça, sem reimplementar detecção de gesto por JS (o
// próprio components/smooth-scroll.tsx documenta o quanto isso é frágil
// pra touch real neste projeto — não repetir aqui).
//
// Escrita no DOM via CSS custom properties num único ref (não vários
// useTransform ligados via `style` em elementos diferentes): medido nesta
// rodada que, com 6 useTransform derivados do mesmo scrollYProgress
// alimentando `style` em elementos DIFERENTES, o valor interno da motion
// value (.get()) ficava sempre correto mas a escrita real no DOM travava no
// valor do primeiro render pra ALGUNS dos elementos (não todos, sem padrão
// óbvio) — confirmado em dev E build de produção, não era artefato do
// Strict Mode. Uma escrita imperativa só, no elemento ancestral comum,
// elimina a dependência nesse mecanismo por completo.
const B1 = 0.3;
const B2 = 0.36;
const B3 = 0.64;
const B4 = 0.7;
const STOPS = [0, B1, B2, B3, B4, 1];

const BG = interpolate(STOPS, ["#2A1D14", "#2A1D14", "#6B4A33", "#6B4A33", "#EDE4D6", "#EDE4D6"]);
const FG = interpolate(STOPS, ["#F5EFE6", "#F5EFE6", "#F5EFE6", "#F5EFE6", "#1C1917", "#1C1917"]);
const MUTED = interpolate(STOPS, ["#C9B8A8", "#C9B8A8", "#DCC9B6", "#DCC9B6", "#78716C", "#78716C"]);
const OPACITY_BEAN = interpolate([0, B1, B2], [1, 1, 0]);
const OPACITY_METHOD = interpolate([B1, B2, B3, B4], [0, 1, 1, 0]);
const OPACITY_CUP = interpolate([B3, B4, 1], [0, 1, 1]);
const OPACITY_BY_INDEX = [OPACITY_BEAN, OPACITY_METHOD, OPACITY_CUP];
const PANEL_OPACITY_VAR = ["--cl-op-0", "--cl-op-1", "--cl-op-2"] as const;

export function Routine() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <RoutineStatic />;
  }

  return <RoutineScrub wrapperRef={wrapperRef} />;
}

function RoutineScrub({ wrapperRef }: { wrapperRef: React.RefObject<HTMLDivElement | null> }) {
  const stickyRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const node = stickyRef.current;
    if (!node) return;
    node.style.backgroundColor = BG(p);
    node.style.setProperty("--cl-fg", FG(p));
    node.style.setProperty("--cl-muted", MUTED(p));
    node.style.setProperty("--cl-op-0", String(OPACITY_BEAN(p)));
    node.style.setProperty("--cl-op-1", String(OPACITY_METHOD(p)));
    node.style.setProperty("--cl-op-2", String(OPACITY_CUP(p)));
  });

  return (
    <div ref={wrapperRef} id="cl-routine" className="relative h-[340vh]">
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen overflow-hidden"
        style={
          {
            backgroundColor: "#2A1D14",
            "--cl-fg": "#F5EFE6",
            "--cl-muted": "#C9B8A8",
            "--cl-op-0": "1",
            "--cl-op-1": "0",
            "--cl-op-2": "0",
          } as React.CSSProperties
        }
      >
        <div
          className="absolute left-6 top-8 z-10 flex items-center gap-3 text-[0.8125rem] tracking-[0.15em] text-[var(--cl-muted)] [text-shadow:0_1px_8px_rgba(0,0,0,0.35)] md:left-16 md:top-10 md:[text-shadow:none]"
        >
          <span className="h-6 w-[2px] bg-[var(--cl-fg)]" aria-hidden />
          04 · A ROTINA
        </div>

        {routineSteps.map((step, i) => (
          <div
            key={step.label}
            className="absolute inset-0 flex flex-col md:flex-row"
            style={{ opacity: `var(${PANEL_OPACITY_VAR[i]})` }}
          >
            <div className="relative h-[42vh] w-full shrink-0 overflow-hidden md:h-full md:w-[45%]">
              <Image
                src={step.image}
                alt={`${step.label} — Café Lisboa's coffee routine`}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                loading="lazy"
                className="object-cover"
              />
            </div>

            <div className="relative flex flex-1 flex-col justify-center gap-3 px-6 py-8 md:px-16">
              <div className="flex items-center gap-3 text-[0.875rem] tracking-[0.05em] text-[var(--cl-muted)]">
                <span className="h-px w-10 bg-current" aria-hidden />
                {String(i + 1).padStart(2, "0")} / 03
              </div>
              <h3 className="font-[family-name:var(--font-newsreader)] text-[clamp(1.9rem,4vw,2.75rem)] text-[var(--cl-fg)]">
                {step.label}
              </h3>
              <div className="flex flex-col gap-1 text-[1.0625rem] leading-[1.6] text-[var(--cl-muted)] md:hidden">
                {step.mobileLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="hidden flex-col gap-1 text-[1.0625rem] leading-[1.6] text-[var(--cl-muted)] md:flex">
                {step.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// prefers-reduced-motion: nada de pin nem scroll-scrub — os 3 passos viram
// uma lista empilhada normal, cada um com sua própria foto e fundo fixo.
function RoutineStatic() {
  const bg = ["#2A1D14", "#6B4A33", "#EDE4D6"];
  const fg = ["#F5EFE6", "#F5EFE6", "#1C1917"];
  const muted = ["#C9B8A8", "#DCC9B6", "#78716C"];

  return (
    <section id="cl-routine">
      <div className="bg-[#FAF8F5] px-6 pt-16 md:px-16 md:pt-24">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-6 w-[2px] bg-[#8B4A2F]" aria-hidden />
          <span className="text-[0.8125rem] tracking-[0.15em] text-[#78716C]">04 · A Rotina</span>
        </div>
      </div>
      {routineSteps.map((step, i) => (
        <div key={step.label} className="flex flex-col md:flex-row" style={{ backgroundColor: bg[i] }}>
          <div className="relative h-[42vh] w-full shrink-0 md:h-[70vh] md:w-[45%]">
            <Image
              src={step.image}
              alt={`${step.label} — Café Lisboa's coffee routine`}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-3 px-6 py-10 md:px-16">
            <div className="flex items-center gap-3 text-[0.875rem] tracking-[0.05em]" style={{ color: muted[i] }}>
              <span className="h-px w-10 bg-current" aria-hidden />
              {String(i + 1).padStart(2, "0")} / 03
            </div>
            <h3
              className="font-[family-name:var(--font-newsreader)] text-[clamp(1.9rem,4vw,2.75rem)]"
              style={{ color: fg[i] }}
            >
              {step.label}
            </h3>
            <div className="flex flex-col gap-1 text-[1.0625rem] leading-[1.6] md:hidden" style={{ color: muted[i] }}>
              {step.mobileLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="hidden flex-col gap-1 text-[1.0625rem] leading-[1.6] md:flex" style={{ color: muted[i] }}>
              {step.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
