"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { AboutReveal } from "./about";

const HeroCanvas = dynamic(
  () => import("@/components/canvas/hero-canvas").then((m) => m.HeroCanvas),
  { ssr: false }
);

// Checagem de suporte a WebGL antes de sequer tentar montar o Canvas — em
// vez de deixar o R3F/Three tentar criar um contexto que vai falhar (alguns
// browsers/dispositivos têm WebGL desabilitado ou indisponível de vez).
// Só roda no client (window/document indefinidos no SSR) — ver o
// useEffect em Hero() que chama isso, nunca durante o render inicial.
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

// Rede de segurança pra qualquer erro que a checagem acima não pega —
// WebGL "existe" mas o driver/GPU falha ao compilar um shader, contexto
// perdido logo no mount, etc. Sem isso, um crash dentro do Canvas (R3F
// lança como exceção JS de render normal) derrubaria a árvore de React
// inteira a partir daqui, e o hero (e o resto da página, já que o resto
// do site está fora desta boundary) sumiria.
class HeroCanvasBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[hero] 3D canvas falhou, caindo pro fallback estático:", error);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// Fallback estático: mesma foto de café já usada como hero em outros
// contextos do banco de imagens do projeto — fundo escuro coerente com
// DARK_COLOR do canvas 3D (ver hero-canvas.tsx), então a troca não lê como
// "quebrado", só como uma versão sem a imersão 3D. HeroOverlay (texto) já
// funciona sobre qualquer fundo escuro, sem mudança nenhuma.
function HeroStaticFallback() {
  return (
    <div className="absolute inset-0">
      <Image
        src="/images/hero/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />
    </div>
  );
}

// PARTE 3 (correção — erro de hidratação persistente): framer-motion's
// useReducedMotion() lê matchMedia de forma SÍNCRONA já no primeiro
// render do CLIENTE (`initPrefersReducedMotion()` roda no corpo da
// função, fora de useEffect) — o servidor não tem window, então assume
// false, mas um dispositivo com "reduzir movimento" ativado já monta a
// árvore de fallback no primeiro paint do cliente enquanto o HTML do
// servidor tinha montado a árvore animada normal: mismatch de
// hidratação de verdade, reproduzido forçando
// prefers-reduced-motion:reduce via Playwright (mesma causa raiz já
// corrigida em pour.tsx). Troca pelo MESMO padrão que canRender3D logo
// abaixo já usa neste arquivo: default false nos dois lados (servidor E
// primeiro render do client), corrigido de verdade só depois, no
// useEffect — mesmo preço de "flash rápido" que o comentário de
// canRender3D já documenta e aceita, aqui só estendido pra
// prefersReducedMotion também.
function usePrefersReducedMotionSafe() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return prefersReducedMotion;
}

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
  const prefersReducedMotion = usePrefersReducedMotionSafe();

  // Default true (tenta o Canvas) tanto no server quanto no primeiro
  // render do client — SEM isso daria mismatch de hidratação (server não
  // tem window pra checar WebGL de verdade). A checagem real roda só
  // depois, no useEffect (client-only); se não tiver suporte, troca pro
  // fallback estático — pode haver um flash rápido (tenta Canvas -> troca),
  // é o preço de manter a hidratação consistente.
  const [canRender3D, setCanRender3D] = useState(true);
  useEffect(() => {
    setCanRender3D(hasWebGL());
  }, []);

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
    // container), nunca por vh/pixel absoluto.
    // Mobile (<lg): 320vh, não mais 150vh — a fase final (80-100%, About
    // revelando+panando dentro do pin, ver about.tsx) precisa de
    // distância de scroll real pra (a) o pan vertical do conteúdo
    // empilhado (kicker→título→parágrafo→foto) não parecer instantâneo, e
    // (b) dar "peso" suficiente nessa fase pra um flick forte gastar seu
    // momento ali dentro em vez de atravessar reto pro Pour. Ainda é
    // TUDO dirigido por scrollYProgress (0-1 relativo à altura do
    // container) — só a altura do container mudou, as frações de fase
    // continuam as mesmas.
    <section id="hero" ref={containerRef} className="relative z-20 h-[320vh] w-full lg:h-[210vh]">
      <div
        className="hero-sticky sticky top-0 h-screen w-full overflow-hidden"
        style={{ background: "#150c07" }}
      >
        <div className="absolute inset-0">
          {canRender3D ? (
            <HeroCanvasBoundary fallback={<HeroStaticFallback />}>
              <HeroCanvas progress={scrollYProgress} />
            </HeroCanvasBoundary>
          ) : (
            <HeroStaticFallback />
          )}
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

// Clone 1:1 da ESTRUTURA/proporções do hero do cinetica
// (referencias-sites/cinetica, extraído do CSS real deles: .hero_inner,
// .hero-span_title, .hero-content__p, .hero-vertical, .hero-deco__span) — o
// texto já foi trocado pro café (era placeholder do template original).
const TITLE_SIZE = "clamp(2.75rem, 8vw, 7.5rem)";

function HeroOverlay() {
  return (
    <div
      className="relative grid h-full w-full grid-rows-3 p-6 text-[#f3e6d3] sm:p-12 md:p-16"
    >
      <CornerBrackets />

      {/* hero-deco: cantos superiores */}
      <div className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e0b686] sm:left-12 sm:top-14">
        the room
      </div>
      <div className="absolute right-6 top-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e0b686] sm:right-12 sm:top-14">
        all rights reserved
      </div>

      {/* hero-vertical: status piscando, rotacionado -90deg */}
      <div className="absolute right-0 top-[7em] hidden origin-top-right -rotate-90 sm:block">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e0b686]">
          now brewing<BlinkingDots />
        </span>
      </div>

      {/* hero-content_top: Made / by hand + parágrafo, linha 1 do grid */}
      <div className="pointer-events-none row-start-1 flex max-w-[58em] flex-wrap items-center gap-8">
        <span
          className="font-sans font-black uppercase leading-none"
          style={{ fontSize: TITLE_SIZE }}
        >
          Made
        </span>
        <span
          className="font-sans font-black uppercase leading-none"
          style={{ fontSize: TITLE_SIZE }}
        >
          by hand
        </span>
        <p className="max-w-[22em] font-sans text-[1.1em] leading-[1.4] text-[#f3e6d3]/90">
          A neighbourhood coffee room in the heart of Dublin. Single origin,
          roasted with care, poured with intention. Every cup starts before
          sunrise.
        </p>
      </div>

      {/* hero-content_bottom: Every morning, alinhado à direita, linha 3 do grid */}
      <div className="pointer-events-none row-start-3 flex items-end justify-end text-right">
        <span
          className="font-sans font-black uppercase leading-none"
          style={{ fontSize: TITLE_SIZE }}
        >
          Every morning
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
