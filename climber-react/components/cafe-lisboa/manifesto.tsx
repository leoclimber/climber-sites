import Image from "next/image";
import { LineReveal, MaskReveal, PhotoReveal, StaggerGroup, StaggerItem } from "./motion";
import { business } from "./data";

// Fase 21 (desktop): a foto deixa de derivar tamanho do texto (Fase 14) —
// medir o bloco de texto pra dimensionar a foto produzia 312×418 boiando
// no canto sempre que o texto real era curto (268px de desalinhamento
// contra o topo travado em 400px). Tamanho FIXO, sem ResizeObserver, sem
// depender de nenhum texto. Topo continua 400px do início da seção
// (separação por título da Fase 2, intocada).
//
// Fase 27 (desktop, fechamento): três erros corrigidos de uma vez —
// (1) a foto sangrava (md:right-0 até a borda) e cortava conteúdo real,
// porque o quadro fixo 560×747 (3:4) forçava um crop numa foto que na
// verdade é 4992×3328 = 3:2 (proporção real lida do arquivo com sharp,
// `node -e "sharp(...).metadata()"` — ver auditoria/fase27). (2) sobrava
// ~837px de creme morto porque a coluna de texto (820px, depois 520px)
// ficava presa no topo da seção enquanto a foto começava só a 400px.
// (3) a base da coluna ficava vazia porque não havia conteúdo suficiente
// pra preencher até a base da foto.
//
// Correção: quadro da foto vira 1152×768 (3:2, EXATAMENTE a proporção
// natural — 1152/1.5=768 — então object-cover não corta nada) e para na
// goteira direita (md:left-[704px], nunca mais md:right-0/sangria):
// x=704 a x=1856 numa tela de 1920, 64px de goteira à direita. A coluna
// de texto PASSA a ser posicionada (md:absolute) começando no mesmo topo
// da foto (md:top-[400px]) e com a MESMA altura (md:h-[768px]) — antes
// ela começava logo abaixo da régua "02 · Manifesto" e ficava alta demais
// pro conteúdo real; agora começa mais abaixo (alinhada à foto) e ganha o
// novo bloco de detalhes (ManifestoDetails, abaixo) pra preencher esse
// vão. Vão horizontal texto->foto: 584 (fim da coluna, 64+520) até 704
// (início da foto) = 120px. Altura mínima da seção: 400 (topo) + 768
// (foto) + 140 (respiro que a Fase 8a usa pro ritmo de 160px até o
// Cardápio) = 1308px. Números literais nas classes (não variáveis) porque
// o scanner do Tailwind só gera CSS pra strings completas no código-fonte.
// Fase 32: ROAST/BEHIND THE COUNTER eram dados internos (só o dono saberia)
// e SINCE repetia o mesmo número três vezes na seção (headline "since
// 2019", este selo, e "EST. 2019" logo abaixo) — este template é gerado
// para muitas cafeterias, prospecção inclusive, então todo dado aqui tem
// que ser o tipo de coisa que já sai da própria ficha do Google Maps do
// negócio (área, horário de pico, "bom para" — não algo que exige
// perguntar ao dono).
const MANIFESTO_DETAILS = [
  { label: "AREA", value: "Dublin 8" },
  { label: "BUSIEST", value: "Weekdays, 8-10am" },
  { label: "GOOD FOR", value: "Laptop mornings" },
] as const;

