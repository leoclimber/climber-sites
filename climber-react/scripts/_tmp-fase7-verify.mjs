import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("auditoria/fase7");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://localhost:3000/cafe-lisboa", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

async function barState(label) {
  const box = await page.locator("main > div.fixed.inset-x-0.bottom-0").boundingBox();
  const viewportH = 844;
  const visible = box && box.y < viewportH;
  console.log(`${label}: bar y=${box ? box.y.toFixed(1) : "n/a"} visible=${visible}`);
}

// 1) hero visivel (topo da pagina)
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await barState("1) hero visivel");
await page.screenshot({ path: path.join(OUT, "1-hero-topo.png") });

// 2) meio da pagina
const docHeight = await page.evaluate(() => document.body.scrollHeight);
await page.evaluate((h) => window.scrollTo(0, h * 0.45), docHeight);
await page.waitForTimeout(600);
await barState("2) meio da pagina");
await page.screenshot({ path: path.join(OUT, "2-meio.png") });

// 3) rodape entrando
const footerY = await page.locator("#cl-footer").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
await page.evaluate((y) => window.scrollTo(0, y - 400), footerY);
await page.waitForTimeout(700);
await barState("3) rodape entrando");
await page.screenshot({ path: path.join(OUT, "3-rodape-entrando.png") });

// 4) fim da pagina
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(700);
await barState("4) fim da pagina");
await page.screenshot({ path: path.join(OUT, "4-fim.png") });

await browser.close();
console.log("DONE");
