"use client";

import { useEffect, useRef, useState } from "react";
import { Rule } from "./manifesto";
import { usePrefersReducedMotion } from "./motion/hooks";
import { reviews } from "./data";

// Rodada 7: trocado o ticker contínuo (uma citação por vez, cortada na
// borda do viewport ao entrar/sair) por uma esteira EM BLOCOS — mantém o
// caráter de correia (translação horizontal, sempre na mesma direção,
// nunca recua) mas avança em quadros inteiros: cada quadro entra
// totalmente visível, para um beat, desliza pro próximo. Nenhuma citação
// nasce cortada em repouso — só durante a própria transição (~900ms),
// que é o esperado num slide.
//
// Loop sem emenda: os grupos aparecem duas vezes seguidas (mesma técnica
// do cl-esteira-track do rodapé/marquee), a trilha desliza até o fim da
// primeira cópia e ali, instantaneamente (sem transição), volta pro
// início — como a segunda cópia é idêntica à primeira, o corte nunca é
// visível.
function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const DESKTOP_GROUPS = chunk(reviews, 3);
const MOBILE_GROUPS = chunk(reviews, 1);

export function Reviews() {
  return (
    <section id="cl-reviews" className="bg-[#FAF8F5] pb-[140px] pt-16 md:pb-[220px] md:pt-24">
      <div className="px-6 md:px-16">
        <Rule label="07 · Avaliações" />
      </div>
      <div className="hidden md:block">
        <QuoteCarousel groups={DESKTOP_GROUPS} intervalMs={5500} />
      </div>
      <div className="md:hidden">
        <QuoteCarousel groups={MOBILE_GROUPS} intervalMs={4000} />
      </div>
    </section>
  );
}

function QuoteCarousel({ groups, intervalMs }: { groups: (typeof reviews)[number][][]; intervalMs: number }) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [instant, setInstant] = useState(false);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const loopGroups = [...groups, ...groups];

  useEffect(() => {
    if (reducedMotion || paused || groups.length <= 1) return;
    const id = setInterval(() => setIndex((i) => i + 1), intervalMs);
    return () => clearInterval(id);
  }, [reducedMotion, paused, groups.length, intervalMs]);

  useEffect(() => {
    if (!instant) return;
    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, [instant]);

  function handleTransitionEnd() {
    if (index >= groups.length) {
      setInstant(true);
      setIndex(0);
    }
  }

  if (reducedMotion) {
    const group = groups[0] ?? [];
    return (
      <div className="flex flex-col gap-8 px-6 md:px-16">
        {group.map((r) => (
          <QuoteCard key={r.author} quote={r.quote} author={r.author} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden"
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex"
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition: instant ? "none" : "transform 900ms cubic-bezier(0.65,0,0.35,1)",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {loopGroups.map((group, gi) => (
          <div
            key={gi}
            className="flex w-full shrink-0 flex-col gap-8 px-6 md:flex-row md:gap-12 md:px-16"
          >
            {group.map((r) => (
              <QuoteCard key={r.author} quote={r.quote} author={r.author} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuoteCard({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="flex flex-1 flex-col gap-3 md:gap-4">
      <p className="font-[family-name:var(--font-newsreader)] text-[1.4rem] italic leading-[1.3] text-[#1C1917] md:text-[1.75rem]">
        &ldquo;{quote}&rdquo;
      </p>
      <span className="text-[0.875rem] text-[#78716C]">— {author}</span>
    </div>
  );
}
