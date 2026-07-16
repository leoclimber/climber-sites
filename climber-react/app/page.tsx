import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Gallery } from "@/components/sections/gallery";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* O "Sobre nós" não é mais uma seção separada — ele materializa como
          overlay dentro do próprio pin do Hero (ver AboutReveal em
          components/sections/about.tsx), não uma div rolando por baixo. */}
      <Hero />
      <Services />
      <Gallery />
      <Testimonials />
      <Contact />
    </main>
  );
}
