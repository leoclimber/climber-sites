"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LineReveal, MaskReveal, PhotoReveal, StaggerGroup, StaggerItem } from "./motion";
import { business } from "./data";

// Fase 14 (desktop): a foto deixa de ter altura fixa (1013px) e passa a
// derivar da altura REAL do bloco de texto (rótulo "02 · Manifesto" até
// "EST. 2019") — 1013px sempre sobrava creme morto quando o texto era
// mais curto que a foto. Largura = altura × 0,75 (mantém 3:4), com teto
// de 760px. O topo continua fixo a 400px do início da seção (a separação
// por título da Fase 2 não muda) e o respiro de 140px entre a base da
// foto e o fim da seção (que a Fase 8a já usa pra fechar o ritmo de
// 160px até o Cardápio) é preservado — por isso a altura mínima da seção
// também vira derivada. Mobile 100% inalterado: nada disto roda abaixo
// de 769px (measure() só seta estado quando window.innerWidth >= 769).
//
// NOTA (verificação da fase, ver relatório): com o texto real deste site
// (rótulo→EST. = ~419px medido), travar o topo em 400px E alinhar a base
// da foto à base do texto ao mesmo tempo exigiria altura = apenas ~159px
// (foto de 119×159px) — um recorte inutilizável. Optei por manter a
// altura = extensão real do bloco de texto (o que a Fase 14 pede
// literalmente e o que elimina o creme morto, o problema descrito), o
// que NÃO fecha o alinhamento de base em <= 8px com este copy específico
// — ver número exato impresso na verificação.
const PHOTO_TOP_PX = 400;
const PHOTO_BOTTOM_GAP_PX = 140;
const PHOTO_WIDTH_CAP_PX = 760;
const PHOTO_ASPECT = 0.75; // width = height * 0.75 (3:4)

function usePhotoSize(ruleRef: React.RefObject<HTMLDivElement | null>, textRef: React.RefObject<HTMLDivElement | null>) {
  const [dynamic, setDynamic] = useState<{ width: number; height: number; minHeight: number } | null>(null);

  useEffect(() => {
    function measure() {
      if (!ruleRef.current || !textRef.current || window.innerWidth < 769) {
        setDynamic(null);
        return;
      }
      const top = ruleRef.current.getBoundingClientRect().top;
      const bottom = textRef.current.getBoundingClientRect().bottom;
      let height = bottom - top;
      let width = height * PHOTO_ASPECT;
      if (width > PHOTO_WIDTH_CAP_PX) {
        width = PHOTO_WIDTH_CAP_PX;
        height = PHOTO_WIDTH_CAP_PX / PHOTO_ASPECT;
      }
      setDynamic({ width, height, minHeight: PHOTO_TOP_PX + height + PHOTO_BOTTOM_GAP_PX });
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (textRef.current) observer.observe(textRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ruleRef, textRef]);

  return dynamic;
}

// Assimétrico de propósito (regra #3 do documento mestre): texto à esquerda,
// foto como objeto solto à direita (Fase B da leva de correção — a foto
// deixou de sangrar até a borda pra não competir com o mosaico, que é
// edge-to-edge e é a seção mais forte do site).
//
// Desktop (Fase 2, geometria; Fase 14, altura derivada): a régua "02 ·
// Manifesto" começa a ordem fixa (creme → rótulo → headline → só então a
// foto, 400px abaixo do topo da seção — essa separação por título não
// muda). A foto sai do grid (md:absolute, ancorada na seção `relative`),
// sangrando na borda direita; a coluna de texto é uma faixa fixa de 820px
// que começa na goteira de 64px. Tamanho da foto e altura mínima da seção
// vêm de usePhotoSize (ver acima) — undefined até medir, então cai nas
// classes 760×1013/min-h-1553 como valor de partida razoável (mesmo teto
// da Fase 2), corrigido no primeiro paint pós-hidratação. Mobile segue
// 100% inalterado: mesma pilha de 1 coluna, mesmas classes base, e
// usePhotoSize nunca seta estado abaixo de 769px.
export function Manifesto() {
  const ruleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dynamic = usePhotoSize(ruleRef, textRef);

  return (
    <section
      id="cl-manifesto"
      className="relative overflow-hidden bg-[#FAF8F5] pt-[120px] md:pt-[140px] md:min-h-[1553px]"
      style={dynamic ? { minHeight: `${dynamic.minHeight}px` } : undefined}
    >
      <div ref={ruleRef} className="px-6 md:px-16">
        <Rule label="02 · Manifesto" />
      </div>

      <div className="grid md:items-start">
        <div className="flex flex-col px-6 pb-9 md:w-[820px] md:px-0 md:ml-16 md:pb-12">
          <div ref={textRef}>
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

        <div
          className="px-6 pb-16 md:absolute md:right-0 md:top-[400px] md:h-[1013px] md:w-[760px] md:px-0 md:pb-0"
          style={dynamic ? { width: `${dynamic.width}px`, height: `${dynamic.height}px` } : undefined}
        >
          {/* Fase 19 [SO DESKTOP]: PhotoReveal por fora (clip-path+scale,
              novo sistema) — MaskReveal segue por dentro só pro mobile
              (vira no-op no desktop, ver useIsDesktop). */}
          <PhotoReveal className="min-h-[280px] md:h-full md:min-h-0">
            <MaskReveal className="h-full w-full">
              <Image
                src="/images/gallery/atmosphere-03.jpg"
                alt="Leather armchair beside a marble table, an open book and a cup of coffee, morning light"
                fill
                sizes="(min-width: 768px) 760px, 100vw"
                loading="lazy"
                className="object-cover md:object-[center_bottom]"
              />
            </MaskReveal>
          </PhotoReveal>
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
