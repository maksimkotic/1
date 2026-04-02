import express from "express";
import cors from "cors";
import path from "node:path";
import { config } from "./config.js";
import { query } from "./db.js";
import { registerUser, requireAuth, signToken, verifyLogin } from "./auth.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));

// Optional: serve the static site from project root
const staticRoot = path.resolve(process.cwd(), "..");
app.use(express.static(staticRoot));

app.get("/", (_req, res) => {
  res.type("html").send(`
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>GeoEco Water API</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:24px;line-height:1.5}
      code{background:#f3f3f3;padding:2px 6px;border-radius:6px}
      ul{padding-left:18px}
    </style>
  </head>
  <body>
    <h2>Сервер запущен</h2>
    <p>API:</p>
    <ul>
      <li><code>GET /api/health</code></li>
      <li><code>POST /api/auth/register</code></li>
      <li><code>POST /api/auth/login</code></li>
      <li><code>GET /api/auth/me</code></li>
      <li><code>GET /api/posts</code></li>
    </ul>
    <p>Статика: можно открыть <code>/index.html</code>, <code>/about.html</code> и т.д.</p>
  </body>
</html>
  `.trim());
});

app.get("/api/health", async (_req, res) => {
  const r = await query("select 1 as ok");
  res.json({ ok: true, db: r.rows[0].ok });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "BAD_REQUEST" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "PASSWORD_TOO_SHORT" });
  }

  try {
    const user = await registerUser({ name: String(name), email, password });
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (e) {
    if (String(e?.message || "").includes("app_user_email_key")) {
      return res.status(409).json({ error: "EMAIL_TAKEN" });
    }
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "BAD_REQUEST" });
  }
  const user = await verifyLogin({ email, password });
  if (!user) return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  const token = signToken(user);
  return res.json({ token, user });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const userId = req.user?.sub;
  const { rows } = await query(
    `select id, name, email, created_at from app_user where id = $1`,
    [userId]
  );
  const user = rows[0];
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json({ user });
});

app.get("/api/posts", async (_req, res) => {
  const { rows } = await query(
    `select id, title, body, created_at from post order by created_at desc limit 20`
  );
  res.json({ items: rows });
});

const basePort = Number(config.port || 3001);

function listenWithFallback(startPort, maxTries = 10) {
  let port = startPort;
  let tries = 0;

  const server = app.listen(port, () => {
    console.log(`[server] listening on http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err?.code === "EADDRINUSE" && tries < maxTries) {
      tries += 1;
      port += 1;
      console.log(`[server] port ${port - 1} busy, trying ${port}...`);
      server.close(() => listenWithFallback(port, maxTries - tries));
      return;
    }
    console.error("[server] failed to start", err);
    process.exit(1);
  });
}

listenWithFallback(basePort);

