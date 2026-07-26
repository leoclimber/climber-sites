"use client";

import Image from "next/image";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { LineReveal, useCountUp } from "./motion";
import { business } from "./data";
import veu from "./veu.json";

// Capa full-bleed — mesma estrutura no mobile e no desktop, muda só a
// escala (clamp/vw). Foto 100%, scrim fixo no topo (legibilidade do
// wordmark), véu adaptativo calculado em build time por scripts/veu.mjs
// (preset + necessidade de dessaturar + trava de contraste já resolvida —
// ver components/cafe-lisboa/veu.json, zero cálculo de imagem no cliente).
const preset = veu.presets[veu.hero.preset as keyof typeof veu.presets];
const a3 = veu.hero.forcedA3 ?? preset.a3;
const [vr, vg, vb] = veu.veilRgb;

export function Hero() {
  const trustBarRef = useRef<HTMLDivElement>(null);
  const trustInView = useInView(trustBarRef, { once: true, amount: 0.4 });
  const ratingValue = useCountUp(business.rating, trustInView, 1.4);
  const reviewValue = useCountUp(business.reviewCount, trustInView, 1.4);

  return (
    <section
      id="cl-hero"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#1C1614] md:h-screen md:min-h-[720px]"
    >
      <Image
        src="/images/gallery/atmosphere-02.jpg"
        alt="Sunlit counter at Café Lisboa, espresso machine steaming, coffee bags on the shelf"
        fill
        sizes="100vw"
        preload
        placeholder="blur"
        blurDataURL={veu.heroBlurDataURL}
        className="object-cover"
      />

      {veu.hero.needsDesaturate && (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{
            backdropFilter: "saturate(.45)",
            WebkitBackdropFilter: "saturate(.45)",
          }}
        />
      )}

      {/* Véu adaptativo — preset escolhido em build time (ver veu.json) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, rgba(${vr},${vg},${vb},${preset.a1}) 34%, rgba(${vr},${vg},${vb},${preset.a2}) 62%, rgba(${vr},${vg},${vb},${a3}) 100%)`,
        }}
      />

      {/* Scrim fixo no topo — legibilidade do wordmark, independe do véu adaptativo */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[120px]"
        style={{
          background: "linear-gradient(to bottom, rgba(18,13,11,.7), transparent)",
        }}
      />

      <div
        className="absolute left-6 top-0 z-10 pt-[max(1.25rem,env(safe-area-inset-top))] md:left-[6.5vw]"
      >
        <span className="font-[family-name:var(--font-newsreader)] text-[1.15rem] tracking-tight text-[#F7F2EA]">
          Café Lisboa
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-10 md:px-[6.5vw] md:pb-14">
        <span className="block text-[0.62rem] tracking-[0.26em] text-[#C89B6A]">
          // FRESHLY BREWED · DUBLIN 8
        </span>

        <LineReveal
          as="h1"
          onMount
          lines={[
            "Your morning,",
            <em className="italic text-[#C89B6A]">done right.</em>,
          ]}
          className="mt-2 font-[family-name:var(--font-newsreader)] text-[clamp(2.6rem,6.4vw,5.2rem)] leading-[0.98] tracking-[-0.02em] text-[#F7F2EA]"
        />

        <p className="mt-4 max-w-[46ch] text-[1rem] leading-[1.5] text-[#F7F2EA]/80 md:text-[1.05rem]">
          Open since seven. The first pour goes out at ten past.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href="#cl-menu"
            className="inline-flex min-h-[48px] items-center bg-[#C89B6A] px-7 text-[0.95rem] font-medium tracking-[0.02em] text-[#1C1614] transition-opacity hover:opacity-90 active:scale-[0.97]"
          >
            View the menu
          </a>
          <a
            href="#cl-hours"
            className="group inline-flex min-h-[48px] items-center gap-1.5 text-[0.9rem] text-[#F7F2EA] active:opacity-70"
          >
            Find us
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        <div
          ref={trustBarRef}
          className="mt-8 flex max-w-md items-start gap-8 border-t border-[#F7F2EA]/20 pt-5 md:max-w-none md:gap-12"
        >
          <StatBlock value={ratingValue.toFixed(1)} label="GOOGLE RATING" />
          <StatBlock value={String(Math.round(reviewValue))} label="REVIEWS" />
          <StatBlock value="7AM" label="OPEN FROM" />
        </div>
      </div>
    </section>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-[family-name:var(--font-newsreader)] text-[clamp(1.7rem,3.4vw,2.6rem)] tabular-nums text-[#F7F2EA]">
        {value}
      </span>
      <span className="text-[0.56rem] tracking-[0.18em] text-[#F7F2EA]/55">{label}</span>
    </div>
  );
}
