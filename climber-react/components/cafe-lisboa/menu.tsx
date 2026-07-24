"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LineReveal, StaggerGroup, StaggerItem, Tappable } from "./motion";
import { usePrefersReducedMotion } from "./motion/hooks";
import { Rule } from "./manifesto";
import { menuCategories, allergenLegend, allergenDeclaration } from "./data";

// Cardápio tipográfico — sem foto em card (regra do Clean A). Abas rolam
// com o dedo no mobile (overflow-x nativo, sem empilhar); linha do preço
// desenha da esquerda pra direita ao entrar em tela.
export function Menu() {
  const [active, setActive] = useState(menuCategories[0].id);
  const category = menuCategories.find((c) => c.id === active) ?? menuCategories[0];

  return (
    <section id="cl-menu" className="bg-[#FAF8F5] px-6 py-16 md:px-16 md:py-24">
      <Rule label="03 · Menu" />

      <div className="cl-drag-row -mx-6 flex gap-8 overflow-x-auto px-6 pb-1 md:mx-0 md:gap-10 md:px-0">
        {menuCategories.map((c) => (
          <Tappable
            key={c.id}
            as="button"
            onClick={() => setActive(c.id)}
            className="relative shrink-0 whitespace-nowrap py-2 text-[1.1rem] md:text-[1.2rem]"
            aria-pressed={active === c.id}
          >
            <span
              className="font-[family-name:var(--font-newsreader)]"
              style={{ color: active === c.id ? "#1C1917" : "#A8A29E" }}
            >
              {c.label}
            </span>
            {active === c.id && (
              <motion.span
                layoutId="cl-menu-underline"
                className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-[#8B4A2F]"
              />
            )}
          </Tappable>
        ))}
      </div>

      <StaggerGroup
        as="ul"
        stagger={0.06}
        className="mt-10 grid gap-x-16 gap-y-1 md:grid-cols-2"
      >
        {category.items.map((item) => (
          <StaggerItem as="li" key={item.name}>
            <MenuRow name={item.name} price={item.price} allergens={item.allergens} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      <div className="mt-12 flex flex-col gap-1 border-t border-[#E7E2DB] pt-6 text-[0.8125rem] text-[#78716C]">
        <p>
          {allergenLegend} — {allergenDeclaration}
        </p>
        <p>Prices include VAT</p>
      </div>
    </section>
  );
}

function MenuRow({
  name,
  price,
  allergens,
}: {
  name: string;
  price: string;
  allergens?: readonly string[];
}) {
  const reducedMotion = usePrefersReducedMotion();

  // O gatilho de viewport fica no CONTÊINER da linha inteira (altura real,
  // ~56px), não no traço de 1px — observar um elemento quase sem altura
  // pra "80% visível" é instável (a razão de interseção oscila por causa
  // de arredondamento de subpixel) e fazia o desenho falhar em algumas
  // linhas. O traço em si só recebe a variante do pai.
  return (
    <Tappable
      as="div"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      className="flex items-baseline justify-between gap-4 py-4"
    >
      <span className="text-[1.0625rem] text-[#1C1917]">
        {name}
        {allergens && (
          <sup className="ml-1 text-[0.65rem] text-[#78716C]">{allergens.join(" ")}</sup>
        )}
      </span>
      <span className="relative flex-1 self-end overflow-hidden">
        <motion.span
          variants={{
            hidden: { scaleX: reducedMotion ? 1 : 0 },
            show: { scaleX: 1, transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } },
          }}
          className="block h-px origin-left border-b border-dashed border-[#E7E2DB]"
          aria-hidden
        />
      </span>
      <span className="shrink-0 text-[1.0625rem] tabular-nums text-[#1C1917]">€{price}</span>
    </Tappable>
  );
}
