// API endpoint: liga um domínio personalizado a um projeto já publicado no Vercel.
// Recebe o nome do projeto (safeName) e o domínio que o cliente comprou.
// Devolve as instruções de DNS que o cliente precisa configurar no registrador (Namecheap, GoDaddy, etc).

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  if (!VERCEL_TOKEN) return res.status(500).json({ error: "Missing VERCEL_TOKEN" });

  const TEAM_ID = process.env.VERCEL_TEAM_ID || "";
  const teamQuery = TEAM_ID ? `?teamId=${TEAM_ID}` : "";

  try {
    const { projectName = "", domain = "" } = req.body || {};
    if (!projectName || !domain) {
      return res.status(400).json({ error: "projectName and domain are required" });
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    // Adiciona o domínio ao projeto no Vercel
    const addRes = await fetch(
      `https://api.vercel.com/v10/projects/${encodeURIComponent(projectName)}/domains${teamQuery}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cleanDomain }),
      }
    );

    const data = await addRes.json();

    if (!addRes.ok) {
      return res.status(502).json({
        error: "Domain attach failed",
        detail: data.error ? data.error.message : JSON.stringify(data),
      });
    }

    // Instruções de DNS padrão do Vercel para o cliente configurar no registrador
    const dnsInstructions = {
      aRecord: { type: "A", name: "@", value: "76.76.21.21" },
      cnameRecord: { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
    };

    return res.status(200).json({
      domain: cleanDomain,
      verified: data.verified || false,
      dnsInstructions,
      note: "Peça ao cliente para adicionar esses registros no painel do registrador (onde ele comprou o domínio). Pode levar de minutos a algumas horas para funcionar.",
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
