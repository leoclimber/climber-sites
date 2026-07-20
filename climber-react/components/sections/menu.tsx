"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";

// Curva única pedida pro reveal inteiro (coluna, itens, réguas).
const EASE_LAYER: [number, number, number, number] = [0.16, 1, 0.3, 1];

// O deslize das colunas agora é ligado a scroll (useTransform), não a
// transition.duration do Framer — mas a curva [0.16,1,0.3,1] continua
// valendo, só que como função de easing de INTERPOLAÇÃO (progress->valor),
// não de tempo. Newton-Raphson pequeno, mesma técnica já usada noutros
// pontos scroll-linked deste projeto.
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const a = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1;
  const b = (a1: number, a2: number) => 3 * a2 - 6 * a1;
  const c = (a1: number) => 3 * a1;
  const calc = (t: number, a1: number, a2: number) => ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
  const slope = (t: number, a1: number, a2: number) => 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1);
  const getTForX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (s === 0) return t;
      t -= (calc(t, x1, x2) - x) / s;
    }
    return t;
  };
  return (x: number) => calc(getTForX(Math.max(0, Math.min(1, x))), y1, y2);
}
const easeLayerFn = cubicBezier(...EASE_LAYER);

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

// Réguas de cada item (mecânica time-based, ver abaixo): desenham com
// scaleX 0->1 a partir da esquerda, no delay do próprio item.
const ruleVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: (delay: number) => ({
    scaleX: 1,
    transition: { duration: 0.7, ease: EASE_LAYER, delay },
  }),
};

// Máscara de cada item (wrapper overflow:hidden fora, y:100%->0% dentro) —
// cascata de ITEM_STAGGER entre os 6 itens de cada coluna. Continua
// time-based (não ligada a scroll): a mecânica de cascata pedida é mais
// simples de ler como "dispara e escalona no tempo" do que fatiada em
// progress de scroll — a instrução permite isso explicitamente contanto
// que dispare no INÍCIO do reveal (ver `revealStarted` em Menu()).
const itemMaskVariants: Variants = {
  hidden: { y: "100%" },
  visible: (delay: number) => ({
    y: "0%",
    transition: { duration: 0.7, ease: EASE_LAYER, delay },
  }),
};

// COLUMN_DELAY: agora só usado como base de tempo pra cascata de ITENS da
// KITCHEN (0.25s depois da COFFEE) — o deslize/opacity da COLUNA em si não
// usa mais esse valor como transition.delay (virou scroll-linked, ver
// MenuColumn). ITEM_STAGGER 0.12s (era 0.07s) e o próprio COLUMN_DELAY
// 0.25s (era 0.12s) foram alargados pra cascata ficar visível item a
// item, não um blur de 6 itens quase juntos.
const COLUMN_DELAY = 0.25;
const ITEM_STAGGER = 0.12;
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

// Deslize da coluna: 120px (era 80px), ligado a scroll — ver `columnRange`
// em Menu(). COLUMN_SLIDE_DURATION_S / KITCHEN_DELAY_S não são mais
// transition.duration/delay de verdade (a coluna não anima por tempo);
// são convertidos em FRAÇÕES do progress de scroll [0,1] do container
// (ver `useScroll` em Menu()), preservando a MESMA proporção pedida
// (coluna leva 1.4s "equivalentes", KITCHEN começa 0.25s "equivalentes"
// depois da COFFEE) — só a régua que mede isso trocou de segundos reais
// pra posição de scroll.
const SLIDE_DISTANCE = 120;
const COLUMN_SLIDE_DURATION_S = 1.4;
const KITCHEN_COLUMN_DELAY_S = 0.25;
const VIRTUAL_TOTAL_S = KITCHEN_COLUMN_DELAY_S + COLUMN_SLIDE_DURATION_S;
const toProgress = (seconds: number) => seconds / VIRTUAL_TOTAL_S;

