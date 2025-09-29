// api/nix.js
export default async function handler(req, res) {
  // Simple Bearer auth so only your GPT can call this proxy
  const ok = req.headers.authorization === `Bearer ${process.env.PROXY_TOKEN}`;
  if (!ok) return res.status(401).json({ error: "unauthorized" });

  // Which Nutritionix endpoint? default to natural/nutrients
  const path = req.query.path || "/v2/natural/nutrients";
  const base = "https://trackapi.nutritionix.com";

  // Forward query string for GET routes
  const qs = req.url.includes("?") ? "?" + req.url.split("?")[1] : "";
  const url = base + path + (req.method === "GET" ? qs : "");

  // Forward body for POST routes
  const opts = {
    method: req.method,
    headers: {
      "x-app-id": process.env.NIX_APP_ID,
      "x-app-key": process.env.NIX_APP_KEY,
      "Content-Type": "application/json",
    },
    body: req.method === "POST" ? JSON.stringify(req.body || {}) : undefined,
  };

  try {
    const r = await fetch(url, opts);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
