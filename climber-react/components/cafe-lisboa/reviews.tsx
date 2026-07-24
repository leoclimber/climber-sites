"use client";

import { useState } from "react";
import { Rule } from "./manifesto";
import { reviews } from "./data";

// Destaque 3/4: esteira contínua, direita -> esquerda, 60s por ciclo,
// pausa no hover (CSS :hover) e no toque (JS, abaixo). Loop sem emenda:
// o conjunto de citações aparece duas vezes seguidas no DOM e a faixa
// translada -50% — a segunda cópia começa exatamente onde a primeira
// terminaria, então o corte nunca é visível.
//
// Respiro travado até o marquee do rodapé: 220px desktop / 140px mobile,
// aplicado como padding-bottom da seção (rodada 5, fechado).
export function Reviews() {
  const [paused, setPaused] = useState(false);

  const track = (
    <div
      className="cl-esteira-track"
      data-dir="rtl"
      style={{ ["--cl-dur" as string]: "60s" }}
    >
      <ReviewSet />
      <ReviewSet dup />
    </div>
  );

  return (
    <section
      id="cl-reviews"
      className="bg-[#FAF8F5] pb-[140px] pt-16 md:pb-[220px] md:pt-24"
    >
      <div className="px-6 md:px-16">
        <Rule label="07 · Avaliações" />
      </div>
      <div
        className="cl-esteira"
        data-paused={paused}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {track}
      </div>
    </section>
  );
}

function ReviewSet({ dup = false }: { dup?: boolean }) {
  return (
    <div className="flex items-baseline" data-dup={dup}>
      {reviews.map((r, i) => (
        <div key={`${dup ? "dup" : "orig"}-${i}`} className="flex shrink-0 items-baseline gap-3">
          <span className="whitespace-nowrap font-[family-name:var(--font-newsreader)] text-[1.75rem] italic text-[#1C1917]">
            &ldquo;{r.quote}&rdquo;
          </span>
          <span className="whitespace-nowrap text-[0.875rem] text-[#78716C]">— {r.author}</span>
          <span className="mx-10 text-[1.375rem] text-[#8B4A2F]" aria-hidden>
            ·
          </span>
        </div>
      ))}
    </div>
  );
}
