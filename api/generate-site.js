export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" });

  try {
    const body = req.body || {};
    const businessName = (body.businessName || "").substring(0, 100);
    const businessType = (body.businessType || "").substring(0, 100);
    const city = (body.city || "Dublin, Ireland").substring(0, 100);
    const phone = (body.phone || "").substring(0, 50);
    const email = (body.email || "").substring(0, 100);
    const address = (body.address || "").substring(0, 200);
    const rating = (body.rating || "4.9").substring(0, 10);
    const reviewCount = (body.reviewCount || "100+").substring(0, 20);
    const hours = (body.hours || "").substring(0, 300);
    const services = (body.services || "").substring(0, 600);
    const whatsapp = (body.whatsapp || "").substring(0, 30);
    const bookingLink = (body.bookingLink || "").substring(0, 300);
    const vibe = (body.vibe || "").substring(0, 200);
    const colors = (body.colors || "").substring(0, 200);
    const logoUrl = (body.logoUrl || "").substring(0, 500);
    const clientPhotos = (body.clientPhotos || "").substring(0, 3000);
    const referenceUrl = (body.referenceUrl || "").substring(0, 300);
    const heroVideoBase64 = body.heroVideoBase64 || "";
    const heroHeadline = (body.heroHeadline || "").substring(0, 200);
    const heroSubtitle = (body.heroSubtitle || "").substring(0, 300);
    const aboutText = (body.aboutText || "").substring(0, 1000);
    const suggestedColors = (body.suggestedColors || "").substring(0, 200);
    const suggestedFonts = (body.suggestedFonts || "").substring(0, 200);
    const editInstruction = (body.editInstruction || "").substring(0, 500);
    const previousHtml = (body.previousHtml || "").substring(0, 60000);

    if (!businessName || !businessType) {
      return res.status(400).json({ error: "businessName and businessType are required" });
    }

    // ---------- CATEGORIZAÇÃO ----------
    const t = businessType.toLowerCase();
    let category = "generic";
    // ===== ALIMENTAÇÃO =====
    if (t.includes("burger") || t.includes("smash") || t.includes("hamburg")) category = "burger";
    else if (t.includes("pizza")) category = "pizza";
    else if (t.includes("sushi") || t.includes("japan") || t.includes("ramen") || t.includes("japon")) category = "japanese";
    else if (t.includes("arab") || t.includes("lebanes") || t.includes("kebab") || t.includes("shawarma") || t.includes("árab")) category = "arabic";
    else if (t.includes("africa") || t.includes("afric")) category = "african";
    else if (t.includes("brazil") || t.includes("brasil")) category = "brazilian";
    else if (t.includes("ital") || t.includes("pasta") || t.includes("trattoria")) category = "italian";
    else if (t.includes("steak") || t.includes("grill") || t.includes("bbq") || t.includes("churrasc")) category = "steak";
    else if (t.includes("cafe") || t.includes("coffee") || t.includes("bakery") || t.includes("padaria") || t.includes("café")) category = "cafe";
    else if (t.includes("confeit") || t.includes("doce") || t.includes("dessert") || t.includes("patisser") || t.includes("cake")) category = "confectionery";
    else if (t.includes("food truck") || t.includes("foodtruck")) category = "foodtruck";
    else if (t.includes("pub") || t.includes("bar")) category = "pub";
    else if (t.includes("fine dining") || t.includes("restaurant") || t.includes("food") || t.includes("bistro") || t.includes("dining") || t.includes("restaurante")) category = "restaurant";
    // ===== BELEZA & ESTÉTICA =====
    else if (t.includes("barb")) category = "barber";
    else if (t.includes("nail") || t.includes("unha")) category = "nail";
    else if (t.includes("brow") || t.includes("sobrancelha") || t.includes("lash") || t.includes("cílios") || t.includes("cilios")) category = "brows";
    else if (t.includes("tan") || t.includes("bronze")) category = "tanning";
    else if (t.includes("aesthet") || t.includes("botox") || t.includes("skin") || t.includes("estetic") || t.includes("estétic") || t.includes("harmoniz") || t.includes("facial")) category = "aesthetic";
    else if (t.includes("body") || t.includes("drenag") || t.includes("criolip") || t.includes("corporal")) category = "bodyaesthetic";
    else if (t.includes("salon") || t.includes("hair") || t.includes("beauty") || t.includes("cabelo") || t.includes("salão") || t.includes("salao")) category = "salon";
    else if (t.includes("spa") || t.includes("massage") || t.includes("massag")) category = "spa";
    else if (t.includes("tattoo") || t.includes("tatuage") || t.includes("tatua")) category = "tattoo";
    // ===== SAÚDE =====
    else if (t.includes("dental") || t.includes("dentist") || t.includes("dentista") || t.includes("odonto")) category = "dental";
    else if (t.includes("physio") || t.includes("fisio")) category = "physio";
    else if (t.includes("nutri")) category = "nutrition";
    else if (t.includes("psico") || t.includes("psych") || t.includes("terap") || t.includes("therap")) category = "psychology";
    else if (t.includes("vet") || t.includes("veterin")) category = "vet";
    else if (t.includes("clinic") || t.includes("health") || t.includes("clínica") || t.includes("clinica")) category = "clinic";
    // ===== FITNESS =====
    else if (t.includes("yoga") || t.includes("pilates")) category = "yoga";
    else if (t.includes("gym") || t.includes("fitness") || t.includes("crossfit") || t.includes("box") || t.includes("personal") || t.includes("academia")) category = "gym";
    // ===== SERVIÇOS =====
    else if (t.includes("laundr") || t.includes("lavand")) category = "laundry";
    else if (t.includes("auto") || t.includes("garage") || t.includes("mechanic") || t.includes("car ") || t.includes("oficina") || t.includes("mecânic")) category = "auto";
    else if (t.includes("groom") || t.includes("tosa") || t.includes("banho e tosa")) category = "petgrooming";
    else if (t.includes("pet")) category = "pet";
    else if (t.includes("locksmith") || t.includes("chaveiro")) category = "locksmith";
    else if (t.includes("electric") || t.includes("plumb") || t.includes("eletric") || t.includes("encanad")) category = "handyman";
    // ===== OUTROS PREMIUM =====
    else if (t.includes("boutique") && t.includes("hotel")) category = "hotel";
    else if (t.includes("jewel") || t.includes("joalher") || t.includes("joia")) category = "jewelry";
    else if (t.includes("cloth") || t.includes("boutique") || t.includes("fashion") || t.includes("roupa") || t.includes("moda")) category = "clothing";
    else if (t.includes("photo") || t.includes("fotograf") || t.includes("studio") || t.includes("estúdio")) category = "photography";
    else if (t.includes("construction") || t.includes("build") || t.includes("real estate") || t.includes("imobili") || t.includes("property") || t.includes("construtora")) category = "construction";

    // ---------- KITS DE DIREÇÃO DE ARTE POR NICHO ----------
    // Cada kit: paleta (hex nomeados), tipografia (display+body+peso), mood da foto,
    // conceito de assinatura (o "momento uau"), e tom de copy.
    // IMPORTANTE: fugir do default IA (creme + serif + terracota #D97757).
    const kits = {
      burger: {
        palette: "ink #12100E / ember #E4551F / cream #F3EDE1 / char #1E1A15 / gold-line #C9A24B",
        fonts: "Display: 'Anton' or heavy condensed grotesque, tight tracking; Body: 'Inter'; huge bold display for burger names",
        mood: "close-up cinematic smash burger, melted cheese dripping, char-grilled edges, deep shadow, warm rim light, steam, appetite-driven macro",
        signature: "hero with the signature burger filling the screen, cheese pull / sizzle / steam, menu prices as a bold typographic list (never emoji icons)",
        tone: "bold, hungry, unapologetic — swagger and flavor, describe the char and the crunch",
      },
      steak: {
        palette: "charcoal #17130F / ember #B4472E / bone #EDE7DB / smoke #33291F / brass #B08D57",
        fonts: "Display: strong serif or condensed grotesque with weight; Body: 'Inter'",
        mood: "seared steak with grill marks, flame, smoke, dark moody steakhouse, warm dramatic light, premium cut close-up",
        signature: "hero with the sizzling cut / flame-kissed sear, smoke rising, dark and premium",
        tone: "premium, primal, confident — fire, craft, the perfect cut",
      },
      restaurant: {
        palette: "ink #12100E / ember #E4551F / cream #F3EDE1 / char #1E1A15 / gold-line #C9A24B",
        fonts: "Display: 'Anton' or condensed grotesque, tight; Body: 'Inter'; use heavy display for food names",
        mood: "close-up cinematic food, deep shadow, warm rim light, steam, appetite-driven macro shots",
        signature: "hero with the signature dish filling the screen, sizzle/steam, menu prices as bold typographic list (never emoji icons)",
        tone: "confident, sensory, hungry — describe flavor and craft, not 'we serve quality food'",
      },
      japanese: {
        palette: "sumi-black #14110F / washi #EFEAE1 / vermilion #B4472E / stone #6E6A63 / gold #B08D57",
        fonts: "Display: elegant high-contrast serif or refined sans with wide tracking; Body: 'Inter' or 'Noto Sans'",
        mood: "minimal, negative space, single piece of sushi lit precisely, dark calm background, zen restraint",
        signature: "extreme minimalism, one hero image with huge negative space, precise plating, quiet luxury",
        tone: "restrained, precise, reverent — omakase energy, craft and silence",
      },
      pizza: {
        palette: "charcoal #171310 / tomato #C7362B / basil #3C6B3F / cream #F4EEE2 / crust #D9A441",
        fonts: "Display: warm bold serif or vintage script; Body: 'Inter'",
        mood: "wood-fired oven glow, melting cheese pull, rustic wood, flour dust, artisan hands",
        signature: "hero with the cheese pull / oven flame, artisanal warmth",
        tone: "artisanal, warm, family-craft — fire, dough, tradition",
      },
      pub: {
        palette: "forest #14231A / brass #C9933E / oat #EDE4D3 / oak #3A2C1E / stout #0E0B08",
        fonts: "Display: traditional serif with character (e.g. Playfair-style but restrained); Body: 'Inter'",
        mood: "warm amber pub interior, pint with backlight, dark wood, cozy low light, live atmosphere",
        signature: "hero with the perfect pint being pulled, warm amber glow, heritage feel",
        tone: "welcoming, heritage, community — the local everyone loves",
      },
      barber: {
        palette: "obsidian #0C0C0C / brass #B8923F / bone #F0ECE0 / leather #2A2018 / steel #8A8A8A",
        fonts: "Display: strong condensed uppercase (e.g. 'Oswald'/'Bebas'); Body: 'Inter'",
        mood: "moody masculine, close-up of clean fade, straight razor, leather chair, dramatic side light",
        signature: "before/after transition of a sharp cut, razor/scissors motion, dark and precise",
        tone: "sharp, confident, masculine — craft and precision, not 'we cut hair'",
      },
      cafe: {
        palette: "espresso #2A1D14 / caramel #B5793F / oat-milk #F6F0E7 / sage #7C8471 / cocoa #4A342260",
        fonts: "Display: friendly modern serif or warm sans; Body: 'Inter'",
        mood: "morning light, latte art top-down, warm textures, croissant flake, calm cozy",
        signature: "hero with pour / latte art from above, warm inviting light",
        tone: "warm, slow-morning, neighborly — ritual and comfort",
      },
      salon: {
        palette: "porcelain #F7F2EE / mauve #B27C71 / espresso #3A2B26 / blush #E3C4B8 / gold #C29A5B",
        fonts: "Display: elegant modern serif with flair; Body: 'Inter'",
        mood: "soft editorial beauty, hair movement, glossy finish, clean bright studio, feminine luxury",
        signature: "before/after transformation, hair in motion, editorial glamour",
        tone: "elevated, feminine, transformative — glow-up and confidence",
      },
      nail: {
        palette: "petal #FBF4F1 / rose #E0919F / plum #4A2C3A / cream #F3E7E0 / gilt #CB9E6B",
        fonts: "Display: delicate high-contrast serif; Body: 'Inter'",
        mood: "macro of manicure detail, soft pastel, delicate hands, clean bright, dainty",
        signature: "macro close-up of flawless nail art, soft pastel gradient shifts",
        tone: "delicate, pampering, detail-obsessed",
      },
      tattoo: {
        palette: "void #0A0A0A / blood #B21F1F / ash #EDEDED / smoke #2E2E2E / bone #CFC9BE",
        fonts: "Display: bold blackletter-adjacent or heavy condensed; Body: 'Inter'",
        mood: "dark studio, ink close-up, needle detail, dramatic single light, skin texture, artistic",
        signature: "a line/tattoo drawing itself as you scroll (SVG path reveal), dark and artistic",
        tone: "bold, artistic, permanent — commitment and craft",
      },
      gym: {
        palette: "black #0D0D0D / volt #E4FF3A / steel #7A7F86 / concrete #1C1E20 / white #F4F5F6",
        fonts: "Display: heavy condensed uppercase, aggressive; Body: 'Inter'",
        mood: "high-contrast bodies in motion, sweat, chalk, dramatic gym light, energy and power",
        signature: "kinetic hero, motion blur of movement, bold stat callouts, high energy",
        tone: "driven, intense, no-excuses — transformation and discipline",
      },
      spa: {
        palette: "clay #EBE3D9 / sand #C7B49B / umber #5A4A3A / eucalyptus #8A9A85 / ivory #FBF8F3",
        fonts: "Display: light airy serif with wide spacing; Body: 'Inter', generous line-height",
        mood: "calm water, steam, oil drop, soft natural light, stones, slow and serene",
        signature: "flowing water / oil ripple, color temperature shifts warm→calm as you scroll",
        tone: "serene, restorative, unhurried — the reader should feel calm just reading",
      },
      aesthetic: {
        palette: "pearl #F6F1EC / champagne #C9A87C / mocha #4A3B32 / rose-nude #E4C7B8 / bronze #A87E52",
        fonts: "Display: refined luxury serif; Body: 'Inter', clean clinical spacing",
        mood: "soft-focus beauty, glowing skin, clean clinical luxury, subtle before/after, radiant",
        signature: "elegant before/after reveal, glowing skin close-up, quiet clinical luxury",
        tone: "refined, confidence-building, expert — natural results and trust",
      },
      dental: {
        palette: "clean-white #F9FBFC / sky #3E8FB0 / navy #1E3A4C / mint #BFE3DD / slate #55636B",
        fonts: "Display: clean modern sans, trustworthy; Body: 'Inter'",
        mood: "bright clean clinic, calm patient, soft light, fresh and reassuring, professional",
        signature: "calm confident smile reveal, bright airy clinical space, trust-first",
        tone: "reassuring, gentle, expert — comfort and confidence, never clinical-cold",
      },
      clinic: {
        palette: "off-white #F7F9F9 / teal #2E8B8B / deep #1F3B3B / soft-green #C6E0DA / grey #5C6A6A",
        fonts: "Display: clean humanist sans; Body: 'Inter'",
        mood: "calm professional care, soft light, human warmth, clean and trustworthy",
        signature: "calm reassuring hero, human-centered care, trust markers",
        tone: "caring, professional, human — wellbeing first",
      },
      auto: {
        palette: "graphite #161718 / amber #E0A829 / steel #8A8F94 / carbon #0E0F10 / white #ECEEEF",
        fonts: "Display: industrial condensed; Body: 'Inter'",
        mood: "detailed machinery, dramatic garage light, chrome, precision engineering, powerful",
        signature: "engine/part detail with dramatic light, precision and power",
        tone: "precise, dependable, expert — engineering and trust",
      },
      pet: {
        palette: "cream #F6F0E6 / coral #E88B6A / forest #3E5C48 / sky #8FB8C9 / warm-grey #6B655C",
        fonts: "Display: friendly rounded; Body: 'Inter'",
        mood: "joyful pets, natural light, warm caring hands, playful and clean",
        signature: "happy pet hero, warmth and care, playful motion",
        tone: "caring, warm, playful — love for animals",
      },
      construction: {
        palette: "concrete #E7E4DF / graphite #1C1C1A / blueprint #2C5A7A / amber #C88A3C / steel #6E7377",
        fonts: "Display: architectural grotesque, wide; Body: 'Inter', technical spacing",
        mood: "architectural models, structure detail, clean daylight, precision, materiality",
        signature: "the building CONSTRUCTS itself as you scroll (foundation → frame → structure → finished home), each stage with a copy line",
        tone: "solid, crafted, engineered — built to last, made for you",
      },
      generic: {
        palette: "midnight #0F1729 / azure #3B7DD8 / cloud #E8EEF6 / slate #334155 / mint #4FD1C5",
        fonts: "Display: strong modern sans; Body: 'Inter'",
        mood: "clean professional, confident light, modern and premium",
        signature: "bold confident hero, clean modern premium feel",
        tone: "professional, confident, modern",
      },
    };

    const kit = kits[category] || kits.generic;

    // ---------- BANCO DE IMAGENS POR NICHO (hospedado no próprio GitHub) ----------
    // Quando o cliente não tem fotos (ou tem poucas), o gerador usa o banco premium
    // do nicho. As imagens ficam em /banco/<nicho>/ no repositório e são servidas
    // pelo raw.githubusercontent.
    //
    // CONVENÇÃO DE NOMES (importante — suba os arquivos EXATAMENTE com estes nomes):
    //   hero.jpg  1.jpg  2.jpg  3.jpg  4.jpg  ambiente.jpg
    // Use sempre a extensão .jpg no NOME do arquivo (mesmo que a imagem tenha vindo
    // como .png, basta renomear a extensão para .jpg ao subir — funciona normalmente).
    // Se preferir, o HTML gerado também tenta .png automaticamente como fallback.
    const BANK_REPO = "leoclimber/climber-sites";
    const BANK_BRANCH = "main";
    const bankBase = `https://raw.githubusercontent.com/${BANK_REPO}/${BANK_BRANCH}/banco/${category}`;
    const bankPhotos = [
      `${bankBase}/hero.jpg`,
      `${bankBase}/1.jpg`,
      `${bankBase}/2.jpg`,
      `${bankBase}/3.jpg`,
      `${bankBase}/4.jpg`,
      `${bankBase}/ambiente.jpg`,
    ];

    // ---------- BANCO DE VÍDEOS POR NICHO (opcional, mesmo esquema das imagens) ----------
    // Vídeos cinematográficos ficam em /banco/<nicho>/<nome>.mp4 no repositório.
    // Para o burger-journey, dois vídeos Seedance são usados quando presentes:
    //   stack.mp4  -> THE STACK (burger girando/desmontando)
    //   sear.mp4   -> THE SEAR  (chapa selando a carne com fogo)
    // Se ainda não estiverem no ar, a jornada cai de volta para imagens do banco
    // automaticamente (via onerror), então o site funciona ANTES dos vídeos existirem.
    const bankVideos = {
      stack: `${bankBase}/stack.mp4`,
      sear: `${bankBase}/sear.mp4`,
    };

    // ---------- ASSETS DO CLIENTE ----------
    const realPhotos = clientPhotos.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).slice(0, 8);
    const hasRealPhotos = realPhotos.length > 0;
    const hasEnoughRealPhotos = realPhotos.length >= 4;
    // Lógica híbrida:
    // - 4+ fotos reais  -> usa só as reais (autenticidade total)
    // - 1 a 3 fotos     -> usa as reais + completa com o banco do nicho
    // - 0 fotos         -> usa 100% o banco do nicho
    const photoList = hasEnoughRealPhotos
      ? realPhotos
      : [...realPhotos, ...bankPhotos].slice(0, 8);
    const usingBank = !hasEnoughRealPhotos;
    const hasVideo = heroVideoBase64 && heroVideoBase64.startsWith("data:video");
    const bookingHref = bookingLink || (whatsapp ? `https://wa.me/${whatsapp}` : (phone ? `tel:${phone}` : "#contact"));
    const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}` : (phone ? `tel:${phone}` : "#contact");

    // ---------- MODO EDIÇÃO ----------
    let userPrompt;
    if (editInstruction && previousHtml) {
      userPrompt = `You are refining an existing premium website. Here is the current HTML:

