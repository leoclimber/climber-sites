"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MaskReveal, Tappable } from "./motion";
import { usePrefersReducedMotion } from "./motion/hooks";
import { Rule } from "./manifesto";
import { mosaicSlots } from "./data";

// Grade fixa de 5 slots (rodada 6, fechada). Cada foto no aspect-ratio
// REAL — a largura da coluna vem de porcentagens travadas (styles.css,
// .cl-mosaic) e a altura de cada foto nasce do próprio aspect-ratio, nunca
// de object-fit: cover ou altura forçada. Sem destaque próprio: reveal em
// máscara com stagger na entrada, depois paradas; clique abre lightbox.
export function GalleryGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const slotA = mosaicSlots[0];
  const [slotB, slotC] = [mosaicSlots[1], mosaicSlots[2]];
  const [slotD, slotE] = [mosaicSlots[3], mosaicSlots[4]];

  return (
    <section id="cl-gallery" className="bg-[#FAF8F5] py-16 md:py-24">
      <div className="px-6 md:px-16">
        <Rule label="05 · O Espaço" />
      </div>

      <div className="hidden md:block md:px-4">
        <div className="cl-mosaic">
          <MosaicTile slot={slotA} index={0} sizes="55vw" onOpen={() => setOpenIndex(0)} />
          <div className="cl-mosaic-col">
            <MosaicTile slot={slotB} index={1} sizes="18vw" onOpen={() => setOpenIndex(1)} />
            <MosaicTile slot={slotC} index={2} sizes="18vw" onOpen={() => setOpenIndex(2)} />
          </div>
          <div className="cl-mosaic-col">
            <MosaicTile slot={slotD} index={3} sizes="27vw" onOpen={() => setOpenIndex(3)} />
            <MosaicTile slot={slotE} index={4} sizes="27vw" onOpen={() => setOpenIndex(4)} />
          </div>
        </div>
      </div>

      <div className="cl-drag-row -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:hidden">
        {mosaicSlots.map((slot, i) => (
          <button
            key={slot.id}
            onClick={() => setOpenIndex(i)}
            className="relative block w-[72vw] shrink-0 snap-start overflow-hidden active:scale-[0.97] active:opacity-70"
            style={{ aspectRatio: slot.ratio }}
            aria-label={`Open ${slot.alt} full screen`}
          >
            <Image src={slot.src} alt={slot.alt} fill sizes="72vw" loading="lazy" className="object-cover" />
          </button>
        ))}
      </div>

      <Lightbox slot={openIndex !== null ? mosaicSlots[openIndex] : null} onClose={() => setOpenIndex(null)} />
    </section>
  );
}

function MosaicTile({
  slot,
  index,
  sizes = "(min-width: 768px) 50vw, 100vw",
  onOpen,
}: {
  slot: (typeof mosaicSlots)[number];
  index: number;
  sizes?: string;
  onOpen: () => void;
}) {
  return (
    <MaskReveal index={index}>
      <Tappable
        as="button"
        onClick={onOpen}
        className="group block w-full cursor-pointer overflow-hidden"
        style={{ aspectRatio: slot.ratio }}
        aria-label={`Open ${slot.alt} full screen`}
      >
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={slot.src}
            alt={slot.alt}
            fill
            sizes={sizes}
            loading="lazy"
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.05]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3A1F0F]/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </div>
      </Tappable>
    </MaskReveal>
  );
}

function Lightbox({
  slot,
  onClose,
}: {
  slot: (typeof mosaicSlots)[number] | null;
  onClose: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!slot) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slot, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {slot && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Photo, full screen"
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-[#1C1917]/92 p-6"
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <div
            className="relative max-h-[86vh] w-full max-w-4xl"
            style={{ aspectRatio: slot.ratio }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={slot.src} alt={slot.alt} fill sizes="86vw" className="object-contain" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
