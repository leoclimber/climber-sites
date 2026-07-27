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
const HEADLINE_POSITION = 0.75;

// Auto-ajuste do scrim local do hero (Fase 1): degraus de 0,04 até o teto de 0,88.
const SCRIM_OPACITY_START = 0.72;
const SCRIM_OPACITY_STEP = 0.04;
const SCRIM_OPACITY_MAX = 0.88;
const SCRIM_MASK_FEATHER_PX = 80;
const SCRIM_SLACK_PX = 64;
const SCRIM_EXTRA_BOTTOM_PX = 40;

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

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// Máscara suave de 80px nas 4 bordas do scrim, avaliada no CENTRO do
// elemento (aproximação: não integra a máscara por cima de cada pixel do
// glyph, só usa o ponto central do bounding box — documentado, mesmo
// espírito de aproximação que o resto deste arquivo já assume).
function maskFactorAt(centerX, centerY, box) {
  const distLeft = centerX - box.left;
  const distRight = box.right - centerX;
  const distTop = centerY - box.top;
  const distBottom = box.bottom - centerY;
  const maskH = clamp01(Math.min(distLeft, SCRIM_MASK_FEATHER_PX) / SCRIM_MASK_FEATHER_PX) *
    clamp01(Math.min(distRight, SCRIM_MASK_FEATHER_PX) / SCRIM_MASK_FEATHER_PX);
  const maskV = clamp01(Math.min(distTop, SCRIM_MASK_FEATHER_PX) / SCRIM_MASK_FEATHER_PX) *
    clamp01(Math.min(distBottom, SCRIM_MASK_FEATHER_PX) / SCRIM_MASK_FEATHER_PX);
  return maskH * maskV;
}

