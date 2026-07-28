"use client";

import { useEffect, useState } from "react";
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
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: false, duration: 24 },
    reducedMotion ? [] : [Autoplay({ delay: 4500, stopOnInteraction: false })]
  );

  // Fase 6d: indicador de posição mobile ("01 / 06") — lê o índice
  // selecionado direto da API do embla (mesma instância que já dirige o
  // autoplay/arraste, não duplica nenhuma lógica de scroll).
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    function onSelect() {
      setSelectedIndex(emblaApi!.selectedScrollSnap());
    }
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  if (reducedMotion) {
    return (
      <div className="mt-10 flex flex-col gap-8 px-6 md:mt-12 md:px-16">
        {reviews.map((r) => (
          <QuoteCard key={r.author} quote={r.quote} author={r.author} />
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
      <div className="overflow-hidden" ref={emblaRef}>
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

      <p
        className="mt-4 text-[0.75rem] tracking-[0.14em] md:hidden"
        style={{ color: "rgba(28,22,20,0.45)" }}
        aria-hidden
      >
        {String(selectedIndex + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
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
