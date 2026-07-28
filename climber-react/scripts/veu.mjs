// Véu adaptativo — sistema de fábrica, não decoração de um site só.
// Calcula em BUILD TIME (rodar manualmente: `node scripts/veu.mjs`, com o
// site rodando em VEU_URL — default http://localhost:3000/cafe-lisboa) o
// preset de escurecimento correto pra cada foto usada como fundo de texto, e
// grava tudo em components/cafe-lisboa/veu.json, que os componentes importam
// como dado estático — zero JS de análise de imagem no cliente.
//
// Trava de contraste do HERO (Fase 1 da leva final): o bug de fábrica da
// versão anterior era medir só a cor média de uma faixa aproximada da foto
// ("bottom 45%") e assumir a opacidade do texto em vez de ler a real. Essa
// versão usa Playwright pra pegar a posição REAL de cada texto do hero (via
// getBoundingClientRect) e a cor REAL renderizada (via getComputedStyle —
// que já inclui o alpha de qualquer /NN de opacidade do Tailwind, sem
// precisar adivinhar), mapeia essa posição pro recorte real da foto sob
// object-cover (mesma matemática do navegador: cover = max(scaleX,scaleY),
// crop simétrico no eixo que sobra) e mede a luminância da foto ORIGINAL
// (não da foto já com véu antigo por cima) sob aquele recorte — pela média
// E pelo quartil mais claro dos pixels, pra pegar o pior caso plausível
// (nuvem clara atrás da letra, não só a média da região toda).
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const GALLERY = path.resolve("public/images/gallery");
const HERO_IMAGE = path.join(GALLERY, "atmosphere-02.jpg");
const FACADE_IMAGE = path.join(GALLERY, "facade-vertical.jpg");
const BG_SOURCE_IMAGES = [
  "atmosphere-02.jpg",
  "atmosphere-03.jpg",
  "atmosphere-04.jpg",
  "product-01.jpg",
].map((f) => path.join(GALLERY, f));

const SITE_URL = process.env.VEU_URL || "http://localhost:3000/cafe-lisboa";

const MAP_VEIL_RGB = [18, 13, 11]; // rgba(18,13,11,A) — véu do mapa/fachada, sistema antigo, intocado
const HERO_SCRIM_RGB = [24, 18, 14]; // rgba(24,18,14,A) — scrim local do hero (comando da Fase 1)
const FG_HEX = "#F7F2EA";

const PRESETS = {
  ESCURA: { a1: 0.18, a2: 0.58, a3: 0.8 },
  MEDIA: { a1: 0.3, a2: 0.76, a3: 0.92 },
  CLARA: { a1: 0.44, a2: 0.88, a3: 0.97 },
};
const PRESET_ORDER = ["ESCURA", "MEDIA", "CLARA"];
const HEADLINE_POSITION = 0.75; // usado só pelo véu do mapa/fachada (analyzeVeil), sistema antigo intocado

// Scrim de contraste do hero (Fase 11 da leva de fechamento do desktop):
// deixou de ser medido pela luminância da foto ATUAL (isso só prova pra
// UMA foto) e virou uma elipse de fórmula fixa (radial-gradient ancorada
// em 22%/72% do bloco+folga, ver hero.tsx), com um único parâmetro
// ajustável — a opacidade central — provado contra 3 cenários de fundo
// (foto real, branco liso, cinza #C8C8C8) nos dois viewports. Sobe em
// degraus de 0,04 até o teto de 0,90 se algum cenário reprovar.
const SCRIM_FOLGA_PX = 120; // -inset-[120px] do container em hero.tsx
const SCRIM_CENTER_X_FRAC = 0.22;
const SCRIM_CENTER_Y_FRAC = 0.72;
const SCRIM_ELLIPSE_RX_FACTOR = 1.3;
const SCRIM_ELLIPSE_RY_FACTOR = 1.1;
const SCRIM_STOPS = [
  [0, 1],
  [0.45, 0.55],
  [0.78, 0],
]; // [distância radial normalizada, fração da opacidade de pico]
const SCRIM_OPACITY_START = 0.82;
const SCRIM_OPACITY_STEP = 0.04;
const SCRIM_OPACITY_MAX = 0.9;

function srgbToLinear(c) {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r, g, b) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p, q, t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)].map((v) =>
    Math.round(v * 255)
  );
}

