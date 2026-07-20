"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

// Curva única pedida pro reveal inteiro (coluna, itens, réguas).
const EASE_LAYER: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Marrom quase-preto (grão torrado) — ritmo do site: claro (sobre nós) ->
// madeira quente (the pour) -> escuro (menu). Cor de carta de restaurante,
// não cardápio de delivery.
const BG = "#1C1614";
const CREAM = "#EDE7DC";
const GOLD = "#C89B6A"; // mesmo tom das estrias do hero
const DIVIDER_COLOR = "rgba(237,231,220,0.1)";

interface MenuEntry {
  name: string;
  price: string;
  description: string;
}

const COFFEE_ITEMS: MenuEntry[] = [
  { name: "ESPRESSO", price: "€2.80", description: "Single origin, rotating. Ask what's on today." },
  { name: "FLAT WHITE", price: "€3.60", description: "Our house blend, silky microfoam." },
  { name: "CORTADO", price: "€3.20", description: "Equal parts, no compromise." },
  { name: "FILTER", price: "€3.40", description: "V60 or batch. Brewed to order." },
  { name: "COLD BREW", price: "€4.20", description: "Steeped 18 hours. Nothing added." },
  { name: "MATCHA LATTE", price: "€4.50", description: "Ceremonial grade, whisked fresh." },
];

const KITCHEN_ITEMS: MenuEntry[] = [
  { name: "SOURDOUGH TOAST", price: "€6.50", description: "Cultured butter, sea salt. Add avocado €2." },
  { name: "PASTEL DE NATA", price: "€3.20", description: "Baked here, twice a day." },
  { name: "BANANA BREAD", price: "€4.00", description: "Toasted, with mascarpone." },
  { name: "EGGS ON RYE", price: "€9.50", description: "Soft scramble, chives, dark rye." },
  { name: "GRANOLA BOWL", price: "€7.80", description: "Greek yoghurt, honey, seasonal fruit." },
  { name: "TOASTIE", price: "€8.50", description: "Aged cheddar, caramelised onion." },
];

// Coluna inteira: desliza da lateral (COFFEE de -80px/esquerda, KITCHEN de
// +80px/direita — sinal vem de `custom.side`) + opacity 0->1, 0.8s. O
// delay entre COFFEE e KITCHEN (0s / 0.12s) chega via `custom.delay`.
const columnVariants: Variants = {
  hidden: (c: { side: number }) => ({ opacity: 0, x: 80 * c.side }),
  visible: (c: { side: number; delay: number }) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: EASE_LAYER, delay: c.delay },
  }),
};

// Label (COFFEE)/(KITCHEN): fade simples, dispara junto com o primeiro
// item da coluna (mesmo delay-base, sem stagger próprio). Opacidade final
// de repouso é 0.45 (rótulo discreto) — não muda.
const labelVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 0.45,
    transition: { duration: 0.5, ease: EASE_LAYER, delay },
  }),
};

// Réguas (a de baixo do label E a de cada item, mesma mecânica): desenham
// com scaleX 0->1 a partir da esquerda, no MESMO delay do elemento
// correspondente (label = primeiro item da coluna; item = o próprio item).
const ruleVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: (delay: number) => ({
    scaleX: 1,
    transition: { duration: 0.7, ease: EASE_LAYER, delay },
  }),
};

// Máscara de cada item (wrapper overflow:hidden fora, y:100%->0% dentro) —
// sobe SIMULTÂNEO ao deslize lateral da coluna (mesma base de delay), em
// cascata de 0.07s entre os 6 itens.
const itemMaskVariants: Variants = {
  hidden: { y: "100%" },
  visible: (delay: number) => ({
    y: "0%",
    transition: { duration: 0.7, ease: EASE_LAYER, delay },
  }),
};

const COLUMN_DELAY = 0.12;
const ITEM_STAGGER = 0.07;
const ITEM_DURATION = 0.7;

// Linha de base ("OAT, ALMOND...") entra por último, opacity 0 -> 0.35
// (0.35 é a opacidade final de repouso do texto, não muda). Delay
// calculado a partir de quando o último item da última coluna a entrar
// (KITCHEN, 6 itens) termina — não é número mágico solto.
const LAST_ITEM_DELAY = COLUMN_DELAY + (6 - 1) * ITEM_STAGGER;
const BASELINE_DELAY = LAST_ITEM_DELAY + ITEM_DURATION;
const baselineVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 0.35,
    transition: { duration: 0.5, ease: EASE_LAYER, delay: BASELINE_DELAY },
  },
};

const HOVER_TRANSITION = "transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)]";

