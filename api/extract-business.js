// API endpoint: Extract Business Data
// Recebe link do Google Maps (ou place_id) e extrai TODOS os dados do negócio
// incluindo fotos, horários, cardápio, avaliações, etc.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!GOOGLE_KEY) return res.status(500).json({ error: "Missing GOOGLE_PLACES_API_KEY" });
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" });

  try {
    const { googleMapsUrl = "", instagramUrl = "" } = req.body || {};

    if (!googleMapsUrl && !instagramUrl) {
      return res.status(400).json({ error: "Provide at least a Google Maps URL" });
    }

    let placeId = "";
    let businessData = {};

    // 1) Extrai place_id do link do Google Maps
    if (googleMapsUrl) {
      // Tenta extrair place_id direto da URL (formato: place_id=...)
      const pidMatch = googleMapsUrl.match(/place_id[=:]([A-Za-z0-9_-]+)/);
      if (pidMatch) {
        placeId = pidMatch[1];
      } else {
        // Tenta extrair o nome do negócio da URL e buscar via Text Search
        // URLs tipo: /maps/place/NOME+DO+NEGOCIO/
        const nameMatch = googleMapsUrl.match(/\/place\/([^\/\?@]+)/);
        if (nameMatch) {
          const searchQuery = decodeURIComponent(nameMatch[1].replace(/\+/g, " "));
          const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_KEY}`;
          const sRes = await fetch(searchUrl);
          const sData = await sRes.json();
          if (sData.results && sData.results[0]) {
            placeId = sData.results[0].place_id;
          }
        }

        // URL tipo maps.app.goo.gl (short link) - resolve o redirect
        if (!placeId && (googleMapsUrl.includes("goo.gl") || googleMapsUrl.includes("maps.app"))) {
          try {
            const redirectRes = await fetch(googleMapsUrl, { redirect: "follow" });
            const finalUrl = redirectRes.url;
            const pidFromRedirect = finalUrl.match(/place_id[=:]([A-Za-z0-9_-]+)/);
            if (pidFromRedirect) {
              placeId = pidFromRedirect[1];
            } else {
              const nameFromRedirect = finalUrl.match(/\/place\/([^\/\?@]+)/);
              if (nameFromRedirect) {
                const searchQuery = decodeURIComponent(nameFromRedirect[1].replace(/\+/g, " "));
                const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_KEY}`;
                const sRes = await fetch(searchUrl);
                const sData = await sRes.json();
                if (sData.results && sData.results[0]) {
                  placeId = sData.results[0].place_id;
                }
              }
            }
          } catch(e) {
            // ignore redirect errors
          }
        }
      }

      // 2) Busca detalhes completos do lugar
      if (placeId) {
        const fields = [
          "name", "formatted_phone_number", "website", "formatted_address",
          "rating", "user_ratings_total", "opening_hours", "price_level",
          "types", "photos", "reviews", "editorial_summary", "url",
          "international_phone_number", "business_status"
        ].join(",");

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_KEY}&language=en`;
        const dRes = await fetch(detailsUrl);
        const dData = await dRes.json();
        const r = dData.result || {};

        // Monta URLs das fotos (máx 6)
        const photoUrls = (r.photos || []).slice(0, 6).map(p =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${GOOGLE_KEY}`
        );

        // Formata horários
        const hoursText = r.opening_hours?.weekday_text?.join(" | ") || "";

        // Pega avaliações reais (máx 3)
        const reviewsText = (r.reviews || []).slice(0, 3).map(rv =>
          `"${rv.text}" — ${rv.author_name} (${rv.rating}★)`
        ).join("\n");

        // Detecta tipo de negócio
        const types = (r.types || []).join(", ");

        businessData = {
          name: r.name || "",
          phone: r.formatted_phone_number || r.international_phone_number || "",
          website: r.website || "",
          address: r.formatted_address || "",
          rating: r.rating || "",
          reviewCount: r.user_ratings_total || "",
          hours: hoursText,
          types: types,
          summary: r.editorial_summary?.overview || "",
          photoUrls: photoUrls,
          realReviews: reviewsText,
          googleMapsEmbed: placeId ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_KEY}&q=place_id:${placeId}` : "",
          placeId: placeId,
        };
      }
    }

    // 3) Usa Claude pra enriquecer os dados e estruturar o conteúdo do site
    const enrichPrompt = `You are a web content strategist. Based on the business data below, create a complete structured brief for building a premium website.

BUSINESS DATA FROM GOOGLE:
Name: ${businessData.name}
Type: ${businessData.types}
Address: ${businessData.address}
Phone: ${businessData.phone}
Rating: ${businessData.rating} (${businessData.reviewCount} reviews)
Hours: ${businessData.hours}
Summary: ${businessData.summary}
Real customer reviews: ${businessData.realReviews}
Instagram: ${instagramUrl || "not provided"}

OUTPUT a JSON object (no markdown, no code fences) with these exact keys:
{
  "businessName": "exact name",
  "businessType": "single category like: Burger Restaurant, Barbershop, Pub, Hair Salon, Tattoo Studio, etc",
  "city": "city and country",
  "phone": "phone number",
  "address": "full address",
  "rating": "rating number",
  "reviewCount": "number of reviews",
  "hours": "formatted opening hours",
  "vibe": "3 adjectives describing the atmosphere based on reviews and type",
  "services": "6 specific menu items or services with realistic prices in EUR format: Item €price | Item €price",
  "heroHeadline": "bold compelling headline specific to this business (not generic)",
  "heroSubtitle": "one sentence that captures what makes this place special",
  "aboutText": "2 sentences about this specific business that sound authentic and local",
  "suggestedColors": "specific color palette that fits this business type and vibe",
  "suggestedFonts": "Google Fonts pairing that fits this business personality"
}`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: enrichPrompt }],
      }),
    });

    const claudeData = await claudeRes.json();
    let enriched = {};
    try {
      let text = (claudeData.content || []).map(b => b.type === "text" ? b.text : "").join("").trim();
      text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      enriched = JSON.parse(text);
    } catch(e) {
      // se falhar o parse, usa dados brutos
      enriched = {
        businessName: businessData.name,
        businessType: businessData.types,
        city: businessData.address,
        phone: businessData.phone,
        rating: businessData.rating,
        reviewCount: businessData.reviewCount,
        hours: businessData.hours,
      };
    }

    return res.status(200).json({
      success: true,
      extracted: {
        ...enriched,
        photoUrls: businessData.photoUrls,
        googleMapsEmbed: businessData.googleMapsEmbed,
        placeId: businessData.placeId,
        realReviews: businessData.realReviews,
      }
    });

  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
