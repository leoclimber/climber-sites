import Image from "next/image";
import { HeroStats } from "./hero-stats";
import { HeroParallax } from "./hero-parallax";
import { business } from "./data";
import veu from "./veu.json";

// Capa full-bleed — Server Component (Fase 4): zero JS no caminho crítico,
// texto e foto aparecem sem esperar hidratação nenhuma. Reveal do headline é
// CSS puro (ver .cl-hero-line-mask em styles.css); só o contador de stats e
// o parallax (Fase 11e, componente à parte, sem output visual próprio)
// saem pra client components isolados, carregados depois.
// Véu adaptativo calculado em build time por scripts/veu.mjs (preset +
// necessidade de dessaturar já resolvida — ver components/cafe-lisboa/veu.json,
// zero cálculo de imagem no cliente).
//
// Legibilidade sobre foto (Fase 11 da leva de fechamento do desktop): o
// alvo deixou de ser "essa foto específica" e passou a ser "qualquer foto
// de cliente". Por isso o scrim de contraste do bloco de texto NÃO é mais
// medido pela luminância real da foto atual (isso só prova pra UMA foto) —
// é um radial-gradient de fórmula fixa (elipse ancorada no canto onde o
// texto mora) + text-shadow em cada texto, provado contra 3 cenários
// (foto real, branco liso, cinza) em scripts/veu.mjs. HERO_SCRIM_PEAK_OPACITY
// é o único parâmetro ajustável: sobe em passos de 0,04 até o teto de 0,90
// se algum cenário reprovar a trava de contraste (ver tabela impressa por
// `node scripts/veu.mjs`).
const HERO_SCRIM_RGB = [24, 18, 14] as const;
const HERO_SCRIM_PEAK_OPACITY = veu.heroScrimPeakOpacity;
const HERO_TEXT_SHADOW = "0 2px 12px rgba(0,0,0,0.65)";
const [sr, sg, sb] = HERO_SCRIM_RGB;

// Regra de fábrica: nome com mais de 16 caracteres cai um degrau de
// tamanho, pra nunca quebrar em mais de 2 linhas.
const NAME_LONG_THRESHOLD = 16;
const nameFontSize =
  business.name.length > NAME_LONG_THRESHOLD
    ? "clamp(2.2rem, 5vw, 3.9rem)"
    : "clamp(2.8rem, 6.4vw, 5rem)";

export function Hero() {
  return (
    <section
      id="cl-hero"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#1C1614] md:h-screen md:min-h-[680px]"
    >
      <div id="cl-hero-photo" className="absolute inset-0">
        <Image
          src="/images/gallery/atmosphere-02.jpg"
          alt="Sunlit counter at Café Lisboa, espresso machine steaming, coffee bags on the shelf"
          fill
          sizes="100vw"
          preload
          fetchPriority="high"
          placeholder="blur"
          blurDataURL={veu.heroBlurDataURL}
          className="object-cover"
        />
      </div>

      {veu.hero.needsDesaturate && (
        // Fase 11b: essa faixa é full-width por natureza (dessatura o chão
        // da foto inteiro), mas SEM máscara ela virava exatamente a aresta
        // reta que o comando pede pra sumir — um corte visível de
        // saturação na largura toda. A máscara suaviza os 200px do topo
        // (0 -> 1) pra a transição ser gradual, sem linha.
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{
            backdropFilter: "saturate(.45)",
            WebkitBackdropFilter: "saturate(.45)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, black 380px)",
            maskImage: "linear-gradient(to bottom, transparent 0, black 380px)",
          }}
        />
      )}

      <HeroParallax />

      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-[8vh] md:px-[6.5vw]">
        <div className="relative inline-block">
          {/* Scrim de contraste local (Fase 11b) — elipse ancorada no canto
              onde o texto mora (22% da largura, 72% da altura do bloco+folga),
              não uma faixa de largura total: por construção não tem aresta
              reta, e por ser uma fórmula fixa (não a luminância medida desta
              foto) funciona contra qualquer foto de cliente — ver prova dos
              3 cenários em scripts/veu.mjs. Cobre o bloco + 120px de folga
              de cada lado (-inset-[120px] sobre o wrapper `relative`). */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[120px] z-0"
            style={{
              background: `radial-gradient(ellipse 130% 110% at 22% 72%, rgba(${sr},${sg},${sb},${HERO_SCRIM_PEAK_OPACITY}) 0%, rgba(${sr},${sg},${sb},${(HERO_SCRIM_PEAK_OPACITY * 0.55).toFixed(3)}) 45%, rgba(${sr},${sg},${sb},0) 78%)`,
            }}
          />

          <div className="relative z-10">
            <span
              className="block text-[0.62rem] tracking-[0.26em] text-[#F7F2EA]"
              style={{ textShadow: HERO_TEXT_SHADOW }}
            >
              // FRESHLY BREWED · DUBLIN 8
            </span>

            <h1
              className="mt-2 font-[family-name:var(--font-newsreader-hero)] leading-[0.98] tracking-[-0.02em] text-[#F7F2EA]"
              style={{ fontSize: nameFontSize, textShadow: HERO_TEXT_SHADOW }}
            >
              <span
                className="cl-hero-line-mask"
                style={{ ["--cl-hero-line-delay" as string]: "0s" }}
              >
                <span>{business.name}</span>
              </span>
            </h1>

            {/* Fase 11c: essa frase só pode ficar em --accent (#C89B6A) onde
                o tamanho computado é >= 24px — medido de verdade via
                Playwright: 30.4px no desktop (aprova), mas o clamp encolhe
                pra 20.8px no mobile (reprova a regra), por isso o mobile
                usa a mesma cor de texto sobre foto (#F7F2EA) e só o
                desktop (md:) mantém o accent. */}
            <p
              className="mt-1 whitespace-nowrap font-[family-name:var(--font-newsreader-hero)] text-[clamp(1.3rem,2.6vw,1.9rem)] italic text-[#F7F2EA] md:text-[#C89B6A]"
              style={{ textShadow: HERO_TEXT_SHADOW }}
            >
              <span
                className="cl-hero-line-mask"
                style={{ ["--cl-hero-line-delay" as string]: "0.09s" }}
              >
                <span>Your morning, done right.</span>
              </span>
            </p>

            <p
              className="mt-4 max-w-[46ch] text-[1rem] leading-[1.5] text-[#F7F2EA]/80 md:text-[1.05rem]"
              style={{ textShadow: HERO_TEXT_SHADOW }}
            >
              Open since seven. The first pour goes out at ten past.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="#cl-menu"
                className="inline-flex min-h-[48px] items-center bg-[#C89B6A] px-7 text-[0.95rem] font-medium tracking-[0.02em] text-[#1C1614] transition-opacity hover:opacity-90 active:scale-[0.97]"
              >
                View the menu
              </a>
              <a
                href="#cl-hours"
                className="group inline-flex min-h-[48px] items-center gap-1.5 text-[0.9rem] text-[#F7F2EA] active:opacity-70"
                style={{ textShadow: HERO_TEXT_SHADOW }}
              >
                Find us
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>

            <HeroStats />
          </div>
        </div>
      </div>
    </section>
  );
}
