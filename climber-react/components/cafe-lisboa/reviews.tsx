"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Rule } from "./manifesto";
import { useContinuousStrip, usePrefersReducedMotion } from "./motion";
import { reviews } from "./data";

// Fase 24c [NOS DOIS]: esteira contínua (motor compartilhado com o marquee
// do rodapé, ver components/cafe-lisboa/motion/continuous-strip.ts) —
// substitui o embla-carousel (loop por snap + autoplay que andava e parava)
// por rolagem contínua sem emenda, sempre rodando. Arraste soma velocidade
// (mesma física do scroll do marquee) e decai de volta à base sozinho. As 6
// avaliações, o texto e o visual do QuoteCard (Fase 18) são intocados —
// só o mecanismo de movimento muda.
const REVIEWS_BASE_SPEED_PX_PER_SEC = 25;

export function Reviews() {
  return (
    <section id="cl-reviews" className="bg-[#FAF8F5] pb-6 pt-[58px] md:pb-12 md:pt-[110px]">
      <div className="px-6 md:px-16">
        <Rule label="07 · Avaliações" />
      </div>
      <ReviewsCarousel />
    </section>
  );
}

function ReviewsCarousel() {
  const reducedMotion = usePrefersReducedMotion();
  const { trackRef, pushDelta, getProgress } = useContinuousStrip({
    baseSpeedPxPerSec: REVIEWS_BASE_SPEED_PX_PER_SEC,
    reducedMotion,
    direction: 1,
  });
  const drag = useRef({ dragging: false, lastX: 0 });
  const [displayIndex, setDisplayIndex] = useState(0);

  // Indicador "01 / 06" do mobile (decorativo, aria-hidden) — não existe
  // mais uma API de carrossel com "slide selecionado"; deriva o índice
  // aproximado direto do progresso contínuo do motor, num polling leve
  // (200ms) pra não gerar um re-render por frame de animação.
  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      const track = trackRef.current;
      if (!track || reviews.length === 0) return;
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      const cardStep = half / reviews.length;
      const idx = Math.floor(getProgress() / cardStep) % reviews.length;
      setDisplayIndex(idx);
    }, 200);
    return () => clearInterval(id);
  }, [reducedMotion, getProgress, trackRef]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    drag.current.dragging = true;
    drag.current.lastX = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.dragging) return;
    const delta = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    // Arrastar pra esquerda (delta negativo) acelera o sentido natural da
    // esteira (direita->esquerda, o mesmo do scroll pra baixo no marquee).
    pushDelta(-delta);
  }
  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    drag.current.dragging = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  if (reducedMotion) {
    // Fase 24c: parado, mostrando as 3 primeiras (era as 6 empilhadas).
    return (
      <div className="mt-10 flex gap-6 px-6 md:mt-12 md:gap-8 md:px-16">
        {reviews.slice(0, 3).map((r) => (
          <div key={r.author} className="min-w-0 shrink-0 grow-0 basis-[88%] md:basis-[calc(33.333%-1.334rem)]">
            <QuoteCard quote={r.quote} author={r.author} />
          </div>
        ))}
      </div>
    );
  }

  // overflow-hidden e padding não podem estar no MESMO elemento aqui: o
  // clip de overflow-hidden acontece na borda externa (padding-box) do
  // elemento, então conteúdo que estoura (o card espiando na borda) seria
  // cortado na borda verdadeira da viewport, ignorando o padding — só o
  // lado esquerdo (fluxo normal, não-overflowing) respeitava a margem. Por
  // isso o padding fica num contêiner de FORA, sem overflow-hidden, e o
  // overflow-hidden fica num contêiner de DENTRO, sem padding próprio —
  // a largura dele já vem encolhida pelo padding do pai, então o clip
  // acontece exatamente na margem certa dos dois lados.
  return (
    <div className="mt-10 px-6 md:mt-12 md:px-16">
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex cursor-grab gap-6 active:cursor-grabbing md:gap-8"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {[...reviews, ...reviews].map((r, i) => (
            <div
              key={`${r.author}-${i}`}
              className="min-w-0 shrink-0 grow-0 basis-[88%] md:basis-[calc(33.333%-1.334rem)]"
            >
              <QuoteCard quote={r.quote} author={r.author} />
            </div>
          ))}
        </div>
      </div>

      <p
        className="mt-4 text-[0.75rem] tracking-[0.14em] md:hidden"
        style={{ color: "rgba(28,22,20,0.45)" }}
        aria-hidden
      >
        {String(displayIndex + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
      </p>
    </div>
  );
}

// Fase 18 [NOS DOIS]: fundo/contorno/sombra do card viram um valor só, igual
// nos dois breakpoints (antes o desktop não tinha sombra e usava um
// contorno diferente, #E7E2DB) — sem tocar em arraste, autoplay, nas 6
// avaliações nem no indicador "04 / 06" do mobile, que ficam acima/abaixo
// deste componente, intocados.
function QuoteCard({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="flex h-full flex-col justify-between gap-6 border border-[rgba(28,22,20,0.14)] bg-white p-8 shadow-[0_1px_3px_rgba(28,22,20,0.07)]">
      <p className="font-[family-name:var(--font-newsreader)] text-[1.4rem] italic leading-[1.3] text-[#1C1917] md:text-[1.75rem]">
        &ldquo;{quote}&rdquo;
      </p>
      <span className="text-[0.875rem] text-[#78716C]">— {author}</span>
    </div>
  );
}
