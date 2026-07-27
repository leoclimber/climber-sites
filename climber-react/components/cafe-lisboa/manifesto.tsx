"use client";

import Image from "next/image";
import { LineReveal, MaskReveal, StaggerGroup, StaggerItem } from "./motion";
import { business } from "./data";

// Assimétrico de propósito (regra #3 do documento mestre): texto à esquerda,
// foto como objeto solto à direita (Fase B da leva de correção — a foto
// deixou de sangrar até a borda pra não competir com o mosaico, que é
// edge-to-edge e é a seção mais forte do site).
//
// Desktop (Fase 2 da leva final): geometria travada em pixel, não mais
// medida via ResizeObserver — separação garantida entre a capa e a foto do
// manifesto exige uma ordem fixa (creme → rótulo → headline → só então a
// foto começa, 400px abaixo do topo da seção), não uma altura que reage ao
// texto. A foto sai do grid (vira md:absolute, ancorada na seção que já é
// `relative`) com tamanho fixo 760×1013 (aspect 3/4) sangrando na borda
// direita da viewport; a coluna de texto vira uma faixa fixa de 820px que
// começa na goteira de 64px. md:min-h no wrapper reserva a altura pra base
// da foto ficar 140px acima do fim da seção, mesmo com o texto sendo bem
// mais curto que a foto (a régua fica FORA do grid, como antes). Mobile
// segue 100% inalterado: mesma pilha de 1 coluna, mesmas classes base.
export function Manifesto() {
  return (
    <section
      id="cl-manifesto"
      className="relative overflow-hidden bg-[#FAF8F5] pt-[120px] md:pt-[140px] md:min-h-[1553px]"
    >
      <div className="px-6 md:px-16">
        <Rule label="02 · Manifesto" />
      </div>

      <div className="grid md:items-start">
        <div className="flex flex-col px-6 pb-9 md:w-[820px] md:px-0 md:ml-16 md:pb-12">
          <div>
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
        </div>

        <div className="px-6 pb-16 md:absolute md:right-0 md:top-[400px] md:h-[1013px] md:w-[760px] md:px-0 md:pb-0">
          <MaskReveal className="min-h-[280px] md:h-full md:min-h-0">
            <Image
              src="/images/gallery/atmosphere-03.jpg"
              alt="Leather armchair beside a marble table, an open book and a cup of coffee, morning light"
              fill
              sizes="(min-width: 768px) 760px, 100vw"
              loading="lazy"
              className="object-cover"
            />
          </MaskReveal>
        </div>
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
