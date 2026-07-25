/**
 * Tiny ticket desk: issue a token, then scan it (first scan OK, second blocked).
 *
 *   cd examples/express-ticket-check
 *   npm install
 *   npm start
 *
 * Then open http://localhost:3847
 */
const express = require("express");
const { issue, verify, TokenExpiredError, InvalidSignatureError, TokenRevokedError } = require("admitiq");

const SECRET = process.env.QRLOCK_SECRET || "demo-secret-change-me";
const used = new Set();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html><head><meta charset="utf-8"><title>admitiq ticket demo</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 16px;line-height:1.5}
  code,pre{background:#f4f4f5;padding:2px 6px;border-radius:4px}
  pre{padding:12px;overflow:auto}
  button{margin-right:8px;margin-top:8px;padding:8px 12px;cursor:pointer}
</style></head><body>
<h1>admitiq — Express ticket demo</h1>
<p>A <a href="https://logiclitz.org">LogicLitz</a> example. Issue a ticket, scan it twice, watch the second scan fail.</p>
<button id="issue">Issue ticket</button>
<button id="scan">Scan ticket</button>
<pre id="out">Click “Issue ticket” to start.</pre>
<script>
let token = null;
const out = document.getElementById("out");
document.getElementById("issue").onclick = async () => {
  const r = await fetch("/issue", { method: "POST" });
  const j = await r.json();
  token = j.token;
  out.textContent = "Issued:\\n" + token.slice(0, 48) + "...\\n\\nNow click Scan.";
};
document.getElementById("scan").onclick = async () => {
  if (!token) { out.textContent = "Issue a ticket first."; return; }
  const r = await fetch("/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const j = await r.json();
  out.textContent = JSON.stringify(j, null, 2);
};
</script>
</body></html>`);
});

app.post("/issue", (_req, res) => {
  const token = issue({ event: "demo-night", seat: "A12" }, 3600, SECRET);
  res.json({ token });
});

app.post("/scan", async (req, res) => {
  const token = req.body?.token;
  if (!token) return res.status(400).json({ ok: false, error: "missing token" });
  try {
    const payload = await verify(token, SECRET, (jti) => used.has(jti));
    used.add(payload.jti);
    res.json({ ok: true, data: payload.data, jti: payload.jti });
  } catch (err) {
    const status =
      err instanceof TokenExpiredError ||
      err instanceof InvalidSignatureError ||
      err instanceof TokenRevokedError
        ? 401
        : 500;
    res.status(status).json({ ok: false, error: err.message, type: err.name });
  }
});

const port = process.env.PORT || 3847;
app.listen(port, () => {
  console.log(`admitiq express demo → http://localhost:${port}`);
});
