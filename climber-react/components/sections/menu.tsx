"use client";

import { motion, type Variants } from "framer-motion";

// Mesma aproximação de power3.out usada em about.tsx (kicker/título) — rima
// visual com aquela seção, já que o Menu reusa o mesmo tom editorial.
const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

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

// Label + régua entram primeiro (delay 0). Os itens começam 0.3s depois,
// com stagger de 0.08s entre eles — dois grupos de variants independentes
// disparados pelo mesmo whileInView, não um staggerChildren único (0.3s
// não é múltiplo limpo de 0.08s, então não dá pra misturar no mesmo grupo).
// NÃO MEXIDO nesta revisão — só layout/cor/tipografia mudaram.
const headerVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_POWER3_OUT } },
};

const itemsContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.3, staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_POWER3_OUT } },
};

function MenuColumn({ label, items }: { label: string; items: MenuEntry[] }) {
  return (
    <div className="w-full">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
        <motion.span
          variants={headerVariants}
          className="block font-mono uppercase"
          style={{ fontSize: "0.7rem", letterSpacing: "0.35em", opacity: 0.45, color: GOLD }}
        >
          {label}
        </motion.span>
        <motion.div
          variants={headerVariants}
          className="mt-4 h-px w-full"
          style={{ backgroundColor: DIVIDER_COLOR }}
        />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={itemsContainerVariants}
        style={{ marginTop: "4vh" }}
      >
        {items.map((item, i) => (
          <motion.div key={item.name} variants={itemVariants}>
            {i > 0 && (
              <div style={{ height: 1, backgroundColor: DIVIDER_COLOR, margin: "2vh 0" }} />
            )}
            <div className="flex items-baseline justify-between gap-6">
              <span
                style={{
                  fontFamily: "var(--font-archivo)",
                  fontWeight: 700,
                  fontSize: "clamp(1.2rem, 1.8vw, 1.7rem)",
                  letterSpacing: "-0.02em",
                  color: CREAM,
                }}
              >
                {item.name}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-archivo)",
                  fontWeight: 400,
                  fontSize: "clamp(1.2rem, 1.8vw, 1.7rem)",
                  letterSpacing: "-0.02em",
                  color: CREAM,
                  opacity: 0.45,
                  whiteSpace: "nowrap",
                }}
              >
                {item.price}
              </span>
            </div>
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.85rem",
                opacity: 0.4,
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
        ))}
      </motion.div>
    </div>
  );
}

export function Menu() {
  return (
    <section
      id="menu"
      className="relative w-full"
      style={{ backgroundColor: BG, paddingTop: "14vh", paddingBottom: "14vh" }}
    >
      <div className="mx-auto w-full max-w-[1400px] px-8 sm:px-16">
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ columnGap: "6vw", rowGap: "8vh" }}
        >
          <MenuColumn label="(COFFEE)" items={COFFEE_ITEMS} />
          <MenuColumn label="(KITCHEN)" items={KITCHEN_ITEMS} />
        </div>

        <p
          className="text-center uppercase"
          style={{
            marginTop: "8vh",
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            opacity: 0.35,
            color: CREAM,
          }}
        >
          Oat, almond and soy at no extra charge · Beans available to take home
        </p>
      </div>
    </section>
  );
}
