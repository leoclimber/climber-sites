"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LineReveal, StaggerGroup, StaggerItem, Tappable } from "./motion";
import { usePrefersReducedMotion } from "./motion/hooks";
import { Rule } from "./manifesto";
import { menuCategories, allergenLegend, allergenDeclaration } from "./data";

// Classes md:hover:/md:group-hover: escritas por extenso direto no
// className (não como template-literal com prefixo importado): o scanner
// estático do Tailwind só gera CSS pra strings de classe completas e
// literais no arquivo-fonte — uma tentativa anterior de montar isso via
// variável (`${HOVER_FINE}hover:...`) nunca virava CSS real (o "md:" não
// ficava adjacente ao resto no texto-fonte), confirmado direto no CSS
// compilado. Tailwind v4 já embrulha `hover:` em @media(hover:hover) por
// padrão, então md:hover: sozinho já evita hover "grudado" depois de um
// toque em telas grandes, com min-width:768px como isolamento auditável.

// Cardápio tipográfico — sem foto em card (regra do Clean A). Abas rolam
// com o dedo no mobile (overflow-x nativo, sem empilhar); linha do preço
// desenha da esquerda pra direita ao entrar em tela.
export function Menu() {
  const [active, setActive] = useState(menuCategories[0].id);
  const category = menuCategories.find((c) => c.id === active) ?? menuCategories[0];
  const reducedMotion = usePrefersReducedMotion();

  // Sublinhado único do desktop (Fase 15): mede a posição/largura real da
  // aba ativa e translada+redimensiona UM elemento só entre trocas — o
  // antigo motion.span com layoutId ficava condicional por aba (desmonta
  // uma, monta outra), e sem AnimatePresence framer não tem o par
  // saída/entrada pra interpolar, então ele "pula" em vez de deslizar.
  // Mobile mantém o mecanismo antigo intocado (fora do escopo desta fase).
  const tabsRowRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState<{ x: number; width: number } | null>(null);

  useEffect(() => {
    function measure() {
      const row = tabsRowRef.current;
      // Tappable não é forwardRef (componente compartilhado, não vale
      // mexer só por causa desta medição) — acha o botão ativo pelo
      // data-tab-id em vez de guardar refs individuais.
      const el = row?.querySelector<HTMLElement>(`[data-tab-id="${active}"]`);
      if (!el || !row) return;
      const elRect = el.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      setUnderline({ x: elRect.left - rowRect.left, width: elRect.width });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  // Altura animada do container mobile (Fase 15): substitui o
  // max-md:min-h-[496px] fixo (resolvia o salto mas deixava ~700px de
  // vazio na aba Toasted, 4 itens). Trava a altura ATUAL antes de trocar
  // de aba, deixa o novo conteúdo renderizar, mede a altura natural dele
  // (scrollHeight ainda mede o conteúdo real mesmo com a caixa presa no
  // valor antigo) e anima até lá via CSS transition. Só roda abaixo de
  // 769px — desktop nunca ganha altura/overflow inline (mantém o fluxo
  // natural de sempre).
  const listWrapRef = useRef<HTMLDivElement>(null);
  // conteúdo real, sem NENHUM estilo de altura/overflow próprio — o
  // wrapper (listWrapRef) é quem trava a altura antiga durante a transição,
  // então o offsetHeight DELE fica preso no valor antigo também (uma caixa
  // de altura fixa maior que o conteúdo novo não "estoura", então o
  // conteúdo simplesmente cabe dentro sem gerar overflow nenhum pra medir).
  // contentRef nunca é limitado, então mede o tamanho natural de verdade
  // do conteúdo ATUAL, encolhendo ou crescendo.
  const contentRef = useRef<HTMLDivElement>(null);
  const [mobileHeight, setMobileHeight] = useState<number | null>(null);
  const isFirstRender = useRef(true);

  function handleTabChange(id: string) {
    if (window.innerWidth < 769 && listWrapRef.current) {
      setMobileHeight(listWrapRef.current.getBoundingClientRect().height);
    }
    setActive(id);
  }

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (window.innerWidth >= 769 || !contentRef.current) {
      setMobileHeight(null);
      return;
    }
    const target = contentRef.current.getBoundingClientRect().height;
    const raf = requestAnimationFrame(() => setMobileHeight(target));
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <section id="cl-menu" className="bg-[#FAF8F5] px-6 pt-[30px] pb-0 md:px-16 md:pt-[18px] md:pb-24">
      {/* Desktop (Fase 3 + Fase 15): container de 1100px deixava ~755px de
          branco à direita numa tela de 1920 — md:max-w-none volta a
          ocupar a faixa inteira goteira-a-goteira (64px dos dois lados,
          já dados pelo padding da seção). mx-auto/max-w continuam
          existindo pro mobile, onde nunca foram o fator limitante. */}
      <div className="mx-auto max-w-[1100px] md:mx-0 md:max-w-none">
        <Rule label="03 · Menu" />

        {/* Fase 22a [NOS DOIS]: overflow-y-hidden — sem ele, o computed
            overflow-y desta linha virava "auto" de fábrica (regra do CSS:
            overflow-x diferente de visible força o eixo Y ausente a virar
            auto também), e o scrollHeight (58px) passava o clientHeight
            (56px) por causa do sublinhado/borda — 2px de sobra bastavam pra
            desenhar uma barra de rolagem vertical inteira (com setinhas) na
            altura das abas. overflow-x-auto continua igual (é o que permite
            arrastar as abas com o dedo no mobile). */}
        <div
          ref={tabsRowRef}
          className="cl-drag-row relative -mx-6 flex gap-8 overflow-x-auto overflow-y-hidden px-6 pb-1 md:mx-0 md:gap-[32px] md:px-0"
        >
          {menuCategories.map((c) => (
            <Tappable
              key={c.id}
              as="button"
              data-tab-id={c.id}
              onClick={() => handleTabChange(c.id)}
              className="relative shrink-0 whitespace-nowrap py-2 text-[1.1rem] md:text-[22px]"
              aria-pressed={active === c.id}
            >
              {/* Fase 31a [NOS DOIS]: aba nao-ativa era #A8A29E (2,38:1 sobre
                  o creme #FAF8F5, o pior contraste do site, e e controle de
                  navegacao) -- #6B6560 fecha >=4,5:1. A aba ATIVA (#1C1917)
                  nao muda. */}
              <span
                className="font-[family-name:var(--font-newsreader)]"
                style={{ color: active === c.id ? "#1C1917" : "#6B6560" }}
              >
                {c.label}
              </span>
              {/* Mobile: mecanismo antigo (por aba, condicional), fora do
                  escopo da Fase 15 — intocado, só ganha md:hidden pra não
                  duplicar com o sublinhado único do desktop abaixo. */}
              {active === c.id && (
                <motion.span
                  layoutId="cl-menu-underline-mobile"
                  className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-[#8B4A2F] md:hidden"
                />
              )}
            </Tappable>
          ))}

          {underline && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -bottom-0.5 left-0 hidden h-[2px] bg-[#8B4A2F] md:block"
              animate={{ x: underline.x, width: underline.width }}
              transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </div>

        {/* key={active}: força remontar o grupo a cada troca de categoria.
            Sem isso, o whileInView/once:true do StaggerGroup só dispara UMA
            vez pra sempre (a mesma instância do componente persiste entre
            trocas de aba) — itens de categorias trocadas depois disso nascem
            e ficam presos no estado "hidden" (opacity:0) porque não existe
            nenhum novo evento de entrada em viewport pra acordar eles. Com a
            key, cada categoria ganha sua própria instância e o observer
            dispara de novo (a seção já está visível, então dispara na hora). */}
        {/* Mobile (Fase 15): min-height fixo saiu — altura do container
            agora anima (ver useLayoutEffect acima), sem vazio sobrando em
            abas com menos itens. Desktop segue com altura natural, sem
            estilo inline algum (mobileHeight só é setado abaixo de 769px).
            Fase 22a [NOS DOIS]: overflow-hidden permanente na className
            (era só inline, condicional a mobileHeight !== null) — sem ele,
            em alguns estados o container ficava sem overflow declarado e o
            navegador desenhava uma scrollbar vertical de fábrica (com
            setinhas) na altura das abas. Altura animada continua idêntica,
            só o clipping passou a ser incondicional. */}
        <div
          ref={listWrapRef}
          className="overflow-hidden"
          style={
            mobileHeight !== null
              ? {
                  height: `${mobileHeight}px`,
                  transition: reducedMotion ? undefined : "height 250ms cubic-bezier(0.16,1,0.3,1)",
                }
              : undefined
          }
        >
          <div ref={contentRef}>
            <StaggerGroup
              key={active}
              as="ul"
              stagger={0.06}
              className="mt-12 flex flex-col gap-1 md:mt-16"
            >
              {category.items.map((item, i) => (
                <StaggerItem as="li" key={`${category.id}-${item.name}`}>
                  <MenuRow index={i} name={item.name} price={item.price} allergens={item.allergens} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>

        {/* Fase 22b [SO DESKTOP]: md:pb-24 na seção (acima) abre 96px entre a
            base deste bloco e o início do bloco marrom da Build Yours — era
            ~0px (pb-0 herdado, sem override no desktop), a cor trocava
            colada em cima de "Prices include VAT". */}
        <div className="mt-12 flex flex-col gap-3 border-t border-[#E7E2DB] pt-6 text-[0.8125rem] text-[#78716C]">
          <AllergenDisclosure />
          <p>Prices include VAT</p>
        </div>
      </div>
    </section>
  );
}

function AllergenDisclosure() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Fase 31d [NOS DOIS]: #78716C dava 4,45:1, abaixo do piso -- #6B6560
          fecha >=4,5:1. */}
      <Tappable
        as="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-[44px] items-center text-[0.8125rem] text-[#6B6560] underline decoration-[#A8A29E] underline-offset-2"
      >
        Allergen info (14) →
      </Tappable>
      {open && (
        <p className="mt-2">
          {allergenLegend} — {allergenDeclaration}
        </p>
      )}
    </div>
  );
}

function MenuRow({
  index,
  name,
  price,
  allergens,
}: {
  index: number;
  name: string;
  price: string;
  allergens?: readonly string[];
}) {
  const reducedMotion = usePrefersReducedMotion();

  // O gatilho de viewport fica no CONTÊINER da linha inteira (altura real,
  // ~56px), não no traço de 1px — observar um elemento quase sem altura
  // pra "80% visível" é instável (a razão de interseção oscila por causa
  // de arredondamento de subpixel) e fazia o desenho falhar em algumas
  // linhas. O traço em si só recebe a variante do pai.
  return (
    <Tappable
      as="div"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      className="group flex items-baseline border-b border-[#E7E2DB] py-4 md:h-[88px] md:py-0 transition-colors duration-[180ms] md:hover:bg-[#F1E9DC]"
    >
      <span className="shrink-0 text-[0.75rem] tabular-nums text-[#A8A29E] transition-colors duration-[180ms] md:text-[13px] md:text-[#1C1917]/45 md:group-hover:text-[#8B4A2F]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="ml-4 text-[1.0625rem] text-[#1C1917] md:text-[26px]">
        {name}
        {allergens && (
          <sup className="ml-1 text-[0.65rem] text-[#78716C]">{allergens.join(" ")}</sup>
        )}
      </span>
      <span className="relative mx-2 min-w-[8px] flex-1 self-end overflow-hidden md:self-auto">
        <motion.span
          variants={{
            hidden: { scaleX: reducedMotion ? 1 : 0 },
            show: { scaleX: 1, transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } },
          }}
          className="block h-px w-full origin-left border-b border-dotted"
          style={{ borderColor: "rgba(28,22,20,.25)" }}
          aria-hidden
        />
      </span>
      <span className="shrink-0 text-[1.0625rem] tabular-nums text-[#1C1917] md:text-[26px]">
        €{price}
      </span>
    </Tappable>
  );
}
