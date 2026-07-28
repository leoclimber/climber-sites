"use client";

import { useEffect } from "react";

const PARALLAX_FACTOR = 0.15;
const DESKTOP_QUERY = "(min-width: 769px)";

// Parallax da foto do hero (Fase 11e, só desktop) — roda inteiramente
// depois do mount, via mutação direta de DOM (sem estado/re-render), pra
// nunca competir com a pintura da foto: ela é o elemento de LCP e não pode
// ganhar animação de entrada, só esse scroll depois que já está na tela.
// Só `transform` muda (nunca top/margin/background-position, que disparam
// layout); o bloco de texto (irmão, fora de #cl-hero-photo) não recebe
// nenhum transform e continua andando a 1×.
export function HeroParallax() {
  useEffect(() => {
    const photo = document.getElementById("cl-hero-photo");
    const hero = document.getElementById("cl-hero");
    if (!photo || !hero) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const mql = window.matchMedia(DESKTOP_QUERY);
    let active = mql.matches;
    let rafId: number | null = null;

    function apply() {
      rafId = null;
      if (!active || !photo || !hero) return;
      const heroHeight = hero.offsetHeight;
      const s = Math.max(0, Math.min(window.scrollY, heroHeight));
      photo.style.transform = `translate3d(0, ${(s * PARALLAX_FACTOR).toFixed(2)}px, 0)`;
    }

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(apply);
    }

    function setActive(isActive: boolean) {
      active = isActive;
      if (active) {
        photo!.style.willChange = "transform";
        apply();
        window.addEventListener("scroll", onScroll, { passive: true });
      } else {
        window.removeEventListener("scroll", onScroll);
        photo!.style.willChange = "";
        photo!.style.transform = "";
      }
    }

    setActive(mql.matches);
    const onMqlChange = (e: MediaQueryListEvent) => setActive(e.matches);
    mql.addEventListener("change", onMqlChange);

    return () => {
      mql.removeEventListener("change", onMqlChange);
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
