"use client";

import { useEffect, useState } from "react";
import { hours } from "./data";

export type OpenStatus = { open: boolean; closeLabel: string; openLabel: string };

// Fase 13: fonte ÚNICA de aberto/fechado — a seção 06 e a linha da Build
// Yours liam de duas funções separadas (useOpenStatus aqui, useTodayClosing
// em build-yours.tsx), e só a segunda checava o horário: ela sempre
// mostrava "Open until X" mesmo fechado. Calculado no CLIENTE, depois da
// hidratação (nunca no build — a rota é prerenderizada estática, então
// congelar isso no build trava o estado errado até o próximo deploy), no
// fuso do negócio (Europe/Dublin via Intl.DateTimeFormat), nunca no fuso
// de quem visita.
export function useOpenStatus(): OpenStatus | null {
  const [status, setStatus] = useState<OpenStatus | null>(null);

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

      const row = weekday === "Sat" ? hours[1] : weekday === "Sun" ? hours[2] : hours[0];
      const isOpen = minutesNow >= row.openMin && minutesNow < row.closeMin;
      const [openLabel, closeLabel] = row.range.split(" – ");

      setStatus({ open: isOpen, closeLabel, openLabel });
    }

    compute();
    const interval = setInterval(compute, 60_000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
