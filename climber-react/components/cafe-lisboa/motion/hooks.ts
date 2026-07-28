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

// Usado por StaggerGroup/StaggerItem/LineReveal (Fase 29) pra decidir se o
// reveal via whileInView roda (só desktop) ou se o conteúdo nasce direto no
// estado final (mobile — nunca depende de IntersectionObserver).
//
// Fase 30 (auditoria): valor inicial é uma CONSTANTE (false), igual no
// servidor e no primeiro paint do cliente — matchMedia só é lido dentro do
// useEffect, depois da montagem. Nunca no corpo da função (render) nem como
// valor inicial de useState — isso é o que evita qualquer divergência entre
// o HTML do servidor e o do cliente nesse primeiro paint (uma divergência
// aí quebraria a hidratação da página inteira, não só deste hook).
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