${previousHtml}

Apply this change exactly, keeping everything else intact and keeping the same premium quality: "${editInstruction}"

Return the COMPLETE updated HTML only, from <!DOCTYPE html> to </html>. No markdown, no explanation.`;
    } else {
      // ---------- BLOCOS DE CONTEXTO ----------
      const photoBlock = `APPROVED IMAGES — use ONLY these image URLs in the site (hero if no video, gallery, about, backgrounds). ${usingBank ? "These come from our curated premium image bank for this niche — they are high-quality and on-brand." : "These are the client's REAL photos — authentic and top priority."}
${photoList.map((u, i) => `${i + 1}. ${u}`).join("\n")}

ABSOLUTE IMAGE RULES:
- Use ONLY the URLs listed above. NEVER invent, guess, or pull any other image URL (no Unsplash/Pexels/stock searches, no placeholder services). Any image not in this list is forbidden.
- Every <img> src must be EXACTLY one of the URLs above, copied verbatim.
- For robustness, add onerror fallback that swaps .jpg for .png on each bank image, e.g. onerror="if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.png');}". This way images load whether stored as .jpg or .png.
- If you have fewer images than a layout wants, reuse the ones above in different crops, or replace image slots with typographic/color panels. NEVER leave a broken or empty image.
- All images: object-fit: cover, descriptive alt text, no stretching.
- Do not introduce images that clash in style — the list above is already curated to be coherent.`;

      const videoBlock = hasVideo
        ? `A 3D HERO VIDEO is provided by the client. Embed it as a full-screen autoplaying, muted, looping background video in the hero using this exact placeholder src: "HERO_VIDEO_SRC". Structure: <video autoplay muted loop playsinline> with a dark gradient overlay on top and the headline/CTA above it. This is the centerpiece — make the hero cinematic around it.`
        : `No hero video. Build a cinematic hero using the signature concept below, strong typography, and CSS (gradients, subtle motion, scroll-reveal). ${kit.signature}`;

      const refBlock = referenceUrl
        ? `VISUAL REFERENCE for quality bar: "${referenceUrl}". Match that LEVEL of polish and taste (spacing, motion, restraint) — do not copy it, and do not fetch it. Just aim for that tier of quality.`
        : "";

      const logoBlock = logoUrl ? `Client logo (use in the nav header): ${logoUrl}` : "";
      const brandColorBlock = (colors || suggestedColors) ? `Client-stated brand colors to respect: ${colors || suggestedColors}. Blend with the art-direction palette below, letting the client colors lead where they conflict.` : "";
      const fontHint = suggestedFonts ? `Suggested fonts from research: ${suggestedFonts} (use if they fit the direction).` : "";
      const headlineHint = heroHeadline ? `Suggested hero headline: "${heroHeadline}" (refine it, don't use verbatim if you can do better).` : "";
      const aboutHint = aboutText ? `Research notes about the business for the About section: ${aboutText}` : "";

      // ---------- BLOCO DA JORNADA CINEMATOGRÁFICA (SÓ BURGER) ----------
      // Este bloco só é injetado quando category === "burger". Ele substitui a
      // estrutura de seções padrão por uma jornada de scroll estilo docmo.agency,
      // com 9 cenas encadeadas. Mantém todo o resto do sistema (motion, cursor de
      // brasa, color journey, contadores) — apenas define a ARQUITETURA das seções.
      const burgerJourneyBlock = category === "burger" ? `

═══════════ BURGER PREMIUM PAGE — CLEAN EDITORIAL LAYOUT + CINEMATIC MOMENTS ═══════════
Build a premium single-page site that is CLEAN, ELEGANT and BREATHABLE as its foundation — generous negative space, confident condensed display typography, strong section rhythm, dark warm palette (ink/ember/cream/gold) — AND injects four genuine "wow" cinematic moments at the right places. The goal is a site that is BOTH elegant AND impressive: an award-winner that never feels cluttered. Do not overload scenes; let each one breathe. Clean layout is the base; the cinematic moments are the seasoning, not the whole meal.

Section eyebrows use small mono labels (e.g. "// THE CUT", "// THE SEAR"). Dark background throughout, warm ember/amber glow as connective tissue between sections. A subtle glowing golden light-ring motif can sit under key product shots.

★★★ GLOBAL FOOD-PHOTO SIZING LAW — STRICT, APPLIES TO THE WHOLE PAGE (this is critical — in past versions the cinematic sections shrank the food photos and killed the appetite; a burger site LIVES on big, generous, appetite-driving food photos, exactly like the clean editorial version): Every food photograph on this page must be LARGE, GENEROUS and APPETITE-DRIVING — the food is the hero of this business, never a small thumbnail. Videos, gauges, counters and interactive widgets must NEVER cause a food image to shrink. Concretely:
- Any burger/food photo used as a feature or hero-adjacent visual must render at a MINIMUM height of 560px on desktop (min-height:560px) and fill its container edge to edge with object-fit:cover — a big, close, mouth-watering crop where the cheese, char and texture are clearly visible. Never letterbox a food photo into a short strip.
- Food photos must dominate their section — a food image should occupy at least ~48% of the section width on desktop when paired with text, and go full-width/near-full-width when standing alone.
- Prefer TIGHT, CLOSE crops (the cheese pull, the sear, the stacked patties) over wide/distant shots. Zoom in on the food. Distant, small-in-frame food is forbidden.
- Never surround a food photo with large empty dark voids that make it look small. If there is dark space, the PHOTO grows to use it, not the void.
This sizing law overrides any layout instinct to shrink images for the sake of widgets. Big food, always.

BUILD THESE SECTIONS IN THIS EXACT ORDER (use the section ids given so nav + CTAs resolve):

★ CINEMATIC MOMENT 1 ★ — SECTION 1: HERO WITH THE STACK VIDEO (id="hero")
   ★ FULL-BLEED HERO VIDEO (like the docmo reference — this is the signature first impression): The STACK VIDEO fills the ENTIRE hero viewport as a full-screen background. ${bankVideos.stack ? `Use the video "${bankVideos.stack}" as a TRUE FULL-BLEED background: <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;"> covering the whole hero edge-to-edge, the exploding burger LARGE, CLOSE and clearly visible filling the screen (the food must read big and appetising, not small or distant). Add MANDATORY onerror AND onstalled fallback that swaps the video src to the hero burger image ${photoList[0]} (NEVER a fries image), also full-bleed and object-fit:cover, so the hero always shows a big, close burger.` : `Use the hero burger image ${photoList[0]} as a full-bleed, object-fit:cover background — a big, close, appetising crop.`}
   ★ KEEP THE BURGER BRIGHT, BIG & VISIBLE: Use only a MINIMAL dark overlay — just enough to keep text legible, and concentrate it BEHIND the text area (e.g. a left-to-right or bottom gradient scrim that darkens only the text zone), leaving the burger itself bright, lit, large and clearly visible. Do NOT wash the whole video in heavy darkness, and do NOT let the food read small — the food must POP and fill the frame. No border, no box, no rounded frame — the video bleeds to all four edges.
   TEXT OVER THE VIDEO: eyebrow ("// STONEYBATTER · DUBLIN"), then the headline, a short subtitle, two CTAs (primary "CALL TO ORDER" → ${bookingHref}, secondary "SEE THE MENU" → #services), and a row of animated stat counters (${rating}★ · ${reviewCount} reviews · 100% fresh) — anchored lower-left over the gradient scrim, z-index above the video. A tiny "SCROLL TO BEGIN" cue at the bottom. Big brand wordmark in the nav.
   ★ HEADLINE SIZING — STRICT, FOR CONSISTENCY (this is critical — past versions came out either too small or absurdly huge with one word per line; it must be CONSISTENT and BALANCED every time): The hero headline must be BOLD and confident but MUST fit comfortably within the hero viewport WITHOUT the user needing to scroll to read it, and WITHOUT becoming one giant word per line. Target: the headline reads in 2 to 3 balanced lines total, each line containing multiple words. Use a responsive clamp so it scales with the screen but never overflows — e.g. font-size: clamp(2.5rem, 5.5vw, 5rem); line-height: ~1.0; and constrain the headline block to about max-width: 60% of the hero (max ~640px) so it wraps into tidy multi-word lines on the left, never spanning huge single words down the whole screen. The entire hero (headline + subtitle + CTAs + stats) must be visible in one screen without scrolling. Balanced, premium, legible — a confident headline, NOT a wall of oversized words. One accent word in ember, the rest cream.
SECTION 2: THE STORY (id="about")  [clean editorial — this is the elegant base]
   Just above or below this section, add an ELEGANT MARQUEE (the moving strip Leo liked): a slow, smooth, seamless infinite horizontal loop of short flavour keywords separated by small dots, e.g. "Smoky Bacon • Cheese Pull • Loaded Fries • Vegan & Proud • Smash Burgers • Char-Grilled •" repeating. Keep it refined — thin/medium weight, tasteful, lower-key (not a loud promo banner), pauses on hover. This is a premium detail.
   Two-column editorial story. LEFT: mono eyebrow "// THE STORY", a strong headline with one phrase in ember accent, then 2 short warm paragraphs about the place (soul, not "founded in"). RIGHT: the interior/ambience image (${photoList.length > 5 ? photoList[5] : photoList[photoList.length-1]}) rendered LARGE (min-height:560px on desktop, object-fit:cover, filling its column edge to edge) with a small ember-orange address badge overlapping a corner (e.g. "55 PRUSSIA ST · D07"). Generous whitespace around the pair, but the image itself must be big and immersive — never a small inset. Calm, premium, confident. This clean section is the backbone — keep it uncluttered.

★ CINEMATIC MOMENT 2 ★ — SECTION 3: // THE CUT (id="cut")
   The "spec sheet" moment — clean and elegant, NO scroll deconstruction, and NO floating ingredient labels around the burger (in the last version the labels overlapped the spec table text and looked cluttered — DO NOT add ingredient callout labels/lines around the burger). Mono eyebrow "// THE CUT". LEFT: a big static "230°C" callout in ember + a clean spec table (Patty/Grind, Sear/Surface · 230°C, Cheese, Bun, Origin) in mono type with the values right-aligned + one short line of copy below. RIGHT: the WHOLE hero burger ${photoList[0]} shown intact and beautiful — a single clean image rendered LARGE (min-height:560px on desktop, ideally 600–680px, object-fit:cover, a big close crop) with steam, sitting in generous dark space, NO labels, NO callout lines, NO annotations over or around it. The burger must be BIG and mouth-watering — fill the right column, do not shrink it into a small centered thumbnail surrounded by void. Just the gorgeous, large burger and the clean spec table on the left. Uncluttered, premium, lots of breathing room. The burger image can gently fade/scale in on scroll, but nothing overlaps it and it never renders small.

★ CINEMATIC MOMENT 3 ★ — SECTION 4: // THE SEAR (id="sear")
   The fire scene with the sear video + the heat gauge. ${bankVideos.sear ? `Use the video "${bankVideos.sear}" as a TRUE FULL-BLEED background of this section: <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"> covering the whole section edge-to-edge (min-height:640px so the fire fills the frame), dark scrim on top for readability. MANDATORY onerror/onstalled fallback to a grill/meat image (${photoList[0]}, NEVER fries), also object-fit:cover full-bleed.` : `Full-bleed grill background using ${photoList[0]} with a fire-glow gradient, min-height:640px, object-fit:cover.`}
   Over the video: four LIVE COUNTERS across the top counting up from 0 on enter (mono, amber glow): 490G (patty weight) · 28 (days aged) · 258° (sear temp) · 7 (layers). Headline "EVERY LAYER. UNCOMPROMISED." Small "SCROLL TO RAISE THE HEAT" cue.
   ★ SCROLL-LINKED HEAT GAUGE (MANDATORY — do not skip): On the RIGHT side, inside a CLEAN, ELEGANT CONTAINER (a slim vertical panel/card with a subtle dark background, a little padding, and a soft border or glow — NOT loose numbers floating over the burger). Inside the container: a label "SEAR TEMP" on top, a large temperature number tied to SCROLL PROGRESS through this section (NOT a one-shot counter): as the user scrolls down through SEAR it climbs 0 → 258 and back down on scroll up. Next to the number, a thin VERTICAL BAR (slim track, amber/orange fill) whose height goes 0%→100% in sync, glowing hotter (yellow-white) near the top — a rising thermometer. The whole gauge sits neatly in its container on the right edge, visually contained and premium — never numbers scattered over the food. Map the section scroll progress (0→1) to the number 0→258 and the bar height 0%→100%. This makes "SCROLL TO RAISE THE HEAT" literal. (prefers-reduced-motion: snap to 258.) The gauge container is slim and sits to the SIDE — it must NOT shrink or crop the background fire/food; the video/photo behind stays full-bleed and large.

SECTION 5: THE MENU (id="services")  [clean typographic menu — elegant base]
   A refined TYPOGRAPHIC menu list, NOT bulky cards. Each item is a full-width row: a small index number (01, 02, 03…), the item name in strong display type on the left, a one-line description under it, and the price in ember on the far right, with a thin divider line between rows. Hover highlights the row. Items (or from services if given: ${services || "invent realistic items"}): e.g. 01 Classic Smash €12, 02 Vegan Burger €12, 03 Bacon Cheeseburger €14, 04 Loaded Cheese Fries €6, 05 Bacon & Cheese Fries €7. Keep prices in € (Dublin). This clean list reads as premium and confident — lots of breathing room.

★ CINEMATIC MOMENT 4 ★ — SECTION 6: BUILD YOUR PRIME (id="build")  [the interactive signature → WhatsApp]
   A REAL, FULLY FUNCTIONAL burger builder (not decorative). Two columns:
   LEFT = options. Step 1 "CHOOSE YOUR SIZE" — three size options (Single €12 / Double €16 / Triple €20) as selectable cards (radio behaviour). Step 2 "ADD TOPPINGS" — a grid of toggleable topping chips (Truffle Mayo +€4, Smoked Bacon +€3, Caramelised Onion +€2, Extra Cheese +€2, Prime Pickles free, Fried Egg +€2), each with a small image tile where possible.
   RIGHT = a preview panel: a burger image (rendered LARGE — min-height:520px, object-fit:cover, a big appetising crop) under a soft light-ring with rising smoke, and a live "TOTAL BUILD" figure that UPDATES ON EVERY CLICK with a smooth count animation, plus a line listing the current build (e.g. "Triple · Smoked Bacon + Extra Cheese"). Below it, a primary button "ORDER THIS BUILD" that opens ${whatsappHref} with a PREFILLED message describing the exact configured build (e.g. "Hi! I'd like to build my Prime: Double + Truffle Mayo + Smoked Bacon — total €34"). Build with real vanilla JS: clicking sizes/toppings recomputes the total AND updates the WhatsApp link text live. This MUST actually work — it is the centerpiece. No checkout/payment — CTA hands off to WhatsApp. Running total aria-live="polite".

SECTION 7: THE GALLERY (id="gallery")  [clean mosaic — elegant base, BIG photos]
   Headline "LOOK. THEN COME HUNGRY" (or similar), mono eyebrow "// THE GOODS". A cinematic MOSAIC grid of food shots that is DENSE and GENEROUS — big tiles, tight dark gaps, NO large empty black voids between or around tiles. Each tile fades+scales in on scroll, subtle hover zoom. Use images: ${photoList.slice(1).join(", ") || photoList.join(", ")}.
   ★ GALLERY SIZING — STRICT (match the clean editorial version, which looked bigger and more appetising than the cinematic one): Build it as a CSS grid that fills its width edge to edge (the mosaic spans the full content width, e.g. grid-template-columns: repeat(12, 1fr); gap:10px;). The FEATURE tile (a burger) spans a large area and is TALL — min-height:620px on desktop. Secondary tiles are also substantial — min-height:300px each, never tiny. Every tile uses width:100%; height:100%; object-fit:cover so photos fill their cells completely with no letterboxing and no dead space. The grid must read as a full, dense, immersive wall of big food — tight gaps, generous tile sizes, zero large black gaps. Do NOT scatter small images with lots of black space between them (that was the mistake in the cinematic version). Big, tight, appetite-driving mosaic.
   IMAGE CURATION (whole site): BURGER shots are the stars — give burgers the largest/prominent tiles (the feature tile is always a burger). Fries/sides and drinks are SUPPORT — smaller, secondary, never the biggest tile, never repeated as a hero across multiple sections. The largest tiles must be burgers.

SECTION 8: REVIEWS (id="reviews")  [clean 3-column — elegant base]
   Mono eyebrow "// WORD ON PRUSSIA ST". A big headline with the rating ("${rating} STARS, ${reviewCount} REVIEWS" — the ${rating} and number animate as counters). Below, THREE clean testimonial columns (not a carousel), each: five amber stars, a short quote, a realistic Irish name + Dublin neighbourhood (e.g. Stoneybatter, Phibsborough, Smithfield). Calm, spacious, trustworthy.

SECTION 9: FAQ (id="faq")  [clean minimalist accordion — elegant base]
   Mono eyebrow "// BEFORE YOU BITE", headline "THE QUESTIONS". A minimalist accordion, 4 rows with a + toggle: "Do you take bookings?", "Is the vegan burger actually good?", "What are your opening hours?", "Where exactly are you?" — thin dividers, lots of space, smooth expand.

SECTION 10: CONTACT (id="contact")  [clean close with map — elegant base]
   Headline "FIND US. FEED YOU." LEFT: address (${address || city}), phone (${phone || "—"}), opening hours (${hours || "Mon–Sun, kitchen hours"}), and a "CALL TO ORDER" CTA → ${bookingHref}. RIGHT: a Google Maps iframe for the address. Dark, clean, confident close.

LAYOUT DISCIPLINE (this is what keeps the nota 10):
- The CLEAN sections (Story, Menu, Gallery, Reviews, FAQ, Contact) must stay uncluttered, spacious, editorial — this elegance is the foundation and must not be sacrificed. Headline + supporting content + whitespace. Do not cram. BUT whitespace never means small food photos — food images stay big per the sizing law above.
- The FOUR cinematic moments (hero video, THE CUT deconstruction, THE SEAR video+gauge, BUILD YOUR PRIME) are the highlights — make each genuinely impressive but self-contained, surrounded by calm, and never at the cost of shrinking the food.
- Every non-static number animates (stats, rating, review count, build total, sear counters, heat gauge). The 230°C is static.
- The result should feel like ONE cohesive premium piece: clean and breathable, punctuated by four unforgettable moments, with big appetite-driving food throughout. Elegant first, cinematic second.

JOURNEY MOTION RULES (on top of the global motion system below):
- Sections connect via the shared dark background and a warm ember glow that shifts scene to scene (cooler → hot at THE SEAR → cooling after).
- The deconstruction (THE CUT), the sear video + heat gauge (THE SEAR), the hero video, and the BUILD builder are the four showpieces. Make them impressive; keep everything else clean and disciplined.
- Every numeric value (230°C is static; but 490G, 28, 258°, 7, the rating, the review count, and the live build total) — all the NON-static ones animate.
- Respect prefers-reduced-motion: disable scroll-linked separation and heavy motion, but keep the site fully usable and the builder fully functional.

NOTE: Required section ids: hero, about (story), cut, sear, services (menu), build, gallery, reviews, faq, contact. Use those exact ids so nav and CTAs resolve. Nav labels can read: STORY, MENU, GALLERY, REVIEWS, VISIT, plus the cinematic anchors (THE CUT, THE SEAR, BUILD).
` : "";

      // Para burger, a lista rígida de seções do bloco de regras não se aplica —
      // a jornada acima define a arquitetura. Para todos os outros nichos, mantém
      // exatamente a hierarquia original.
      const sectionHierarchyRule = category === "burger"
        ? `7. Follow the BURGER PREMIUM PAGE architecture defined above (clean editorial layout + four cinematic moments). Keep the required section ids: hero, about, cut, sear, services, build, gallery, reviews, faq, contact.`
        : `7. Real hierarchy: hero → brand story/about (with soul, not "founded in 2010") → services (premium cards, no emoji) → gallery → reviews (3 testimonials, realistic Irish names) → FAQ (accordion, 4 items) → contact (with address, hours, map embed via Google Maps iframe using the address, and the booking CTA).`;

      const sectionIdsLine = category === "burger"
        ? `Section ids required: hero, about, cut, sear, services, build, gallery, reviews, faq, contact.`
        : `Section ids required: about, services, gallery, reviews, faq, contact.`;

      userPrompt = `You are the design lead at an award-winning web studio (Awwwards Site of the Day level). A client is paying premium for a website that must look like a €50,000 agency build — NOT like an AI template. Build a complete, single-page, production-ready website.

Output ONLY raw HTML from <!DOCTYPE html> to </html>. No markdown, no code fences, no explanation. All CSS and JS inline.

═══════════ THE BUSINESS ═══════════
Name: ${businessName}
Type: ${businessType}
City: ${city}
Phone: ${phone || "—"}
Email: ${email || "—"}
Address: ${address || city}
Rating: ${rating} stars (${reviewCount} reviews)
Hours: ${hours || "Mon–Fri 9–18 · Sat 10–17 · Sun closed"}
Services / menu: ${services || "(invent 6 realistic offerings appropriate to this business, with prices in € where natural)"}
Booking link (primary CTA target): ${bookingHref}
WhatsApp link: ${whatsappHref}
${logoBlock}

═══════════ ART DIRECTION (follow precisely) ═══════════
Palette (named hex — derive every color from these): ${kit.palette}
Typography: ${kit.fonts}
Photographic mood: ${kit.mood}
SIGNATURE MOMENT (the one thing this site is remembered by): ${kit.signature}
Copy tone: ${kit.tone}
${brandColorBlock}
${fontHint}
${vibe ? `Client vibe keywords: ${vibe}` : ""}
${headlineHint}

═══════════ ASSETS ═══════════
${videoBlock}

${photoBlock}

${refBlock}
${aboutHint}
${burgerJourneyBlock}

═══════════ MOTION SYSTEM (this is what separates award-winners from templates) ═══════════
The site must feel ALIVE and cinematic — not a static page. Build ALL of the following, orchestrated and tasteful (never gimmicky). Everything must respect prefers-reduced-motion (wrap motion in a media query and disable it there).

A. PAGE LOAD SEQUENCE: On load, the hero animates in as a choreographed sequence, not all at once. Eyebrow fades+slides first, then the big headline reveals line-by-line (each line clip-masked, rising up with a slight stagger ~120ms apart), then subtext, then CTAs, then stats. Use a smooth cubic-bezier ease (e.g. cubic-bezier(0.16, 1, 0.3, 1)). This first ~1.2s is the "wow".

B. HERO PARALLAX & DEPTH: The hero background image/video must have depth. On mouse move (desktop), the hero image shifts subtly (translate a few px, opposite to cursor) for a living parallax. On scroll, the hero image moves slower than the text (parallax layers) and can subtly scale up (1.0→1.08) as you scroll past. The headline can drift up slightly faster than the image. This layered depth is critical — a flat hero reads as cheap.

C. SCROLL-TRIGGERED REVEALS: Every section's content animates in as it enters the viewport (IntersectionObserver, trigger ~15% visible, animate once). Vary the reveal per element type: headings clip-reveal upward, body text fades+rises, images/cards fade+rise+slight-scale (from 0.96), and stagger children so items in a row appear one after another (~80-100ms apart), never all together.

D. NUMBER COUNTERS: Any stat/number (rating, review count, years, "100%") counts up from 0 to its value when it scrolls into view (~1.2s, ease-out). This always reads as premium.

E. SIGNATURE SCROLL MOMENT: Deliver the signature concept from the art direction as a real scroll-driven moment. For product businesses, the hero/feature image can scale, rotate slightly, or have layered elements move at different speeds as you scroll through the section (scroll-linked, using scroll progress). For the construction/real-estate kit specifically, implement the build-up: swap/cross-fade through stages as the user scrolls the section. Make this ONE moment genuinely impressive.

F. MICRO-INTERACTIONS: Buttons have a refined hover (subtle lift + shadow bloom, or a fill-sweep). Gallery images zoom slightly (scale 1.05) with an overlay tint on hover. Nav links have an animated underline. The sticky nav shrinks/gains a backdrop blur + solid background after scrolling ~80px. A slim scroll-progress bar at the very top is welcome.

G. If a HERO VIDEO is present, it plays behind a gradient scrim with the load sequence layered on top; the parallax applies to the scrim/text, and the video stays cinematic (object-fit cover, full-bleed).

═══════════ AWARD-TIER DIFFERENTIATORS (these push it from "very good" to top-tier — implement ALL) ═══════════

H. CUSTOM CURSOR — EMBER WITH A SMOKE TRAIL (desktop only, ≥1024px): Replace the default cursor with a glowing ember that leaves a SMOKE TRAIL as it moves. Two parts:
   (1) The ember tip: a small bright hot core (pale gold/near-white) wrapped in a soft warm amber radial glow that bleeds outward — like a live coal, not a flat dot.
   (2) The smoke trail: as the pointer moves, it emits soft smoke particles along its recent path that drift slightly upward, fade out, and dissipate over ~0.6-1s. Spawn small blurred warm semi-transparent particle divs at the pointer position, each animating opacity 0.5→0 + slight upward/outward drift + scale up, then removed.
   ★ PERFORMANCE IS CRITICAL — the cursor MUST NOT cause jank or lag (a laggy cursor ruins the premium feel). Implement these optimizations, all mandatory:
     - Do NOT create a particle on every mousemove event. THROTTLE hard: spawn a particle at most every ~60-80ms (track last-spawn timestamp; skip if too soon). This alone prevents most lag.
     - Update the ember core position inside a requestAnimationFrame loop, NOT directly in the mousemove handler. The mousemove handler only stores the latest x/y; a single rAF loop reads it and moves the ember. Never do layout work in mousemove.
     - Move everything with transform: translate3d() (GPU-composited), never top/left. Set will-change: transform, opacity on the ember and particles.
     - Cap ACTIVE particles low — around 12-15 max, not 30. If at cap, skip spawning until some expire. Fewer, softer particles read as more elegant anyway.
     - Give each particle a CSS animation that removes it via animationend (don't poll with setInterval). Use pointer-events: none on all cursor elements.
     - Wrap the whole effect so it only initializes on devices with a fine pointer AND width >= 1024px: only run if window.matchMedia('(pointer: fine)').matches && innerWidth >= 1024. On touch/coarse pointers, do nothing and keep the normal cursor.
   The result must feel silky at 60fps even on a mid-range laptop. If there's any doubt, fewer particles and more throttle — smoothness beats density. This smoke-trail ember is THE signature bespoke touch — evocative of grill smoke, tasteful, and above all SMOOTH.

I. SECTION COLOR JOURNEY — MAKE IT FELT: The background must visibly shift as the user scrolls — not a subtle near-invisible change. Since the base is dark, use PERCEPTIBLE warm ambient glows: as the user enters key sections, introduce a visible radial glow/gradient of the accent color (ember/amber) bleeding from an edge or behind content, then receding. Think of light sources warming the room as you move through it. The shift between sections should be noticeable (a warm amber wash appearing behind the story section, cooling again, etc.) while keeping text readable. If the change isn't clearly felt when scrolling, it's too weak — make it stronger.

J. NUMBER COUNTERS ARE MANDATORY, NOT OPTIONAL: EVERY numeric stat (rating like 4.9, review counts like 170, percentages like 100%, years) MUST animate counting up from 0 to its final value when it first scrolls into view (~1.2s ease-out). This is required on every generation — never skip it. Preserve decimals (4.9 counts to 4.9, not 5). Trigger via IntersectionObserver, once.

K. REFINED MARQUEE: If a scrolling marquee of menu items / keywords is used, make it ELEGANT not cheap: slow, smooth, seamless infinite loop, subtle (lower opacity or thin refined type), pauses on hover. It should feel like a premium detail, never like a promo banner. If it can't be elegant, omit it.

L. COHESIVE POLISH: Section transitions connect rather than just appear. The whole thing should feel like ONE cinematic piece, not stacked blocks. Every interactive element has a considered hover state. Nothing is left at browser defaults.

Motion must be smooth (transform & opacity only, GPU-friendly, will-change where needed), never janky, never blocking scroll. If in doubt, make it subtle — restraint reads as expensive.

═══════════ NON-NEGOTIABLE QUALITY RULES ═══════════
1. NEVER use emoji as service/feature icons. This is the #1 tell of AI sites. Use clean inline SVG line icons, or numbered/typographic markers, or no icons at all.
2. Typography is the personality. Import the right Google Fonts. Set a real type scale with intentional weights, tight letter-spacing on big display, generous line-height on body. Big confident headlines.
3. Generous negative space. Premium sites breathe. Cheap sites cram. Use large section padding.
4. The MOTION SYSTEM and AWARD-TIER DIFFERENTIATORS above are mandatory and orchestrated on EVERY generation — but tasteful. The custom cursor, section color journey, and animated number counters must ALWAYS be present (never skip them). An elegant, coherent set of motions beats scattered flashy effects. Everything transform/opacity based and respecting prefers-reduced-motion.
5. Avoid the generic AI look: do NOT default to cream background + serif + terracotta (#D97757) unless the palette above says so.
6. Sticky nav that turns solid + backdrop-blur on scroll. Smooth scroll to anchors.
${sectionHierarchyRule}
8. Floating WhatsApp/booking button bottom-right linking to ${whatsappHref}.
9. Fully mobile responsive. Visible keyboard focus states.
10. Copy must be specific and brand-voiced, never filler. Write like a copywriter, in ${city.includes("Ireland") ? "English" : "the appropriate local language"}.

${sectionIdsLine}

Build it to win an award. Every color and type choice must come from the art direction above. Every section must move.`;
    }

    // ---------- CHAMADA À API COM STREAMING (Opus para criação, Sonnet para edição) ----------
    // Streaming é essencial aqui: sem ele, a função fica "muda" por minutos enquanto o Opus
    // gera o site inteiro, e o proxy da Vercel corta a conexão por inatividade (504) antes
    // mesmo de bater o maxDuration configurado. Com streaming, mandamos heartbeats conforme
    // os dados chegam, então a conexão nunca fica "morta".
    const isEdit = editInstruction && previousHtml;
    const useModel = isEdit ? "claude-sonnet-4-6" : "claude-opus-4-8";
    // Teto máximo nos dois casos. Você paga só pelos tokens realmente gerados,
    // então um teto alto não custa mais — apenas garante que nenhum site (grande
    // ou pequeno) seja cortado no meio, na criação OU na edição.
    const maxTokens = 32000;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: useModel,
        max_tokens: maxTokens,
        stream: true,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const err = await anthropicResponse.text();
      return res.status(502).json({ error: "AI failed", detail: err.substring(0, 500) });
    }

    // A partir daqui já começamos a manter a conexão viva. Headers primeiro.
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });

    // Heartbeat por timer (rede de segurança) + heartbeat a cada pedaço recebido do Opus.
    // Espaços em branco são JSON-válidos como whitespace antes do objeto final,
    // então o JSON.parse do cliente ignora tudo isso automaticamente.
    const heartbeat = setInterval(() => {
      try { res.write(" "); } catch (_) {}
    }, 10000);

    let html = "";
    let streamError = "";

    try {
      const reader = anthropicResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        try { res.write(" "); } catch (_) {} // heartbeat a cada pedaço recebido

        const lines = buffer.split("\n");
        buffer = lines.pop(); // guarda linha incompleta pro próximo pedaço

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;
          try {
            const evt = JSON.parse(jsonStr);
            if (evt.type === "content_block_delta" && evt.delta && evt.delta.type === "text_delta") {
              html += evt.delta.text;
            } else if (evt.type === "error") {
              streamError = (evt.error && evt.error.message) || "Stream error";
            }
          } catch (_) { /* linha parcial, ignora e espera o resto */ }
        }
      }
    } catch (e) {
      streamError = streamError || String(e).substring(0, 200);
    } finally {
      clearInterval(heartbeat);
    }

    if (streamError) {
      res.write(JSON.stringify({ error: "AI failed", detail: streamError }));
      return res.end();
    }

    html = html.trim();
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    // Injeta o vídeo real no placeholder (evita mandar base64 gigante no prompt)
    if (hasVideo) {
      html = html.split("HERO_VIDEO_SRC").join(heroVideoBase64);
    }

    if (!html.includes("</html>")) {
      res.write(JSON.stringify({ error: "Incomplete HTML, try again" }));
      return res.end();
    }

    res.write(JSON.stringify({ html }));
    return res.end();

  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e).substring(0, 200) });
  }
}
