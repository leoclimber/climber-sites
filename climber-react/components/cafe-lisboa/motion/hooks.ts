"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

// Fonte única de verdade pra prefers-reduced-motion neste produto — os
// primitivos de movimento (LineReveal, MaskReveal, StaggerReveal) todos
// leem daqui em vez de cada um checar matchMedia por conta própria.
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reduced;
}

// Fase 19 [SO DESKTOP]: MaskReveal (o wipe de retângulo sólido) é o sistema
// de entrada aprovado do MOBILE — continua existindo e rodando exatamente
// igual lá. No desktop ele passa a ceder lugar ao novo sistema
// (motion/photo-reveal.tsx, clip-path+scale). Em vez de duplicar a
// animação nos dois breakpoints ao mesmo tempo, MaskReveal usa este hook
// pra virar um no-op só quando a viewport é desktop — mobile nunca lê
// `true` daqui, então seu ramo de código (e sua aparência) não muda em
// nada.
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 769px)");
    setIsDesktop(query.matches);
    const handler = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

// Conta de 0 até `target` quando `start` vira true (o chamador decide o
// gatilho — normalmente um useInView no contêiner que engloba vários
// contadores, pra todos dispararem juntos). Usa a função imperativa
// `animate` do Framer (não bound a nenhum elemento) só pra interpolar um
// número puro; prefers-reduced-motion pula direto pro valor final.
export function useCountUp(target: number, start: boolean, duration = 1.6) {
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (!start) return;
    if (reducedMotion) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [start, target, duration, reducedMotion]);

  return value;
}

// Irmão do useCountUp: em vez de contar de 0 quando entra em viewport, re-anima
// do valor MOSTRADO ATUAL pro novo `target` toda vez que `target` muda —
// mesmo mecanismo (`animate()`, mesmo easing), gatilho diferente. Usado pelo
// preço do Build Yours: cada toque numa opção sobe/desce do preço antigo pro
// novo, não reinicia do zero.
export function useAnimatedNumber(target: number, duration = 0.42) {
  const reducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (prevTarget.current === target) return;
    const from = prevTarget.current;
    prevTarget.current = target;

    if (reducedMotion) {
      setValue(target);
      return;
    }
    const controls = animate(from, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [target, duration, reducedMotion]);

  return value;
}
