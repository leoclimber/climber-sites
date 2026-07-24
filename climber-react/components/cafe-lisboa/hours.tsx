"use client";

import { useEffect, useState } from "react";
import { Rule } from "./manifesto";
import { business, hours } from "./data";

// "Open now" — calculado no fuso de Dublin (Europe/Dublin), não no fuso da
// máquina de quem visita. Só roda no cliente, depois do mount: o servidor
// nunca sabe a hora real de quem vai ver a página, então renderizar isso no
// SSR gera meio segundo de estado errado (ou pior, mismatch de hydration).
function useOpenStatus() {
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);

  useEffect(() => {
    function compute() {
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-IE", {
        timeZone: "Europe/Dublin",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(now);

      const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
      const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
      const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
      const minutesNow = h * 60 + m;

      const row =
        weekday === "Sat"
          ? hours[1]
          : weekday === "Sun"
            ? hours[2]
            : hours[0];

      const isOpen = minutesNow >= row.openMin && minutesNow < row.closeMin;
      const closeLabel = row.range.split(" – ")[1];
      const openLabel = row.range.split(" – ")[0];

      setStatus({
        open: isOpen,
        text: isOpen ? `Open now — until ${closeLabel}` : `Closed — opens ${openLabel}`,
      });
    }

    compute();
    const interval = setInterval(compute, 60_000);
    return () => clearInterval(interval);
  }, []);

  return status;
}

export function Hours() {
  const status = useOpenStatus();

  return (
    <section id="cl-hours" className="bg-[#FAF8F5] px-6 py-16 md:px-16 md:py-24">
      <Rule label="06 · Horários + Localização" />

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <a
          href={business.mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-[4/3] w-full overflow-hidden bg-[#D9CFC2] active:scale-[0.97] active:opacity-70 md:aspect-[16/9]"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #BFB2A0 0 10px, transparent 10px 20px)",
            }}
          />
          <span className="absolute left-4 top-4 font-mono text-[0.75rem] text-[#4A4136]">
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
                  style={{ backgroundColor: status.open ? "#8B4A2F" : "#A8A29E" }}
                  aria-hidden
                />
                {status.text}
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
            <a href={business.phoneHref} className="w-fit hover:text-[#1C1917]">
              {business.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