async function measureHeroViewport(page, viewport, deviceTag, heroSharpMeta, heroBuffer) {
  await page.setViewportSize(viewport);
  await page.goto(SITE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("text=GOOGLE RATING", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1800); // contador dos stats termina (1.4s) + folga

  const img = page.locator("#cl-hero img").first();
  const imgBox = await img.boundingBox();
  const naturalSize = await img.evaluate((el) => ({
    w: el.naturalWidth,
    h: el.naturalHeight,
  }));

  // REPORTE SEM ALTERAR — filter computado da imagem e do container dela.
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
    const relBox = { x: box.x - imgBox.x, y: box.y - imgBox.y, width: box.width, height: box.height };
    const photo = await samplePhotoRegion(
      heroSharpMeta,
      heroBuffer,
      relBox,
      coverMap,
      imgBox.width,
      imgBox.height
    );
    return {
      box,
      color: parseCssColor(style.color),
      fontSizePx: parseFloat(style.fontSize),
      fontWeight: parseInt(style.fontWeight, 10) || 400,
      avgRgb: photo.avgRgb,
      lightRgb: photo.lightRgb,
    };
  }

  const eyebrowLoc = page.locator("#cl-hero span", { hasText: "FRESHLY BREWED" }).first();
  const nameLoc = page.locator("#cl-hero h1").first();
  const taglineLoc = page.locator("#cl-hero p.italic").first();
  const subheadlineLoc = page.locator("#cl-hero p:not(.italic)").first();
  const statsRowLoc = page.locator("#cl-hero .border-t").first();
  const statSpans = page.locator("#cl-hero .border-t span");
  const statCount = await statSpans.count();
  const menuBtnLoc = page.locator('#cl-hero a[href="#cl-menu"]').first();
  const findUsLoc = page.locator('#cl-hero a[href="#cl-hours"]').first();

  const eyebrow = await measureEl(eyebrowLoc);
  const name = await measureEl(nameLoc);
  const tagline = await measureEl(taglineLoc);
  const subheadline = await measureEl(subheadlineLoc);
  const menuBtn = await measureEl(menuBtnLoc);
  const findUs = await measureEl(findUsLoc);

  const statLabels = [];
  const statNumbers = [];
  for (let i = 0; i < statCount; i++) {
    const el = await measureEl(statSpans.nth(i));
    if (!el) continue;
    if (i % 2 === 0) statNumbers.push(el);
    else statLabels.push(el);
  }

  // Botão "View the menu" tem fundo OPACO próprio (#C89B6A) — contraste
  // independe do véu/scrim da foto, calculado direto contra a cor do botão.
  const buttonBgRgb = hexToRgb("#C89B6A");
  const buttonBgLum = relativeLuminance(...buttonBgRgb);

  // Caixa do "bloco" pro gradiente do scrim: topo do eyebrow até 40px abaixo
  // da linha dos rótulos dos stats. Largura = união de todos os elementos
  // (equivalente ao que um wrapper inline-block encolhido ao conteúdo mediria).
  const allBoxes = [eyebrow, name, tagline, subheadline, menuBtn, findUs, ...statLabels, ...statNumbers]
    .filter(Boolean)
    .map((e) => e.box);
  const blockLeft = Math.min(...allBoxes.map((b) => b.x));
  const blockRight = Math.max(...allBoxes.map((b) => b.x + b.width));
  const blockTop = eyebrow.box.y;
  const statsRowBox = await statsRowLoc.boundingBox();
  const statsBottom = statsRowBox
    ? statsRowBox.y + statsRowBox.height
    : Math.max(...allBoxes.map((b) => b.y + b.height));
  const blockBottom = statsBottom + SCRIM_EXTRA_BOTTOM_PX;

  const scrimBox = {
    left: blockLeft - SCRIM_SLACK_PX,
    right: blockRight + SCRIM_SLACK_PX,
    top: blockTop,
    bottom: blockBottom,
  };
  const gradientTop = blockTop;
  const gradientHeight = blockBottom - blockTop;

  function scrimAlphaFor(box, baseOpacity) {
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const yFraction = clamp01((centerY - gradientTop) / gradientHeight);
    const mask = maskFactorAt(centerX, centerY, scrimBox);
    return baseOpacity * yFraction * mask;
  }

  function floorFor(el) {
    return el.fontSizePx >= 24 && el.fontWeight >= 700 ? 3.0 : 4.5;
  }

  function evalElement(label, el, dependsOnScrim, baseOpacity) {
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

    const alpha = scrimAlphaFor(el.box, baseOpacity);
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

  function buildTable(baseOpacity) {
    const rows = [];
    rows.push(evalElement("eyebrow (// FRESHLY BREWED · DUBLIN 8)", eyebrow, true, baseOpacity));
    rows.push(evalElement("nome (Café Lisboa)", name, true, baseOpacity));
    rows.push(evalElement("frase itálica (Your morning, done right.)", tagline, true, baseOpacity));
    rows.push(evalElement("subheadline (Open since seven...)", subheadline, true, baseOpacity));
    statLabels.forEach((el, i) =>
      rows.push(evalElement(`rótulo stat #${i + 1} (GOOGLE RATING/REVIEWS/OPEN FROM)`, el, true, baseOpacity))
    );
    statNumbers.forEach((el, i) =>
      rows.push(evalElement(`número stat #${i + 1} (4.8/503/7AM)`, el, true, baseOpacity))
    );
    rows.push(evalElement('botão "View the menu" (fundo próprio, independe do véu)', menuBtn, false, baseOpacity));
    rows.push(evalElement('link "Find us →"', findUs, true, baseOpacity));
    return rows;
  }

  let baseOpacity = SCRIM_OPACITY_START;
  let table = buildTable(baseOpacity);
  while (
    table.some((r) => !r.independent && !r.pass) &&
    baseOpacity < SCRIM_OPACITY_MAX - 1e-9
  ) {
    baseOpacity = Math.min(SCRIM_OPACITY_MAX, Number((baseOpacity + SCRIM_OPACITY_STEP).toFixed(2)));
    table = buildTable(baseOpacity);
  }

  return {
    deviceTag,
    baseOpacity,
    table,
    imgFilter,
    containerFilter,
    allPass: table.every((r) => r.pass),
  };
}

function printTable(result) {
  console.log(`\n[veu] ===== HERO — ${result.deviceTag} (scrim baseOpacity=${result.baseOpacity}) =====`);
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
  console.log(`[veu] filter da <img> do hero: ${result.imgFilter}`);
  console.log(`[veu] filter do container da <img> do hero: ${result.containerFilter}`);
}

async function main() {
  const hero = await analyzeVeil(HERO_IMAGE, "hero (atmosphere-02.jpg)");
  const map = await analyzeVeil(FACADE_IMAGE, "map (facade-vertical.jpg)");
  const heroBlurDataURL = await computeBlurDataURL(HERO_IMAGE);
  const buildYoursBg = await computeBgColor(BG_SOURCE_IMAGES);

  const heroSharpMeta = await sharp(HERO_IMAGE).metadata();
  const heroBuffer = await fs.readFile(HERO_IMAGE);

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const desktopResult = await measureHeroViewport(
    page,
    { width: 1920, height: 1080 },
    "desktop",
    heroSharpMeta,
    heroBuffer
  );
  const mobileResult = await measureHeroViewport(
    page,
    { width: 390, height: 844 },
    "mobile",
    heroSharpMeta,
    heroBuffer
  );

  await browser.close();

  printTable(desktopResult);
  printTable(mobileResult);

  // Um único valor de opacidade base pra produção: o pior caso dos dois
  // viewports (mais conservador), reavaliado nos dois pra confirmar.
  const finalBaseOpacity = Math.max(desktopResult.baseOpacity, mobileResult.baseOpacity);
  console.log(`\n[veu] scrim baseOpacity final (pior caso dos dois viewports): ${finalBaseOpacity}`);

  const failing = [...desktopResult.table, ...mobileResult.table].filter((r) => !r.pass);
  if (failing.length > 0) {
    console.log(
      `[veu] FALHOU — ${failing.length} linha(s) não bateram o piso de contraste mesmo no teto de opacidade (${SCRIM_OPACITY_MAX}):`
    );
    for (const f of failing) console.log(`  - ${f.label}: ${f.ratio}:1 (piso ${f.floor}:1)`);
  } else {
    console.log("[veu] todas as linhas do hero aprovadas na trava de contraste.");
  }

  const output = {
    generatedAt: new Date().toISOString(),
    fg: FG_HEX,
    veilRgb: MAP_VEIL_RGB,
    presets: PRESETS,
    hero,
    map,
    heroBlurDataURL,
    buildYoursBg,
    heroScrim: {
      rgb: HERO_SCRIM_RGB,
      baseOpacity: finalBaseOpacity,
      maskFeatherPx: SCRIM_MASK_FEATHER_PX,
      slackPx: SCRIM_SLACK_PX,
      extraBottomPx: SCRIM_EXTRA_BOTTOM_PX,
      allPass: failing.length === 0,
      desktop: { baseOpacity: desktopResult.baseOpacity, table: desktopResult.table },
      mobile: { baseOpacity: mobileResult.baseOpacity, table: mobileResult.table },
    },
  };

  const outPath = path.resolve("components/cafe-lisboa/veu.json");
  await fs.writeFile(outPath, JSON.stringify(output, null, 2) + "\n");
  console.log(`[veu] escrito em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
