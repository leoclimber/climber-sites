"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "./motion/hooks";
import { business } from "./data";

const EASE = [0.16, 1, 0.3, 1] as const;

// Barra fixa de ação (Fase 7, componente novo) — só existe no mobile
// (md:hidden; o desktop já tem os dois CTAs espalhados pela página, não
// precisa de atalho fixo). Some enquanto o hero está na tela (a capa já
// tem "View the menu"/"Find us") e some de novo quando o rodapé entra
// (senão os mesmos dois links — call/directions — apareceriam duplicados
// na mesma tela, o rodapé já tem telefone e endereço). Nos dois casos usa
// IntersectionObserver, não scroll position em pixels — mais barato e não
// quebra com a altura das seções mudando.
export function MobileActionBar() {
  const reducedMotion = usePrefersReducedMotion();
  const [heroVisible, setHeroVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("#cl-hero");
    const footer = document.querySelector("#cl-footer");
    if (!hero || !footer) return;

    const heroObserver = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
      threshold: 0,
    });
    const footerObserver = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      threshold: 0,
    });
    heroObserver.observe(hero);
    footerObserver.observe(footer);
    return () => {
      heroObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  const visible = !heroVisible && !footerVisible;

  return (
    <motion.div
      aria-hidden={!visible}
      className="fixed inset-x-0 bottom-0 z-40 flex md:hidden"
      style={{
        height: "calc(64px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        backgroundColor: "rgba(26,21,18,0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        pointerEvents: visible ? "auto" : "none",
      }}
      initial={false}
      animate={{ y: reducedMotion ? "0%" : visible ? "0%" : "100%" }}
      transition={{ duration: reducedMotion ? 0 : 0.24, ease: EASE }}
    >
      <a
        href={business.phoneHref}
        tabIndex={visible ? 0 : -1}
        className="flex flex-1 items-center justify-center text-[0.9375rem] tracking-[0.02em] text-[#F7F2EA] active:opacity-70"
      >
        Call
      </a>
      <span aria-hidden className="w-px self-stretch bg-[rgba(247,242,234,0.18)]" />
      <a
        href={business.mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={visible ? 0 : -1}
        className="flex flex-1 items-center justify-center text-[0.9375rem] tracking-[0.02em] text-[#F7F2EA] active:opacity-70"
      >
        Get directions
      </a>
    </motion.div>
  );
}
