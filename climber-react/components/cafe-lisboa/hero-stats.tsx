"use client";

import dynamic from "next/dynamic";
import { business } from "./data";

// Isola o Framer Motion (useInView + animate) do caminho crítico do Hero
// (que virou Server Component na Fase 4): carregado só no cliente
// (ssr:false), fora do bundle inicial. O fallback `loading` roda no SSR de
// verdade (next/dynamic com ssr:false ainda renderiza o Suspense fallback
// no servidor via bailout-to-CSR) com os valores finais estáticos — sem
// contagem, mas também sem CLS/pulo de conteúdo até o JS assumir.
const AnimatedStats = dynamic(
  () => import("./hero-stats-counter").then((m) => m.HeroStatsCounter),
  { ssr: false, loading: () => <StaticStats /> }
);

function StaticStats() {
  return (
    <div className="mt-8 flex max-w-md items-start gap-8 border-t border-[#F7F2EA]/20 pt-5 md:max-w-[720px] md:gap-12">
      <StatBlock value={business.rating.toFixed(1)} label="GOOGLE RATING" />
      <StatBlock value={String(business.reviewCount)} label="REVIEWS" />
      <StatBlock value="7AM" label="OPEN FROM" />
    </div>
  );
}

const STAT_TEXT_SHADOW = "0 2px 12px rgba(0,0,0,0.65)";

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="font-[family-name:var(--font-newsreader)] text-[clamp(1.7rem,3.4vw,2.6rem)] tabular-nums text-[#F7F2EA]"
        style={{ textShadow: STAT_TEXT_SHADOW }}
      >
        {value}
      </span>
      {/* Fase 31c [NOS DOIS]: 8,96px/opacidade 0,55 dava 3,79:1. 11px,
          opacidade 0.85, mesma cor #F7F2EA e mesmo text-shadow. */}
      <span
        className="text-[11px] tracking-[0.18em] text-[#F7F2EA]/85"
        style={{ textShadow: STAT_TEXT_SHADOW }}
      >
        {label}
      </span>
    </div>
  );
}

export function HeroStats() {
  return <AnimatedStats />;
}
