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
    <div className="mt-8 flex max-w-md items-start gap-8 border-t border-[#F7F2EA]/20 pt-5 md:max-w-none md:gap-12">
      <StatBlock value={business.rating.toFixed(1)} label="GOOGLE RATING" />
      <StatBlock value={String(business.reviewCount)} label="REVIEWS" />
      <StatBlock value="7AM" label="OPEN FROM" />
    </div>
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

export function HeroStats() {
  return <AnimatedStats />;
}
