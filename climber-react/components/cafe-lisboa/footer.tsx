import { business, hours } from "./data";

// Destaque 4/4: marquee, direção OPOSTA à esteira das avaliações (a esteira
// roda direita->esquerda; aqui é esquerda->direita — mesma técnica de
// duplicar o conteúdo e transladar -50%, só que animation-direction:
// reverse). Newsreader grande, opacidade 0.32 sobre #FAF8F5 — não é dark
// mode, o rodapé escuro só começa depois da faixa.
export function Footer() {
  const brandText = `${business.name.toUpperCase()} · MEATH STREET · DUBLIN 8 · EST. ${business.establishedYear} · `;

  return (
    <footer id="cl-footer">
      <div className="cl-esteira bg-[#FAF8F5]">
        <div className="cl-esteira-track" data-dir="ltr" style={{ ["--cl-dur" as string]: "50s" }}>
          <MarqueeText text={brandText} />
          <MarqueeText text={brandText} dup />
        </div>
      </div>

      <div className="bg-[#1C1917] px-6 py-14 md:px-16 md:py-16">
        <h2 className="font-[family-name:var(--font-newsreader)] text-[clamp(2rem,3vw,2.75rem)] text-[#FAF8F5]">
          {business.name}
        </h2>

        {/* Desktop (Fase 5): duas colunas de 896px (grid-cols-2 sobre a
            faixa de conteúdo já com goteira de 64px = 896 cada, gap-0 —
            a divisória de 1px é a borda esquerda da 2ª coluna, não um gap
            visual). Mobile inalterado: mesma pilha de 1 coluna, mesmas
            classes base nos dois filhos originais do grid. */}
        <div className="mt-8 grid gap-10 md:mt-10 md:grid-cols-2 md:gap-0">
          <div className="flex flex-col gap-3 text-[1.1875rem] text-[#F5F0E8]">
            <a
              href={business.instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit border-b border-[#8B4A2F] pb-0.5 active:scale-[0.97] active:opacity-70"
            >
              {business.instagramHandle}
            </a>
            <a href={business.phoneHref} className="w-fit border-b border-[#8B4A2F] pb-0.5 active:scale-[0.97] active:opacity-70">
              {business.phoneDisplay}
            </a>
            <a
              href={business.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit border-b border-[#8B4A2F] pb-0.5 active:scale-[0.97] active:opacity-70"
            >
              {business.addressLine}
            </a>
          </div>

          {/* 2ª coluna: no mobile é só o parágrafo de sempre (o wrapper não
              carrega nenhuma classe base, então não existe pro mobile).
              No desktop, o bloco HOURS (novo, hidden md:block — zero pixel
              no mobile) entra acima do parágrafo, que ganha md:mt-6 pra não
              ficar colado nele. */}
          <div className="md:border-l md:border-l-[rgba(247,242,234,0.12)] md:pl-16">
            <div className="hidden md:block">
              <span className="text-[0.75rem] tracking-[0.18em] text-[#8A8378]">HOURS</span>
              <dl className="mt-6 flex flex-col gap-3 text-[1.0625rem] text-[#F5F0E8]">
                {hours.map((row) => (
                  <div key={row.day} className="flex justify-between gap-6">
                    <dt>{row.day}</dt>
                    <dd className="tabular-nums">{row.range}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="text-[0.8125rem] text-[#8A8378] md:mt-6 md:text-[0.9375rem]">
              Prices include VAT · Est. {business.establishedYear}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-[#332C23] pt-6 text-[0.75rem] text-[#6E6656] md:mt-14 md:text-[0.875rem]">
          © {business.name}
        </div>
      </div>
    </footer>
  );
}

function MarqueeText({ text, dup = false }: { text: string; dup?: boolean }) {
  return (
    <span
      className="shrink-0 whitespace-nowrap font-[family-name:var(--font-newsreader)] font-semibold tracking-[-0.02em] text-[#1C1917]"
      style={{ fontSize: "min(9vw, 108px)", opacity: 0.32 }}
      data-dup={dup}
    >
      {text}
    </span>
  );
}
