"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./motion";
import { business } from "./data";

const NAV_HEIGHT_PX = 56;

const SECTIONS = [
  { id: "cl-manifesto", label: "Manifesto" },
  { id: "cl-menu", label: "Menu" },
  { id: "cl-build-yours", label: "Build yours" },
  { id: "cl-gallery", label: "O Espaço" },
  { id: "cl-hours", label: "Horários" },
  { id: "cl-reviews", label: "Avaliações" },
] as const;

// Fase 25 [SO DESKTOP, componente novo]: barra de navegação fixa — a página
// tem 8 seções e, acima de 768px, nenhuma forma de pular entre elas (o
// mobile já resolve isso com a MobileActionBar, fixa embaixo). Nunca
// renderiza abaixo de 768px (md:flex/hidden). Fica invisível enquanto o
// hero preenche a tela (a capa já tem os próprios CTAs) e some de novo
// quando o rodapé entra — mesmo par de IntersectionObserver que a
// MobileActionBar já usa, só que disparando um translateY(-100%) no topo
// em vez de translateY(100%) embaixo. Um segundo IntersectionObserver, com
// rootMargin negativo dos dois lados, mede qual seção ocupa a faixa logo
// abaixo da barra (scroll-spy) pra destacar o rótulo certo.
export function DesktopNavBar() {
  const reducedMotion = usePrefersReducedMotion();
  const [heroVisible, setHeroVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;

    // Faixa observada: logo abaixo da barra (56px) até 40% da viewport — a
    // seção com MAIOR proporção do próprio corpo dentro dessa faixa é "a
    // seção atual" pro rótulo destacado (intersectionRatio é relativo à
    // altura do próprio alvo, não da faixa — por isso uma seção alta como
    // o Cardápio, com só os últimos 56px ainda cruzando a faixa, perde pra
    // Build Yours quando ela já preenche a faixa inteira).
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        const mostVisible = intersecting.reduce((a, b) =>
          a.intersectionRatio >= b.intersectionRatio ? a : b
        );
        setActiveId(mostVisible.target.id);
      },
      { rootMargin: `-${NAV_HEIGHT_PX}px 0px -60% 0px`, threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const visible = !heroVisible && !footerVisible;

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT_PX;
    window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  return (
    <nav
      aria-hidden={!visible}
      className="fixed inset-x-0 top-0 z-40 hidden md:flex md:items-center md:justify-between md:px-16"
      style={{
        height: `${NAV_HEIGHT_PX}px`,
        backgroundColor: "rgba(26,21,18,0.90)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transform: visible ? "translateY(0%)" : "translateY(-100%)",
        transition: reducedMotion ? "none" : "transform 240ms cubic-bezier(0.16,1,0.3,1)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <button
        type="button"
        onClick={scrollToTop}
        tabIndex={visible ? 0 : -1}
        className="font-[family-name:var(--font-newsreader)] text-[17px] text-[#F7F2EA]"
      >
        {business.name}
      </button>

      <div className="flex items-center gap-[28px]">
        {SECTIONS.map((s) => {
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              tabIndex={visible ? 0 : -1}
              className={`relative py-2 text-[13px] tracking-[0.08em] text-[#F7F2EA] transition-opacity duration-[180ms] hover:opacity-100 ${
                isActive ? "opacity-100" : "opacity-70"
              }`}
            >
              {s.label}
              {isActive && (
                <span aria-hidden className="absolute bottom-0 left-0 h-px w-full bg-[#C89B6A]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
