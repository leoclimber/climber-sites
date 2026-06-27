// API endpoint: gera um site completo em HTML usando a IA da Anthropic (Claude)
// Recebe os dados do negócio e devolve o HTML pronto do site.

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

    const systemPrompt = `You are the lead designer at a premium web agency. Your job is to generate a COMPLETE, STUNNING, FULLY POPULATED one-page website for local businesses. You output ONLY a complete self-contained HTML file with inline <style> and <script>. No markdown, no explanations, no code fences — raw HTML starting with <!DOCTYPE html>.

═══════════════════════════════════════
CONTENT GENERATION RULES (CRITICAL)
═══════════════════════════════════════
You MUST invent realistic, professional content for ANY field that is empty or missing. Never leave a section empty. Never write placeholder text like "Lorem ipsum" or "[Add your text here]".

For a BARBERSHOP, if services are not provided, always include these realistic services with prices:
- Haircut — €20
- Skin Fade — €22
- Beard Trim — €10
- Haircut + Beard — €28
- Hot Towel Shave — €18
- Kids Cut (under 12) — €14
- Hair + Beard + Eyebrows — €32

For a BARBERSHOP about section, write something like:
"At [Name], we believe a great cut is more than just a haircut — it's the detail, the craft, and the confidence you walk out with. Based in [City], we've built a reputation for precision fades, clean lines, and a welcoming atmosphere where every client feels at home. Whether you're after a sharp skin fade or a classic trim, our barbers bring their A-game every single time."

For TESTIMONIALS, if not provided, invent 3 realistic 5-star Google reviews appropriate for the business type. For barbershop:
- "Best fade in [City]. I've been coming here for 2 years and never once been disappointed. The attention to detail is unreal." — Conor M.
- "Walked in without an appointment and still got seen quickly. Great atmosphere, great cut, great price. Highly recommend." — Jamie O.
- "My son and I both get our hair done here. Always consistent, always friendly. Wouldn't go anywhere else." — David R.

For OPENING HOURS, if not provided, use realistic hours for the business type. For barbershop:
Mon–Fri: 9:00am – 7:00pm | Sat: 8:00am – 6:00pm | Sun: 10:00am – 4:00pm

Apply the same principle to ALL business types: restaurants, salons, nail bars, gyms, etc. Always invent realistic, convincing content that makes the site look 100% real and ready to launch.

═══════════════════════════════════════
DESIGN RULES
═══════════════════════════════════════
1. Design specifically for THIS business type. A barbershop = dark, masculine, gold accents, bold typography. A nail salon = soft, elegant, pastel. A restaurant = warm, appetite-driven, rustic or modern. Never use a generic template look.
2. Google Fonts: pick a bold display font + clean body font. Import both via <link>.
3. Add smooth scroll: html { scroll-behavior: smooth; }
4. Sticky header that shrinks slightly on scroll (use JS scroll listener + CSS class).
5. Hover effects on all buttons, cards, nav links.
6. Fully mobile responsive using CSS Grid and Flexbox.

═══════════════════════════════════════
PHOTOS
═══════════════════════════════════════
Use ONLY these Pexels URLs. Never use Lorem Picsum or source.unsplash.com.

BARBERSHOP:
- Hero (1600w): https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1600
- Gallery: https://images.pexels.com/photos/897262/pexels-photo-897262.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/2061828/pexels-photo-2061828.jpeg?auto=compress&cs=tinysrgb&w=800
- About photo: https://images.pexels.com/photos/3356170/pexels-photo-3356170.jpeg?auto=compress&cs=tinysrgb&w=800

RESTAURANT / CAFE:
- Hero: https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600
- Gallery: https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=800
- About: https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800

HAIR SALON / BEAUTY:
- Hero: https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1600
- Gallery: https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/3738338/pexels-photo-3738338.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800
- About: https://images.pexels.com/photos/3738347/pexels-photo-3738347.jpeg?auto=compress&cs=tinysrgb&w=800

NAIL SALON:
- Hero: https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg?auto=compress&cs=tinysrgb&w=1600
- Gallery: https://images.pexels.com/photos/939836/pexels-photo-939836.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/3997385/pexels-photo-3997385.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/1526170/pexels-photo-1526170.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg?auto=compress&cs=tinysrgb&w=800
- About: https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=800

GYM / FITNESS:
- Hero: https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1600
- Gallery: https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=800
- Gallery: https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800
- About: https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=800

GENERIC FALLBACK:
- Hero: https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1600
- Gallery/About: https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=800

If client photo URLs are provided, use those FIRST in the gallery.
If logo URL is provided, use it as <img> in header. Otherwise make a CSS text wordmark.

═══════════════════════════════════════
REQUIRED SECTIONS — ALL MANDATORY
═══════════════════════════════════════

1. STICKY HEADER — logo left, nav center (About, Services, Gallery, Reviews, Contact), Book Now button right. Shrinks on scroll via JS.

2. HERO (#hero) — full-screen background image with dark overlay, large bold headline, subheadline, two CTAs (Book Now + Our Services). Include Google rating badge if rating provided.

3. ABOUT (#about) — two-column layout: photo left, text right. Write a compelling 3-paragraph story about the business. Include founding story, values, what makes them different.

4. SERVICES (#services) — grid of cards. Each card: icon (emoji or SVG), service name, short description, price. Minimum 6 services.

5. GALLERY (#gallery) — CSS masonry or grid, minimum 4 photos. Title: "Our Work" or "Gallery".

6. REVIEWS (#reviews) — Google rating (large stars + number), then 3 testimonial cards with name, stars, review text.

7. CONTACT (#contact) — two columns: left has phone, email, address, opening hours table; right has Google Maps iframe. Below: large Book Now CTA button.

8. FOOTER — logo, tagline, nav links, social icons (Instagram, Facebook), copyright.

═══════════════════════════════════════
BOOKING CTA
═══════════════════════════════════════
- WhatsApp number provided → https://wa.me/NUMBER?text=Hi%2C+I%27d+like+to+book+an+appointment
- Booking link provided → link directly (target="_blank")
- Otherwise → tel:PHONE
- Place booking button in: header, hero, contact section.`;

    let userPrompt;
    if (editInstruction && previousHtml) {
      userPrompt = `Here is the current website HTML:\n\n${previousHtml}\n\nApply this change requested by the user, keeping everything else intact and still returning the FULL complete HTML file:\n\n"${editInstruction}"`;
    } else {
      userPrompt = `Build a complete one-page website for this business. For any field that is empty, invent realistic professional content — do NOT skip any section.

Business name: ${businessName}
Type of business: ${businessType}
City/Location: ${city || "Dublin, Ireland"}
Phone: ${phone || ""}
Email: ${email || ""}
Address: ${address || ""}
Services/offerings: ${services || "(not provided — invent realistic services with prices for this business type)"}
Google rating: ${rating || "5.0"}${reviewCount ? ` (${reviewCount} reviews)` : " (invent a realistic review count)"}
Opening hours: ${hours || "(not provided — invent realistic hours for this business type)"}
WhatsApp number: ${whatsapp || ""}
Booking link: ${bookingLink || ""}
Desired vibe/style: ${vibe || "(choose the ideal vibe for this business type)"}
Brand colors: ${colors || "(choose ideal colors for this business type)"}
Logo URL: ${logoUrl || ""}
Client photos: ${clientPhotos || ""}
Extra info: ${extraInfo || ""}

Output ONLY the raw HTML. Make it look like a €2,000 agency-built site.`;
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

    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    if (!html.toLowerCase().includes("<!doctype") && !html.toLowerCase().includes("<html")) {
      return res.status(502).json({ error: "AI did not return valid HTML" });
    }

    return res.status(200).json({ html });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
