import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/cafe-lisboa";

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function lum(r, g, b) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrast(l1, l2) {
  const a = Math.max(l1, l2), b = Math.min(l1, l2);
  return (a + 0.05) / (b + 0.05);
}
function composite(bg, fg, alpha) {
  return bg.map((c, i) => c * (1 - alpha) + fg[i] * alpha);
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const buildYours = page.locator("#cl-build-yours");
  await buildYours.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // gap: bottom of paragraph "Three taps..." vs top of "COFFEE" label
  const para = page.locator("#cl-build-yours p", { hasText: "Three taps" }).first();
  const paraBox = await para.boundingBox();
  const coffeeLabel = page.locator("#cl-build-yours span", { hasText: "COFFEE" }).first();
  const coffeeBox = await coffeeLabel.boundingBox();
  const gapTop = coffeeBox.y - (paraBox.y + paraBox.height);
  console.log("GAP top (paragraph->COFFEE):", gapTop.toFixed(1), "px");

  // grid check: coffee options count per row (3 cols x 2 rows)
  const coffeeButtons = page.locator("#cl-build-yours button[aria-pressed]");
  const count = await coffeeButtons.count();
  const boxes = [];
  for (let i = 0; i < 6; i++) {
    boxes.push(await coffeeButtons.nth(i).boundingBox());
  }
  console.log("Coffee button Y positions (first 6):", boxes.map((b) => b.y.toFixed(0)));
  console.log("Coffee button min-height (first):", boxes[0].height.toFixed(1), "px");
  const radius = await coffeeButtons.first().evaluate((el) => getComputedStyle(el).borderRadius);
  console.log("Coffee button border-radius:", radius);
  const gapX = boxes[1].x - (boxes[0].x + boxes[0].width);
  console.log("Gap X between col1/col2:", gapX.toFixed(1), "px");

  // find selected (aria-pressed=true) and an unselected button, sample colors
  const sectionBgHex = await page.locator("#cl-build-yours").evaluate((el) => getComputedStyle(el).backgroundColor);
  console.log("Section bg (computed):", sectionBgHex);

  async function sampleButton(loc) {
    const box = await loc.boundingBox();
    const style = await loc.evaluate((el) => {
      const cs = getComputedStyle(el);
      const canvas = document.createElement("canvas");
      canvas.width = 1; canvas.height = 1;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = cs.color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return { textColor: [r, g, b, a / 255], bg: cs.backgroundColor, border: cs.borderColor };
    });
    // sample actual rendered background pixel just outside the text (near edge of box, avoiding glyph)
    const px = await page.evaluate(({ x, y, w, h }) => {
      // hide all text via style injection, screenshot approach is heavy; instead sample via computed bg chain
      return null;
    }, { x: box.x, y: box.y, w: box.width, h: box.height });
    return { box, ...style };
  }

  // Hide-text technique like veu.mjs global audit, but scoped: screenshot with text hidden, sample pixel under each button
  await page.addStyleTag({
    content: `*, *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow:none !important; }`,
  });
  const hiddenBuffer = await page.screenshot({ fullPage: false });
  await page.evaluate(() => {
    const tags = document.querySelectorAll("style");
    tags[tags.length - 1].remove();
  });

  const { PNG } = await import("pngjs");
  const png = PNG.sync.read(hiddenBuffer);

  function samplePixel(x, y) {
    // média de uma área 16x16 (não 1 pixel) — o grão SVG do fundo (Fase 16:
    // GrainAndVignette) é ruído de alta frequência; amostra pontual herda
    // a variância do ruído, área evita o efeito.
    let r = 0, g = 0, b = 0, n = 0;
    for (let dy = -8; dy < 8; dy++) {
      for (let dx = -8; dx < 8; dx++) {
        const px = Math.round(x) + dx;
        const py = Math.round(y) + dy;
        if (px < 0 || py < 0 || px >= png.width || py >= png.height) continue;
        const idx = (png.width * py + px) << 2;
        r += png.data[idx];
        g += png.data[idx + 1];
        b += png.data[idx + 2];
        n++;
      }
    }
    return [r / n, g / n, b / n];
  }

  const selectedBtn = coffeeButtons.first(); // first coffee option is selected by default (flat white)
  const selBox = await selectedBtn.boundingBox();
  const selStyle = await selectedBtn.evaluate((el) => {
    const cs = getComputedStyle(el);
    const canvas = document.createElement("canvas");
    canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = cs.color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255 };
  });
  const selBg = samplePixel(selBox.x + selBox.width / 2, selBox.y + selBox.height / 2);
  const selComposited = composite(selBg, [selStyle.r, selStyle.g, selStyle.b], selStyle.a);
  const selTextLum = lum(...selComposited);
  const selBgLum = lum(...selBg);
  console.log("SELECTED text color:", selStyle, "bg pixel:", selBg, "contrast:", contrast(selTextLum, selBgLum).toFixed(2));

  const unselBtn = coffeeButtons.nth(1); // second coffee option, unselected
  const unselBox = await unselBtn.boundingBox();
  const unselStyle = await unselBtn.evaluate((el) => {
    const cs = getComputedStyle(el);
    const canvas = document.createElement("canvas");
    canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = cs.color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255 };
  });
  const unselBg = samplePixel(unselBox.x + unselBox.width / 2, unselBox.y + unselBox.height / 2);
  const unselComposited = composite(unselBg, [unselStyle.r, unselStyle.g, unselStyle.b], unselStyle.a);
  const unselTextLum = lum(...unselComposited);
  const unselBgLum = lum(...unselBg);
  console.log("UNSELECTED text color:", unselStyle, "bg pixel:", unselBg, "contrast:", contrast(unselTextLum, unselBgLum).toFixed(2));

  await page.screenshot({ path: "auditoria/fase16/build-yours-desktop.png" });

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
