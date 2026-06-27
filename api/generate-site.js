// API endpoint: gera um site completo em HTML usando a IA da Anthropic (Claude)
// Recebe os dados do negócio e devolve o HTML pronto do site.

export default async function handler(req, res) {
  // CORS básico
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

    // Monta o prompt para a IA gerar (ou editar) o site
    const systemPrompt = `You are the design lead at a boutique studio known for giving every local business a distinctive visual identity that could never be mistaken for a template. You output ONLY a complete, self-contained HTML file (with inline <style> and minimal inline <script> if needed). No markdown, no explanations, no code fences — just raw HTML starting with <!DOCTYPE html>.

YOUR DESIGN PROCESS (do this silently, then output only the final HTML):
1. Ground the design in THIS specific business. A barbershop's world (chrome, leather, classic masculine craft) is different from a nail salon's (soft, elegant, pastel) or a pizzeria's (warm, rustic, appetite). Derive every choice from the business type and vibe.
2. Build a deliberate token system: a palette of 4-6 hex colors specific to this business, a characterful display font + a clean body font (pair them intentionally via Google Fonts), and a clear type scale.
3. Pick ONE signature element this site will be remembered by.

PHOTOS: Use Lorem Picsum which always works reliably: https://picsum.photos/seed/SEED/WIDTH/HEIGHT
- Hero background image: https://picsum.photos/seed/biz1/1600/900
- Use different seeds for each image so they vary: biz1, biz2, biz3, biz4, biz5, biz6
- Gallery needs at least 4 images, each with a different seed
- For barbershop use seeds like: barber1, barber2, barber3, fade1, cut1
- For restaurant: food1, food2, chef1, dining1, plate1
- For salon: salon1, salon2, beauty1, hair1, style1
- NEVER leave image src empty. Every <img> must have a real picsum URL.
- If client photo URLs are provided, use those in gallery instead of picsum.
- LOGO: if a logo URL is provided use it as <img> in header. Otherwise create elegant CSS text wordmark.

QUALITY RULES — every site must hit 9/10:
- Look like a €2000 agency site. Make deliberate, specific choices for THIS business type.
- Mobile-first, fully responsive, flawless on phone and desktop.
- Real Google Font pairing (import via <link>). Display font with personality + clean body font.
- Generous spacing, strong visual hierarchy, tasteful CSS hover/scroll micro-interactions.
- Compelling, specific marketing copy. Never lorem ipsum or generic filler.
- Accessibility: good contrast, alt text on all images, keyboard-focusable nav.
- The hero section MUST have a full-screen background image or split image layout — never a plain colored background with no photo.

REQUIRED SECTIONS: sticky header with logo + nav + booking CTA button; full-screen hero with background photo, strong headline and subheadline; about/story section with photo; services as visual cards; photo gallery (minimum 4 photos in a grid); Google rating + 3 testimonials; location/contact with phone, address, opening hours table, and embedded Google Maps iframe (use address-based search embed: https://maps.google.com/maps?q=ADDRESS&output=embed); footer with links and copyright.

BOOKING is the #1 priority for local businesses:
- If WhatsApp number provided: main CTA links to https://wa.me/NUMBER with message "Hi, I'd like to book an appointment"
- If booking link (Fresha/Booksy/Calendly) provided: main CTA links to it (target="_blank")  
- Otherwise: CTA links to tel:PHONE
- Repeat the booking button in: sticky header, hero section, and contact section.`;

    let userPrompt;
    if (editInstruction && previousHtml) {
      userPrompt = `Here is the current website HTML:\n\n${previousHtml}\n\nApply this change requested by the user, keeping everything else intact and still returning the FULL complete HTML file:\n\n"${editInstruction}"`;
    } else {
      userPrompt = `Build a complete one-page website for this business:

Business name: ${businessName}
Type of business: ${businessType}
City/Location: ${city}
Phone: ${phone}
Email: ${email}
Address: ${address}
Services/offerings: ${services}
Google rating: ${rating}${reviewCount ? ` (${reviewCount} reviews)` : ""}
Opening hours: ${hours}
WhatsApp number (for booking button): ${whatsapp}
Booking link (Fresha/Booksy/Calendly, if any): ${bookingLink}
Desired vibe/style: ${vibe}
Brand colors (if any): ${colors}
Logo image URL (if any): ${logoUrl}
Client photos (use these in the gallery if provided, one URL per line): ${clientPhotos}
Extra info: ${extraInfo}

Remember: output ONLY the raw HTML file, nothing else.`;
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
        max_tokens: 8000,
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

    // Remove cercas de código se a IA tiver colocado por engano
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    if (!html.toLowerCase().includes("<!doctype") && !html.toLowerCase().includes("<html")) {
      return res.status(502).json({ error: "AI did not return valid HTML" });
    }

    return res.status(200).json({ html });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
