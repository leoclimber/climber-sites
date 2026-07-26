"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { useCountUp } from "./motion";
import { business } from "./data";

export function HeroStatsCounter() {
  const trustBarRef = useRef<HTMLDivElement>(null);
  const trustInView = useInView(trustBarRef, { once: true, amount: 0.4 });
  const ratingValue = useCountUp(business.rating, trustInView, 1.4);
  const reviewValue = useCountUp(business.reviewCount, trustInView, 1.4);

  return (
    <div
      ref={trustBarRef}
      className="mt-8 flex max-w-md items-start gap-8 border-t border-[#F7F2EA]/20 pt-5 md:max-w-none md:gap-12"
    >
      <StatBlock value={ratingValue.toFixed(1)} label="GOOGLE RATING" />
      <StatBlock value={String(Math.round(reviewValue))} label="REVIEWS" />
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
