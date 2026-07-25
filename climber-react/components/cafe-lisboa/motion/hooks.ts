"use client";

import { useEffect, useState } from "react";
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
