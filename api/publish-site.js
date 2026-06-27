// API endpoint: publica um site no Vercel automaticamente.
// Recebe o HTML do site + um nome de projeto, cria/atualiza um deployment no Vercel
// usando a API oficial do Vercel, e devolve a URL pública (.vercel.app).

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  if (!VERCEL_TOKEN) return res.status(500).json({ error: "Missing VERCEL_TOKEN. Add it in environment variables." });

  // (Opcional) Se sua conta Vercel for de um time, configure VERCEL_TEAM_ID
  const TEAM_ID = process.env.VERCEL_TEAM_ID || "";
  const teamQuery = TEAM_ID ? `?teamId=${TEAM_ID}` : "";

  try {
    const { html = "", projectName = "" } = req.body || {};
    if (!html || !projectName) {
      return res.status(400).json({ error: "html and projectName are required" });
    }

    // Normaliza o nome do projeto: só letras minúsculas, números e hífen
    const safeName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 52) || "climber-site";

    // Cria um deployment no Vercel com o arquivo index.html inline.
    // A API de deployments aceita os arquivos diretamente no corpo.
    const deployBody = {
      name: safeName,
      files: [
        {
          file: "index.html",
          data: html,
        },
      ],
      projectSettings: {
        framework: null,
      },
      target: "production",
    };

    const vercelRes = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deployBody),
    });

    const data = await vercelRes.json();

    if (!vercelRes.ok) {
      return res.status(502).json({
        error: "Vercel publish failed",
        detail: data.error ? data.error.message : JSON.stringify(data),
      });
    }

    // A URL pública vem em data.url (sem https://) ou em data.alias
    const url = data.url ? `https://${data.url}` : null;
    const inspectorUrl = data.inspectorUrl || null;

    return res.status(200).json({
      url,
      inspectorUrl,
      projectName: safeName,
      deploymentId: data.id || null,
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
