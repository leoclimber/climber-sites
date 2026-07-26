"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LineReveal, MaskReveal, StaggerGroup, StaggerItem } from "./motion";
import { business } from "./data";

// Assimétrico de propósito (regra #3 do documento mestre): texto à esquerda,
// foto como objeto solto à direita (Fase B da leva de correção — a foto
// deixou de sangrar até a borda pra não competir com o mosaico, que é
// edge-to-edge e é a seção mais forte do site).
//
// A Régua fica FORA do grid de 2 colunas, de propósito: assim o topo da
// foto (que começa junto com a linha de cima do grid, md:items-start) cai
// exatamente no topo da HEADLINE, não no topo da seção — sem precisar medir
// a altura da Régua. A altura da foto em si (base = 64px acima do fim do
// texto) já não dá pra fechar em CSS puro (depende da altura real do
// parágrafo, que muda com a largura da viewport), por isso mede de verdade
// via ResizeObserver, mesmo padrão já usado no mosaico (gallery-grid.tsx).
export function Manifesto() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [photoHeight, setPhotoHeight] = useState<number | null>(null);

  useEffect(() => {
    function measure() {
      if (!contentRef.current) return;
      if (window.innerWidth < 768) {
        setPhotoHeight(null); // mobile: foto usa a altura natural própria dela
        return;
      }
      setPhotoHeight(Math.max(contentRef.current.offsetHeight - 64, 200));
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (contentRef.current) observer.observe(contentRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section id="cl-manifesto" className="relative overflow-hidden bg-[#FAF8F5] pt-[120px]">
      <div className="px-6 md:px-16">
        <Rule label="02 · Manifesto" />
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_55%] md:items-start">
        <div className="flex flex-col px-6 pb-9 md:px-16 md:pb-12">
          <div ref={contentRef}>
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

        <div className="px-6 pb-16 md:px-0 md:pb-0 md:pr-[6.5vw]">
          <MaskReveal
            className={photoHeight ? "min-h-[200px]" : "min-h-[280px] md:min-h-[420px]"}
            style={photoHeight ? { height: photoHeight } : undefined}
          >
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
