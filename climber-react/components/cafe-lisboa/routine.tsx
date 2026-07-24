"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Rule } from "./manifesto";
import { routineSteps } from "./data";

// Destaque 2/4: sticky bidirecional no desktop (painel travado em 38vh,
// exatamente — não interpretar), arraste horizontal no mobile.
export function Routine() {
  return (
    <section id="cl-routine" className="bg-[#FAF8F5] px-6 py-16 md:px-16 md:py-24">
      <Rule label="04 · A Rotina" />
      <RoutineDesktop />
      <RoutineMobile />
    </section>
  );
}

function RoutineDesktop() {
  const [active, setActive] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Progresso contínuo de rolagem da SEÇÃO INTEIRA (0 no topo do wrapper,
  // 1 no fim), dividido em 3 terços iguais. Uma função contínua nunca tem
  // "zona morta" entre passos — ao contrário de 3 observers de viewport
  // independentes (tentativa anterior: com o texto mais curto que a tela,
  // sobrava faixa onde nenhum dos três cruzava o centro ao mesmo tempo, e
  // "Method" nunca vencia a corrida contra o vizinho). Bidirecional de
  // graça: o valor de progresso responde à posição atual, não a uma
  // direção de rolagem.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const index = Math.min(2, Math.floor(progress * 3));
    setActive(index);
  });

  return (
    <div ref={wrapperRef} className="hidden md:grid md:grid-cols-[38vw_1fr] md:gap-16">
      <div>
        <div className="sticky top-24 h-[38vh] w-full overflow-hidden">
          {routineSteps.map((step, i) => (
            <motion.div
              key={step.label}
              className="absolute inset-0"
              animate={{ opacity: active === i ? 1 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Image
                src={step.image}
                alt={`${step.label} — Café Lisboa's coffee routine`}
                fill
                sizes="38vw"
                loading="lazy"
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        {routineSteps.map((step, i) => (
          <div key={step.label} className="flex min-h-[75vh] flex-col justify-center gap-3">
            <div className="flex items-center gap-3 text-[0.875rem] tracking-[0.05em] text-[#8B4A2F]">
              <span className="h-px w-10 bg-[#8B4A2F]" aria-hidden />
              {String(i + 1).padStart(2, "0")} / 03
            </div>
            <h3 className="font-[family-name:var(--font-newsreader)] text-[2rem] text-[#1C1917]">
              {step.label}
            </h3>
            <div className="flex flex-col gap-1 text-[1.0625rem] leading-[1.6] text-[#78716C]">
              {step.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoutineMobile() {
  const [active, setActive] = useState(0);

  return (
    <div className="md:hidden">
      <div
        className="cl-drag-row flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
        onScroll={(e) => {
          const el = e.currentTarget;
          const cardWidth = el.firstElementChild?.clientWidth ?? 1;
          setActive(Math.round(el.scrollLeft / (cardWidth + 16)));
        }}
      >
        {routineSteps.map((step, i) => (
          <div
            key={step.label}
            className="relative w-[82vw] shrink-0 snap-start"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={step.image}
                alt={`${step.label} — Café Lisboa's coffee routine`}
                fill
                sizes="82vw"
                loading="lazy"
                className="object-cover"
              />
              <span className="absolute right-3 top-3 bg-[#1C1917] px-2 py-1 text-[0.6875rem] tracking-[0.05em] text-[#FAF8F5]">
                {String(i + 1).padStart(2, "0")} / 03
              </span>
            </div>
            <h3 className="mt-4 font-[family-name:var(--font-newsreader)] text-[1.5rem] text-[#1C1917]">
              {step.label}
            </h3>
            <div className="mt-1 flex flex-col gap-0.5 text-[0.9375rem] leading-[1.5] text-[#78716C]">
              {step.mobileLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-1.5" aria-hidden>
        {routineSteps.map((step, i) => (
          <span
            key={step.label}
            className="h-1.5 w-1.5 rounded-full transition-colors"
            style={{ backgroundColor: active === i ? "#8B4A2F" : "#D9CFC2" }}
          />
        ))}
      </div>
    </div>
  );
}
