import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/cafe-lisboa";
const OUT = "auditoria/final-2";

const SECTIONS = [
  ["#cl-hero", "01-hero"],
  ["#cl-manifesto", "02-manifesto"],
  ["#cl-build-yours", "04-build-yours"],
  ["#cl-gallery", "05-espaco"],
  ["#cl-hours", "06-horarios"],
  ["#cl-reviews", "07-avaliacoes"],
  ["#cl-footer", "08-rodape"],
];

const TABS = [
  { id: "coffee", label: "Coffee" },
  { id: "pastries", label: "Pastries" },
  { id: "toasted", label: "Toasted" },
  { id: "cold", label: "Cold" },
];

async function capture(viewport, tag) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  for (const [sel, name] of SECTIONS) {
    await page.locator(sel).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${OUT}/${name}-${tag}.png` });
  }

  // 03 · Menu — as 4 abas separadas
  await page.locator("#cl-menu").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  for (const tab of TABS) {
    if (tab.id !== "coffee") {
      await page.locator(`[data-tab-id="${tab.id}"]`).click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: `${OUT}/03-cardapio-${tab.id}-${tag}.png` });
  }

  await browser.close();
}

await capture({ width: 1920, height: 1080 }, "desktop");
await capture({ width: 390, height: 844 }, "mobile");

console.log("DONE");
