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
    if (t.includes("burger") || t.includes("restaurant") || t.includes("food") || t.includes("steak") || t.includes("grill")) category = "restaurant";
    else if (t.includes("sushi") || t.includes("japan") || t.includes("ramen")) category = "japanese";
    else if (t.includes("pizza")) category = "pizza";
    else if (t.includes("pub") || t.includes("bar")) category = "pub";
    else if (t.includes("barb")) category = "barber";
    else if (t.includes("cafe") || t.includes("coffee") || t.includes("bakery") || t.includes("padaria")) category = "cafe";
    else if (t.includes("nail")) category = "nail";
    else if (t.includes("salon") || t.includes("hair") || t.includes("beauty")) category = "salon";
    else if (t.includes("tattoo")) category = "tattoo";
    else if (t.includes("gym") || t.includes("fitness") || t.includes("crossfit")) category = "gym";
    else if (t.includes("spa") || t.includes("massage") || t.includes("massag")) category = "spa";
    else if (t.includes("aesthet") || t.includes("botox") || t.includes("skin") || t.includes("estetic") || t.includes("harmoniz")) category = "aesthetic";
    else if (t.includes("dental") || t.includes("dentist")) category = "dental";
    else if (t.includes("clinic") || t.includes("physio") || t.includes("health")) category = "clinic";
    else if (t.includes("auto") || t.includes("garage") || t.includes("mechanic") || t.includes("car")) category = "auto";
    else if (t.includes("pet") || t.includes("grooming") || t.includes("vet")) category = "pet";
    else if (t.includes("construction") || t.includes("build") || t.includes("real estate") || t.includes("imobili") || t.includes("property")) category = "construction";

    // ---------- KITS DE DIREÇÃO DE ARTE POR NICHO ----------
    // Cada kit: paleta (hex nomeados), tipografia (display+body+peso), mood da foto,
    // conceito de assinatura (o "momento uau"), e tom de copy.
    // IMPORTANTE: fugir do default IA (creme + serif + terracota #D97757).
    const kits = {
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
    // pelo raw.githubusercontent. Padrão de nomes por nicho:
    //   hero.jpg  1.jpg 2.jpg 3.jpg 4.jpg  ambiente.jpg
    // IMPORTANTE: troque "leoclimber/climber-sites" e o branch se o repo mudar.
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

═══════════ MOTION SYSTEM (this is what separates award-winners from templates) ═══════════
The site must feel ALIVE and cinematic — not a static page. Build ALL of the following, orchestrated and tasteful (never gimmicky). Everything must respect prefers-reduced-motion (wrap motion in a media query and disable it there).

A. PAGE LOAD SEQUENCE: On load, the hero animates in as a choreographed sequence, not all at once. Eyebrow fades+slides first, then the big headline reveals line-by-line (each line clip-masked, rising up with a slight stagger ~120ms apart), then subtext, then CTAs, then stats. Use a smooth cubic-bezier ease (e.g. cubic-bezier(0.16, 1, 0.3, 1)). This first ~1.2s is the "wow".

B. HERO PARALLAX & DEPTH: The hero background image/video must have depth. On mouse move (desktop), the hero image shifts subtly (translate a few px, opposite to cursor) for a living parallax. On scroll, the hero image moves slower than the text (parallax layers) and can subtly scale up (1.0→1.08) as you scroll past. The headline can drift up slightly faster than the image. This layered depth is critical — a flat hero reads as cheap.

C. SCROLL-TRIGGERED REVEALS: Every section's content animates in as it enters the viewport (IntersectionObserver, trigger ~15% visible, animate once). Vary the reveal per element type: headings clip-reveal upward, body text fades+rises, images/cards fade+rise+slight-scale (from 0.96), and stagger children so items in a row appear one after another (~80-100ms apart), never all together.

D. NUMBER COUNTERS: Any stat/number (rating, review count, years, "100%") counts up from 0 to its value when it scrolls into view (~1.2s, ease-out). This always reads as premium.

E. SIGNATURE SCROLL MOMENT: Deliver the signature concept from the art direction as a real scroll-driven moment. For product businesses, the hero/feature image can scale, rotate slightly, or have layered elements move at different speeds as you scroll through the section (scroll-linked, using scroll progress). For the construction/real-estate kit specifically, implement the build-up: swap/cross-fade through stages as the user scrolls the section. Make this ONE moment genuinely impressive.

F. MICRO-INTERACTIONS: Buttons have a refined hover (subtle lift + shadow bloom, or a fill-sweep). Gallery images zoom slightly (scale 1.05) with an overlay tint on hover. Nav links have an animated underline. The sticky nav shrinks/gains a backdrop blur + solid background after scrolling ~80px. A slim scroll-progress bar at the very top is welcome.

G. If a HERO VIDEO is present, it plays behind a gradient scrim with the load sequence layered on top; the parallax applies to the scrim/text, and the video stays cinematic (object-fit cover, full-bleed).

Motion must be smooth (transform & opacity only, GPU-friendly, will-change where needed), never janky, never blocking scroll. If in doubt, make it subtle — restraint reads as expensive.

═══════════ NON-NEGOTIABLE QUALITY RULES ═══════════
1. NEVER use emoji as service/feature icons. This is the #1 tell of AI sites. Use clean inline SVG line icons, or numbered/typographic markers, or no icons at all.
2. Typography is the personality. Import the right Google Fonts. Set a real type scale with intentional weights, tight letter-spacing on big display, generous line-height on body. Big confident headlines.
3. Generous negative space. Premium sites breathe. Cheap sites cram. Use large section padding.
4. The MOTION SYSTEM above is mandatory and orchestrated — but tasteful. An elegant, coherent set of motions beats scattered flashy effects. Everything transform/opacity based and respecting prefers-reduced-motion.
5. Avoid the generic AI look: do NOT default to cream background + serif + terracotta (#D97757) unless the palette above says so.
6. Sticky nav that turns solid + backdrop-blur on scroll. Smooth scroll to anchors.
7. Real hierarchy: hero → brand story/about (with soul, not "founded in 2010") → services (premium cards, no emoji) → gallery → reviews (3 testimonials, realistic Irish names) → FAQ (accordion, 4 items) → contact (with address, hours, map embed via Google Maps iframe using the address, and the booking CTA).
8. Floating WhatsApp/booking button bottom-right linking to ${whatsappHref}.
9. Fully mobile responsive. Visible keyboard focus states.
10. Copy must be specific and brand-voiced, never filler. Write like a copywriter, in ${city.includes("Ireland") ? "English" : "the appropriate local language"}.

Section ids required: about, services, gallery, reviews, faq, contact.

Build it to win an award. Every color and type choice must come from the art direction above. Every section must move.`;
    }

    // ---------- CHAMADA À API COM STREAMING (Opus para criação, Sonnet para edição) ----------
    // Streaming é essencial aqui: sem ele, a função fica "muda" por minutos enquanto o Opus
    // gera o site inteiro, e o proxy da Vercel corta a conexão por inatividade (504) antes
    // mesmo de bater o maxDuration configurado. Com streaming, mandamos heartbeats conforme
    // os dados chegam, então a conexão nunca fica "morta".
    const useModel = (editInstruction && previousHtml) ? "claude-sonnet-4-6" : "claude-opus-4-8";

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: useModel,
        max_tokens: 32000,
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
