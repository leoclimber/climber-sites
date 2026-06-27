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
2. Build a deliberate token system: a palette of 4-6 hex colors specific to this business (NOT generic blue/gray defaults), a characterful display font + a clean body font (pair them intentionally via Google Fonts), and a clear type scale.
3. Pick ONE signature element this site will be remembered by (a striking hero treatment, an elegant section transition, a distinctive way of showing services).

CRITICAL QUALITY RULES — every site must hit these:
- Look like a €2000 agency site, never a template. Avoid the three generic AI looks: cream+serif+terracotta, near-black+acid-green, and broadsheet-with-hairlines. Make a real choice for THIS business.
- Mobile-first, fully responsive, flawless on phone and desktop.
- Real Google Font pairing suited to the business (import via <link>). Never default system fonts.
- Deliberate, tasteful color palette derived from the business type/vibe (or the colors given).
- Generous, consistent spacing. Strong visual hierarchy. Tasteful hover and scroll micro-interactions via CSS (but don't overdo animation — too much reads as AI-generated).
- Compelling, specific marketing copy in the business's language (default English for Ireland). Never lorem ipsum, never generic filler.
- Accessibility floor: good contrast, alt text on images, visible keyboard focus, respects reduced-motion.

REQUIRED SECTIONS in order: sticky header with logo + nav + booking button; hero with strong headline, subheadline and a clear call-to-action; about/story; services/offerings as cards; gallery using real photos; Google rating + testimonials; location/contact with phone, email, address, opening hours, and an embedded Google Maps iframe (maps search embed by address); footer.
- BOOKING / CONTACT is the single most important action for a local business. Always include a prominent "Book Now" / "Book on WhatsApp" button. If a WhatsApp number is provided, link to https://wa.me/NUMBER (digits only) with a pre-filled message "Hi, I'd like to book an appointment". If a booking link (Fresha, Booksy, Calendly) is provided, the main button links to it (new tab). Otherwise link to tel: the phone. Repeat the booking button in the hero, sticky header, and contact section.
- If opening hours are provided, show them in a clean table.
- For photos, use https://source.unsplash.com/1600x900/?KEYWORDS with keywords matching the business (vary them so images differ).
- LOGO: if a logo image URL is provided, use it as an <img> in the header/footer. Otherwise create an elegant text wordmark from the business name.`;

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
