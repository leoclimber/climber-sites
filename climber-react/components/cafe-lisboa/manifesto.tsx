"use client";

import Image from "next/image";
import { LineReveal, MaskReveal, StaggerGroup, StaggerItem } from "./motion";
import { business } from "./data";

// Assimétrico de propósito (regra #3 do documento mestre): texto à esquerda,
// foto sangrando até a borda direita — nunca 50/50.
export function Manifesto() {
  return (
    <section id="cl-manifesto" className="relative overflow-hidden bg-[#FAF8F5]">
      <div className="grid md:grid-cols-[minmax(0,1fr)_55%]">
        <div className="flex flex-col justify-center px-6 pt-18 pb-9 md:px-16 md:pt-24 md:pb-12">
          <Rule label="02 · Manifesto" />

          <LineReveal
            as="h2"
            lines={["Meath Street, every", "morning since 2019."]}
            className="font-[family-name:var(--font-newsreader)] text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.02em] text-[#1C1917]"
          />

          <StaggerGroup className="mt-8 flex w-[88%] max-w-[62ch] flex-col gap-5 text-[1.0625rem] leading-[1.65] text-[#78716C]">
            <StaggerItem>
              We opened the green corner door in 2019. The beans are roasted
              in small batches, once a week, so nothing sits past its peak.
            </StaggerItem>
            <StaggerItem>
              This isn&rsquo;t a place to rush through. There&rsquo;s a
              reading chair, a marble table, and regulars who stay all
              morning with a coffee gone cold.
            </StaggerItem>
            <StaggerItem>
              Ask for Sara behind the counter — she&rsquo;s been pulling
              shots here since day one.
            </StaggerItem>
          </StaggerGroup>

          <div className="mt-10 flex items-center gap-3 text-[0.75rem] tracking-[0.15em] text-[#78716C]">
            <span className="h-[2px] w-10 bg-[#8B4A2F]" aria-hidden />
            EST. {business.establishedYear}
          </div>
        </div>

        <MaskReveal className="min-h-[420px] md:min-h-[640px]">
          <Image
            src="/images/gallery/atmosphere-03.jpg"
            alt="Leather armchair beside a marble table, an open book and a cup of coffee, morning light"
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            loading="lazy"
            className="object-cover"
          />
        </MaskReveal>
      </div>
    </section>
  );
}

// Régua tipográfica — o detalhe assinado do Clean A: linha vertical fina +
// número da seção, presente em toda seção.
export function Rule({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="h-6 w-[2px] bg-[#8B4A2F]" aria-hidden />
      <span className="text-[0.8125rem] tracking-[0.15em] text-[#78716C]">{label}</span>
    </div>
  );
}
