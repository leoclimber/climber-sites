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

═══════════ CINEMATIC JOURNEY MODE (BURGER — THIS OVERRIDES THE DEFAULT SECTION LIST) ═══════════
This is not a normal restaurant page. Build it as a single cinematic scroll journey, in the spirit of a high-end product microsite (think a luxury-car or Apple-product reveal, applied to a burger). The whole page is ONE continuous film the visitor scrolls through. Each scene flows into the next — dark background throughout, warm ember/amber light as the connective tissue, generous full-viewport (or near) scenes, huge confident condensed display type, mono/technical labels for the "spec" text.

Recurring visual anchor: a glowing golden light-ring / plinth under the hero product (a thin luminous ellipse of light), echoed subtly in later scenes. This ring is the signature motif — reuse it.

Section labels use a technical格式: a slash prefix + two-digit number + name, e.g. "// 01. THE CUT", "// 02. THE SEAR". Small mono eyebrow text. This encodes a real sequence, so numbering is justified.

BUILD THESE SCENES IN THIS EXACT ORDER (use section ids given so nav + CTAs still work):

SCENE 1 — HERO / OVERVIEW (id="hero")
   Full-viewport. The signature burger fills the frame, sitting above the glowing golden light-ring. A tiny mono cue "SCROLL TO BEGIN" or "SCROLL NOW" at the bottom. Big brand wordmark. This is the establishing shot.
   Use image: ${photoList[0]} (the hero burger).

SCENE 2 — // 01. THE CUT (id="about")  [this doubles as the brand/about scene]
   Spec-sheet aesthetic. On the left, technical specifications in mono type with a big "230°C" callout (this is a FIXED spec, displayed statically — NOT a counter). The burger floats above the light-ring on the right. As the user scrolls INTO this scene, the burger DECONSTRUCTS: the layers (bun, patties, cheese, tomato, lettuce, base) separate and drift apart vertically with wisps of smoke at the sides, and thin label lines point to each ingredient (SESAME BRIOCHE, DOUBLE SMASH, AGED CHEDDAR, BEEFSTEAK TOMATO, BUTTER LETTUCE, BRIOCHE BASE). Drive the separation with scroll progress over the section.
   ${bankVideos.stack ? `PREFERRED: use the video "${bankVideos.stack}" as the deconstruction/rotation visual — a <video autoplay muted loop playsinline> sitting over the light-ring. Add onerror/onstalled fallback to the image ${photoList[0]} so if the video isn't uploaded yet, the still burger shows instead and the scroll-driven CSS separation still plays. ` : ""}Write the brand story woven into the spec copy (why this burger exists), not a generic "founded in" paragraph.

SCENE 3 — // 02. THE STACK (id="stack")
   The inverse of the previous: the layers RE-ASSEMBLE / the burger rotates and rebuilds over the light-ring as you scroll, smoke curling. Big headline "THE STACK" / "PRIME STACK". One line of copy about the build. If the ${bankVideos.stack} video is used, this is where its rotation reads best — you may reuse the same video element concept here or continue the scroll-linked motion. Keep it seamless from Scene 2.

SCENE 4 — // 02. THE SEAR (id="sear")
   The fire scene. A full-bleed grill/sear visual with live flames and smoke. Four LIVE COUNTERS across the top, each counting up from 0 when the scene enters view (mono display type, amber glow):
     • 490G  — dry-aged patty weight
     • 28    — days aged
     • 258°  — flat-top sear temperature (counts 0 → 258)
     • 7     — layers in the stack
   Headline treatment: "THE WAGYU RESTS" / "EVERY LAYER. UNCOMPROMISED." A small "SCROLL TO RAISE HEAT" mono cue.
   ${bankVideos.sear ? `PREFERRED: use the video "${bankVideos.sear}" as the full-bleed background of this scene — <video autoplay muted loop playsinline> with a dark scrim so the counters and headline stay readable. Add onerror fallback to image ${photoList.length > 1 ? photoList[1] : photoList[0]} so the scene still works before the video is uploaded. ` : `Use image ${photoList.length > 1 ? photoList[1] : photoList[0]} as the sear background with a fire-glow gradient. `}The four counters are MANDATORY and must animate.

SCENE 5 — EVERY LAYER. UNCOMPROMISED (id="gallery")
   A cinematic mosaic/grid of the best food shots (the "ingredient wall"). Tight grid, dark gaps, each tile fades+scales in on scroll, hover zoom. Headline "EVERY LAYER. UNCOMPROMISED." Use the remaining images: ${photoList.slice(1).join(", ") || photoList.join(", ")}. Reuse in different crops if few.

SCENE 6 — // 04. THE LINE-UP (id="services")  [this is the menu]
   Three premium build cards, dark with amber edge-glow, each with a burger image, a name, a one-line description, a price, and an "ADD TO ORDER" style button that links to ${bookingHref}:
     • THE SMASH — €28  (or invent fitting names/prices if services given: ${services || "invent 3 realistic premium builds"})
     • THE TRUFFLE — €48
     • THE PRIME — €50
   Cards reveal staggered. This is the real menu — keep prices in € (Dublin).

