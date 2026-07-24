"use client";

import { useEffect, useState } from "react";

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
