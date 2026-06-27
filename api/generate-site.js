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

    const systemPrompt = `You are the design lead at a boutique studio known for giving every local business a distinctive visual identity that could never be mistaken for a template. You output ONLY a complete, self-contained HTML file (with inline <style> and minimal inline <script> if needed). No markdown, no explanations, no code fences — just raw HTML starting with <!DOCTYPE html>.

YOUR DESIGN PROCESS (do this silently, then output only the final HTML):
1. Ground the design in THIS specific business. A barbershop's world (chrome, leather, classic masculine craft) is different from a nail salon's (soft, elegant, pastel) or a pizzeria's (warm, rustic, appetite). Derive every choice from the business type and vibe.
2. Build a deliberate token system: a palette of 4-6 hex colors specific to this business, a characterful display font + a clean body font (pair them intentionally via Google Fonts), and a clear type scale.
3. Pick ONE signature element this site will be remembered by.

PHOTOS: Use Pexels direct image URLs. These are real, permanent URLs that always work. Choose from this curated list based on business type and append the size query string as shown.

BARBERSHOP / BARBER:
- Hero: https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1600
- https://images.pexels.com/photos/897262/pexels-photo-897262.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/2061828/pexels-photo-2061828.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/3356170/pexels-photo-3356170.jpeg?auto=compress&cs=tinysrgb&w=800

RESTAURANT / CAFE:
- Hero: https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600
- https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=800

HAIR SALON / BEAUTY:
- Hero: https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1600
- https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/3738338/pexels-photo-3738338.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800

NAIL SALON:
- Hero: https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg?auto=compress&cs=tinysrgb&w=1600
- https://images.pexels.com/photos/939836/pexels-photo-939836.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/3997385/pexels-photo-3997385.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/1526170/pexels-photo-1526170.jpeg?auto=compress&cs=tinysrgb&w=800

GYM / FITNESS:
- Hero: https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1600
- https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=800

CLEANING / HOME SERVICES:
- Hero: https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=1600
- https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=800

GENERIC FALLBACK (use if no category matches):
- Hero: https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1600
- https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=800
- https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800

RULES:
- NEVER use Lorem Picsum. NEVER use source.unsplash.com. NEVER leave img src empty.
- Always use the exact URLs above with the query string appended.
- If client photo URLs are provided, use those FIRST in the gallery, then fill remaining slots with Pexels URLs.
- LOGO: if a logo URL is provided use it as <img> in header. Otherwise create elegant CSS text wordmark.

QUALITY RULES — every site must hit 9/10:
- Look like a €2000 agency site. Make deliberate, specific choices for THIS business type.
- Mobile-first, fully responsive, flawless on phone and desktop.
- Real Google Font pairing (import via <link>). Display font with personality + clean body font.
- Generous spacing, strong visual hierarchy, tasteful CSS hover/scroll micro-interactions.
- Compelling, specific marketing copy. Never lorem ipsum or generic filler.
- Accessibility: good contrast, alt text on all images, keyboard-focusable nav.
- The hero section MUST have a full-screen background image or split image layout — never a plain colored background with no photo.

REQUIRED SECTIONS (all must be present and nav links must anchor to them):
1. Sticky header with logo + nav links (#about #services #gallery #reviews #contact) + booking CTA button
2. Full-screen hero (#hero) with background photo, strong headline and subheadline + booking CTA
3. About/story section (#about) with photo
4. Services as visual cards (#services)
5. Photo gallery (#gallery) — minimum 4 photos in a grid
6. Google rating + 3 testimonials (#reviews)
7. Location/contact (#contact) with phone, address, opening hours table, and embedded Google Maps iframe using: https://maps.google.com/maps?q=URLENCODE_ADDRESS&output=embed
8. Footer with links and copyright

IMPORTANT: Every nav link must use href="#sectionid" so clicking scrolls to that section. Add scroll-behavior: smooth to the html element.

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
