// Véu adaptativo — sistema de fábrica, não decoração de um site só.
// Calcula em BUILD TIME (rodar manualmente: `node scripts/veu.mjs`) o preset
// de escurecimento correto pra cada foto usada como fundo de texto, e grava
// tudo em components/cafe-lisboa/veu.json, que os componentes importam como
// dado estático — zero JS de análise de imagem no cliente.
//
// Aproximação assumida: a região dos 45% inferiores da foto (onde o bloco de
// texto do hero/mapa realmente fica, "ancorado no terço inferior") também
// serve de proxy pra cor média "atrás da headline" na trava de contraste —
// não temos a posição exata do texto em pixels, então usamos a mesma faixa
// pras duas coisas. Documentado aqui pra quem for revisar o número no log.
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const GALLERY = path.resolve("public/images/gallery");
const HERO_IMAGE = path.join(GALLERY, "atmosphere-02.jpg");
const FACADE_IMAGE = path.join(GALLERY, "facade-vertical.jpg");
const BG_SOURCE_IMAGES = [
  "atmosphere-02.jpg",
  "atmosphere-03.jpg",
  "atmosphere-04.jpg",
  "product-01.jpg",
].map((f) => path.join(GALLERY, f));

const VEIL_RGB = [18, 13, 11]; // rgba(18,13,11,A) do comando
const FG_HEX = "#F7F2EA";

const PRESETS = {
  ESCURA: { a1: 0.18, a2: 0.58, a3: 0.8 },
  MEDIA: { a1: 0.3, a2: 0.76, a3: 0.92 },
  CLARA: { a1: 0.44, a2: 0.88, a3: 0.97 },
};
// Ordem de "quanto véu precisa": foto escura pede pouco, foto clara pede
// muito — escalar a trava de contraste significa andar pra frente nesta
// lista (mais opacidade), nunca pra trás.
const PRESET_ORDER = ["ESCURA", "MEDIA", "CLARA"];

// Posição aproximada (fração do gradiente 0→1) onde o bloco de texto senta,
// pra trava de contraste — "terço inferior" do comando, um pouco além do
// meio da faixa analisada.
const HEADLINE_POSITION = 0.75;

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

function compositeOver(photoRgb, veilRgb, alpha) {
  return photoRgb.map((c, i) => c * (1 - alpha) + veilRgb[i] * alpha);
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
    const composited = compositeOver(avgRgb, VEIL_RGB, alpha);
    finalContrast = contrastRatio(fgLuminance, relativeLuminance(...composited));
    if (finalContrast >= 7 || presetIndex === PRESET_ORDER.length - 1) break;
    presetIndex++;
  }

  const preset = PRESET_ORDER[presetIndex];
  let forcedA3 = null;
  if (finalContrast < 7 && preset === "CLARA") {
    forcedA3 = 0.99;
    const composited = compositeOver(avgRgb, VEIL_RGB, forcedA3);
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

  // Busca binária na luminosidade (HSL "L"), mantendo matiz/saturação,
  // até a luminância relativa WCAG cair em 0.10–0.14.
  let lo = 0;
  let hi = hsl.l;
  let bestRgb = avg;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const rgb = hslToRgb(hsl.h, hsl.s, mid);
    const lum = relativeLuminance(...rgb);
    bestRgb = rgb;
    if (lum > 0.14) hi = mid;
    else if (lum < 0.1) lo = mid;
    else break;
  }
  const finalLuminance = relativeLuminance(...bestRgb);
  console.log(
    `[veu] build-yours bg: hex=${toHex(bestRgb)} luminance=${finalLuminance.toFixed(3)}`
  );
  return { hex: toHex(bestRgb), luminance: Number(finalLuminance.toFixed(4)) };
}

async function main() {
  const hero = await analyzeVeil(HERO_IMAGE, "hero (atmosphere-02.jpg)");
  const map = await analyzeVeil(FACADE_IMAGE, "map (facade-vertical.jpg)");
  const heroBlurDataURL = await computeBlurDataURL(HERO_IMAGE);
  const buildYoursBg = await computeBgColor(BG_SOURCE_IMAGES);

  const output = {
    generatedAt: new Date().toISOString(),
    fg: FG_HEX,
    veilRgb: VEIL_RGB,
    presets: PRESETS,
    hero,
    map,
    heroBlurDataURL,
    buildYoursBg,
  };

  const outPath = path.resolve("components/cafe-lisboa/veu.json");
  await fs.writeFile(outPath, JSON.stringify(output, null, 2) + "\n");
  console.log(`[veu] escrito em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