// Fase 27c: os 3 dados já existem no texto do manifesto — não inventa nada
// novo, só resume o que os parágrafos já dizem numa lista rápida de
// escanear. Era [SO DESKTOP] (hidden md:block) até a Fase 29: o "hidden"
// saiu — passa a aparecer também no mobile (mesmas classes, sem prefixo
// md:), já que este bloco nunca dependeu do sistema de reveal (não usa
// StaggerGroup/MaskReveal, é um <div> comum) — só estava escondido por uma
// decisão de escopo da Fase 27c, não por causa do bug de reveal.
function ManifestoDetails() {
  return (
    <div className="mt-12 border-t border-[rgba(28,22,20,0.14)]">
      {MANIFESTO_DETAILS.map((d) => (
        <div
          key={d.label}
          className="flex h-14 items-center justify-between border-b border-[rgba(28,22,20,0.14)]"
        >
          <span className="text-[10px] tracking-[0.3em] text-[#8B4A2F]">{d.label}</span>
          <span className="text-right text-[15px] text-[#1C1614]">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// Assimétrico de propósito (regra #3 do documento mestre): texto à esquerda,
// foto como objeto solto à direita (Fase B da leva de correção — a foto
// deixou de sangrar até a borda pra não competir com o mosaico, que é
// edge-to-edge e é a seção mais forte do site).
//
// Fase 28 (desktop): rótulo "02 · Manifesto" e headline viram UM bloco de
// fluxo normal (nada de position:absolute pros dois) no topo da seção —
// antes o rótulo ficava sozinho ali (fluxo normal) enquanto a headline
// vivia dentro da coluna de texto, ancorada a 400px via position:absolute
// (Fase 21/27), criando ~240px de creme morto entre os dois porque só
// coincidiam por acaso com essa constante. Rótulo+headline moram no mesmo
// wrapper (px-6 md:px-16, largura total) que vira md:flex md:flex-col
// md:gap-2 no desktop: o Rule mantém seu próprio mb-6 (24px, componente
// compartilhado por todas as seções, não mexido) e gap-2 (8px) soma mais
// 24+8=32px — o valor exato pedido, sem depender de margin-collapsing
// (que um flex container desliga por padrão) nem duplicar o Rule.
//
// A foto e a coluna de texto DEIXAM de ser position:absolute com top fixo
// (Fase 21/27) — agora é uma segunda linha em fluxo normal (row: flex row
// no desktop), empurrada 96px abaixo da headline via margin-top no PRÓPRIO
// row (mt-24 no desktop == 96px), o que resolve os dois alvos ("topo da
// foto" e "topo do primeiro parágrafo") com UM único valor, sem medir nada:
// os dois são as duas colunas dessa mesma linha, começando no mesmo topo
// por construção (md:items-start). A foto não busca mais se alinhar com a
// headline por uma constante em comum (400px); a base real de alinhamento
// agora é a base da HEADLINE, não o topo da seção. Larguras/altura da
// coluna (520×768) e da foto (1152×768, 3:2 real do arquivo — Fase 27) e o
// vão de 120px entre elas continuam intocados, junto com o bloco de
// detalhes e "EST. 2019" (mt-auto dentro da coluna de altura 768, ver
// ManifestoDetails acima). Como tudo agora é fluxo normal (sem position:
// absolute), a altura mínima artificial da seção sai (md:min-h-[...]) —
// a seção passa a ter a altura real do próprio conteúdo, fechada por um
// md:pb-[140px] (o mesmo respiro que a Fase 8a usa pro ritmo de 160px até
// o Cardápio, antes garantido pelo min-height).
// Mobile segue 100% inalterado: mesma pilha de 1 coluna, mesmos números
// (Rule mb-6 + StaggerGroup renderizado logo em seguida = mesmos 24px de
// sempre entre rótulo e headline; row com mt-8 = os mesmos 32px de sempre
// entre headline e primeiro parágrafo) — nenhuma classe md: chega a
// aplicar abaixo de 769px.
//
// Nota sobre o padding-top do desktop: com os três espaçamentos exatos
// exigidos por esta fase (32px régua->headline, 96px headline->foto/
// parágrafo) e a altura REAL da headline renderizada (~100.8px, 2 linhas
// a 48px/1.05 de leading — igual desde a Fase 2, não mudou aqui), 140px
// de pt não fecha mais mais os >=400px exigidos entre a base da foto da
// capa e o topo da foto do manifesto (dava ~392.8px). Os três espaçamentos
// e a altura da headline são os valores medidos/verificados desta fase;
// o padding-top é o único grau de liberdade que não tem verificação
// própria, então sobe pra 150px (folga de ~7px sobre o mínimo de 147.2px)
// pra fechar o item 4 sem tocar em nenhum número que a fase pede pra
// medir exato.
export function Manifesto() {
  return (
    <section
      id="cl-manifesto"
      className="relative overflow-hidden bg-[#FAF8F5] pt-[120px] md:pt-[150px] md:pb-[140px]"
    >
      <div className="px-6 md:flex md:flex-col md:gap-2 md:px-16">
        <Rule label="02 · Manifesto" />
        <LineReveal
          as="h2"
          lines={["Meath Street, every", "morning since 2019."]}
          className="font-[family-name:var(--font-newsreader)] text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.02em] text-[#1C1917]"
        />
      </div>

      {/* md:shrink-0 nas duas colunas abaixo: sem ele, o flex encolhe as
          larguras fixas (520/1152) sempre que a viewport "real" (menos a
          largura da scrollbar vertical, que em Windows/Chrome tira uns
          15px do 1920 nominal) é menor que a soma goteira+colunas+vão —
          media 1141px em vez de 1152px. shrink-0 preserva os 520/1152/120
          exatos da Fase 27, intocados. */}
      <div className="mt-8 flex flex-col px-6 md:mt-24 md:flex-row md:items-start md:gap-[120px] md:px-16">
        <div className="flex flex-col pb-9 md:h-[768px] md:w-[520px] md:shrink-0 md:pb-0">
          <StaggerGroup className="flex w-[88%] max-w-[62ch] flex-col gap-5 text-[1.0625rem] leading-[1.65] text-[#78716C]">
            <StaggerItem>
              We opened the green corner door in 2019. The beans are roasted
              in small batches, once a week, so nothing sits past its peak.
            </StaggerItem>
            <StaggerItem>
              This isn&rsquo;t a place to rush through. There&rsquo;s a
              reading chair, a marble table, and regulars who stay all
              morning with a coffee gone cold.
            </StaggerItem>
            <StaggerItem>
              Ask for Sara behind the counter — she&rsquo;s been pulling
              shots here since day one.
            </StaggerItem>
          </StaggerGroup>

          <ManifestoDetails />

          <div className="mt-10 md:mt-auto flex items-center gap-3 text-[0.75rem] tracking-[0.15em] text-[#78716C]">
            <span className="h-[2px] w-10 bg-[#8B4A2F]" aria-hidden />
            EST. {business.establishedYear}
          </div>
        </div>

        <div className="pb-16 md:h-[768px] md:w-[1152px] md:shrink-0 md:pb-0">
          {/* Fase 19 [SO DESKTOP]: PhotoReveal por fora (clip-path+scale,
              novo sistema) — MaskReveal segue por dentro só pro mobile
              (vira no-op no desktop, ver useIsDesktop). Fase 27: quadro
              1152×768 é a proporção NATURAL do arquivo (3:2) — object-cover
              não recorta nada, só preenche o quadro exato. */}
          <PhotoReveal className="min-h-[280px] md:h-full md:min-h-0">
            <MaskReveal className="h-full w-full">
              <Image
                src="/images/gallery/atmosphere-03.jpg"
                alt="Leather armchair beside a marble table, an open book and a cup of coffee, morning light"
                fill
                sizes="(min-width: 768px) 1152px, 100vw"
                loading="lazy"
                className="object-cover"
              />
            </MaskReveal>
          </PhotoReveal>
        </div>
      </div>
    </section>
  );
}

// Régua tipográfica — o detalhe assinado do Clean A: linha vertical fina +
// número da seção, presente em toda seção.
export function Rule({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="h-6 w-[2px] bg-[#8B4A2F]" aria-hidden />
      <span className="text-[0.8125rem] tracking-[0.15em] text-[#78716C]">{label}</span>
    </div>
  );
}
