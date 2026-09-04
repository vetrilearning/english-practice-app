// Minimal backend that keeps your Anthropic API key private.
// The mobile app calls POST /api/chat with { system, messages, max_tokens }
// and this server forwards the request to Anthropic, attaching the key
// from an environment variable (never from the frontend).

const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "1mb" }));

// --- CORS -------------------------------------------------------------
// Restrict this to the actual origin(s) your app runs from once you
// know them (your GitHub Pages URL, your custom domain, etc).
// Example: cors({ origin: "https://yourname.github.io" })
const rawOrigins = process.env.ALLOWED_ORIGINS;
const allowedOrigins =
  !rawOrigins || rawOrigins.trim() === "*"
    ? "*"
    : rawOrigins.split(",").map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));

// --- very simple rate limiting per IP ---------------------------------
const rateLimitWindowMs = 60 * 1000;
const rateLimitMax = 20;
const hits = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, start: now };
  if (now - entry.start > rateLimitWindowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > rateLimitMax) {
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }
  next();
}

// --- health check -------------------------------------------------------
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "English Practice backend is running." });
});

// --- main chat proxy ------------------------------------------------------
app.post("/api/chat", rateLimit, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });
  }

  const { system, messages, max_tokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Request must include a non-empty 'messages' array." });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: Math.min(max_tokens || 1000, 1500),
        system: system || undefined,
        messages
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data });
    }

    res.json(data);
  } catch (err) {
    console.error("Upstream request failed:", err);
    res.status(502).json({ error: "Failed to reach Claude API." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`English Practice backend listening on port ${PORT}`);
});
