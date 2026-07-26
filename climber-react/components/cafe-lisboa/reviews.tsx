"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Rule } from "./manifesto";
import { usePrefersReducedMotion } from "./motion/hooks";
import { reviews } from "./data";

// Esteira arrastável (embla-carousel-react + embla-carousel-autoplay,
// API consultada via context7 antes de escrever este arquivo — não
// chutada). loop contínuo, autoplay que retoma sozinho depois de um
// arraste (stopOnInteraction:false), 1 card por vez no mobile com ~12% do
// próximo espiando na borda (flex-basis 88%), 3 por vez no desktop — sem
// setas nem bolinhas, o próprio espião na borda já avisa que dá pra
// arrastar.
export function Reviews() {
  return (
    <section id="cl-reviews" className="bg-[#FAF8F5] pb-20 pt-16 md:pb-[120px] md:pt-24">
      <div className="px-6 md:px-16">
        <Rule label="07 · Avaliações" />
      </div>
      <ReviewsCarousel />
    </section>
  );
}

function ReviewsCarousel() {
  const reducedMotion = usePrefersReducedMotion();
  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: false, duration: 24 },
    reducedMotion ? [] : [Autoplay({ delay: 4500, stopOnInteraction: false })]
  );

  if (reducedMotion) {
    return (
      <div className="mt-10 flex flex-col gap-8 px-6 md:mt-12 md:px-16">
        {reviews.map((r) => (
          <QuoteCard key={r.author} quote={r.quote} author={r.author} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-10 overflow-hidden px-6 md:mt-12 md:px-16" ref={emblaRef}>
      <div className="flex gap-6 md:gap-8">
        {reviews.map((r) => (
          <div
            key={r.author}
            className="min-w-0 shrink-0 grow-0 basis-[88%] md:basis-[calc(33.333%-1.334rem)]"
          >
            <QuoteCard quote={r.quote} author={r.author} />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuoteCard({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="flex h-full flex-col justify-between gap-6 border border-[#E7E2DB] bg-white p-8">
      <p className="font-[family-name:var(--font-newsreader)] text-[1.4rem] italic leading-[1.3] text-[#1C1917] md:text-[1.75rem]">
        &ldquo;{quote}&rdquo;
      </p>
      <span className="text-[0.875rem] text-[#78716C]">— {author}</span>
    </div>
  );
}
