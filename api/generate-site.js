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
    const address = (body.address || "").substring(0, 200);
    const rating = (body.rating || "4.9").substring(0, 10);
    const reviewCount = (body.reviewCount || "100+").substring(0, 20);
    const hours = (body.hours || "").substring(0, 300);
    const services = (body.services || "").substring(0, 300);
    const editInstruction = (body.editInstruction || "").substring(0, 500);
    const previousHtml = (body.previousHtml || "").substring(0, 40000);

    if (!businessName || !businessType) {
      return res.status(400).json({ error: "businessName and businessType are required" });
    }

    const t = businessType.toLowerCase();
    let category = "generic";
    if (t.includes("burger") || t.includes("restaurant") || t.includes("food")) category = "restaurant";
    else if (t.includes("pub") || t.includes("bar")) category = "pub";
    else if (t.includes("barb")) category = "barber";
    else if (t.includes("cafe") || t.includes("coffee")) category = "cafe";
    else if (t.includes("salon") || t.includes("hair")) category = "salon";
    else if (t.includes("tattoo")) category = "tattoo";
    else if (t.includes("gym") || t.includes("fitness")) category = "gym";
    else if (t.includes("nail")) category = "nail";
    else if (t.includes("spa") || t.includes("aesthet")) category = "spa";
    else if (t.includes("dental") || t.includes("clinic")) category = "dental";
    else if (t.includes("auto") || t.includes("garage")) category = "auto";

    const heroes = {
      restaurant: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1600",
      pub: "https://images.pexels.com/photos/1267700/pexels-photo-1267700.jpeg?auto=compress&cs=tinysrgb&w=1600",
      barber: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1600",
      cafe: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1600",
      salon: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1600",
      tattoo: "https://images.pexels.com/photos/4123897/pexels-photo-4123897.jpeg?auto=compress&cs=tinysrgb&w=1600",
      gym: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1600",
      nail: "https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg?auto=compress&cs=tinysrgb&w=1600",
      spa: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1600",
      dental: "https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=1600",
      auto: "https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1600",
      generic: "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1600",
    };

    const palettes = {
      restaurant: "bg:#1a1410 accent:#d4622a text:#f5efe6",
      pub: "bg:#1b2e22 accent:#c9933e text:#ede4d3",
      barber: "bg:#0d0d0d accent:#b8923f text:#f0ece0",
      cafe: "bg:#faf7f2 accent:#6b4226 text:#1a1410",
      salon: "bg:#faf7f4 accent:#c17a5a text:#3d2b24",
      tattoo: "bg:#0a0a0a accent:#c0392b text:#f0f0f0",
      gym: "bg:#0d0d0d accent:#e0a829 text:#f0f0f0",
      nail: "bg:#fdf8f5 accent:#e8a4b0 text:#2d1f1f",
      spa: "bg:#f5f0eb accent:#8b7355 text:#2a2018",
      dental: "bg:#f8fbff accent:#2563eb text:#1e2a3a",
      auto: "bg:#161718 accent:#e0a829 text:#eceeef",
      generic: "bg:#0f172a accent:#3b82f6 text:#e2e8f0",
    };

    const heroImg = heroes[category];
    const palette = palettes[category];
    const bookingHref = phone ? `tel:${phone}` : "#contact";
    const defaultServices = services || "Service 1 €20 | Service 2 €30 | Service 3 €40 | Service 4 €50 | Service 5 €60 | Service 6 €70";
    const defaultHours = hours || "Mon-Fri 9am-6pm | Sat 10am-5pm | Sun Closed";

    let userPrompt;
    if (editInstruction && previousHtml) {
      userPrompt = `HTML:\n${previousHtml}\n\nApply this change: "${editInstruction}"\n\nReturn complete updated HTML only.`;
    } else {
      userPrompt = `Create a premium one-page website. Output ONLY raw HTML from <!DOCTYPE html> to </html>. No markdown.

Business: ${businessName}
Type: ${businessType}  
City: ${city}
Phone: ${phone || "+353 1 000 0000"}
Address: ${address || city}
Rating: ${rating} stars (${reviewCount} reviews)
Hours: ${defaultHours}
Services: ${defaultServices}
Color palette: ${palette}
Hero image: ${heroImg}
Booking link: ${bookingHref}

Requirements:
- Import Google Fonts matching this business personality
- Full-screen hero with this background image and dark overlay
- Sticky navigation header
- Sections: about, services (6 cards), gallery (4 photos from pexels), reviews (3 testimonials with Irish names), FAQ (4 items with accordion), contact with map
- Floating WhatsApp button bottom-right linking to ${bookingHref}
- IntersectionObserver scroll animations
- Mobile responsive
- Premium design specific to this business type
- All CSS and JS inline
- Section ids: about, services, gallery, reviews, faq, contact`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 10000,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: "AI failed", detail: err.substring(0, 500) });
    }

    const data = await response.json();
    let html = (data.content || []).map(b => b.type === "text" ? b.text : "").join("").trim();
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    if (!html.includes("</html>")) {
      return res.status(502).json({ error: "Incomplete HTML, try again" });
    }

    return res.status(200).json({ html });

  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e).substring(0, 200) });
  }
}
