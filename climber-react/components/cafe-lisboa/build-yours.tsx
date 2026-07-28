"use client";

import { useEffect, useMemo, useState } from "react";
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

// Cor do líquido por tipo de café — valores exatos do comando (leva de
// correção), correspondendo à quantidade de leite de cada bebida.
// "Espresso" citado no comando + na verificação não existia em
// buildYoursOptions.coffees na leva anterior (só tínhamos 5 itens); dessa
// vez adicionei de verdade (data.ts), com o preço real do cardápio (€3.20),
// já que o comando volta a citar a opção duas vezes (tabela de cor +
// verificação) e ela já existe como item real do menu.
const LIQUID_COLORS: Record<string, string> = {
  espresso: "#2E1C0F",
  americano: "#452C18",
  mocha: "#6B4426",
  cortado: "#8A5F3C",
  "flat-white": "#A8794F",
  cappuccino: "#BC8D61",
};

const BASE_LEVEL = 58;
const EXTRA_SHOT_LEVEL_DELTA = 20; // 58 -> 78 só com extra shot
const OAT_LEVEL_DELTA = 10; // 58 -> 68 só com oat; 78 -> 88 com os dois
const MILK_BAND_FRACTION = 0.12; // faixa de leite = 12% do topo do LÍQUIDO (não da xícara)

