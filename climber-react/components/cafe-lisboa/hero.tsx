import Image from "next/image";
import { HeroStats } from "./hero-stats";
import { business } from "./data";
import veu from "./veu.json";

// Capa full-bleed — Server Component (Fase 4): zero JS no caminho crítico,
// texto e foto aparecem sem esperar hidratação nenhuma. Reveal do headline é
// CSS puro (ver .cl-hero-line-mask em styles.css); só o contador de stats
// sai pra um client component isolado, carregado depois (ver hero-stats.tsx).
// Véu adaptativo calculado em build time por scripts/veu.mjs (preset +
// necessidade de dessaturar + trava de contraste já resolvida — ver
// components/cafe-lisboa/veu.json, zero cálculo de imagem no cliente).
const preset = veu.presets[veu.hero.preset as keyof typeof veu.presets];
const a3 = veu.hero.forcedA3 ?? preset.a3;
const [vr, vg, vb] = veu.veilRgb;

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

      {veu.hero.needsDesaturate && (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{
            backdropFilter: "saturate(.45)",
            WebkitBackdropFilter: "saturate(.45)",
          }}
        />
      )}

      {/* Véu adaptativo — preset escolhido em build time (ver veu.json) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, rgba(${vr},${vg},${vb},${preset.a1}) 34%, rgba(${vr},${vg},${vb},${preset.a2}) 62%, rgba(${vr},${vg},${vb},${a3}) 100%)`,
        }}
      />

      {/* Scrim fixo no topo — legibilidade do wordmark, independe do véu adaptativo */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[120px]"
        style={{
          background: "linear-gradient(to bottom, rgba(18,13,11,.7), transparent)",
        }}
      />

      <div
        className="absolute left-6 top-0 z-10 pt-[max(1.25rem,env(safe-area-inset-top))] md:left-[6.5vw]"
      >
        <span className="font-[family-name:var(--font-newsreader-hero)] text-[1.05rem] tracking-tight text-[#F7F2EA]">
          Café Lisboa
        </span>
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-start px-6 pt-[8vh] md:px-[6.5vw]">
        <span className="block text-[0.62rem] tracking-[0.26em] text-[#C89B6A]">
          // FRESHLY BREWED · DUBLIN 8
        </span>

        <h1
          className="mt-2 font-[family-name:var(--font-newsreader-hero)] leading-[0.98] tracking-[-0.02em] text-[#F7F2EA]"
          style={{ fontSize: nameFontSize }}
        >
          <span
            className="cl-hero-line-mask"
            style={{ ["--cl-hero-line-delay" as string]: "0s" }}
          >
            <span>{business.name}</span>
          </span>
        </h1>

        <p className="mt-1 whitespace-nowrap font-[family-name:var(--font-newsreader-hero)] text-[clamp(1.3rem,2.6vw,1.9rem)] italic text-[#C89B6A]">
          <span
            className="cl-hero-line-mask"
            style={{ ["--cl-hero-line-delay" as string]: "0.09s" }}
          >
            <span>Your morning, done right.</span>
          </span>
        </p>

        <p className="mt-4 max-w-[46ch] text-[1rem] leading-[1.5] text-[#F7F2EA]/80 md:text-[1.05rem]">
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
          >
            Find us
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        <HeroStats />
      </div>
    </section>
  );
}
