import { ProgressBar } from "@/components/cafe-lisboa/motion";
import { Hero } from "@/components/cafe-lisboa/hero";
import { Manifesto } from "@/components/cafe-lisboa/manifesto";
import { Menu } from "@/components/cafe-lisboa/menu";
import { Routine } from "@/components/cafe-lisboa/routine";
import { GalleryGrid } from "@/components/cafe-lisboa/gallery-grid";
import { Hours } from "@/components/cafe-lisboa/hours";
import { Reviews } from "@/components/cafe-lisboa/reviews";
import { Footer } from "@/components/cafe-lisboa/footer";

export default function CafeLisboaPage() {
  return (
    <main className="relative">
      <ProgressBar />
      <Hero />
      <Manifesto />
      <Menu />
      <Routine />
      <GalleryGrid />
      <Hours />
      <Reviews />
      <Footer />
    </main>
  );
}
