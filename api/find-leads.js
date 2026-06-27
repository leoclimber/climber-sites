// API endpoint: Lead Finder.
// Busca negócios locais (por tipo + cidade) usando a Google Places API,
// e marca quais NÃO têm site (os melhores leads para vender um site).

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!GOOGLE_KEY) return res.status(500).json({ error: "Missing GOOGLE_PLACES_API_KEY" });

  try {
    const { businessType = "", city = "", onlyNoWebsite = true } = req.body || {};
    if (!businessType || !city) {
      return res.status(400).json({ error: "businessType and city are required" });
    }

    // 1) Text Search: acha os negócios pelo tipo + cidade
    const query = `${businessType} in ${city}`;
    const searchUrl =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(query)}&key=${GOOGLE_KEY}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
      return res.status(502).json({ error: "Google search failed", detail: searchData.status + " " + (searchData.error_message || "") });
    }

    const places = (searchData.results || []).slice(0, 20);

    // 2) Para cada lugar, pega detalhes (telefone, site) via Place Details
    const leads = [];
    for (const place of places) {
      try {
        const detailsUrl =
          `https://maps.googleapis.com/maps/api/place/details/json` +
          `?place_id=${place.place_id}` +
          `&fields=name,formatted_phone_number,website,formatted_address,rating,user_ratings_total` +
          `&key=${GOOGLE_KEY}`;
        const dRes = await fetch(detailsUrl);
        const dData = await dRes.json();
        const r = dData.result || {};
        const hasWebsite = !!r.website;

        const lead = {
          name: r.name || place.name || "",
          phone: r.formatted_phone_number || "",
          website: r.website || "",
          address: r.formatted_address || place.formatted_address || "",
          rating: r.rating || place.rating || null,
          reviews: r.user_ratings_total || place.user_ratings_total || null,
          hasWebsite,
        };

        if (onlyNoWebsite && hasWebsite) continue; // pula quem já tem site
        leads.push(lead);
      } catch (e) {
        // se falhar um lugar, ignora e continua
      }
    }

    return res.status(200).json({
      query,
      total: leads.length,
      leads,
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
