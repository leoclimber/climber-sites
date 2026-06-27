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
      businessName = "",
      businessType = "",
      city = "",
      phone = "",
      email = "",
      address = "",
      services = "",
      rating = "",
      reviewCount = "",
      vibe = "",
      colors = "",
      logoUrl = "",
      clientPhotos = "",
      extraInfo = "",
      whatsapp = "",
      bookingLink = "",
      hours = "",
      editInstruction = "",
      previousHtml = "",
    } = req.body || {};

    if (!businessName || !businessType) {
      return res.status(400).json({ error: "businessName and businessType are required" });
    }

    // Determina fotos pelo tipo de negócio
    const t = (businessType || "").toLowerCase();
    let photos = {
      hero: "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1600",
      about: "https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=800",
      g1: "https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=800",
      g2: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800",
      g3: "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800",
      g4: "https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=800",
    };
    if (t.includes("barb")) {
      photos = {
        hero: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/3356170/pexels-photo-3356170.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/897262/pexels-photo-897262.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/2061828/pexels-photo-2061828.jpeg?auto=compress&cs=tinysrgb&w=800",
      };
    } else if (t.includes("restaurant") || t.includes("cafe") || t.includes("food") || t.includes("pizz")) {
      photos = {
        hero: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=800",
      };
    } else if (t.includes("salon") || t.includes("hair") || t.includes("beauty")) {
      photos = {
        hero: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/3738347/pexels-photo-3738347.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/3738338/pexels-photo-3738338.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800",
      };
    } else if (t.includes("nail")) {
      photos = {
        hero: "https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/939836/pexels-photo-939836.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/3997385/pexels-photo-3997385.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/1526170/pexels-photo-1526170.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800",
      };
    } else if (t.includes("gym") || t.includes("fitness")) {
      photos = {
        hero: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1600",
        about: "https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=800",
        g1: "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800",
        g2: "https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=800",
        g3: "https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=800",
        g4: "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800",
      };
    }

    // Se cliente enviou fotos próprias, usa elas na galeria
    if (clientPhotos && clientPhotos.trim()) {
      const cp = clientPhotos.trim().split("\n").map(u => u.trim()).filter(Boolean);
      if (cp[0]) photos.g1 = cp[0];
      if (cp[1]) photos.g2 = cp[1];
      if (cp[2]) photos.g3 = cp[2];
      if (cp[3]) photos.g4 = cp[3];
      if (cp[4]) photos.about = cp[4];
    }

    // Determina o CTA de booking
    let bookingCta = `tel:${phone || ""}`;
    let bookingLabel = "Call to Book";
    if (whatsapp) {
      bookingCta = `https://wa.me/${whatsapp}?text=Hi%2C+I'd+like+to+book+an+appointment`;
      bookingLabel = "Book on WhatsApp";
    } else if (bookingLink) {
      bookingCta = bookingLink;
      bookingLabel = "Book Now";
    }

    const systemPrompt = `You are a senior web designer. Output ONLY a complete self-contained HTML file. No markdown, no code fences — raw HTML starting with <!DOCTYPE html>.

Rules:
- Invent realistic content for any missing field (services, hours, testimonials, about text)
- All section ids MUST be exactly: about, services, gallery, reviews, contact
- html { scroll-behavior: smooth; scroll-padding-top: 80px; }
- Mobile responsive, Google Fonts, hover effects
- Design must match the business type (barbershop = dark/gold/masculine, etc.)
- Compelling copy, never placeholder text
- Keep total HTML under 4000 words to ensure fast generation`;

    let userPrompt;
    if (editInstruction && previousHtml) {
      userPrompt = `Current HTML:\n${previousHtml}\n\nApply this edit and return full HTML:\n"${editInstruction}"`;
    } else {
      const defaultServices = t.includes("barb")
        ? "Haircut €20, Skin Fade €22, Beard Trim €10, Haircut + Beard €28, Hot Towel Shave €18, Kids Cut €14"
        : t.includes("restaurant") || t.includes("cafe")
        ? "Starters €8-12, Mains €16-24, Desserts €7, Daily Specials, Coffee & Drinks"
        : t.includes("salon") || t.includes("hair")
        ? "Wash & Cut €35, Colour from €60, Highlights from €80, Blowdry €25, Treatment €20"
        : t.includes("nail")
        ? "Manicure €25, Pedicure €35, Gel Nails €40, Nail Art from €5, Removal €15"
        : t.includes("gym") || t.includes("fitness")
        ? "Day Pass €10, Monthly €45, Personal Training €50/session, Group Classes €8, Annual €399"
        : services || "Main Service €30, Premium Service €50, Consultation €20";

      const defaultHours = t.includes("barb")
        ? "Mon–Fri: 9am–7pm | Sat: 8am–6pm | Sun: 10am–4pm"
        : t.includes("restaurant") || t.includes("cafe")
        ? "Mon–Thu: 12pm–10pm | Fri–Sat: 12pm–11pm | Sun: 1pm–9pm"
        : "Mon–Fri: 9am–6pm | Sat: 10am–5pm | Sun: Closed";

      userPrompt = `Build a complete one-page website. Use these EXACT image URLs (already chosen for you — do not change them):
Hero background: ${photos.hero}
About photo: ${photos.about}
Gallery photo 1: ${photos.g1}
Gallery photo 2: ${photos.g2}
Gallery photo 3: ${photos.g3}
Gallery photo 4: ${photos.g4}
Logo URL: ${logoUrl || "(none — use CSS text wordmark)"}

Booking CTA href: ${bookingCta}
Booking CTA label: "${bookingLabel}"

Business details:
Name: ${businessName}
Type: ${businessType}
City: ${city || "Dublin, Ireland"}
Phone: ${phone || "(invent a realistic Irish number)"}
Email: ${email || ""}
Address: ${address || "(invent a realistic address in " + (city || "Dublin") + ")"}
Services: ${services || defaultServices}
Google rating: ${rating || "5.0"} (${reviewCount || "100+"} reviews)
Hours: ${hours || defaultHours}
Vibe: ${vibe || "(choose best for this business type)"}
Colors: ${colors || "(choose best for this business type)"}
Extra: ${extraInfo || ""}

Generate ALL sections: sticky header, hero, #about, #services, #gallery, #reviews, #contact, footer.
Invent compelling about text (3 paragraphs), 3 realistic testimonials, all content.
Output ONLY raw HTML.`;
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
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

    return res.status(200).json({ html });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
