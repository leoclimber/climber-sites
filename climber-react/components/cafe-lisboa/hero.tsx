"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { LineReveal, useCountUp } from "./motion";
import { usePrefersReducedMotion } from "./motion/hooks";
import { business } from "./data";

// Duas colunas literais (texto ~43% | foto ~57%), no mesmo espírito do
// Manifesto — nunca foto full-bleed com texto por cima. Três camadas de
// movimento na foto: 1) parallax de scroll (translateY, mais devagar que o
// texto), 2) drift de mouse em desktop com ponteiro fino (translateX/Y
// pequeno, spring), 3) vapor/luz quente ambiente (CSS puro, sem canvas).
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const trustBarRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, 120]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (reducedMotion) return;
    const canHoverFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHoverFine) return;
    const el = photoRef.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(relX * 18);
      mouseY.set(relY * 18);
    }
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [reducedMotion, mouseX, mouseY]);

  // Um único gatilho de viewport pra ambos os contadores (nota e reviews)
  // dispararem juntos, em vez de cada número medir sua própria visibilidade.
  const trustInView = useInView(trustBarRef, { once: true, amount: 0.6 });
  const ratingValue = useCountUp(business.rating, trustInView, 1.4);
  const reviewValue = useCountUp(business.reviewCount, trustInView, 1.6);

  return (
    <section
      ref={sectionRef}
      id="cl-hero"
      className="relative w-full overflow-hidden bg-[#1C1917] md:grid md:h-screen md:min-h-[640px] md:grid-cols-[43%_1fr] md:items-stretch"
    >
      <div className="relative z-10 order-2 flex flex-col justify-center gap-5 px-6 py-14 md:order-1 md:px-14 md:py-0">
        <span className="text-[0.8125rem] tracking-[0.15em] text-[#E9DFCF]/70">
          // FRESHLY BREWED · DUBLIN 8
        </span>

        <LineReveal
          as="h1"
          onMount
          lines={[
            "Your morning,",
            <>
              <em className="italic text-[#8B4A2F]">done right</em>.
            </>,
          ]}
          className="font-[family-name:var(--font-newsreader)] text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.02] tracking-[-0.02em] text-[#FAF8F5]"
        />

        <motion.p
          initial={reducedMotion ? undefined : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[38ch] text-[clamp(1rem,1.4vw,1.15rem)] leading-[1.5] text-[#E9DFCF]"
        >
          Open since seven. The first pour goes out at ten past.
        </motion.p>

        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          <a
            href="#cl-menu"
            className="inline-flex items-center bg-[#8B4A2F] px-7 py-3.5 text-[0.95rem] font-medium tracking-[0.02em] text-[#FAF8F5] transition-colors hover:bg-[#7A3F27] active:scale-[0.97] active:opacity-90"
          >
            View the menu
          </a>
          <a
            href="#cl-hours"
            className="group inline-flex items-center gap-1.5 text-[0.9rem] text-[#E9DFCF] active:opacity-70"
          >
            Find us
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </motion.div>

        <motion.div
          ref={trustBarRef}
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.95 }}
          className="mt-6 flex flex-col gap-3 border-t border-[#E9DFCF]/25 pt-5 text-[0.8125rem] tracking-[0.03em] text-[#E9DFCF]/85 md:mt-8"
        >
          <span>{business.addressShort}</span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span aria-hidden className="text-[#8B4A2F]">
              ★
            </span>
            <span className="tabular-nums">{ratingValue.toFixed(1)}</span>
            <span className="text-[#E9DFCF]/50">on Google</span>
            <span aria-hidden className="text-[#E9DFCF]/40">
              ·
            </span>
            <span className="tabular-nums">{Math.round(reviewValue)}</span>
            <span className="text-[#E9DFCF]/50">reviews</span>
            <span aria-hidden className="text-[#E9DFCF]/40">
              ·
            </span>
            <span>Open from 7AM</span>
          </span>
        </motion.div>
      </div>

      <div
        ref={photoRef}
        className="relative order-1 aspect-[4/5] w-full overflow-hidden md:order-2 md:aspect-auto md:h-full"
      >
        <motion.div className="absolute inset-0" style={{ y: photoY }}>
          <motion.div className="absolute inset-0" style={{ x: springX, y: springY, scale: 1.14 }}>
            <Image
              src="/images/gallery/atmosphere-02.jpg"
              alt="Sunlit counter at Café Lisboa, espresso machine steaming, coffee bags on the shelf"
              fill
              sizes="(min-width: 768px) 57vw, 100vw"
              preload
              className="object-cover"
            />
          </motion.div>
        </motion.div>
        <div aria-hidden className="cl-hero-steam" />
      </div>
    </section>
  );
}
