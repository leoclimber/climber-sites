export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" });

  try {
    const {
      businessName = "", businessType = "", city = "", phone = "", email = "",
      address = "", services = "", rating = "", reviewCount = "", vibe = "",
      colors = "", logoUrl = "", clientPhotos = "", extraInfo = "",
      whatsapp = "", bookingLink = "", hours = "",
      heroVideoBase64 = "",
      referenceUrl = "",
      heroHeadline = "", heroSubtitle = "", aboutText = "",
      suggestedColors = "", suggestedFonts = "",
      googleMapsEmbed = "", realReviews = "",
      editInstruction = "", previousHtml = "",
    } = req.body || {};

    if (!businessName || !businessType) {
      return res.status(400).json({ error: "businessName and businessType are required" });
    }

    const t = (businessType || "").toLowerCase();

    const photoSets = {
      barber: {
        hero: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/897262/pexels-photo-897262.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      restaurant: {
        hero: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      pub: {
        hero: "https://images.pexels.com/photos/1267700/pexels-photo-1267700.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/1089930/pexels-photo-1089930.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/2796105/pexels-photo-2796105.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/1672304/pexels-photo-1672304.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      cafe: {
        hero: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/1813466/pexels-photo-1813466.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/302896/pexels-photo-302896.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/1307658/pexels-photo-1307658.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/685527/pexels-photo-685527.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      salon: {
        hero: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/3738347/pexels-photo-3738347.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/3738338/pexels-photo-3738338.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      nail: {
        hero: "https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/939836/pexels-photo-939836.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/3997385/pexels-photo-3997385.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/1526170/pexels-photo-1526170.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      spa: {
        hero: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/3865711/pexels-photo-3865711.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/3188/love-romantic-bath-candlelight.jpg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/6663571/pexels-photo-6663571.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      gym: {
        hero: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      dental: {
        hero: "https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/3779709/pexels-photo-3779709.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/4269694/pexels-photo-4269694.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/3881449/pexels-photo-3881449.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/6627286/pexels-photo-6627286.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/3845981/pexels-photo-3845981.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      auto: {
        hero: "https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/4116193/pexels-photo-4116193.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/3822843/pexels-photo-3822843.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/4480505/pexels-photo-4480505.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/3354648/pexels-photo-3354648.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/13065690/pexels-photo-13065690.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      pet: {
        hero: "https://images.pexels.com/photos/6816858/pexels-photo-6816858.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/6131005/pexels-photo-6131005.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/6568461/pexels-photo-6568461.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/6816861/pexels-photo-6816861.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/4498185/pexels-photo-4498185.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      tattoo: {
        hero: "https://images.pexels.com/photos/4123897/pexels-photo-4123897.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/955938/pexels-photo-955938.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/4123895/pexels-photo-4123895.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/1304469/pexels-photo-1304469.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/2961247/pexels-photo-2961247.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/4125657/pexels-photo-4125657.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      generic: {
        hero: "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    };

    function detectCategory(s) {
      if (s.includes("barb")) return "barber";
      if (s.includes("pub") || s.includes("bar")) return "pub";
      if (s.includes("cafe") || s.includes("café") || s.includes("coffee")) return "cafe";
      if (s.includes("restaurant") || s.includes("food") || s.includes("pizz") || s.includes("bistro") || s.includes("diner") || s.includes("burger") || s.includes("smash")) return "restaurant";
      if (s.includes("nail")) return "nail";
      if (s.includes("spa") || s.includes("massage") || s.includes("estét") || s.includes("esthet") || s.includes("aesthet") || s.includes("wax")) return "spa";
      if (s.includes("salon") || s.includes("salão") || s.includes("hair") || s.includes("beauty")) return "salon";
      if (s.includes("gym") || s.includes("fitness") || s.includes("crossfit") || s.includes("pilates") || s.includes("yoga")) return "gym";
      if (s.includes("dent") || s.includes("clinic") || s.includes("clínica") || s.includes("ortho") || s.includes("medical")) return "dental";
      if (s.includes("auto") || s.includes("mech") || s.includes("car ") || s.includes("garage") || s.includes("tyre") || s.includes("tire") || s.includes("motor")) return "auto";
      if (s.includes("pet") || s.includes("dog") || s.includes("groom") || s.includes("vet") || s.includes("animal")) return "pet";
      if (s.includes("tattoo") || s.includes("ink") || s.includes("piercing")) return "tattoo";
      return "generic";
    }

    const category = detectCategory(t);
    let photos = { ...photoSets[category] };

    if (clientPhotos && clientPhotos.trim()) {
      const cp = clientPhotos.trim().split("\n").map(u => u.trim()).filter(Boolean);
      if (cp[0]) photos.hero = cp[0];
      if (cp[1]) photos.about = cp[1];
      if (cp[2]) photos.g1 = cp[2];
      if (cp[3]) photos.g2 = cp[3];
      if (cp[4]) photos.g3 = cp[4];
      if (cp[5]) photos.g4 = cp[5];
    }

    let bookingCta = phone ? `tel:${phone}` : "#contact";
    let bookingLabel = "Call to Book";
    if (whatsapp) {
      bookingCta = `https://wa.me/${whatsapp}?text=Hi%2C+I'd+like+to+book`;
      bookingLabel = "Book on WhatsApp";
    } else if (bookingLink) {
      bookingCta = bookingLink;
      bookingLabel = "Book Now";
    }

    const servicesByCat = {
      barber: "Haircut €20 | Skin Fade €22 | Beard Trim €10 | Haircut + Beard €28 | Hot Towel Shave €18 | Kids Cut €14",
      restaurant: "Classic Smash Burger €14 | Double Smash €17 | Chicken Crispy €13 | Loaded Fries €8 | Onion Rings €6 | Milkshake €6",
      pub: "Draught Pints from €6 | Craft Beers | Pub Classics €14-18 | Live Music Weekends | Sunday Carvery €16",
      cafe: "Specialty Coffee €3.50 | Fresh Pastries €3 | Brunch €10-14 | Loose Leaf Teas | Homemade Cakes €5",
      salon: "Wash & Cut €35 | Colour from €60 | Highlights from €80 | Blowdry €25 | Treatment €20",
      nail: "Manicure €25 | Pedicure €35 | Gel Nails €40 | Nail Art from €5 | Removal €15",
      spa: "Full Body Massage €70 | Facial €55 | Hot Stone €85 | Aromatherapy €65 | Day Package €150",
      gym: "Day Pass €10 | Monthly €45 | Personal Training €50 | Group Classes €8 | Annual €399",
      dental: "Check-up €50 | Cleaning €70 | Whitening €250 | Fillings from €90 | Emergency Care",
      auto: "Full Service €120 | NCT Prep €60 | Brake Repair from €80 | Diagnostics €45 | Tyre Change €25",
      pet: "Full Groom from €40 | Bath & Brush €25 | Nail Clipping €12 | De-shedding €35 | Puppy Groom €30",
      tattoo: "Small Tattoo from €60 | Custom Design (quote) | Cover-ups | Piercings from €25 | Touch-ups",
      generic: "Consultation €30 | Standard Service €50 | Premium Service €80",
    };
    const defaultServices = services || servicesByCat[category];

    const hoursByCat = {
      barber: "Mon–Fri 9am–7pm | Sat 8am–6pm | Sun 10am–4pm",
      restaurant: "Mon–Thu 12pm–10pm | Fri–Sat 12pm–11pm | Sun 1pm–9pm",
      pub: "Mon–Thu 4pm–11:30pm | Fri–Sat 12pm–12:30am | Sun 12pm–11pm",
      cafe: "Mon–Fri 7:30am–5pm | Sat–Sun 8am–6pm",
      dental: "Mon–Fri 9am–5:30pm | Sat 9am–1pm | Sun Closed",
      auto: "Mon–Fri 8am–6pm | Sat 9am–1pm | Sun Closed",
      generic: "Mon–Fri 9am–6pm | Sat 10am–5pm | Sun Closed",
    };
    const defaultHours = hours || hoursByCat[category] || hoursByCat.generic;

    const paletteByCat = {
      barber: "Background #0d0d0d, Accent #b8923f (gold), Text #f0ece0, Cards #1a1a1a",
      restaurant: "Background #1a1410, Accent #d4622a (burnt orange), Text #f5efe6, Cards #2a1f1a",
      pub: "Background #1b2e22 (bottle green), Accent #c9933e (amber), Text #ede4d3, Cards #243d2e",
      cafe: "Background #faf7f2, Accent #6b4226 (espresso), Text #1a1410, Cards #f0e8d8",
      salon: "Background #faf7f4, Accent #c17a5a (terracotta), Text #3d2b24, Cards #f5ede6",
      nail: "Background #fdf8f5, Accent #e8a4b0 (blush), Text #2d1f1f, Cards #f8f0eb",
      spa: "Background #f5f0eb, Accent #8b7355 (taupe), Text #2a2018, Cards #ebe3d8",
      gym: "Background #0d0d0d, Accent #e0a829 (yellow), Text #f0f0f0, Cards #161718",
      dental: "Background #f8fbff, Accent #2563eb (blue), Text #1e2a3a, Cards #edf4ff",
      auto: "Background #161718, Accent #e0a829 (yellow), Text #eceeef, Cards #1f2224",
      pet: "Background #f0f9f4, Accent #2d9b6a (green), Text #1a3028, Cards #e4f5ec",
      tattoo: "Background #0a0a0a, Accent #c0392b (red), Text #f0f0f0, Cards #141414",
      generic: "Background #0f172a, Accent #3b82f6 (blue), Text #e2e8f0, Cards #1e293b",
    };

    const referenceSitesByCat = {
      restaurant: "https://www.theoneburgerbcn.com",
      pub: "https://www.mulligans.ie",
      barber: "https://www.gentlemansbarbers.com",
      cafe: "https://www.3fecafe.com",
      salon: "https://www.toni-and-guy.com",
      tattoo: "https://www.sanctuarytattoodublin.com",
      gym: "https://www.flyefit.ie",
      dental: "https://www.smilestudiodublin.ie",
      spa: "https://www.themillspa.ie",
      nail: "https://www.nailsbyivydublin.com",
      auto: "https://www.midas.ie",
      pet: "https://www.pawfectgrooming.ie",
      generic: "https://www.squarespace.com/templates",
    };

    const effectiveReferenceUrl = referenceUrl || referenceSitesByCat[category] || "";

    const heroSection = heroVideoBase64
      ? `HERO TYPE: VIDEO HERO (3D PREMIUM)
Use a full-screen HTML5 <video> tag: autoplay muted loop playsinline
src="${heroVideoBase64}"
Video: 100vw / 100vh, object-fit: cover, position absolute.
Dark gradient overlay rgba(0,0,0,0.5) on top.
Overlay content: bold headline, subtitle, 2 CTA buttons, rating badge.`
      : `HERO TYPE: PHOTO HERO
Hero background-image: ${photos.hero}
CSS background-image with dark overlay rgba(0,0,0,0.55), background-size:cover, background-position:center.`;

    const systemPrompt = `You are the lead designer at a premium digital agency in Dublin. You build websites that look like they cost €5,000 — custom, specific, never AI-generated looking.

DESIGN RULES:
- Typography with personality — import Google Fonts matching the vibe
- Color palette specific to this business category
- Hero section is unforgettable — bold, specific, memorable
- If VIDEO provided: full screen video hero is #1 priority
- Scroll animations with IntersectionObserver on every section
- Micro-interactions: hover effects, card lifts, image zooms
- Mobile-first — client sees this on phone during sales pitch
- Copy sounds LOCAL and SPECIFIC — never generic marketing speak
${effectiveReferenceUrl ? `- Use this as visual inspiration for layout quality: ${effectiveReferenceUrl}` : ""}

NEVER:
- Generic centered hero with flat gradient
- Numbered section markers (01/02/03)
- Excessive rounded corners everywhere
- Same layout for every business type

Output ONLY complete self-contained HTML. No markdown, no code fences. Start with <!DOCTYPE html>.

TECHNICAL:
- Inline all CSS and JS
- Section ids: about, services, gallery, reviews, faq, contact
- html { scroll-behavior: smooth; scroll-padding-top: 80px; }
- Every <img>: onerror="this.style.display='none'"
- Complete ALL sections — never stop before </html>`;

    let userPrompt;
    if (editInstruction && previousHtml) {
      userPrompt = `Current HTML:\n${previousHtml}\n\nApply this edit and return complete updated HTML:\n"${editInstruction}"`;
    } else {
      userPrompt = `Build a PREMIUM one-page website that closes a €699 sale on a phone screen.

PALETTE: ${suggestedColors || paletteByCat[category]}
FONTS: ${suggestedFonts || "Choose Google Fonts perfectly matching this business"}

${heroSection}

IMAGES (use exactly):
About photo: ${photos.about}
Gallery 1: ${photos.g1}
Gallery 2: ${photos.g2}
Gallery 3: ${photos.g3}
Gallery 4: ${photos.g4}

BOOKING: href="${bookingCta}" label="${bookingLabel}"

BUSINESS:
Name: ${businessName}
Type: ${businessType}
City: ${city || "Dublin, Ireland"}
Phone: ${phone || "+353 1 000 0000"}
Email: ${email || "info@" + businessName.toLowerCase().replace(/\s+/g,"") + ".ie"}
Address: ${address || "Dublin, Ireland"}
Services: ${defaultServices}
Rating: ${rating || "4.9"} (${reviewCount || "100+"} reviews)
Hours: ${defaultHours}
Vibe: ${vibe || "modern, welcoming, premium"}
Logo: ${logoUrl || businessName.toUpperCase()}
${heroHeadline ? `Hero Headline: ${heroHeadline}` : ""}
${heroSubtitle ? `Hero Subtitle: ${heroSubtitle}` : ""}
${aboutText ? `About: ${aboutText}` : ""}
${realReviews ? `Real reviews: ${realReviews}` : ""}
${googleMapsEmbed ? `Maps embed: ${googleMapsEmbed}` : ""}
${extraInfo ? `Extra: ${extraInfo}` : ""}

SECTIONS:
1. Sticky header: logo left, nav (About/Menu/Gallery/Reviews/FAQ/Contact), booking CTA right
2. Hero: FULL SCREEN per HERO TYPE above. Headline, subtitle, 2 CTAs, rating badge
3. <section id="about">: 2-column — image left, 3 paragraphs right, LOCAL specific copy
4. <section id="services">: 6 cards — emoji + name + price, styled to palette
5. <section id="gallery">: 4-photo grid with hover zoom
6. <section id="reviews">: large rating + 3 testimonials with Irish names${realReviews ? " — use real reviews provided" : ""}
7. <section id="faq">: 4 FAQ accordion (click open/close) specific to this business
8. <section id="contact">: address + phone + email + hours + ${googleMapsEmbed ? `Maps iframe src="${googleMapsEmbed}"` : "Maps iframe"} + booking CTA
9. Footer: name, tagline, copyright
10. Fixed WhatsApp button bottom-right (green, 58px) → ${bookingCta}

Add IntersectionObserver fadeInUp animations on sections.
Add hover micro-interactions per section.

Output ONLY raw HTML starting <!DOCTYPE html> ending </html>.`;
    }

    // Tenta Opus 4.8 primeiro, fallback para Sonnet 4.6
    const models = ["claude-sonnet-4-6", "claude-sonnet-4-6"];
    let html = "";
    let lastError = "";

    for (const model of models) {
      try {
        const body = {
          model,
          max_tokens: 16000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        };

        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify(body),
        });

        if (!anthropicRes.ok) {
          const errText = await anthropicRes.text();
          lastError = errText;
          continue; // tenta próximo modelo
        }

        const data = await anthropicRes.json();
        let candidate = (data.content || [])
          .map((b) => (b.type === "text" ? b.text : ""))
          .join("")
          .trim();

        candidate = candidate.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

        if (candidate.toLowerCase().includes("<!doctype") || candidate.toLowerCase().includes("<html")) {
          if (candidate.toLowerCase().includes("</html>")) {
            html = candidate;
            break; // sucesso, sai do loop
          }
        }
      } catch(e) {
        lastError = String(e);
        continue;
      }
    }

    if (!html) {
      return res.status(502).json({ error: "AI generation failed", detail: lastError });
    }

    return res.status(200).json({ html });

  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
