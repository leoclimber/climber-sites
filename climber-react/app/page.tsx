import { Hero } from "@/components/sections/hero";
import { Pour } from "@/components/sections/pour";
import { Menu } from "@/components/sections/menu";
import { Gallery } from "@/components/sections/gallery";
import { Reviews } from "@/components/sections/reviews";
import { Visit } from "@/components/sections/visit";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* O "Sobre nós" não é mais uma seção separada — ele materializa como
          overlay dentro do próprio pin do Hero (ver AboutReveal em
          components/sections/about.tsx), não uma div rolando por baixo. */}
      <Hero />
      <Pour />
      <Menu />
      <Gallery />
      <Reviews />
      <Visit />
      <Footer />
    </main>
  );
}
