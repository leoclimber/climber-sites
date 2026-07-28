import Image from "next/image";
import { LineReveal, MaskReveal, PhotoReveal, StaggerGroup, StaggerItem } from "./motion";
import { business } from "./data";

// Fase 21 (desktop): a foto deixa de derivar tamanho do texto (Fase 14) —
// medir o bloco de texto pra dimensionar a foto produzia 312×418 boiando
// no canto sempre que o texto real era curto (268px de desalinhamento
// contra o topo travado em 400px). Tamanho FIXO 560×747 (3:4), sem
// ResizeObserver, sem depender de nenhum texto. Topo continua 400px do
// início da seção (separação por título da Fase 2, intocada) e a altura
// mínima da seção vira constante: 400 (topo) + 747 (foto) + 140 (respiro
// que a Fase 8a usa pra fechar o ritmo de 160px até o Cardápio) = 1287px
// (md:min-h-[1287px] abaixo).
//
// Coluna de texto: 520px (era 820px, deixando o texto ocupar pouca altura
// perto da foto). "EST. 2019" vira o terminador da coluna — desce até a
// base, alinhada com a base da foto (md:h-[959px] = distância do topo do
// grid, logo abaixo da régua "02 · Manifesto" — pt-[140px] da seção + 48px
// da própria régua — até a base da foto a 1147px [=400+747] do topo da
// seção; md:mt-auto no selo empurra ele pro fim dessa caixa de altura
// fixa). Números literais nas classes abaixo (não variáveis) porque o
// scanner do Tailwind só gera CSS pra strings completas no código-fonte.

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
      className="relative overflow-hidden bg-[#FAF8F5] pt-[120px] md:pt-[140px] md:min-h-[1287px]"
    >
      <div className="px-6 md:px-16">
        <Rule label="02 · Manifesto" />
      </div>

      <div className="grid md:items-start">
        <div className="flex flex-col px-6 pb-9 md:w-[520px] md:px-0 md:ml-16 md:pb-0">
          <div className="flex flex-col md:h-[959px]">
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

            <div className="mt-10 md:mt-auto flex items-center gap-3 text-[0.75rem] tracking-[0.15em] text-[#78716C]">
              <span className="h-[2px] w-10 bg-[#8B4A2F]" aria-hidden />
              EST. {business.establishedYear}
            </div>
          </div>
        </div>

        <div className="px-6 pb-16 md:absolute md:right-0 md:top-[400px] md:h-[747px] md:w-[560px] md:px-0 md:pb-0">
          {/* Fase 19 [SO DESKTOP]: PhotoReveal por fora (clip-path+scale,
              novo sistema) — MaskReveal segue por dentro só pro mobile
              (vira no-op no desktop, ver useIsDesktop). */}
          <PhotoReveal className="min-h-[280px] md:h-full md:min-h-0">
            <MaskReveal className="h-full w-full">
              <Image
                src="/images/gallery/atmosphere-03.jpg"
                alt="Leather armchair beside a marble table, an open book and a cup of coffee, morning light"
                fill
                sizes="(min-width: 768px) 560px, 100vw"
                loading="lazy"
                className="object-cover md:object-[center_bottom]"
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
