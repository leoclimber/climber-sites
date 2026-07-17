"use client";

import { motion, type Variants } from "framer-motion";

// Mesma aproximação de power3.out usada em about.tsx (kicker/título) — rima
// visual com aquela seção, já que o Menu reusa o mesmo tom editorial.
const EASE_POWER3_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

// Mesma curva do reveal por máscara do SOBRE NÓS (TITLE_WORDS em about.tsx).
const EASE_MASK: [number, number, number, number] = [0.16, 1, 0.3, 1];

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

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_POWER3_OUT } },
};

// Um único trigger de viewport por COLUNA (não por item) — staggerChildren
// cascateia os 6 itens a partir dele. COFFEE e KITCHEN têm cada uma o seu
// próprio motion.div pai, então disparam de forma independente conforme
// cada uma cruza a viewport. Menu é seção normal de fluxo (ver Menu()
// abaixo) — nada esconde os itens antes disso, então whileInView dispara
// exatamente quando devia, sem gambiarra.
const itemsContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

// Máscara: o wrapper (overflow:hidden, fora daqui, no JSX) esconde o
// transbordo; o item desliza de y:100% (fora, embaixo da máscara) até
// y:0% — mesma linguagem do título do SOBRE NÓS (about.tsx).
const itemMaskVariants: Variants = {
  hidden: { y: "100%" },
  visible: { y: "0%", transition: { duration: 0.7, ease: EASE_MASK } },
};

const HOVER_TRANSITION = "transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)]";

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
          <div key={item.name}>
            {i > 0 && (
              <div style={{ height: 1, backgroundColor: DIVIDER_COLOR, margin: "2vh 0" }} />
            )}
            {/* Máscara do item: overflow:hidden fora, y:100%->0% dentro. */}
            <div style={{ overflow: "hidden" }}>
              <motion.div variants={itemMaskVariants} className="group">
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
                      items-baseline no pai. Vira dourada no hover. */}
                  <div
                    aria-hidden
                    className={`bg-[rgba(237,231,220,0.08)] group-hover:bg-[#C89B6A] group-hover:opacity-60 ${HOVER_TRANSITION}`}
                    style={{ flexGrow: 1, height: 1 }}
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
        ))}
      </motion.div>
    </div>
  );
}

export function Menu() {
  return (
    // SEM z-index/position explícitos de propósito: Menu precisa ficar
    // ATRÁS das camadas fixed do Pour (vídeo z-10, cortina z-20 — ver
    // pour.tsx/pour-curtain.tsx) enquanto elas ainda cobrem a tela. Um
    // z-index alto aqui (tentativa anterior: 30) fazia exatamente o
    // oposto do pedido — Menu, sendo uma caixa de fluxo normal bem maior
    // que a viewport, passava a desenhar POR CIMA da cortina/vídeo assim
    // que sua própria borda superior entrava geometricamente na tela,
    // muito antes da cortina terminar de fechar: dava pra ver o topo do
    // Menu "vazando" por cima da galeria ainda ativa. Sem position
    // (static) e sem z-index, elementos position:fixed sempre desenham
    // acima de conteúdo de fluxo normal, na ordem certa, sem precisar de
    // nenhum número mágico.
    <section id="menu" className="w-full" style={{ backgroundColor: BG }}>
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
