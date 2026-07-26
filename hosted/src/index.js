const express = require("express");
const { resolveProjectFromAuth } = require("./db");
const v1 = require("./routes/v1");
const { createCheckoutSession } = require("./stripe");

const app = express();
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "admitiq-hosted" });
});

app.use(async (req, res, next) => {
  if (!req.path.startsWith("/v1/")) return next();
  try {
    const project = await resolveProjectFromAuth(req.headers.authorization || "");
    if (!project) return res.status(401).json({ error: "unauthorized" });
    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/v1", v1);

app.post("/v1/billing/checkout", async (req, res, next) => {
  try {
    const tier = req.body?.tier === "growth" ? "growth" : "starter";
    const base = process.env.PUBLIC_BASE_URL || "http://localhost:8787";
    const session = await createCheckoutSession({
      projectId: req.project.id,
      tier,
      successUrl: req.body?.successUrl || `${base}/billing/success`,
      cancelUrl: req.body?.cancelUrl || `${base}/billing/cancel`,
    });
    res.json({ url: session.url, id: session.id });
  } catch (err) {
    if (err.status === 501) return res.status(501).json({ error: err.message });
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

const port = Number(process.env.PORT || 8787);
if (require.main === module) {
  app.listen(port, () => {
    console.log(`admitiq-hosted listening on :${port}`);
  });
}

module.exports = app;
