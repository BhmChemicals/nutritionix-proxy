// api/nix.js
export default async function handler(req, res) {
  // --- simple bearer auth ---
  const ok = req.headers.authorization === `Bearer ${process.env.PROXY_TOKEN}`;
  if (!ok) return res.status(401).json({ error: "unauthorized" });

  const base = "https://trackapi.nutritionix.com";

  // read ?path=/v2/... and remove it from the query string we forward
  const urlObj = new URL(req.url, "http://localhost"); // base not used
  const path = urlObj.searchParams.get("path") || "/v2/natural/nutrients";
  urlObj.searchParams.delete("path"); // <— DO NOT forward 'path'

  // rebuild query string without 'path'
  const qs = urlObj.searchParams.toString();
  const target = base + path + (req.method === "GET" && qs ? `?${qs}` : "");

  const headers = {
    "x-app-id": process.env.NIX_APP_ID,
    "x-app-key": process.env.NIX_APP_KEY,
    "Content-Type": "application/json",
  };

  try {
    const r = await fetch(target, {
      method: req.method,
      headers,
      body: req.method === "POST" ? JSON.stringify(req.body || {}) : undefined,
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
