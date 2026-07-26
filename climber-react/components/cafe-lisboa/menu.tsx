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
    <section id="cl-menu" className="bg-[#FAF8F5] px-6 pt-9 pb-0 md:px-16 md:pt-12">
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

      {/* key={active}: força remontar o grupo a cada troca de categoria.
          Sem isso, o whileInView/once:true do StaggerGroup só dispara UMA
          vez pra sempre (a mesma instância do componente persiste entre
          trocas de aba) — itens de categorias trocadas depois disso nascem
          e ficam presos no estado "hidden" (opacity:0) porque não existe
          nenhum novo evento de entrada em viewport pra acordar eles. Com a
          key, cada categoria ganha sua própria instância e o observer
          dispara de novo (a seção já está visível, então dispara na hora). */}
      <StaggerGroup
        key={active}
        as="ul"
        stagger={0.06}
        className="mx-auto mt-12 flex max-w-[1100px] flex-col gap-1 md:mt-16"
      >
        {category.items.map((item, i) => (
          <StaggerItem as="li" key={`${category.id}-${item.name}`}>
            <MenuRow index={i} name={item.name} price={item.price} allergens={item.allergens} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      <div className="mx-auto mt-12 flex max-w-[1100px] flex-col gap-3 border-t border-[#E7E2DB] pt-6 text-[0.8125rem] text-[#78716C]">
        <AllergenDisclosure />
        <p>Prices include VAT</p>
      </div>
    </section>
  );
}

function AllergenDisclosure() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Tappable
        as="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-[44px] items-center text-[0.8125rem] text-[#78716C] underline decoration-[#A8A29E] underline-offset-2"
      >
        Allergen info (14) →
      </Tappable>
      {open && (
        <p className="mt-2">
          {allergenLegend} — {allergenDeclaration}
        </p>
      )}
    </div>
  );
}

function MenuRow({
  index,
  name,
  price,
  allergens,
}: {
  index: number;
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
      className="flex items-baseline border-b border-[#E7E2DB] py-4"
    >
      <span className="shrink-0 text-[0.75rem] tabular-nums text-[#A8A29E]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="ml-4 text-[1.0625rem] text-[#1C1917]">
        {name}
        {allergens && (
          <sup className="ml-1 text-[0.65rem] text-[#78716C]">{allergens.join(" ")}</sup>
        )}
      </span>
      <span className="relative mx-2 min-w-[8px] flex-1 self-end overflow-hidden">
        <motion.span
          variants={{
            hidden: { scaleX: reducedMotion ? 1 : 0 },
            show: { scaleX: 1, transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } },
          }}
          className="block h-px w-full origin-left border-b border-dotted"
          style={{ borderColor: "rgba(28,22,20,.25)" }}
          aria-hidden
        />
      </span>
      <span className="shrink-0 text-[1.0625rem] tabular-nums text-[#1C1917]">€{price}</span>
    </Tappable>
  );
}
