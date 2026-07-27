"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type Ref } from "react";
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
//
// Base das 3 colunas igualada (Fase E): coluna 2 (B+C) é a âncora — nem A
// nem C mudam de recorte/tamanho. Só o slot A (coluna 1, único e por isso
// também "o último" dela) e o slot E (último da coluna 3) ganham uma altura
// calculada pra fechar exatamente na mesma base, com object-cover só neles
// pra acomodar. A conta não dá pra fechar em CSS puro (fr-tracks + aspect
// ratio + gap fixo de 10px não é proporção limpa entre si), por isso mede
// de verdade via ResizeObserver — mesmo padrão de runtime-measurement já
// usado em smooth-scroll.tsx pros anchors de scroll.
export function GalleryGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const slotA = mosaicSlots[0];
  const [slotB, slotC] = [mosaicSlots[1], mosaicSlots[2]];
  const [slotD, slotE] = [mosaicSlots[3], mosaicSlots[4]];

  // Indicador de arraste mobile (Fase 6a) — mesma cor/altura do ProgressBar
  // do topo da página (h-[3px] bg-[#8B4A2F]), scaleX em vez de width pelo
  // mesmo motivo: composita na GPU, não dispara layout a cada frame de
  // scroll horizontal.
  const dragRowRef = useRef<HTMLDivElement>(null);
  const [dragProgress, setDragProgress] = useState(0);

  function handleDragScroll() {
    const el = dragRowRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setDragProgress(max > 0 ? el.scrollLeft / max : 0);
  }

  const tileARef = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const tileDRef = useRef<HTMLDivElement>(null);
  const [adjustedHeights, setAdjustedHeights] = useState<{ a: number; e: number } | null>(null);

  useEffect(() => {
    function measure() {
      if (!col2Ref.current || !tileDRef.current) return;
      const target = col2Ref.current.offsetHeight;
      if (target === 0) return; // mosaico desktop escondido (mobile usa a faixa de arraste)
      const dHeight = tileDRef.current.offsetHeight;
      setAdjustedHeights({ a: target, e: Math.max(target - dHeight - 10, 0) });
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (col2Ref.current) observer.observe(col2Ref.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section id="cl-gallery" className="bg-[#FAF8F5] pt-[70px] pb-9 md:pt-[126px] md:pb-12">
      <div className="px-6 md:px-16">
        <Rule label="05 · O Espaço" />
      </div>

      <div className="hidden md:block md:px-4">
        <div className="cl-mosaic">
          <MosaicTile
            slot={slotA}
            index={0}
            sizes="55vw"
            onOpen={() => setOpenIndex(0)}
            tileRef={tileARef}
            heightOverride={adjustedHeights?.a}
          />
          <div className="cl-mosaic-col" ref={col2Ref}>
            <MosaicTile slot={slotB} index={1} sizes="18vw" onOpen={() => setOpenIndex(1)} />
            <MosaicTile slot={slotC} index={2} sizes="18vw" onOpen={() => setOpenIndex(2)} />
          </div>
          <div className="cl-mosaic-col">
            <MosaicTile slot={slotD} index={3} sizes="27vw" onOpen={() => setOpenIndex(3)} tileRef={tileDRef} />
            <MosaicTile
              slot={slotE}
              index={4}
              sizes="27vw"
              onOpen={() => setOpenIndex(4)}
              heightOverride={adjustedHeights?.e}
            />
          </div>
        </div>
      </div>

      {/* Fase 6a: -mx-6+px-6 (pensado pra sangrar dos dois lados) na
          verdade empurrava a 1ª foto 24px além da goteira real do rótulo
          (medido: rótulo em x=24, foto em x=-24). Duas causas empilhadas:
          a margem negativa, E o fato de scroll-snap-type:mandatory ignorar
          padding comum — sem scroll-padding correspondente, o navegador
          nunca considera scrollLeft=0 uma posição "encaixada" (o padding
          não é um ponto de snap válido) e pula direto pra a foto colada na
          borda. pl-6 (sem margem negativa) resolve a 1ª causa; scroll-pl-6
          (mesma medida, como scroll-padding) resolve a 2ª — só assim
          scrollLeft=0 vira um snap válido e a foto cai nos mesmos 24px do
          rótulo. A última foto continua "sangrando" pra fora — isso vem da
          largura w-[72vw] de cada foto, nunca dependeu do padding. */}
      <div
        ref={dragRowRef}
        onScroll={handleDragScroll}
        className="cl-drag-row flex snap-x snap-mandatory gap-4 overflow-x-auto pl-6 scroll-pl-6 md:hidden"
      >
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

      <div className="mt-5 flex justify-center md:hidden" aria-hidden>
        <div className="h-[3px] w-16 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(28,22,20,0.15)" }}>
          <div
            className="h-full w-full origin-left rounded-full bg-[#8B4A2F]"
            style={{ transform: `scaleX(${Math.max(dragProgress, 0.08)})` }}
          />
        </div>
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
  tileRef,
  heightOverride,
}: {
  slot: (typeof mosaicSlots)[number];
  index: number;
  sizes?: string;
  onOpen: () => void;
  tileRef?: Ref<HTMLDivElement>;
  heightOverride?: number;
}) {
  return (
    <MaskReveal index={index}>
      <div
        ref={tileRef}
        className="w-full"
        style={heightOverride ? { height: heightOverride } : { aspectRatio: slot.ratio }}
      >
        <Tappable
          as="button"
          onClick={onOpen}
          className="group block h-full w-full cursor-pointer overflow-hidden"
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
      </div>
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
