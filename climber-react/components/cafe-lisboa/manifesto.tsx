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
const MANIFESTO_DETAILS = [
  { label: "ROAST", value: "Small batches, weekly" },
  { label: "SINCE", value: String(business.establishedYear) },
  { label: "BEHIND THE COUNTER", value: "Sara" },
] as const;

// Fase 27c [SO DESKTOP]: os 3 dados já existem no texto do manifesto — não
// inventa nada novo, só resume o que os parágrafos já dizem numa lista
// rápida de escanear. hidden md:block: zero pixel/altura no mobile, que
// mantém exatamente o fluxo de sempre (parágrafos -> EST. 2019 direto).
function ManifestoDetails() {
  return (
    <div className="hidden md:mt-12 md:block md:border-t md:border-[rgba(28,22,20,0.14)]">
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
// Desktop (Fase 2, geometria; Fase 21, tamanho fixo): a régua "02 ·
// Manifesto" começa a ordem fixa (creme → rótulo → headline → só então a
// foto, 400px abaixo do topo da seção — essa separação por título não
// muda). A foto sai do grid (md:absolute, ancorada na seção `relative`),
// sangrando na borda direita; a coluna de texto é uma faixa fixa de 520px
// que começa na goteira de 64px. Nem a foto nem a altura da seção dependem
// de nenhuma medição de texto — tudo em constantes no topo do arquivo.
// Mobile segue 100% inalterado: mesma pilha de 1 coluna, mesmas classes
// base, nada disto (nenhuma classe md:) chega a aplicar abaixo de 769px.
export function Manifesto() {
  return (
    <section
      id="cl-manifesto"
      className="relative overflow-hidden bg-[#FAF8F5] pt-[120px] md:pt-[140px] md:min-h-[1308px]"
    >
      <div className="px-6 md:px-16">
        <Rule label="02 · Manifesto" />
      </div>

      <div className="grid md:items-start">
        <div className="flex flex-col px-6 pb-9 md:absolute md:left-16 md:top-[400px] md:h-[768px] md:w-[520px] md:px-0 md:pb-0">
          <div className="flex flex-col md:h-full">
            <div>
              <LineReveal
                as="h2"
                lines={["Meath Street, every", "morning since 2019."]}
                className="font-[family-name:var(--font-newsreader)] text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-[-0.02em] text-[#1C1917]"
              />

              <StaggerGroup className="mt-8 flex w-[88%] max-w-[62ch] flex-col gap-5 text-[1.0625rem] leading-[1.65] text-[#78716C]">
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
            </div>

            <ManifestoDetails />

            <div className="mt-10 md:mt-auto flex items-center gap-3 text-[0.75rem] tracking-[0.15em] text-[#78716C]">
              <span className="h-[2px] w-10 bg-[#8B4A2F]" aria-hidden />
              EST. {business.establishedYear}
            </div>
          </div>
        </div>

        <div className="px-6 pb-16 md:absolute md:left-[704px] md:top-[400px] md:h-[768px] md:w-[1152px] md:px-0 md:pb-0">
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
