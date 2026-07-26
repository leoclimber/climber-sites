"use client";

import { useEffect, useState } from "react";
import { Tappable, useAnimatedNumber } from "./motion";
import { business, buildYoursOptions, hours } from "./data";
import veu from "./veu.json";

// Configurador de preço — NUNCA loja: sem carrinho, sem quantidade, sem
// "adicionar". Três toques (café/tamanho/extra) e o preço reage na hora,
// pra quem chega no balcão já sabendo o valor. Fundo é a cor quente
// dominante do banco de fotos, escurecida em build-time (scripts/veu.mjs)
// até bater 7:1 de contraste — ver components/cafe-lisboa/veu.json.
const bg = veu.buildYoursBg.hex;

export function BuildYours() {
  const [coffeeId, setCoffeeId] = useState<string>(buildYoursOptions.coffees[0].id);
  const [sizeId, setSizeId] = useState<string>(buildYoursOptions.sizes[0].id);
  const [extraId, setExtraId] = useState<string>(buildYoursOptions.extras[0].id);

  const coffee = buildYoursOptions.coffees.find((c) => c.id === coffeeId)!;
  const size = buildYoursOptions.sizes.find((s) => s.id === sizeId)!;
  const extra = buildYoursOptions.extras.find((e) => e.id === extraId)!;

  const price = coffee.price + size.delta + extra.delta;
  const animatedPrice = useAnimatedNumber(price, 0.42);
  const closing = useTodayClosing();

  return (
    <section
      id="cl-build-yours"
      className="relative flex h-[100svh] min-h-[560px] w-full flex-col justify-center overflow-hidden px-6 py-14 md:h-screen md:min-h-[700px] md:px-[6.5vw]"
      style={{ backgroundColor: bg }}
    >
      <GrainAndVignette />

      <div className="relative z-10">
        <span className="text-[0.55rem] tracking-[0.26em] text-[#C89B6A]">04 · BUILD YOURS</span>
        <h2 className="mt-2 font-[family-name:var(--font-newsreader)] text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] text-[#F7F2EA]">
          Build your <em className="italic text-[#C89B6A]">usual.</em>
        </h2>
        <p className="mt-3 max-w-[46ch] text-[0.95rem] text-[#F7F2EA]/70">
          Three taps. Know the price before you walk in.
        </p>

        <div className="mt-10 flex flex-col gap-8 md:mt-12 md:flex-row md:gap-16">
          <OptionAxis
            label="COFFEE"
            options={buildYoursOptions.coffees}
            selectedId={coffeeId}
            onSelect={setCoffeeId}
          />
          <OptionAxis
            label="SIZE"
            options={buildYoursOptions.sizes}
            selectedId={sizeId}
            onSelect={setSizeId}
          />
          <OptionAxis
            label="EXTRA"
            options={buildYoursOptions.extras}
            selectedId={extraId}
            onSelect={setExtraId}
          />
        </div>

        <div className="mt-10 flex flex-col gap-2 md:mt-12 md:flex-row md:items-end md:gap-6">
          <div>
            <span className="block text-[0.53rem] tracking-[0.22em] text-[#F7F2EA]/42">
              YOUR CUP
            </span>
            <span className="font-[family-name:var(--font-newsreader)] text-[clamp(2.6rem,7vw,4.4rem)] tabular-nums text-[#C89B6A]">
              €{animatedPrice.toFixed(2)}
            </span>
          </div>
          <span className="text-[0.7rem] text-[#F7F2EA]/45 md:pb-2">
            {coffee.name} · {size.name} · {extra.name}
          </span>
        </div>

        <div className="mt-10 flex flex-col gap-3 pb-[env(safe-area-inset-bottom)] md:mt-12">
          <a
            href={business.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] w-fit items-center bg-[#C89B6A] px-7 text-[0.95rem] font-medium tracking-[0.02em] text-[#1C1614] transition-opacity hover:opacity-90 active:scale-[0.97]"
          >
            Get directions →
          </a>
          <p className="text-[0.72rem] text-[#F7F2EA]/50">
            {business.addressShort} · {closing ? `Open until ${closing}` : " "}
          </p>
          <p className="text-[0.72rem] text-[#F7F2EA]/50">
            Made fresh at the counter — no app, no queue.
          </p>
        </div>
      </div>
    </section>
  );
}

function OptionAxis<T extends { id: string; name: string }>({
  label,
  options,
  selectedId,
  onSelect,
}: {
  label: string;
  options: readonly T[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[0.53rem] tracking-[0.22em] text-[#F7F2EA]/42">{label}</span>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((opt) => {
          const selected = opt.id === selectedId;
          return (
            <Tappable
              key={opt.id}
              as="button"
              onClick={() => onSelect(opt.id)}
              aria-pressed={selected}
              className="flex min-h-[44px] items-center font-[family-name:var(--font-newsreader)] text-[clamp(1rem,1.5vw,1.15rem)] transition-colors duration-200"
              style={{
                color: selected ? "#C89B6A" : "rgba(247,242,234,0.45)",
                textDecoration: selected ? "underline" : "none",
                textDecorationThickness: "1.6px",
                textUnderlineOffset: "4px",
              }}
            >
              {opt.name}
            </Tappable>
          );
        })}
      </div>
    </div>
  );
}

function GrainAndVignette() {
  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]">
        <filter id="cl-build-yours-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cl-build-yours-grain)" />
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.18) 100%)",
        }}
      />
    </>
  );
}

// "Open until HH:MM" de verdade, calculado no fuso de Dublin — não um
// texto fixo (o horário de fechamento muda por dia da semana). Só roda no
// cliente, depois do mount, mesmo motivo do useOpenStatus em hours.tsx.
function useTodayClosing() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    function compute() {
      const now = new Date();
      const weekday = new Intl.DateTimeFormat("en-IE", {
        timeZone: "Europe/Dublin",
        weekday: "short",
      }).format(now);
      const row = weekday === "Sat" ? hours[1] : weekday === "Sun" ? hours[2] : hours[0];
      setLabel(row.range.split(" – ")[1]);
    }
    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, []);

  return label;
}
