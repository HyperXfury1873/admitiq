const express = require("express");
const { prisma, bumpUsage, withinQuota, yearMonth } = require("../db");

const router = express.Router();

router.post("/check", async (req, res) => {
  const jti = String(req.body?.jti || "").trim();
  if (!jti) return res.status(400).json({ error: "jti_required" });

  const quota = await withinQuota(req.project);
  if (!quota.ok) return res.status(402).json({ error: "quota_exceeded", ...quota });

  const existing = await prisma.revocationEvent.findUnique({
    where: { projectId_jti: { projectId: req.project.id, jti } },
  });
  await bumpUsage(req.project.id, "checks");

  return res.json({
    jti,
    revoked: Boolean(existing),
    usage: { used: quota.used + 1, limit: quota.limit },
  });
});

router.post("/revoke", async (req, res) => {
  const jti = String(req.body?.jti || "").trim();
  if (!jti) return res.status(400).json({ error: "jti_required" });

  const quota = await withinQuota(req.project);
  if (!quota.ok) return res.status(402).json({ error: "quota_exceeded", ...quota });

  try {
    await prisma.revocationEvent.create({
      data: {
        projectId: req.project.id,
        jti,
        action: "revoke",
        outcome: "revoked",
      },
    });
    await bumpUsage(req.project.id, "revokes");
    return res.json({ jti, revoked: true, first: true });
  } catch (err) {
    if (String(err.code) === "P2002") {
      await bumpUsage(req.project.id, "revokes");
      return res.json({ jti, revoked: true, first: false });
    }
    throw err;
  }
});

router.get("/usage", async (req, res) => {
  const quota = await withinQuota(req.project);
  res.json({
    tier: req.project.tier,
    yearMonth: yearMonth(),
    ...quota,
  });
});

module.exports = router;
