"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LineReveal } from "./motion";
import { usePrefersReducedMotion } from "./motion/hooks";
import { business } from "./data";

// Destaque 1/4: parallax. A foto anda mais devagar que o texto ao rolar —
// só a camada da foto tem transform, o bloco de texto fica parado no fluxo
// normal (position: sticky não entra aqui, é só translateY escalado).
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, 160]);

  return (
    <section
      ref={sectionRef}
      id="cl-hero"
      className="relative h-screen min-h-[640px] w-full overflow-hidden"
    >
      <motion.div className="absolute inset-0" style={{ y: photoY, scale: 1.12 }}>
        <Image
          src="/images/gallery/atmosphere-02.jpg"
          alt="Sunlit counter at Café Lisboa, espresso machine steaming, coffee bags on the shelf"
          fill
          sizes="100vw"
          preload
          className="object-cover"
        />
      </motion.div>

      {/* Vinheta radial concentrada atrás do bloco de texto — não uma
          faixa reta cobrindo metade da foto (fechado na rodada 3). */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 22% 84%, rgba(28,25,23,0.62) 0%, rgba(28,25,23,0.32) 55%, rgba(28,25,23,0) 100%)",
        }}
      />

      <div className="relative flex h-full flex-col justify-end px-6 pb-16 md:px-16 md:pb-24">
        <LineReveal
          as="h1"
          lines={[business.name]}
          onMount
          className="font-[family-name:var(--font-newsreader)] text-[clamp(3rem,13vw,9.5rem)] leading-[0.95] tracking-[-0.03em] text-[#FAF8F5]"
        />

        <motion.p
          initial={reducedMotion ? undefined : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 max-w-md text-[clamp(1rem,2.4vw,1.6rem)] text-[#E9DFCF] md:mt-4"
        >
          Open since seven. The first pour goes out at ten past.
        </motion.p>

        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 md:mt-8"
        >
          <a
            href="#cl-menu"
            className="group inline-flex flex-col gap-2 text-[1.05rem] font-medium text-[#FAF8F5] active:scale-[0.97] active:opacity-70"
          >
            <span className="inline-flex items-center gap-2">
              View the menu
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
            <span className="h-[2px] w-[130px] bg-[#8B4A2F]" aria-hidden />
          </a>
        </motion.div>

        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.95 }}
          className="mt-8 border-t border-[#E9DFCF]/40 pt-4 text-[0.75rem] tracking-[0.15em] text-[#E9DFCF]/85 md:mt-10"
        >
          MEATH STREET, DUBLIN 8
        </motion.div>
      </div>
    </section>
  );
}
