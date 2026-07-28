"use client";

import Image from "next/image";
import { Rule } from "./manifesto";
import { PhotoReveal } from "./motion";
import { business, hours } from "./data";
import { useOpenStatus } from "./use-open-status";
import veu from "./veu.json";

// Mesmo véu adaptativo do hero (scripts/veu.mjs), calculado pra
// facade-vertical.jpg — protege o rótulo do endereço em cima da foto.
const mapPreset = veu.presets[veu.map.preset as keyof typeof veu.presets];
const mapA3 = veu.map.forcedA3 ?? mapPreset.a3;
const [mvr, mvg, mvb] = veu.veilRgb;

export function Hours() {
  const status = useOpenStatus();

  return (
    <section id="cl-hours" className="bg-[#FAF8F5] px-6 pt-[58px] pb-9 md:px-16 md:pt-[110px] md:pb-12">
      <Rule label="06 · Horários + Localização" />

      <div className="grid gap-10 md:grid-cols-2 md:items-stretch md:gap-16">
        <a
          href={business.mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-[4/3] w-full overflow-hidden bg-[#1C1614] active:scale-[0.97] active:opacity-70 md:aspect-auto md:h-full"
        >
          {/* Fase 19 [SO DESKTOP]: fachada nunca teve animação de entrada
              (mobile: instantânea, aprovado) — PhotoReveal só existe
              >=769px, então abaixo disso isto continua sem nenhum efeito. */}
          <PhotoReveal fill>
            <Image
              src="/images/gallery/facade-vertical.jpg"
              alt="Café Lisboa's green shopfront on Meath Street"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </PhotoReveal>

          {veu.map.needsDesaturate && (
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[55%]"
              style={{
                backdropFilter: "saturate(.45)",
                WebkitBackdropFilter: "saturate(.45)",
              }}
            />
          )}

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(${mvr},${mvg},${mvb},${mapPreset.a1}) 0%, transparent 30%, transparent 65%, rgba(${mvr},${mvg},${mvb},${mapA3}) 100%)`,
            }}
          />

          <span
            className="absolute left-4 top-4 text-[0.75rem] text-[#F7F2EA]"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.65)" }}
          >
            Meath Street, Dublin 8
          </span>
          <span className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#1C1917] px-4 py-2 text-[0.8125rem] font-medium text-[#FAF8F5] transition-transform group-hover:translate-x-0.5">
            Open in Maps →
          </span>
        </a>

        <div className="flex flex-col justify-center">
          <div
            className="mb-6 flex items-center gap-2 text-[1rem] text-[#1C1917]"
            aria-live="polite"
          >
            {status && (
              <>
                <span
                  className="h-[9px] w-[9px] shrink-0 rounded-full"
                  style={{ backgroundColor: status.open ? "#22C55E" : "#A8A29E" }}
                  aria-hidden
                />
                {status.open
                  ? `Open now — until ${status.closeLabel}`
                  : `Closed — opens ${status.openLabel}`}
              </>
            )}
          </div>

          <dl className="flex flex-col gap-3 text-[1.125rem] tabular-nums">
            {hours.map((row) => (
              <div key={row.day} className="flex justify-between border-b border-[#E7E2DB] pb-3">
                <dt className="text-[#1C1917]">{row.day}</dt>
                <dd className="text-[#1C1917]">{row.range}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col gap-2 text-[1.0625rem] text-[#78716C]">
            <a href={business.mapsHref} target="_blank" rel="noopener noreferrer" className="w-fit hover:text-[#1C1917]">
              {business.addressLine}
            </a>
            {/* Fase 6b: telefone parecia não-tocável (cinza, sem sublinhado).
                Mesmo tratamento do rodapé — mobile só, desktop intocado. */}
            <a
              href={business.phoneHref}
              className="w-fit max-md:underline max-md:decoration-[#8B4A2F] max-md:decoration-1 max-md:underline-offset-4 hover:text-[#1C1917]"
            >
              {business.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
