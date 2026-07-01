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

    if (googleMapsUrl) {

      // 1) Tenta extrair place_id direto da URL
      const pidMatch = googleMapsUrl.match(/place_id[=:]([A-Za-z0-9_-]+)/);
      if (pidMatch) {
        placeId = pidMatch[1];
      }

      // 2) Tenta extrair coordenadas do link longo (@lat,lng)
      if (!placeId) {
        const coordMatch = googleMapsUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        const nameMatch = googleMapsUrl.match(/\/place\/([^\/\?@]+)/);

        if (coordMatch && nameMatch) {
          const lat = coordMatch[1];
          const lng = coordMatch[2];
          const searchName = decodeURIComponent(nameMatch[1].replace(/\+/g, " "));

          // Busca com localização usando coordenadas
          const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=100&keyword=${encodeURIComponent(searchName)}&key=${GOOGLE_KEY}`;
          const nearbyRes = await fetch(nearbyUrl);
          const nearbyData = await nearbyRes.json();

          if (nearbyData.results && nearbyData.results[0]) {
            placeId = nearbyData.results[0].place_id;
          }

          // Se não achou por nearby, tenta textsearch com localização
          if (!placeId) {
            const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchName)}&location=${lat},${lng}&radius=500&key=${GOOGLE_KEY}`;
            const textRes = await fetch(textUrl);
            const textData = await textRes.json();
            if (textData.results && textData.results[0]) {
              placeId = textData.results[0].place_id;
            }
          }
        } else if (nameMatch) {
          // Sem coordenadas, busca só pelo nome
          const searchName = decodeURIComponent(nameMatch[1].replace(/\+/g, " "));
          const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchName)}&key=${GOOGLE_KEY}`;
          const textRes = await fetch(textUrl);
          const textData = await textRes.json();
          if (textData.results && textData.results[0]) {
            placeId = textData.results[0].place_id;
          }
        }
      }

      // 3) Resolve links curtos (goo.gl, maps.app.goo.gl, share.google)
      if (!placeId && (googleMapsUrl.includes("goo.gl") || googleMapsUrl.includes("maps.app") || googleMapsUrl.includes("share.google"))) {
        try {
          const redirectRes = await fetch(googleMapsUrl, { redirect: "follow" });
          const finalUrl = redirectRes.url;

          const pidFromRedirect = finalUrl.match(/place_id[=:]([A-Za-z0-9_-]+)/);
          if (pidFromRedirect) {
            placeId = pidFromRedirect[1];
          } else {
            const coordFromRedirect = finalUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            const nameFromRedirect = finalUrl.match(/\/place\/([^\/\?@]+)/);

            if (coordFromRedirect && nameFromRedirect) {
              const lat = coordFromRedirect[1];
              const lng = coordFromRedirect[2];
              const searchName = decodeURIComponent(nameFromRedirect[1].replace(/\+/g, " "));

              const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=100&keyword=${encodeURIComponent(searchName)}&key=${GOOGLE_KEY}`;
              const nearbyRes = await fetch(nearbyUrl);
              const nearbyData = await nearbyRes.json();
              if (nearbyData.results && nearbyData.results[0]) {
                placeId = nearbyData.results[0].place_id;
              }
            }
          }
        } catch(e) {
          // ignore redirect errors
        }
      }

      // 4) Busca detalhes completos com o place_id
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

        const photoUrls = (r.photos || []).slice(0, 6).map(p =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${GOOGLE_KEY}`
        );

        const hoursText = r.opening_hours?.weekday_text?.join(" | ") || "";

        const reviewsText = (r.reviews || []).slice(0, 3).map(rv =>
          `"${rv.text}" — ${rv.author_name} (${rv.rating}★)`
        ).join("\n");

        businessData = {
          name: r.name || "",
          phone: r.formatted_phone_number || r.international_phone_number || "",
          website: r.website || "",
          address: r.formatted_address || "",
          rating: r.rating || "",
          reviewCount: r.user_ratings_total || "",
          hours: hoursText,
          types: (r.types || []).join(", "),
          summary: r.editorial_summary?.overview || "",
          photoUrls,
          realReviews: reviewsText,
          googleMapsEmbed: placeId ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_KEY}&q=place_id:${placeId}` : "",
          placeId,
        };
      }
    }

    if (!businessData.name) {
      return res.status(404).json({ error: "Não consegui encontrar esse negócio. Tente copiar o link completo do Google Maps no navegador do computador." });
    }

    // 5) Claude enriquece os dados
    const enrichPrompt = `You are a web content strategist. Based on the business data below, create a structured brief for a premium website.

BUSINESS DATA:
Name: ${businessData.name}
Type: ${businessData.types}
Address: ${businessData.address}
Phone: ${businessData.phone}
Rating: ${businessData.rating} (${businessData.reviewCount} reviews)
Hours: ${businessData.hours}
Summary: ${businessData.summary}
Real reviews: ${businessData.realReviews}
Instagram: ${instagramUrl || "not provided"}

OUTPUT only a JSON object (no markdown, no code fences) with these keys:
{
  "businessName": "exact name",
  "businessType": "single category: Burger Restaurant, Barbershop, Pub, Hair Salon, Tattoo Studio, Cafe, etc",
  "city": "city and country only",
  "phone": "phone number",
  "address": "full address",
  "rating": "rating number",
  "reviewCount": "number",
  "hours": "formatted hours",
  "vibe": "3 adjectives describing the atmosphere",
  "services": "6 specific items with realistic EUR prices: Item €price | Item €price",
  "heroHeadline": "bold compelling headline specific to this business",
  "heroSubtitle": "one sentence capturing what makes this place special",
  "aboutText": "2 authentic sentences about this specific business",
  "suggestedColors": "specific hex color palette fitting this business",
  "suggestedFonts": "Google Fonts pairing fitting this business personality"
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
      enriched = {
        businessName: businessData.name,
        businessType: businessData.types,
        city: businessData.address,
        phone: businessData.phone,
        rating: String(businessData.rating),
        reviewCount: String(businessData.reviewCount),
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