function toHex([r, g, b]) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

async function loadBottom45Pixels(imagePath) {
  const meta = await sharp(imagePath).metadata();
  const top = Math.round(meta.height * 0.55);
  const height = meta.height - top;
  const { data, info } = await sharp(imagePath)
    .extract({ left: 0, top, width: meta.width, height })
    .resize({ width: 80, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = [];
  for (let i = 0; i < data.length; i += info.channels) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  return pixels;
}

function averagePixelLuminance(pixels) {
  let sum = 0;
  for (const [r, g, b] of pixels) sum += relativeLuminance(r, g, b);
  return sum / pixels.length;
}

function averageRgb(pixels) {
  let r = 0;
  let g = 0;
  let b = 0;
  for (const p of pixels) {
    r += p[0];
    g += p[1];
    b += p[2];
  }
  const n = pixels.length;
  return [r / n, g / n, b / n];
}

function averageSaturation(pixels) {
  let s = 0;
  for (const [r, g, b] of pixels) s += rgbToHsl(r, g, b).s;
  return s / pixels.length;
}

function pickPreset(luminance) {
  if (luminance < 0.3) return "ESCURA";
  if (luminance <= 0.6) return "MEDIA";
  return "CLARA";
}

function opacityAt(preset, positionFrac) {
  const { a1, a2, a3 } = PRESETS[preset];
  const stops = [
    [0, 0],
    [0.34, a1],
    [0.62, a2],
    [1, a3],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, v0] = stops[i];
    const [p1, v1] = stops[i + 1];
    if (positionFrac >= p0 && positionFrac <= p1) {
      const t = (positionFrac - p0) / (p1 - p0);
      return v0 + (v1 - v0) * t;
    }
  }
  return stops[stops.length - 1][1];
}

function compositeOver(photoRgb, overlayRgb, alpha) {
  return photoRgb.map((c, i) => c * (1 - alpha) + overlayRgb[i] * alpha);
}

async function analyzeVeil(imagePath, label) {
  const pixels = await loadBottom45Pixels(imagePath);
  const avgLuminance = averagePixelLuminance(pixels);
  const avgRgb = averageRgb(pixels);
  const avgSaturation = averageSaturation(pixels);
  const needsDesaturate = avgSaturation > 0.45;

  let presetIndex = PRESET_ORDER.indexOf(pickPreset(avgLuminance));
  const fgRgb = hexToRgb(FG_HEX);
  const fgLuminance = relativeLuminance(...fgRgb);
  let finalContrast = 0;

  for (let attempt = 0; attempt < PRESET_ORDER.length; attempt++) {
    const preset = PRESET_ORDER[presetIndex];
    const alpha = opacityAt(preset, HEADLINE_POSITION);
    const composited = compositeOver(avgRgb, MAP_VEIL_RGB, alpha);
    finalContrast = contrastRatio(fgLuminance, relativeLuminance(...composited));
    if (finalContrast >= 7 || presetIndex === PRESET_ORDER.length - 1) break;
    presetIndex++;
  }

  const preset = PRESET_ORDER[presetIndex];
  let forcedA3 = null;
  if (finalContrast < 7 && preset === "CLARA") {
    forcedA3 = 0.99;
    const composited = compositeOver(avgRgb, MAP_VEIL_RGB, forcedA3);
    finalContrast = contrastRatio(fgLuminance, relativeLuminance(...composited));
  }

  console.log(
    `[veu] ${label}: luminance=${avgLuminance.toFixed(3)} saturation=${avgSaturation.toFixed(3)} ` +
      `preset=${preset} needsDesaturate=${needsDesaturate} contrast=${finalContrast.toFixed(2)}:1` +
      (forcedA3 ? ` (forcedA3=${forcedA3})` : "")
  );

  return {
    preset,
    needsDesaturate,
    avgLuminance: Number(avgLuminance.toFixed(4)),
    avgSaturation: Number(avgSaturation.toFixed(4)),
    contrastRatio: Number(finalContrast.toFixed(2)),
    forcedA3,
  };
}

async function computeBlurDataURL(imagePath) {
  const buf = await sharp(imagePath).resize(16).jpeg({ quality: 40 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

async function computeBgColor(imagePaths) {
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;
  for (const imgPath of imagePaths) {
    const { data, info } = await sharp(imgPath)
      .resize({ width: 40, withoutEnlargement: true })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += info.channels) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }
  }
  const avg = [totalR / count, totalG / count, totalB / count];
  const hsl = rgbToHsl(...avg);

  const fgLuminance = relativeLuminance(...hexToRgb(FG_HEX));
  const targetContrast = 7.05;
  let lo = 0;
  let hi = hsl.l;
  let bestRgb = hslToRgb(hsl.h, hsl.s, 0);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const rgb = hslToRgb(hsl.h, hsl.s, mid);
    const lum = relativeLuminance(...rgb);
    const contrast = contrastRatio(fgLuminance, lum);
    if (contrast >= targetContrast) {
      bestRgb = rgb;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const finalLuminance = relativeLuminance(...bestRgb);
  const finalContrast = contrastRatio(fgLuminance, finalLuminance);
  console.log(
    `[veu] build-yours bg: hex=${toHex(bestRgb)} luminance=${finalLuminance.toFixed(3)} contrast=${finalContrast.toFixed(2)}:1`
  );
  return {
    hex: toHex(bestRgb),
    luminance: Number(finalLuminance.toFixed(4)),
    contrastRatio: Number(finalContrast.toFixed(2)),
  };
}

// ---------------------------------------------------------------------------
// Trava de contraste do HERO — medição real via Playwright (Fase 1)
// ---------------------------------------------------------------------------

function parseCssColor(cssColor) {
  const m = cssColor.match(/rgba?\(([^)]+)\)/);
  if (!m) return { r: 255, g: 255, b: 255, a: 1 };
  const parts = m[1].split(",").map((v) => parseFloat(v));
  return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
}

// Matemática do object-fit: cover — mesmo cálculo que o navegador faz.
function objectCoverMap(containerW, containerH, naturalW, naturalH) {
  const containerRatio = containerW / containerH;
  const naturalRatio = naturalW / naturalH;
  let scaledW;
  let scaledH;
  let offsetX = 0;
  let offsetY = 0;
  if (containerRatio >= naturalRatio) {
    // largura manda a escala, sobra de altura é cortada em cima/embaixo
    scaledW = containerW;
    scaledH = containerW / naturalRatio;
    offsetY = (scaledH - containerH) / 2;
  } else {
    // altura manda a escala, sobra de largura é cortada dos dois lados
    scaledH = containerH;
    scaledW = containerH * naturalRatio;
    offsetX = (scaledW - containerW) / 2;
  }
  return { scaledW, scaledH, offsetX, offsetY };
}

// Recorta da foto ORIGINAL (não da tela, que já teria o véu antigo por cima)
// a região que corresponde a um bounding box da viewport, dado o mapeamento
// de object-cover. Retorna pixels crus + estatísticas (média e quartil mais
// claro), aproximação documentada: usa o CENTRO do elemento pra decidir a
// posição na máscara/gradiente (não integra pixel a pixel a borda do texto).
async function samplePhotoRegion(imageSharpMeta, imageBuffer, box, coverMap, containerW, containerH) {
  const { scaledW, scaledH, offsetX, offsetY } = coverMap;
  const toSourceFrac = (xClient, yClient) => {
    const xScaled = xClient + offsetX;
    const yScaled = yClient + offsetY;
    return { fx: xScaled / scaledW, fy: yScaled / scaledH };
  };
  const topLeft = toSourceFrac(box.x, box.y);
  const bottomRight = toSourceFrac(box.x + box.width, box.y + box.height);

  const natW = imageSharpMeta.width;
  const natH = imageSharpMeta.height;
  const left = Math.max(0, Math.min(natW - 1, Math.round(topLeft.fx * natW)));
  const top = Math.max(0, Math.min(natH - 1, Math.round(topLeft.fy * natH)));
  const right = Math.max(left + 1, Math.min(natW, Math.round(bottomRight.fx * natW)));
  const bottom = Math.max(top + 1, Math.min(natH, Math.round(bottomRight.fy * natH)));

  const { data, info } = await sharp(imageBuffer)
    .extract({ left, top, width: right - left, height: bottom - top })
    .resize({ width: 40, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = [];
  for (let i = 0; i < data.length; i += info.channels) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  const avgRgb = averageRgb(pixels);
  const withLum = pixels.map((p) => ({ p, l: relativeLuminance(...p) }));
  withLum.sort((a, b) => b.l - a.l);
  const quartileCount = Math.max(1, Math.ceil(pixels.length * 0.25));
  const lightPixels = withLum.slice(0, quartileCount).map((x) => x.p);
  const lightRgb = averageRgb(lightPixels);

  return { avgRgb, lightRgb };
}

// Mesma matemática do radial-gradient CSS em hero.tsx: elipse com raios em
// % do container (bloco de texto + 120px de folga de cada lado), centro em
// (22%, 72%) desse container, 3 stops interpolados linearmente entre si
// pela distância radial normalizada (0 no centro, 1 na borda da elipse).
// Avaliada no CENTRO do elemento (mesma aproximação documentada de sempre
// neste arquivo — não integra pixel a pixel o glyph).
function radialScrimAlphaAt(centerX, centerY, blockBox, peakOpacity) {
  const containerLeft = blockBox.left - SCRIM_FOLGA_PX;
  const containerTop = blockBox.top - SCRIM_FOLGA_PX;
  const containerWidth = blockBox.right - blockBox.left + 2 * SCRIM_FOLGA_PX;
  const containerHeight = blockBox.bottom - blockBox.top + 2 * SCRIM_FOLGA_PX;

  const cx = containerLeft + SCRIM_CENTER_X_FRAC * containerWidth;
  const cy = containerTop + SCRIM_CENTER_Y_FRAC * containerHeight;
  const rx = SCRIM_ELLIPSE_RX_FACTOR * containerWidth;
  const ry = SCRIM_ELLIPSE_RY_FACTOR * containerHeight;

  const d = Math.sqrt(((centerX - cx) / rx) ** 2 + ((centerY - cy) / ry) ** 2);

  const stops = SCRIM_STOPS;
  if (d <= stops[0][0]) return peakOpacity * stops[0][1];
  if (d >= stops[stops.length - 1][0]) return peakOpacity * stops[stops.length - 1][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, v0] = stops[i];
    const [p1, v1] = stops[i + 1];
    if (d >= p0 && d <= p1) {
      const t = (d - p0) / (p1 - p0);
      return peakOpacity * (v0 + (v1 - v0) * t);
    }
  }
  return 0;
}

// Cenários de fundo pra prova de robustez (Fase 11d): a foto real e dois
// PNGs lisos, injetados via page.route (nunca gravados em public/, nem
// nunca de verdade servidos — pura substituição de bytes na resposta HTTP
// da imagem do hero, foto original restaurada assim que a rota é removida).
async function buildScenarios() {
  const white = await sharp({
    create: { width: 1920, height: 1080, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .jpeg()
    .toBuffer();
  const gray = await sharp({
    create: { width: 1920, height: 1080, channels: 3, background: { r: 200, g: 200, b: 200 } },
  })
    .jpeg()
    .toBuffer();

  return [
    { label: "foto atual (atmosphere-02.jpg)", flatRgb: null, buffer: null },
    { label: "PNG branco liso #FFFFFF", flatRgb: [255, 255, 255], buffer: white },
    { label: "PNG cinza #C8C8C8", flatRgb: [200, 200, 200], buffer: gray },
  ];
}

async function measureHeroViewport(page, viewport, deviceTag, scenario, heroSharpMeta, heroBuffer, peakOpacity) {
  await page.setViewportSize(viewport);

  if (scenario.buffer) {
    await page.route(/atmosphere-02/, (route) =>
      route.fulfill({ status: 200, contentType: "image/jpeg", body: scenario.buffer })
    );
  }

  await page.goto(SITE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("text=GOOGLE RATING", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1800); // contador dos stats termina (1.4s) + folga

  const img = page.locator("#cl-hero img").first();
  const imgBox = await img.boundingBox();
  const naturalSize = await img.evaluate((el) => ({
    w: el.naturalWidth,
    h: el.naturalHeight,
  }));

  // REPORTE SEM ALTERAR (Fase 11f) — filter computado da imagem e do
  // container dela, só no cenário da foto real (é o que roda em produção).
  const imgFilter = await img.evaluate((el) => getComputedStyle(el).filter);
  const containerFilter = await img.evaluate((el) => getComputedStyle(el.parentElement).filter);

  const coverMap = objectCoverMap(imgBox.width, imgBox.height, naturalSize.w, naturalSize.h);

  async function measureEl(locator) {
    const box = await locator.boundingBox();
    if (!box) return null;
    const style = await locator.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { color: cs.color, fontSize: cs.fontSize, fontWeight: cs.fontWeight };
    });
    let avgRgb;
    let lightRgb;
    if (scenario.flatRgb) {
      avgRgb = scenario.flatRgb;
      lightRgb = scenario.flatRgb;
    } else {
      const relBox = { x: box.x - imgBox.x, y: box.y - imgBox.y, width: box.width, height: box.height };
      const photo = await samplePhotoRegion(
        heroSharpMeta,
        heroBuffer,
        relBox,
        coverMap,
        imgBox.width,
        imgBox.height
      );
      avgRgb = photo.avgRgb;
      lightRgb = photo.lightRgb;
    }
    return {
      box,
      color: parseCssColor(style.color),
      fontSizePx: parseFloat(style.fontSize),
      fontWeight: parseInt(style.fontWeight, 10) || 400,
      avgRgb,
      lightRgb,
    };
  }

  const eyebrowLoc = page.locator("#cl-hero span", { hasText: "FRESHLY BREWED" }).first();
  const nameLoc = page.locator("#cl-hero h1").first();
  const taglineLoc = page.locator("#cl-hero p.italic").first();
  const subheadlineLoc = page.locator("#cl-hero p:not(.italic)").first();
  const statSpans = page.locator("#cl-hero .border-t span");
  const statCount = await statSpans.count();
  const menuBtnLoc = page.locator('#cl-hero a[href="#cl-menu"]').first();
  const findUsLoc = page.locator('#cl-hero a[href="#cl-hours"]').first();
  const blockLoc = page.locator("#cl-hero .relative.inline-block").first();

  const eyebrow = await measureEl(eyebrowLoc);
  const name = await measureEl(nameLoc);
  const tagline = await measureEl(taglineLoc);
  const subheadline = await measureEl(subheadlineLoc);
  const menuBtn = await measureEl(menuBtnLoc);
  const findUs = await measureEl(findUsLoc);
  const blockBoxRaw = await blockLoc.boundingBox();

  const statLabels = [];
  const statNumbers = [];
  for (let i = 0; i < statCount; i++) {
    const el = await measureEl(statSpans.nth(i));
    if (!el) continue;
    if (i % 2 === 0) statNumbers.push(el);
    else statLabels.push(el);
  }

  if (scenario.buffer) {
    await page.unroute(/atmosphere-02/);
  }

  // Botão "View the menu" tem fundo OPACO próprio (#C89B6A) — contraste
  // independe do véu/scrim da foto, calculado direto contra a cor do botão.
  const buttonBgRgb = hexToRgb("#C89B6A");
  const buttonBgLum = relativeLuminance(...buttonBgRgb);

  // Bloco de referência do scrim = a própria caixa do wrapper
  // `.relative.inline-block` (o container real que o -inset-[120px] do
  // CSS usa), medida direto — não mais uma aproximação por união de caixas.
  const blockBox = {
    left: blockBoxRaw.x,
    top: blockBoxRaw.y,
    right: blockBoxRaw.x + blockBoxRaw.width,
    bottom: blockBoxRaw.y + blockBoxRaw.height,
  };

  // Fase 11c/11d: piso 3:1 pra texto >= 24px, sem qualificar peso — regra
  // explícita desta fase (a Fase 12, depois, reintroduz weight >= 700 como
  // critério próprio da sua própria trava global; aqui segue o texto do
  // comando ao pé da letra).
  function floorFor(el) {
    return el.fontSizePx >= 24 ? 3.0 : 4.5;
  }

  function evalElement(label, el, dependsOnScrim, peakOpacityVal) {
    if (!dependsOnScrim) {
      // texto sobre fundo opaco do próprio botão: compara direto, sem véu/foto.
      const fgLum = relativeLuminance(el.color.r, el.color.g, el.color.b);
      const ratio = contrastRatio(fgLum, buttonBgLum);
      const floor = floorFor(el);
      return {
        label,
        colorRgb: `rgb(${Math.round(el.color.r)},${Math.round(el.color.g)},${Math.round(el.color.b)})`,
        opacity: Number((el.color.a ?? 1).toFixed(2)),
        avgLuminance: null,
        lightQuartileLuminance: null,
        ratioAvg: Number(ratio.toFixed(2)),
        ratioLight: Number(ratio.toFixed(2)),
        ratio: Number(ratio.toFixed(2)),
        floor,
        independent: true,
        pass: ratio >= floor,
      };
    }

    const centerX = el.box.x + el.box.width / 2;
    const centerY = el.box.y + el.box.height / 2;
    const alpha = radialScrimAlphaAt(centerX, centerY, blockBox, peakOpacityVal);
    const bgAvg = compositeOver(el.avgRgb, HERO_SCRIM_RGB, alpha);
    const bgLight = compositeOver(el.lightRgb, HERO_SCRIM_RGB, alpha);

    const textAlpha = el.color.a ?? 1;
    const fgOverAvg = compositeOver(bgAvg, [el.color.r, el.color.g, el.color.b], textAlpha);
    const fgOverLight = compositeOver(bgLight, [el.color.r, el.color.g, el.color.b], textAlpha);

    const ratioAvg = contrastRatio(relativeLuminance(...fgOverAvg), relativeLuminance(...bgAvg));
    const ratioLight = contrastRatio(relativeLuminance(...fgOverLight), relativeLuminance(...bgLight));
    const ratio = Math.min(ratioAvg, ratioLight);
    const floor = floorFor(el);

    return {
      label,
      colorRgb: `rgb(${Math.round(el.color.r)},${Math.round(el.color.g)},${Math.round(el.color.b)})`,
      opacity: Number(textAlpha.toFixed(2)),
      avgLuminance: Number(relativeLuminance(...bgAvg).toFixed(3)),
      lightQuartileLuminance: Number(relativeLuminance(...bgLight).toFixed(3)),
      ratioAvg: Number(ratioAvg.toFixed(2)),
      ratioLight: Number(ratioLight.toFixed(2)),
      ratio: Number(ratio.toFixed(2)),
      floor,
      independent: false,
      pass: ratio >= floor,
      scrimAlphaAtElement: Number(alpha.toFixed(3)),
    };
  }

  function buildTable(peakOpacityVal) {
    const rows = [];
    rows.push(evalElement("eyebrow (// FRESHLY BREWED · DUBLIN 8)", eyebrow, true, peakOpacityVal));
    rows.push(evalElement("nome (Café Lisboa)", name, true, peakOpacityVal));
    rows.push(evalElement("frase itálica (Your morning, done right.)", tagline, true, peakOpacityVal));
    rows.push(evalElement("subheadline (Open since seven...)", subheadline, true, peakOpacityVal));
    statLabels.forEach((el, i) =>
      rows.push(evalElement(`rótulo stat #${i + 1} (GOOGLE RATING/REVIEWS/OPEN FROM)`, el, true, peakOpacityVal))
    );
    statNumbers.forEach((el, i) =>
      rows.push(evalElement(`número stat #${i + 1} (4.8/503/7AM)`, el, true, peakOpacityVal))
    );
    rows.push(evalElement('botão "View the menu" (fundo próprio, independe do véu)', menuBtn, false, peakOpacityVal));
    rows.push(evalElement('link "Find us →"', findUs, true, peakOpacityVal));
    return rows;
  }

  const table = buildTable(peakOpacity);

  return {
    deviceTag,
    scenarioLabel: scenario.label,
    peakOpacity,
    table,
    imgFilter,
    containerFilter,
    allPass: table.every((r) => r.pass),
  };
}

function printTable(result) {
  console.log(
    `\n[veu] ===== HERO — ${result.deviceTag} — cenário: ${result.scenarioLabel} (peakOpacity=${result.peakOpacity}) =====`
  );
  console.log(
    "cor | opacidade | luminância média | luminância quartil claro | ratio | piso | resultado"
  );
  for (const r of result.table) {
    const status = r.pass ? "APROVA" : "REPROVA";
    const bgInfo = r.independent
      ? "n/d (fundo é o botão)"
      : `${r.avgLuminance} / ${r.lightQuartileLuminance}`;
    console.log(
      `${r.label} — ${r.colorRgb} | ${r.opacity} | ${bgInfo} | ${r.ratio}:1 | ${r.floor}:1 | ${status}`
    );
  }
  if (result.imgFilter !== undefined) {
    console.log(`[veu] filter da <img> do hero: ${result.imgFilter}`);
    console.log(`[veu] filter do container da <img> do hero: ${result.containerFilter}`);
  }
}

async function main() {
  const hero = await analyzeVeil(HERO_IMAGE, "hero (atmosphere-02.jpg)");
  const map = await analyzeVeil(FACADE_IMAGE, "map (facade-vertical.jpg)");
  const heroBlurDataURL = await computeBlurDataURL(HERO_IMAGE);
  const buildYoursBg = await computeBgColor(BG_SOURCE_IMAGES);

  const heroSharpMeta = await sharp(HERO_IMAGE).metadata();
  const heroBuffer = await fs.readFile(HERO_IMAGE);
  const scenarios = await buildScenarios();

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const viewports = [
    { viewport: { width: 1920, height: 1080 }, deviceTag: "desktop" },
    { viewport: { width: 390, height: 844 }, deviceTag: "mobile" },
  ];

  // Prova contra foto qualquer (Fase 11d): mede as 3 x 2 combinações no
  // opacity de partida; se alguma reprovar, sobe o degrau e remede TODAS
  // de novo — um único peakOpacity final tem que servir pros 6 casos.
  let peakOpacity = SCRIM_OPACITY_START;
  let allResults = [];
  for (;;) {
    allResults = [];
    for (const { viewport, deviceTag } of viewports) {
      for (const scenario of scenarios) {
        const result = await measureHeroViewport(
          page,
          viewport,
          deviceTag,
          scenario,
          heroSharpMeta,
          heroBuffer,
          peakOpacity
        );
        allResults.push(result);
      }
    }
    const anyFail = allResults.some((r) => !r.allPass);
    if (!anyFail || peakOpacity >= SCRIM_OPACITY_MAX - 1e-9) break;
    peakOpacity = Math.min(SCRIM_OPACITY_MAX, Number((peakOpacity + SCRIM_OPACITY_STEP).toFixed(2)));
  }

  await browser.close();

  for (const r of allResults) printTable(r);

  console.log(`\n[veu] scrim peakOpacity final (prova dos 3 cenários x 2 viewports): ${peakOpacity}`);

  const failing = allResults.flatMap((r) =>
    r.table.filter((row) => !row.pass).map((row) => ({ ...row, scenario: r.scenarioLabel, device: r.deviceTag }))
  );
  if (failing.length > 0) {
    console.log(
      `[veu] FALHOU — ${failing.length} linha(s) não bateram o piso de contraste mesmo no teto de opacidade (${SCRIM_OPACITY_MAX}):`
    );
    for (const f of failing) console.log(`  - [${f.device}/${f.scenario}] ${f.label}: ${f.ratio}:1 (piso ${f.floor}:1)`);
  } else {
    console.log("[veu] todas as linhas do hero aprovadas nos 3 cenários x 2 viewports.");
  }

  const realPhotoResults = allResults.filter((r) => r.scenarioLabel.startsWith("foto atual"));

  const output = {
    generatedAt: new Date().toISOString(),
    fg: FG_HEX,
    veilRgb: MAP_VEIL_RGB,
    presets: PRESETS,
    hero,
    map,
    heroBlurDataURL,
    buildYoursBg,
    heroScrimPeakOpacity: peakOpacity,
    heroScrimProof: {
      rgb: HERO_SCRIM_RGB,
      folgaPx: SCRIM_FOLGA_PX,
      centerXFrac: SCRIM_CENTER_X_FRAC,
      centerYFrac: SCRIM_CENTER_Y_FRAC,
      ellipseRxFactor: SCRIM_ELLIPSE_RX_FACTOR,
      ellipseRyFactor: SCRIM_ELLIPSE_RY_FACTOR,
      stops: SCRIM_STOPS,
      peakOpacity,
      allPass: failing.length === 0,
      scenarios: allResults.map((r) => ({
        deviceTag: r.deviceTag,
        scenarioLabel: r.scenarioLabel,
        allPass: r.allPass,
        table: r.table,
      })),
    },
    heroImgFilter: realPhotoResults.find((r) => r.deviceTag === "desktop")?.imgFilter ?? null,
    heroImgContainerFilter: realPhotoResults.find((r) => r.deviceTag === "desktop")?.containerFilter ?? null,
  };

  const outPath = path.resolve("components/cafe-lisboa/veu.json");
  await fs.writeFile(outPath, JSON.stringify(output, null, 2) + "\n");
  console.log(`[veu] escrito em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
