import { business, allergenDeclaration } from "./data";

// Destaque 4/4: marquee, direção OPOSTA à esteira das avaliações (a esteira
// roda direita->esquerda; aqui é esquerda->direita — mesma técnica de
// duplicar o conteúdo e transladar -50%, só que animation-direction:
// reverse). Newsreader grande, opacidade 0.12 sobre #FAF8F5 — não é dark
// mode, o rodapé escuro só começa depois da faixa.
export function Footer() {
  const brandText = `${business.name.toUpperCase()} · MEATH STREET · DUBLIN 8 · EST. ${business.establishedYear} · `;

  return (
    <footer id="cl-footer">
      <div className="cl-esteira bg-[#FAF8F5]" style={{ height: "min(11vw, 110px)" }}>
        <div className="cl-esteira-track" data-dir="ltr" style={{ ["--cl-dur" as string]: "50s" }}>
          <MarqueeText text={brandText} />
          <MarqueeText text={brandText} dup />
        </div>
      </div>

      <div className="bg-[#1C1917] px-6 py-14 md:px-16 md:py-16">
        <h2 className="font-[family-name:var(--font-newsreader)] text-[clamp(2rem,3vw,2.75rem)] text-[#FAF8F5]">
          {business.name}
        </h2>

        <div className="mt-8 grid gap-10 md:mt-10 md:grid-cols-[1.4fr_1fr_1.4fr] md:gap-12">
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

          <div className="hidden flex-col gap-2 text-[0.875rem] text-[#D8CFC2] md:flex">
            <span className="tracking-[0.1em] text-[#A8A29E]">DELIVERY</span>
            <span>Deliveroo</span>
            <span>Just Eat</span>
            <span>Uber Eats</span>
          </div>
          <p className="text-[0.875rem] text-[#D8CFC2] md:hidden">
            Deliveroo · Just Eat · Uber Eats
          </p>

          <div className="hidden flex-col gap-1 text-[0.8125rem] leading-[1.6] text-[#8A8378] md:flex">
            <p>{allergenDeclaration}</p>
            <p>Prices include VAT · Est. {business.establishedYear}</p>
          </div>
          <p className="text-[0.75rem] text-[#8A8378] md:hidden">
            Full allergen list (14) on request · Prices include VAT
          </p>
        </div>

        <div className="mt-12 border-t border-[#332C23] pt-6 text-[0.75rem] text-[#6E6656] md:mt-14">
          © {business.name} · touch targets ≥44px · prefers-reduced-motion respected
        </div>
      </div>
    </footer>
  );
}

function MarqueeText({ text, dup = false }: { text: string; dup?: boolean }) {
  return (
    <span
      className="shrink-0 whitespace-nowrap font-[family-name:var(--font-newsreader)] font-semibold tracking-[-0.02em] text-[#1C1917]"
      style={{ fontSize: "min(9vw, 108px)", opacity: 0.12 }}
      data-dup={dup}
    >
      {text}
    </span>
  );
}