function MenuColumn({
  label,
  items,
  inView,
  side,
  columnDelay,
}: {
  label: string;
  items: MenuEntry[];
  inView: boolean;
  side: -1 | 1;
  columnDelay: number;
}) {
  return (
    <motion.div
      className="w-full"
      custom={{ side, delay: columnDelay }}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={columnVariants}
    >
      <motion.span
        custom={columnDelay}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={labelVariants}
        className="block font-mono uppercase"
        style={{ fontSize: "0.7rem", letterSpacing: "0.35em", color: GOLD }}
      >
        {label}
      </motion.span>
      <motion.div
        custom={columnDelay}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={ruleVariants}
        className="mt-4 h-px w-full"
        style={{ backgroundColor: DIVIDER_COLOR, transformOrigin: "left" }}
      />

      <div style={{ marginTop: "4vh" }}>
        {items.map((item, i) => {
          const itemDelay = columnDelay + i * ITEM_STAGGER;
          return (
            <div key={item.name}>
              {i > 0 && (
                <div style={{ height: 1, backgroundColor: DIVIDER_COLOR, margin: "2vh 0" }} />
              )}
              {/* Máscara do item: overflow:hidden fora, y:100%->0% dentro. */}
              <div style={{ overflow: "hidden" }}>
                <motion.div
                  custom={itemDelay}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={itemMaskVariants}
                  className="group"
                >
                  <div className="flex items-baseline gap-4">
                    <span
                      className={`inline-block group-hover:translate-x-[12px] ${HOVER_TRANSITION}`}
                      style={{
                        fontFamily: "var(--font-instrument-serif)",
                        fontWeight: 400,
                        fontSize: "clamp(1.4rem, 2vw, 1.9rem)",
                        letterSpacing: 0,
                        color: CREAM,
                      }}
                    >
                      {item.name}
                    </span>
                    {/* Régua sólida (não mais pontilhada): estende do fim do
                        nome até o início do preço, alinhada ao baseline via
                        items-baseline no pai. Vira dourada no hover. Desenha
                        com o próprio item (scaleX 0->1, mesmo delay). */}
                    <motion.div
                      aria-hidden
                      custom={itemDelay}
                      initial="hidden"
                      animate={inView ? "visible" : "hidden"}
                      variants={ruleVariants}
                      className={`bg-[rgba(237,231,220,0.08)] group-hover:bg-[#C89B6A] group-hover:opacity-60 ${HOVER_TRANSITION}`}
                      style={{ flexGrow: 1, height: 1, transformOrigin: "left" }}
                    />
                    {/* Preço como textura editorial, não informação — grande,
                        quase apagado, deixa de competir com o nome. */}
                    <span
                      style={{
                        fontFamily: "var(--font-archivo)",
                        fontWeight: 400,
                        fontSize: "2rem",
                        color: CREAM,
                        opacity: 0.25,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.price}
                    </span>
                  </div>
                  <p
                    className={`opacity-40 group-hover:opacity-75 ${HOVER_TRANSITION}`}
                    style={{
                      fontFamily: "var(--font-archivo)",
                      marginTop: "0.4rem",
                      fontSize: "0.8rem",
                      maxWidth: 420,
                      color: CREAM,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.description}
                  </p>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function Menu() {
  // Um único observer pra seção inteira — dispara o reveal em camadas das
  // duas colunas juntas, cada uma com seu próprio delay/lado (ver
  // columnDelay/side em MenuColumn). Sem margin negativa no viewport
  // (diferente de tentativas anteriores): a seção do Pour agora sobe e
  // sai da tela em fluxo normal, sem backdrop opaco cobrindo o Menu — o
  // amount:0.15 geométrico já bate perto de quando o Menu realmente
  // aparece, não precisa de ajuste.
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {
    amount: 0.15,
    once: true,
  });

  return (
    <section id="menu" ref={sectionRef} className="w-full" style={{ backgroundColor: BG }}>
      <div
        className="mx-auto w-full max-w-[1400px] px-8 sm:px-16"
        style={{ paddingTop: "14vh", paddingBottom: "14vh" }}
      >
        {/* Assimetria: COFFEE 58% / KITCHEN 42%, gap 8% — as duas alinhadas
            no topo (o offset vertical de +12vh na KITCHEN foi removido:
            lia como desalinhamento quebrado, não como editorial). */}
        <div
          className="grid grid-cols-1 items-start gap-y-[8vh] md:grid-cols-[58fr_42fr] md:gap-x-[8%] md:gap-y-0"
        >
          <MenuColumn
            label="(COFFEE)"
            items={COFFEE_ITEMS}
            inView={inView}
            side={-1}
            columnDelay={0}
          />
          <MenuColumn
            label="(KITCHEN)"
            items={KITCHEN_ITEMS}
            inView={inView}
            side={1}
            columnDelay={COLUMN_DELAY}
          />
        </div>

        <motion.p
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={baselineVariants}
          className="text-center uppercase"
          style={{
            marginTop: "8vh",
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            color: CREAM,
          }}
        >
          Oat, almond and soy at no extra charge · Beans available to take home
        </motion.p>
      </div>
    </section>
  );
}
