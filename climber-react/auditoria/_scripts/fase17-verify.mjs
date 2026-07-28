import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/cafe-lisboa";

// Primeiro bloco de conteúdo real de cada uma das 8 seções (o elemento que
// carrega o texto/rótulo visível mais à esquerda, não o <section> em si,
// que só tem padding).
// Rule() (manifesto.tsx) é um <div> com 2 filhos (traço de 2px + texto);
// o traço já começa exatamente na borda de padding da seção — é o
// contêiner do Rule, não o span do texto (deslocado +14px pelo traço+gap),
// que representa "o primeiro bloco de conteúdo" da seção.
const TARGETS = [
  { name: "01-hero", selector: "#cl-hero span" }, // "// FRESHLY BREWED..."
  { name: "02-manifesto", selector: "#cl-manifesto div.mb-6" }, // Rule container
  { name: "03-cardapio", selector: "#cl-menu div.mb-6" },
  { name: "04-build-yours", selector: "#cl-build-yours span" }, // "04 · BUILD YOURS"
  { name: "05-espaco", selector: "#cl-gallery div.mb-6" },
  { name: "06-horarios", selector: "#cl-hours div.mb-6" },
  { name: "07-avaliacoes", selector: "#cl-reviews div.mb-6" },
  { name: "08-rodape", selector: "#cl-footer h2" },
];

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  console.log("secao | offsetLeft (px)");
  for (const t of TARGETS) {
    const loc = page.locator(t.selector).nth(t.nth ?? 0);
    await loc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await loc.boundingBox();
    console.log(`${t.name} | ${box ? box.x.toFixed(1) : "N/A"}`);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
