import dynamic from "next/dynamic";
import { ProgressBar } from "@/components/cafe-lisboa/motion";
import { Hero } from "@/components/cafe-lisboa/hero";

// Abaixo da dobra: dynamic import pra separar cada seção em chunk próprio,
// fora do bundle crítico do Hero. `ssr:false` não é permitido aqui (page.tsx
// é Server Component — Next lança erro em build, ver
// node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md), então fica
// em ssr:true (default): SSR completo continua, sem CLS/perda de conteúdo,
// só o JS de cada seção vira um chunk à parte em vez de ir tudo junto no
// bundle inicial da rota.
const Manifesto = dynamic(() =>
  import("@/components/cafe-lisboa/manifesto").then((m) => m.Manifesto)
);
const Menu = dynamic(() => import("@/components/cafe-lisboa/menu").then((m) => m.Menu));
const BuildYours = dynamic(() =>
  import("@/components/cafe-lisboa/build-yours").then((m) => m.BuildYours)
);
const GalleryGrid = dynamic(() =>
  import("@/components/cafe-lisboa/gallery-grid").then((m) => m.GalleryGrid)
);
const Hours = dynamic(() => import("@/components/cafe-lisboa/hours").then((m) => m.Hours));
const Reviews = dynamic(() => import("@/components/cafe-lisboa/reviews").then((m) => m.Reviews));
const Footer = dynamic(() => import("@/components/cafe-lisboa/footer").then((m) => m.Footer));

export default function CafeLisboaPage() {
  return (
    <main className="relative">
      <ProgressBar />
      <Hero />
      <Manifesto />
      <Menu />
      <BuildYours />
      <GalleryGrid />
      <Hours />
      <Reviews />
      <Footer />
    </main>
  );
}
