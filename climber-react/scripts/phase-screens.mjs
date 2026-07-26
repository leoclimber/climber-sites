import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = "http://localhost:3001/cafe-lisboa";
const OUT = path.resolve(
  "C:/Users/LEONAR~1/AppData/Local/Temp/claude/C--Users-Leonardo-Munhoz-projetos-climber-sites-climber-react/d8fc8a78-1ebe-4d9e-95a8-b0404d639c9e/scratchpad/screens"
);
mkdirSync(OUT, { recursive: true });

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const tag = process.argv[2] || "phase";
const sections = (process.argv[3] || "").split(",").filter(Boolean);

async function run(viewport, deviceTag) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await wait(2000);

  if (sections.length === 0) {
    await page.screenshot({ path: path.join(OUT, `${tag}-${deviceTag}-top.png`) });
  } else {
    for (const sel of sections) {
      const loc = page.locator(sel);
      if (await loc.count()) {
        await loc.first().scrollIntoViewIfNeeded();
        await wait(600);
        await page.screenshot({
          path: path.join(OUT, `${tag}-${deviceTag}-${sel.replace(/[^a-z0-9]/gi, "")}.png`),
        });
      }
    }
  }
  await browser.close();
}

await run({ width: 1920, height: 1080 }, "desktop");
await run({ width: 390, height: 844 }, "mobile");

console.log("DONE", OUT);