SCENE 7 — // 05. BUILD YOUR PRIME (id="build")  ★ THE INTERACTIVE SIGNATURE ★
   A REAL, FULLY FUNCTIONAL burger builder (not decorative). Two columns:
   LEFT = options. Step 1 "CHOOSE YOUR SIZE" — three size cards (Single / Double / Triple) as radio-style选择, each with a price. Step 2 "ADD TOPPINGS" — a grid of toggleable topping chips (Truffle Mayo +€4, Smoked Bacon +€3, Caramelised Onion +€2, Extra Cheese +€2, Prime Pickles free, Fried Egg +€2, etc), each with a small image tile where possible.
   RIGHT = a preview panel: the burger under the golden light-ring with rising smoke, and a live running total that UPDATES ON EVERY CLICK. Show a "TOTAL BUILD" figure that recalculates in real time (e.g. €26 → €29 → €34) with a smooth count animation on change. Below it, a primary button "ORDER THIS BUILD" that opens ${whatsappHref} with a prefilled message describing the exact build the user configured (e.g. "Hi! I'd like to build my Prime: Double + Truffle Mayo + Smoked Bacon — total €34"). Build this with real vanilla JS: clicking sizes and toppings recomputes the total and updates the WhatsApp link's text. This section MUST actually work — it is the centrepiece and a broken/fake builder ruins the whole site. No checkout/payment — the CTA hands off to WhatsApp/booking. Keep the running total accessible (aria-live="polite").

SCENE 8 — // 04. THE CUT (cards) (id="reviews")  [carousel + social proof]
   A horizontal, smooth-scrolling carousel of hero burger shots (smoke rising off each), and woven in, 3 short testimonials with realistic Irish names (rating ${rating}, ${reviewCount} reviews). The ${rating} and review number animate as counters. Drag/scroll horizontally, snap points, elegant.

SCENE 9 — // 05. THE STORY (id="faq")  [story + FAQ + contact bleed]
   An editorial "story" list — expandable article rows (accordion, 4 items) like "Why We Age Our Beef 28 Days", "The Maillard Reaction: Engineering the Perfect Sear", "Sourcing Our Brioche", "Why We Sear at 258°C". These double as the FAQ accordion. Under it, a slow elegant marquee: "FLAME-FORGED IN ${city.toUpperCase().replace(", IRELAND", "").replace("IRELAND", "DUBLIN")} • FLAME-FORGED IN ${city.toUpperCase().replace(", IRELAND", "").replace("IRELAND", "DUBLIN")} •" repeating.

FINAL — CONTACT (id="contact")
   The closing scene: address (${address || city}), hours (${hours || "Mon–Sun, kitchen hours"}), phone/email, a Google Maps iframe for the address, and the booking CTA to ${bookingHref}. Dark, cinematic, with the light-ring motif one last time as a footer flourish.

JOURNEY MOTION RULES (on top of the global motion system below):
- Scenes should feel connected — no hard white breaks. Transitions cross-fade or share the dark background; the ember/amber color-journey glow moves scene to scene (cool → hot at THE SEAR → cooling into THE STORY).
- The burger deconstruction (Scene 2) and reassembly (Scene 3) are the scroll-linked showpieces alongside the SEAR counters and the BUILD YOUR PRIME builder. Make these four moments genuinely impressive; keep everything else disciplined.
- Every numeric value (230°C is static; but 490G, 28, 258°, 7, the rating, the review count, and the live build total) — all the NON-static ones animate.
- Respect prefers-reduced-motion: disable scroll-linked separation and heavy motion, but keep the site fully usable and the builder fully functional.

NOTE: The section ids above (about, services, gallery, reviews, faq, contact) are intentionally mapped onto the journey scenes so the nav and CTAs still resolve. Use those exact ids. Nav labels can read as the scene names (THE CUT, THE SEAR, THE LINE-UP, BUILD, THE STORY).
` : "";

      // Para burger, a lista rígida de seções do bloco de regras não se aplica —
      // a jornada acima define a arquitetura. Para todos os outros nichos, mantém
      // exatamente a hierarquia original.
      const sectionHierarchyRule = category === "burger"
        ? `7. Follow the CINEMATIC JOURNEY MODE scene architecture defined above for the section structure (it replaces the standard hierarchy). Keep the required section ids (about, services, gallery, reviews, faq, contact) mapped onto the scenes as specified, plus the extra journey ids (stack, sear, build).`
        : `7. Real hierarchy: hero → brand story/about (with soul, not "founded in 2010") → services (premium cards, no emoji) → gallery → reviews (3 testimonials, realistic Irish names) → FAQ (accordion, 4 items) → contact (with address, hours, map embed via Google Maps iframe using the address, and the booking CTA).`;

      const sectionIdsLine = category === "burger"
        ? `Section ids required: about, services, gallery, reviews, faq, contact (mapped onto the journey scenes), plus stack, sear, build.`
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
   (2) The smoke trail: as the pointer moves, it continuously emits soft smoke particles along its recent path that drift slightly upward, fade out, and dissipate over ~0.6-1s. Implement by spawning small blurred greyish/warm semi-transparent particle divs (or canvas puffs) at the pointer position on mousemove, each animating opacity 0.5→0 + slight upward/outward drift + scale up, then removed. The faster the mouse moves, the more trail. Keep it subtle and elegant — a wispy smoke trail following the cursor, evoking a hot grill. Throttle particle creation for performance (e.g. cap active particles ~30). On hover over interactive elements, the ember core brightens/grows.
   Hide the whole effect on touch devices (fall back to normal cursor). This smoke-trail ember is THE signature bespoke touch — make it genuinely evocative of grill smoke, tasteful, never distracting from content.

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
