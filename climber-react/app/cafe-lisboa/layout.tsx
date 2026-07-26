import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./styles.css";

// Layout aninhado só desta rota — não toca em app/layout.tsx (compartilhado
// com o café cinematográfico). Herda o <html>/<body> raiz (header/footer
// vazios, Lenis que não faz nada sem #hero/#pour/#menu), define as fontes
// e a paleta próprias do Clean A por cima disso.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

// Instância separada, só peso 400 (normal + italic) — o que o headline e o
// wordmark do hero usam. Preloadada (link no <head>) pra não competir no
// preload inicial com os pesos 500/600 usados no resto do site, que a
// instância principal acima ainda carrega, só sem preload.
const newsreaderHero = Newsreader({
  variable: "--font-newsreader-hero",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Café Lisboa — Meath Street, Dublin 8",
  description:
    "Independent café on Meath Street, Dublin 8. Coffee roasted in small batches, open since 2019.",
};

export default function CafeLisboaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${newsreader.variable} ${newsreaderHero.variable} ${inter.variable} bg-[#FAF8F5] text-[#1C1917]`}
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      {children}
    </div>
  );
}
