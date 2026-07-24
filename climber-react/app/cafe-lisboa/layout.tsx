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
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Café Lisboa — Meath Street, Dublin 8",
  description:
    "Independent café on Meath Street, Dublin 8. Coffee roasted in small batches, open since 2019.",
};

export default function CafeLisboaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${newsreader.variable} ${inter.variable} bg-[#FAF8F5] text-[#1C1917]`}
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      {children}
    </div>
  );
}