export function BuildYours() {
  const [coffeeId, setCoffeeId] = useState<string>(buildYoursOptions.coffees[0].id);
  const [sizeId, setSizeId] = useState<string>(buildYoursOptions.sizes[0].id);
  const [activeExtras, setActiveExtras] = useState<ReadonlySet<string>>(new Set());

  const coffee = buildYoursOptions.coffees.find((c) => c.id === coffeeId)!;
  const size = buildYoursOptions.sizes.find((s) => s.id === sizeId)!;
  const extrasList = useMemo(
    () => buildYoursOptions.extras.filter((e) => activeExtras.has(e.id)),
    [activeExtras]
  );
  const extrasDelta = extrasList.reduce((sum, e) => sum + e.delta, 0);

  const price = coffee.price + size.delta + extrasDelta;
  const animatedPrice = useAnimatedNumber(price, 0.42);
  const closing = useTodayClosing();

  function toggleExtra(id: string) {
    setActiveExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function clearExtras() {
    setActiveExtras(new Set());
  }

  // "Flat white · Regular" / "... · Extra shot" / "... · Extra shot + Oat"
  // — ordem fixa (extra shot sempre antes de oat), não a ordem de clique.
  const extrasSummary = [
    activeExtras.has("extra-shot") ? "Extra shot" : null,
    activeExtras.has("oat") ? "Oat" : null,
  ]
    .filter(Boolean)
    .join(" + ");
  const summary = extrasSummary
    ? `${coffee.name} · ${size.name} · ${extrasSummary}`
    : `${coffee.name} · ${size.name}`;

  return (
    <section
      id="cl-build-yours"
      className="relative flex min-h-[560px] w-full flex-col overflow-hidden px-6 pt-24 pb-6 md:pb-8 md:px-[6.5vw] md:pt-40"
      style={{ backgroundColor: bg }}
    >
      <GrainAndVignette />

      {/* Desktop (Fase 4): md:items-stretch (era md:items-start) faz as
          duas colunas ocuparem a mesma altura de linha (a da coluna direita,
          que é a mais alta); md:mt-auto no grupo de eixos (abaixo) empurra
          só ELE pro fim da coluna esquerda agora esticada, fechando o vão
          marrom sem redistribuir o espaço entre eyebrow/headline/parágrafo. */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-col gap-3 md:flex-row md:items-stretch md:gap-[96px]">
        <div className="flex flex-col md:w-[52%]">
          <span className="text-[0.55rem] tracking-[0.26em] text-[var(--accent-text)]">04 · BUILD YOURS</span>
          <h2 className="mt-2 font-[family-name:var(--font-newsreader)] text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] text-[#F7F2EA]">
            Build your <em className="italic text-[#C89B6A]">usual.</em>
          </h2>
          <p className="mt-2 max-w-[46ch] text-[0.95rem] text-[#F7F2EA]/80">
            Three taps. Know the price before you walk in.
          </p>

          <div className="mt-4 flex flex-col gap-4 md:mt-auto md:gap-8">
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
            <ExtraAxis activeExtras={activeExtras} onToggle={toggleExtra} onClear={clearExtras} />
          </div>
        </div>

        <div className="flex flex-col md:w-[48%]">
          <span className="block text-[0.53rem] tracking-[0.22em] text-[#F7F2EA]/42">
            YOUR CUP
          </span>
          <div className="mt-2 flex items-end gap-6 md:flex-col md:items-start md:gap-0">
            <span className="font-[family-name:var(--font-newsreader)] text-[clamp(4.5rem,9vw,7rem)] leading-none tabular-nums text-[var(--accent)]">
              €{animatedPrice.toFixed(2)}
            </span>
            <Cup coffeeId={coffeeId} sizeId={sizeId} activeExtras={activeExtras} className="md:mt-3" />
          </div>

          <span className="mt-2 text-[0.8rem] text-[#F7F2EA]/80">{summary}</span>

          <div className="mt-4 flex flex-col gap-2 pb-[env(safe-area-inset-bottom)] md:mt-10 md:gap-3">
            <a
              href={business.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] w-fit items-center bg-[#C89B6A] px-7 text-[0.95rem] font-medium tracking-[0.02em] text-[#1C1614] transition-opacity hover:opacity-90 active:scale-[0.97]"
            >
              Get directions →
            </a>
            <p className="text-[0.72rem] text-[#F7F2EA]/80">
              {business.addressShort} · {closing ? `Open until ${closing}` : " "}
            </p>
            <p className="text-[0.72rem] text-[#F7F2EA]/80">
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
      <span className="text-[0.53rem] tracking-[0.22em] text-[#F7F2EA]/80">{label}</span>
      {/* Mobile (Fase 4): grade fixa de 3 colunas, mesmo pro SIZE (2 opções)
          e EXTRA (3 opções) — "herdam a mesma grade". Desktop mantém o
          flex-wrap de sempre, intocado. */}
      <div className="flex flex-wrap gap-x-5 gap-y-3 max-md:grid max-md:grid-cols-3 max-md:gap-3">
        {options.map((opt) => {
          const selected = opt.id === selectedId;
          return (
            <Tappable
              key={opt.id}
              as="button"
              onClick={() => onSelect(opt.id)}
              aria-pressed={selected}
              className={`flex min-h-[44px] items-center font-[family-name:var(--font-newsreader)] text-[clamp(1rem,1.5vw,1.15rem)] transition-colors duration-200 max-md:min-h-[48px] max-md:justify-center max-md:rounded-[4px] max-md:px-2 max-md:text-center max-md:text-[0.95rem] ${
                selected
                  ? "md:text-[#C89B6A] md:underline md:decoration-[1.6px] md:underline-offset-4 max-md:border max-md:border-transparent max-md:bg-[rgba(232,201,160,0.14)] max-md:text-[#E8C9A0] max-md:underline max-md:decoration-2 max-md:underline-offset-4"
                  : "md:text-[rgba(247,242,234,0.45)] max-md:border max-md:border-[rgba(247,242,234,0.18)] max-md:text-[rgba(247,242,234,0.72)] max-md:no-underline"
              }`}
            >
              {opt.name}
            </Tappable>
          );
        })}
      </div>
    </div>
  );
}

// EXTRA vira multi-seleção: "Extra shot" e "Oat" são toggles independentes
// (os dois podem estar ativos ao mesmo tempo), "None" é um botão de limpar
// — não um terceiro estado selecionável, só fica com a marca visual de
// "selecionado" quando os outros dois estão desligados.
function ExtraAxis({
  activeExtras,
  onToggle,
  onClear,
}: {
  activeExtras: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.53rem] tracking-[0.22em] text-[#F7F2EA]/80">EXTRA</span>
      {/* Mobile (Fase 4): mesma grade de 3 colunas do COFFEE/SIZE. */}
      <div className="flex flex-wrap gap-x-5 gap-y-3 max-md:grid max-md:grid-cols-3 max-md:gap-3">
        {buildYoursOptions.extras.map((opt) => {
          const selected = opt.id === "none" ? activeExtras.size === 0 : activeExtras.has(opt.id);
          return (
            <Tappable
              key={opt.id}
              as="button"
              onClick={() => (opt.id === "none" ? onClear() : onToggle(opt.id))}
              aria-pressed={selected}
              className={`flex min-h-[44px] items-center font-[family-name:var(--font-newsreader)] text-[clamp(1rem,1.5vw,1.15rem)] transition-colors duration-200 max-md:min-h-[48px] max-md:justify-center max-md:rounded-[4px] max-md:px-2 max-md:text-center max-md:text-[0.95rem] ${
                selected
                  ? "md:text-[#C89B6A] md:underline md:decoration-[1.6px] md:underline-offset-4 max-md:border max-md:border-transparent max-md:bg-[rgba(232,201,160,0.14)] max-md:text-[#E8C9A0] max-md:underline max-md:decoration-2 max-md:underline-offset-4"
                  : "md:text-[rgba(247,242,234,0.45)] max-md:border max-md:border-[rgba(247,242,234,0.18)] max-md:text-[rgba(247,242,234,0.72)] max-md:no-underline"
              }`}
            >
              {opt.name}
            </Tappable>
          );
        })}
      </div>
    </div>
  );
}

// Xícara em SVG, traço só (sem preenchimento no corpo/alça/pires) — proporção
// de xícara de café de verdade (mais larga que alta), não copo de latte.
// viewBox 150x100: corpo 100 de largura no topo / 68 na base / 62 de altura
// (unidades relativas do comando), alça em arco de ~26 à direita centrada
// na altura do corpo, pires com 140 de largura. Reage às três escolhas:
// tamanho escala o traço inteiro (transform, 320ms), extras somam nível +
// faixa de leite (clipados pela forma do corpo, acompanham o afunilamento
// do trapézio automaticamente), tipo de café muda a cor do líquido (mesma
// transição 320ms). Altura mobile 92px (não 140px): a proporção 150:100
// (mais larga que o antigo desenho quadrado) não cabia ao lado do preço na
// faixa "lado a lado" do mobile em 140px — 92px é o que sobra de largura
// depois do preço + gap nesse layout, medido de verdade, não chutado.
// Desktop (200px) segue coluna empilhada, sem essa disputa de largura.
const CUP_BODY_D = "M25,20 L125,20 L109,82 L41,82 Z";
const CAVITY_TOP = 20;
const CAVITY_BOTTOM = 82;
const CAVITY_HEIGHT = CAVITY_BOTTOM - CAVITY_TOP;

function yAtLevel(pct: number) {
  return CAVITY_BOTTOM - (pct / 100) * CAVITY_HEIGHT;
}

function Cup({
  coffeeId,
  sizeId,
  activeExtras,
  className = "",
}: {
  coffeeId: string;
  sizeId: string;
  activeExtras: ReadonlySet<string>;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const liquidColor = LIQUID_COLORS[coffeeId] ?? LIQUID_COLORS["flat-white"];
  const isLarge = sizeId === "large";
  const hasExtraShot = activeExtras.has("extra-shot");
  const hasOat = activeExtras.has("oat");

  // Efeitos SOMAM, não se substituem: base 58, +20 com extra shot, +10 com
  // oat (58/68/78/88 conforme a combinação). A faixa de leite é 12% do
  // topo do LÍQUIDO em si (proporcional ao nível final), não da xícara.
  let level = BASE_LEVEL;
  if (hasExtraShot) level += EXTRA_SHOT_LEVEL_DELTA;
  if (hasOat) level += OAT_LEVEL_DELTA;
  const milkBand = hasOat ? level * MILK_BAND_FRACTION : 0;
  const coffeeLevel = level - milkBand;

  const coffeeTopY = yAtLevel(coffeeLevel);
  const liquidTopY = yAtLevel(level);
  const colorTransition = "fill 320ms cubic-bezier(0.16,1,0.3,1)";
  const geometryTransition = `y 320ms cubic-bezier(0.16,1,0.3,1), height 320ms cubic-bezier(0.16,1,0.3,1), ${colorTransition}`;

  return (
    <div
      className={`h-[92px] md:h-[200px] ${className}`}
      style={{
        transform: `scale(${isLarge ? 1.1 : 1}, ${isLarge ? 1.18 : 1})`,
        transformOrigin: "bottom center",
        transition: "transform 320ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <svg viewBox="0 0 150 100" className="h-full w-auto overflow-visible" aria-hidden>
        <defs>
          <clipPath id="cl-cup-body-clip">
            <path d={CUP_BODY_D} />
          </clipPath>
        </defs>

        {!reducedMotion && (
          <g className="cl-cup-steam">
            <path
              d="M63,16 C59,12 67,9 63,5"
              fill="none"
              stroke="#C89B6A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M87,16 C83,12 91,9 87,5"
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
            width="150"
            height={CAVITY_BOTTOM - coffeeTopY}
            fill={liquidColor}
            style={{ transition: geometryTransition }}
          />
          {hasOat && (
            <rect
              x="0"
              y={liquidTopY}
              width="150"
              height={coffeeTopY - liquidTopY}
              fill="#D9BE96"
              style={{ transition: geometryTransition }}
            />
          )}
        </g>

        <path d={CUP_BODY_D} fill="none" stroke="#C89B6A" strokeWidth="2" />
        <path
          d="M117,36 C143,38 143,64 117,66"
          fill="none"
          stroke="#C89B6A"
          strokeWidth="2"
        />
        <ellipse cx="75" cy="86" rx="70" ry="4" fill="none" stroke="#C89B6A" strokeWidth="2" />
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