const HOVER_TRANSITION = "transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)]";

function MenuColumn({
  label,
  items,
  scrollYProgress,
  revealStarted,
  side,
  itemBaseDelay,
}: {
  label: string;
  items: MenuEntry[];
  scrollYProgress: MotionValue<number>;
  revealStarted: boolean;
  side: -1 | 1;
  itemBaseDelay: number;
}) {
  // Faixa de progress da COLUNA: COFFEE ocupa [0, toProgress(1.4)],
  // KITCHEN ocupa [toProgress(0.25), toProgress(0.25+1.4)] — mesma
  // proporção duração/delay pedida, só reexpressa em progress de scroll
  // (ver comentário de VIRTUAL_TOTAL_S acima).
  const pStart = toProgress(itemBaseDelay);
  const pEnd = toProgress(itemBaseDelay + COLUMN_SLIDE_DURATION_S);

  const colX = useTransform(scrollYProgress, [pStart, pEnd], [SLIDE_DISTANCE * side, 0], {
    ease: easeLayerFn,
  });
  const colOpacity = useTransform(scrollYProgress, [pStart, pEnd], [0, 1], { ease: easeLayerFn });
  const labelOpacity = useTransform(scrollYProgress, [pStart, pEnd], [0, 0.45], { ease: easeLayerFn });
  const ruleScaleX = useTransform(scrollYProgress, [pStart, pEnd], [0, 1], { ease: easeLayerFn });

  return (
    <motion.div className="w-full" style={{ x: colX, opacity: colOpacity }}>
      <motion.span
        style={{ opacity: labelOpacity, fontSize: "0.7rem", letterSpacing: "0.35em", color: GOLD }}
        className="block font-mono uppercase"
      >
        {label}
      </motion.span>
      <motion.div
        style={{ scaleX: ruleScaleX, transformOrigin: "left", backgroundColor: DIVIDER_COLOR }}
        className="mt-4 h-px w-full"
      />

      <div style={{ marginTop: "4vh" }}>
        {items.map((item, i) => {
          const itemDelay = itemBaseDelay + i * ITEM_STAGGER;
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
                  animate={revealStarted ? "visible" : "hidden"}
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
                      animate={revealStarted ? "visible" : "hidden"}
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
  // Deslize das colunas ligado a SCROLL (não mais useInView disparando
  // tudo de uma vez): conforme a seção entra na viewport, columnProgress
  // anda de 0 a 1 e as colunas vão entrando das laterais em sincronia
  // direta com a rolagem — o usuário VÊ o movimento acontecer, não um
  // flash de "sumiu -> apareceu". offset ["start end", "start center"]:
  // progress 0 quando o topo do Menu toca o fundo da viewport (começando
  // a entrar), progress 1 quando o topo do Menu chega ao centro da
  // viewport — a janela de scroll em que o deslize acontece.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start center"],
  });

  // Cascata dos itens continua no tempo (ver comentário em itemMaskVariants
  // acima), mas o GATILHO que dispara essa cascata agora nasce do mesmo
  // scroll-progress da coluna — assim que o reveal começa a entrar
  // (progress > ~0), não de um useInView separado. "once" (sem branch de
  // reset pra false): igual ao comportamento anterior, não quero a
  // cascata re-disparando se a pessoa rolar pra cima e pra baixo de novo.
  const [revealStarted, setRevealStarted] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p > 0.02) setRevealStarted(true);
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
            scrollYProgress={scrollYProgress}
            revealStarted={revealStarted}
            side={-1}
            itemBaseDelay={0}
          />
          <MenuColumn
            label="(KITCHEN)"
            items={KITCHEN_ITEMS}
            scrollYProgress={scrollYProgress}
            revealStarted={revealStarted}
            side={1}
            itemBaseDelay={COLUMN_DELAY}
          />
        </div>

        <motion.p
          initial="hidden"
          animate={revealStarted ? "visible" : "hidden"}
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
