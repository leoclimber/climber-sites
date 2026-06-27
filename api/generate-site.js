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
      editInstruction = "", previousHtml = "",
    } = req.body || {};

    if (!businessName || !businessType) {
      return res.status(400).json({ error: "businessName and businessType are required" });
    }

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

    const defaultServices = t.includes("barb")
      ? "Haircut €20 | Skin Fade €22 | Beard Trim €10 | Haircut + Beard €28 | Hot Towel Shave €18 | Kids Cut €14"
      : t.includes("restaurant") || t.includes("cafe") || t.includes("food")
      ? "Starters €8-12 | Mains €16-24 | Desserts €7 | Daily Specials | Coffee & Drinks"
      : t.includes("salon") || t.includes("hair")
      ? "Wash & Cut €35 | Colour from €60 | Highlights from €80 | Blowdry €25 | Treatment €20"
      : t.includes("nail")
      ? "Manicure €25 | Pedicure €35 | Gel Nails €40 | Nail Art from €5 | Removal €15"
      : t.includes("gym") || t.includes("fitness")
      ? "Day Pass €10 | Monthly €45 | Personal Training €50 | Group Classes €8 | Annual €399"
      : services || "Consultation €30 | Standard Service €50 | Premium Service €80";

    const defaultHours = t.includes("barb")
      ? "Mon–Fri 9am–7pm | Sat 8am–6pm | Sun 10am–4pm"
      : t.includes("restaurant") || t.includes("cafe")
      ? "Mon–Thu 12pm–10pm | Fri–Sat 12pm–11pm | Sun 1pm–9pm"
      : "Mon–Fri 9am–6pm | Sat 10am–5pm | Sun Closed";

    const systemPrompt = `You are a senior web designer. Output ONLY a complete self-contained HTML file with inline CSS and JS. No markdown, no code fences — start directly with <!DOCTYPE html>.

CRITICAL RULES:
- Use EXACTLY the image URLs provided in the prompt — do not change them
- Section ids must be exactly: about, services, gallery, reviews, contact
- Add to CSS: html { scroll-behavior: smooth; scroll-padding-top: 80px; }
- Sticky header with nav linking to #about #services #gallery #reviews #contact
- Hero must use the provided hero image as CSS background-image with a dark overlay
- All sections must have visible content — no empty sections
- Invent realistic about text (3 paragraphs), 3 testimonials with Irish names
- Design must strongly reflect the business type visually
- Mobile responsive using flexbox and grid`;

    let userPrompt;
    if (editInstruction && previousHtml) {
      userPrompt = `Current HTML:\n${previousHtml}\n\nApply this edit and return the complete HTML:\n"${editInstruction}"`;
    } else {
      userPrompt = `Build a complete one-page website using these exact details:

IMAGES (use these exact URLs):
Hero background-image: ${photos.hero}
About photo src: ${photos.about}
Gallery img 1: ${photos.g1}
Gallery img 2: ${photos.g2}
Gallery img 3: ${photos.g3}
Gallery img 4: ${photos.g4}

BOOKING: href="${bookingCta}" label="${bookingLabel}" — place in header, hero, contact

BUSINESS:
Name: ${businessName}
Type: ${businessType}
City: ${city || "Dublin, Ireland"}
Phone: ${phone || "+353 1 000 0000"}
Email: ${email || "info@business.ie"}
Address: ${address || "Dublin, Ireland"}
Services: ${services || defaultServices}
Rating: ${rating || "5.0"} (${reviewCount || "100+"} reviews)
Hours: ${hours || defaultHours}
Vibe: ${vibe || "professional and modern"}
Colors: ${colors || "dark background with gold accents"}
Logo: ${logoUrl || businessName.toUpperCase()}

REQUIRED SECTIONS:
1. Sticky header: logo left, nav center, booking button right
2. Hero: full-screen CSS background-image with dark overlay, bold headline, 2 CTA buttons
3. <section id="about">: 2 columns — photo left, 3 paragraphs right
4. <section id="services">: 6 service cards with emoji, name, price
5. <section id="gallery">: 4-photo CSS grid
6. <section id="reviews">: rating + 3 testimonial cards
7. <section id="contact">: hours + phone + address + Google Maps iframe + booking button
8. Footer: name, tagline, copyright

Output ONLY raw HTML starting with <!DOCTYPE html>.`;
    }

    // Streaming para evitar timeout do Vercel
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 6000,
        stream: true,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(502).json({ error: "AI generation failed", detail: errText });
    }

    const reader = anthropicRes.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              fullText += parsed.delta.text;
            }
          } catch (_) {}
        }
      }
    }

    let html = fullText.trim();
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    if (!html.toLowerCase().includes("<!doctype") && !html.toLowerCase().includes("<html")) {
      return res.status(502).json({ error: "AI did not return valid HTML", detail: html.slice(0, 300) });
    }

    return res.status(200).json({ html });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
