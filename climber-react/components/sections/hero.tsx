"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { AboutReveal } from "./about";

const HeroCanvas = dynamic(
  () => import("@/components/canvas/hero-canvas").then((m) => m.HeroCanvas),
  { ssr: false }
);

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-IE", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Dublin",
      }).format(new Date());

    setTime(format());
    const id = setInterval(() => setTime(format()), 1000 * 15);
    return () => clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{time || "--:--"}</span>;
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    mass: 0.3,
  });

  // Fase 1 do cinetica: textos saem ao longo de 0-25% do scroll, junto com
  // o nascimento das estrias (ver hyperspace-streaks.tsx) — não antes.
  const overlayOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);
  const overlayBlur = useTransform(smoothProgress, [0, 0.25], [0, 8]);
  const overlayFilter = useTransform(overlayBlur, (v) => `blur(${v}px)`);
  const overlayY = useTransform(smoothProgress, [0, 0.25], ["0%", "-6%"]);

  if (prefersReducedMotion) {
    return (
      <section
        id="hero"
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ background: "#150c07" }}
      >
        <HeroOverlay />
      </section>
    );
  }

  return (
    // Metade da duração anterior (300vh → 150vh) — mesmas proporções de
    // fase internamente (0-25% textos saindo / 25-80% imersão / 80-100%
    // clip-path abrindo), só comprimidas pra exigir menos rolagem.
    // Desktop (lg+): +40% de altura (150vh -> 210vh) pra dar mais fôlego
    // de rolagem à imersão — as frações de fase acima não mudam porque
    // tudo é dirigido por scrollYProgress (0-1 relativo à altura do
    // container), nunca por vh/pixel absoluto. Mobile mantém 150vh: o
    // dedo já rende pouco progresso por swipe, mais altura ali significa
    // só mais swipes repetidos pra atravessar a mesma imersão.
    <section id="hero" ref={containerRef} className="relative z-20 h-[150vh] w-full lg:h-[210vh]">
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ background: "#150c07" }}
      >
        <div className="absolute inset-0">
          <HeroCanvas progress={scrollYProgress} />
        </div>

        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ opacity: overlayOpacity, filter: overlayFilter, y: overlayY }}
        >
          <HeroOverlay />
        </motion.div>

        <AboutReveal progress={smoothProgress} />
      </div>
    </section>
  );
}

// Clone 1:1 da estrutura/texto do hero do cinetica (referencias-sites/cinetica),
// extraído do CSS real deles (.hero_inner, .hero-span_title, .hero-content__p,
// .hero-vertical, .hero-deco__span). Texto e proporções ainda são os deles —
// só troca pro café depois de aprovado.
const TITLE_SIZE = "clamp(2.75rem, 8vw, 7.5rem)";

function HeroOverlay() {
  return (
    <div
      className="relative grid h-full w-full grid-rows-3 p-6 text-[#f3e6d3] sm:p-12 md:p-16"
    >
      <CornerBrackets />

      {/* hero-deco: cantos superiores */}
      <div className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e0b686] sm:left-12 sm:top-14">
        cinetica studio
      </div>
      <div className="absolute right-6 top-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e0b686] sm:right-12 sm:top-14">
        all rights reserved
      </div>

      {/* hero-vertical: status piscando, rotacionado -90deg */}
      <div className="absolute right-0 top-[7em] hidden origin-top-right -rotate-90 sm:block">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e0b686]">
          loading new reality<BlinkingDots />
        </span>
      </div>

      {/* hero-content_top: Experience / the + parágrafo, linha 1 do grid */}
      <div className="pointer-events-none row-start-1 flex max-w-[58em] flex-wrap items-center gap-8">
        <span
          className="font-sans font-black uppercase leading-none"
          style={{ fontSize: TITLE_SIZE }}
        >
          Experience
        </span>
        <span
          className="font-sans font-black uppercase leading-none"
          style={{ fontSize: TITLE_SIZE }}
        >
          the
        </span>
        <p className="max-w-[22em] font-sans text-[1.1em] leading-[1.4] text-[#f3e6d3]/90">
          Award-winning digital studio crafting high-impact content, immersive
          &amp; interactive experiences for global brands since 2019.
        </p>
      </div>

      {/* hero-content_bottom: Impossible, alinhado à direita, linha 3 do grid */}
      <div className="pointer-events-none row-start-3 flex items-end justify-end text-right">
        <span
          className="font-sans font-black uppercase leading-none"
          style={{ fontSize: TITLE_SIZE }}
        >
          Impossible
        </span>
      </div>

      {/* hero-deco: rodapé (relógio no lugar de data/hora deles) */}
      <div className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e0b686] sm:left-12 sm:bottom-10">
        Dublin, IE — <LiveClock />
      </div>
    </div>
  );
}

function BlinkingDots() {
  return (
    <>
      <span className="animate-pulse [animation-delay:0ms]">.</span>
      <span className="animate-pulse [animation-delay:200ms]">.</span>
      <span className="animate-pulse [animation-delay:400ms]">.</span>
    </>
  );
}

function CornerBrackets() {
  const size = "1.25rem";
  const common = "absolute border-[#e0b686]/60";
  return (
    <>
      <div
        className={`${common} left-4 top-4 border-l border-t sm:left-6 sm:top-6`}
        style={{ width: size, height: size }}
      />
      <div
        className={`${common} right-4 top-4 border-r border-t sm:right-6 sm:top-6`}
        style={{ width: size, height: size }}
      />
      <div
        className={`${common} bottom-4 left-4 border-b border-l sm:bottom-6 sm:left-6`}
        style={{ width: size, height: size }}
      />
      <div
        className={`${common} bottom-4 right-4 border-b border-r sm:bottom-6 sm:right-6`}
        style={{ width: size, height: size }}
      />
    </>
  );
}
