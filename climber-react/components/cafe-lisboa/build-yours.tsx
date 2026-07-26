"use client";

import { useEffect, useState } from "react";
import { Tappable, useAnimatedNumber } from "./motion";
import { usePrefersReducedMotion } from "./motion/hooks";
import { business, buildYoursOptions, hours } from "./data";
import veu from "./veu.json";

// Configurador de preço — NUNCA loja: sem carrinho, sem quantidade, sem
// "adicionar". Três toques (café/tamanho/extra) e o preço reage na hora,
// pra quem chega no balcão já sabendo o valor. Fundo é a cor quente
// dominante do banco de fotos, escurecida em build-time (scripts/veu.mjs)
// até bater 7:1 de contraste — ver components/cafe-lisboa/veu.json.
const bg = veu.buildYoursBg.hex;

// Cor do líquido por tipo de café — valores exatos do comando. O comando
// lista 6 nomes (incluindo "Espresso"), mas buildYoursOptions.coffees só
// tem 5 itens reais (não existe opção "Espresso" nos dados, e o próprio
// item 4 desta fase fala em "5 opções de COFFEE") — uso as 5 cores que
// correspondem a opções reais, a cor de Espresso fica sem uso.
const LIQUID_COLORS: Record<string, string> = {
  cortado: "#4A2E18",
  americano: "#3A2413",
  mocha: "#3A2416",
  "flat-white": "#6B4526",
  cappuccino: "#7A522F",
};

const LEVEL_BY_EXTRA: Record<string, number> = {
  none: 58,
  "extra-shot": 78,
  oat: 68,
};

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
      className="relative flex min-h-[560px] w-full flex-col overflow-hidden px-6 pt-24 pb-6 md:pb-8 md:px-[6.5vw]"
      style={{ backgroundColor: bg }}
    >
      <GrainAndVignette />

      <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-start md:gap-[80px]">
        <div className="flex flex-col md:w-[55%]">
          <span className="text-[0.55rem] tracking-[0.26em] text-[#C89B6A]">04 · BUILD YOURS</span>
          <h2 className="mt-2 font-[family-name:var(--font-newsreader)] text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] text-[#F7F2EA]">
            Build your <em className="italic text-[#C89B6A]">usual.</em>
          </h2>
          <p className="mt-2 max-w-[46ch] text-[0.95rem] text-[#F7F2EA]/70">
            Three taps. Know the price before you walk in.
          </p>

          <div className="mt-4 flex flex-col gap-4 md:mt-12 md:gap-8">
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
        </div>

        <div className="flex flex-col md:w-[45%]">
          <span className="block text-[0.53rem] tracking-[0.22em] text-[#F7F2EA]/42">
            YOUR CUP
          </span>
          <div className="mt-2 flex items-end gap-6 md:flex-col md:items-start md:gap-0">
            <span className="font-[family-name:var(--font-newsreader)] text-[clamp(4.5rem,9vw,7rem)] leading-none tabular-nums text-[#C89B6A]">
              €{animatedPrice.toFixed(2)}
            </span>
            <Cup coffeeId={coffeeId} sizeId={sizeId} extraId={extraId} className="md:mt-3" />
          </div>

          <span className="mt-2 text-[0.8rem] text-[#F7F2EA]/50">
            {coffee.name} · {size.name} · {extra.name}
          </span>

          <div className="mt-4 flex flex-col gap-2 pb-[env(safe-area-inset-bottom)] md:mt-10 md:gap-3">
            <a
              href={business.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] w-fit items-center bg-[#C89B6A] px-7 text-[0.95rem] font-medium tracking-[0.02em] text-[#1C1614] transition-opacity hover:opacity-90 active:scale-[0.97]"
            >
              Get directions →
            </a>
            <p className="text-[0.72rem] text-[#F7F2EA]/50">
              {business.addressShort} · {closing ? `Open until ${closing}` : " "}
            </p>
            <p className="text-[0.72rem] text-[#F7F2EA]/50">
              Made fresh at the counter — no app, no queue.
            </p>
          </div>
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
    <div className="flex flex-col gap-2">
      <span className="text-[0.53rem] tracking-[0.22em] text-[#F7F2EA]/42">{label}</span>
      <div className="flex flex-wrap gap-x-5 gap-y-3">
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

// Xícara em SVG, traço só (sem preenchimento no corpo/alça/pires) — reage
// às três escolhas: tamanho escala o traço inteiro (transform, 320ms),
// extra muda o nível do líquido (clipado pela forma do corpo, por isso
// acompanha o afunilamento do trapézio automaticamente) e o tipo de café
// muda a cor do líquido. viewBox quadrado (0 0 100 100): só a ALTURA do
// contêiner é especificada pelo comando (140/200px) — a largura vem de
// preservar a proporção do viewBox (h-full w-auto).
const CUP_BODY_D = "M25,18 L75,18 L63,78 L37,78 Z";
const CAVITY_TOP = 18;
const CAVITY_BOTTOM = 78;
const CAVITY_HEIGHT = CAVITY_BOTTOM - CAVITY_TOP;

function yAtLevel(pct: number) {
  return CAVITY_BOTTOM - (pct / 100) * CAVITY_HEIGHT;
}

function Cup({
  coffeeId,
  sizeId,
  extraId,
  className = "",
}: {
  coffeeId: string;
  sizeId: string;
  extraId: string;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const liquidColor = LIQUID_COLORS[coffeeId] ?? LIQUID_COLORS["flat-white"];
  const level = LEVEL_BY_EXTRA[extraId] ?? LEVEL_BY_EXTRA.none;
  const hasMilk = extraId === "oat";
  const isLarge = sizeId === "large";

  const milkSplitLevel = hasMilk ? level - 12 : level;
  const coffeeTopY = yAtLevel(milkSplitLevel);
  const liquidTopY = yAtLevel(level);
  const geometryTransition = "y 320ms cubic-bezier(0.16,1,0.3,1), height 320ms cubic-bezier(0.16,1,0.3,1)";

  return (
    <div
      className={`h-[140px] md:h-[200px] ${className}`}
      style={{
        transform: `scale(${isLarge ? 1.1 : 1}, ${isLarge ? 1.18 : 1})`,
        transformOrigin: "bottom center",
        transition: "transform 320ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-auto overflow-visible" aria-hidden>
        <defs>
          <clipPath id="cl-cup-body-clip">
            <path d={CUP_BODY_D} />
          </clipPath>
        </defs>

        {!reducedMotion && (
          <g className="cl-cup-steam">
            <path
              d="M38,16 C34,12 42,9 38,5"
              fill="none"
              stroke="#C89B6A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M58,16 C54,12 62,9 58,5"
              fill="none"
              stroke="#C89B6A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        )}

        <g clipPath="url(#cl-cup-body-clip)">
          <rect
            x="0"
            y={coffeeTopY}
            width="100"
            height={CAVITY_BOTTOM - coffeeTopY}
            fill={liquidColor}
            style={{ transition: geometryTransition }}
          />
          {hasMilk && (
            <rect
              x="0"
              y={liquidTopY}
              width="100"
              height={coffeeTopY - liquidTopY}
              fill="#D9BE96"
              style={{ transition: geometryTransition }}
            />
          )}
        </g>

        <path d={CUP_BODY_D} fill="none" stroke="#C89B6A" strokeWidth="2" />
        <path
          d="M73,32 C90,34 90,60 73,62"
          fill="none"
          stroke="#C89B6A"
          strokeWidth="2"
        />
        <ellipse cx="50" cy="81" rx="30" ry="4" fill="none" stroke="#C89B6A" strokeWidth="2" />
      </svg>
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
