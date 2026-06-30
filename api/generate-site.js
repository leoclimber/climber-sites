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
      heroVideoUrl = "",
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
        hero: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600",
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
      if (cp[0]) photos.g1 = cp[0];
      if (cp[1]) photos.g2 = cp[1];
      if (cp[2]) photos.g3 = cp[2];
      if (cp[3]) photos.g4 = cp[3];
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
      restaurant: "Starters €8-12 | Mains €16-24 | Desserts €7 | Daily Specials | Sunday Roast €18",
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

    // Paletas premium por categoria
    const paletteByCat = {
      barber: "Background: #0d0d0d, Accent: #b8923f (gold), Text: #f0ece0, Secondary: #1a1a1a",
      restaurant: "Background: #1a1410, Accent: #d4622a (burnt orange), Text: #f5efe6, Secondary: #2a1f1a",
      pub: "Background: #1b2e22 (bottle green), Accent: #c9933e (amber), Text: #ede4d3, Secondary: #243d2e",
      cafe: "Background: #faf7f2, Accent: #6b4226 (espresso), Text: #1a1410, Secondary: #f0e8d8",
      salon: "Background: #faf7f4, Accent: #c17a5a (terracotta), Text: #3d2b24, Secondary: #f5ede6",
      nail: "Background: #fdf8f5, Accent: #e8a4b0 (blush rose), Text: #2d1f1f, Secondary: #f8f0eb",
      spa: "Background: #f5f0eb, Accent: #8b7355 (warm taupe), Text: #2a2018, Secondary: #ebe3d8",
      gym: "Background: #0d0d0d, Accent: #e0a829 (yellow), Text: #f0f0f0, Secondary: #161718",
      dental: "Background: #f8fbff, Accent: #2563eb (blue), Text: #1e2a3a, Secondary: #edf4ff",
      auto: "Background: #161718, Accent: #e0a829 (industrial yellow), Text: #eceeef, Secondary: #1f2224",
      pet: "Background: #f0f9f4, Accent: #2d9b6a (forest green), Text: #1a3028, Secondary: #e4f5ec",
      tattoo: "Background: #0a0a0a, Accent: #c0392b (blood red), Text: #f0f0f0, Secondary: #141414",
      generic: "Background: #0f172a, Accent: #3b82f6 (blue), Text: #e2e8f0, Secondary: #1e293b",
    };

    const heroSection = heroVideoUrl
      ? `HERO TYPE: VIDEO HERO
Hero video URL: ${heroVideoUrl}
The hero must use a full-screen <video> tag (autoplay muted loop playsinline) with this video as source.
The video covers 100% width and height of the viewport (100vw / 100vh), object-fit: cover.
Overlay a dark semi-transparent gradient on top of the video (rgba 0,0,0,0.5).
On top of the overlay: bold headline, subtitle, 2 CTA buttons, and rating badge.
This video IS the hero — no background-image fallback needed.`
      : `HERO TYPE: PHOTO HERO
Hero background-image: ${photos.hero}
Use as CSS background-image with dark overlay (rgba 0,0,0,0.55), background-size: cover, background-position: center.`;

    const systemPrompt = `You are the lead designer at a premium digital agency known for building sites that look custom-made, never AI-generated or templated. Every site you build looks like it was made by a real studio for a specific client.

ABSOLUTE DESIGN RULES — follow all of these:
- Choose a color palette that fits THIS specific business — use the palette provided in the prompt
- Typography must carry personality — use Google Fonts that match the business vibe (import them)
- DO NOT use generic centered hero text + flat gradient + stock button
- DO NOT use generic numbered section markers (01/02/03) unless content is genuinely sequential
- DO NOT use excessive rounded corners and soft shadows on every single element
- The hero is the most important moment — make it bold, specific, memorable
- If a VIDEO URL is provided for the hero, use a full-screen <video> tag — this is the #1 priority visual element
- If NO video, use the photo as hero background with a strong typographic statement
- Use scroll-triggered fade-in animations (IntersectionObserver) on sections for a premium feel
- One deliberate hover micro-interaction per section (card lift, underline reveal, image zoom)
- Mobile-first responsive design — most clients see this on their phone during a sales call
- Copy must sound local and specific — never generic marketing speak like "quality you can trust"

Output ONLY a complete self-contained HTML file with inline CSS and JS. No markdown, no code fences — start directly with <!DOCTYPE html>.

CRITICAL TECHNICAL RULES:
- Use EXACTLY the image URLs provided — do not change them
- Section ids must be exactly: about, services, gallery, reviews, faq, contact
- Add to CSS: html { scroll-behavior: smooth; scroll-padding-top: 80px; }
- Sticky header with nav linking to #about #services #gallery #reviews #faq #contact
- All sections must have visible content — no empty sections
- On EVERY <img> tag add: onerror="this.style.display='none'"
- Invent realistic about text (3 paragraphs), 3 testimonials with local-sounding names, 4 FAQ items
- MUST complete ALL sections through to closing </html> — never stop early`;

    let userPrompt;
    if (editInstruction && previousHtml) {
      userPrompt = `Current HTML:\n${previousHtml}\n\nApply this edit and return the complete updated HTML:\n"${editInstruction}"`;
    } else {
      userPrompt = `Build a complete one-page premium website. This needs to look good enough to close a €699 sale on a phone screen during a cold call.

PALETTE TO USE:
${paletteByCat[category]}

${heroSection}

IMAGES (use these exact URLs):
About photo src: ${photos.about}
Gallery img 1: ${photos.g1}
Gallery img 2: ${photos.g2}
Gallery img 3: ${photos.g3}
Gallery img 4: ${photos.g4}

BOOKING: href="${bookingCta}" label="${bookingLabel}" — place in header, hero, contact, and floating WhatsApp button

BUSINESS:
Name: ${businessName}
Type: ${businessType}
City: ${city || "Dublin, Ireland"}
Phone: ${phone || "+353 1 000 0000"}
Email: ${email || "info@business.ie"}
Address: ${address || "Dublin, Ireland"}
Services: ${defaultServices}
Rating: ${rating || "5.0"} (${reviewCount || "100+"} reviews)
Hours: ${defaultHours}
Vibe: ${vibe || "professional and modern"}
Colors: ${colors || "use the palette above"}
Logo: ${logoUrl || businessName.toUpperCase()}
Extra info: ${extraInfo || ""}

REQUIRED SECTIONS (in this order):
1. Sticky header: logo left, nav center (About/Services/Gallery/Reviews/FAQ/Contact), booking button right
2. Hero: full-screen — see HERO TYPE above. Bold headline specific to this business, subtitle, 2 CTA buttons, rating badge
3. <section id="about">: 2 columns — photo left, 3 paragraphs right with local specific copy, badge
4. <section id="services">: 6 service cards with emoji, name, price — styled to match business palette
5. <section id="gallery">: 4-photo CSS grid with hover zoom effect
6. <section id="reviews">: big rating number + 3 testimonial cards with Irish-sounding names
7. <section id="faq">: 4 FAQ items with accordion open/close, relevant to this business
8. <section id="contact">: address, phone, email, hours table + Google Maps iframe + booking button
9. Footer: name, tagline, copyright
10. Floating WhatsApp button (fixed bottom-right, green, 58px) linking to booking URL

Output ONLY raw HTML starting with <!DOCTYPE html> and ending with </html>.`;
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(502).json({ error: "AI generation failed", detail: errText });
    }

    const data = await anthropicRes.json();
    let html = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    if (!html.toLowerCase().includes("<!doctype") && !html.toLowerCase().includes("<html")) {
      return res.status(502).json({ error: "AI did not return valid HTML" });
    }

    if (!html.toLowerCase().includes("</html>")) {
      return res.status(502).json({ error: "Generation incomplete, please try again" });
    }

    return res.status(200).json({ html });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
