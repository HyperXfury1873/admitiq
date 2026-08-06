const express = require("express");
const {
  prisma,
  bumpUsage,
  withinQuota,
  yearMonth,
  normalizeJti,
  errorShape,
  consumeJti,
} = require("../db");

const router = express.Router();

router.post("/check", async (req, res) => {
  const jtiCheck = normalizeJti(req.body?.jti);
  if (!jtiCheck.ok) {
    return res.status(400).json(errorShape(jtiCheck.code, jtiCheck.message, req.requestId));
  }
  const jti = jtiCheck.value;

  const quota = await withinQuota(req.project);
  if (!quota.ok) {
    return res
      .status(429)
      .json(errorShape("quota_exceeded", "Monthly operation limit reached", req.requestId, false, quota));
  }

  const existing = await prisma.revocationEvent.findUnique({
    where: { projectId_jti: { projectId: req.project.id, jti } },
  });
  await bumpUsage(req.project.id, "checks");

  return res.json({
    jti,
    revoked: Boolean(existing),
    state: existing ? "revoked" : "fresh",
    usage: { used: quota.used + 1, limit: quota.limit },
  });
});

router.post("/revoke", async (req, res) => {
  const jtiCheck = normalizeJti(req.body?.jti);
  if (!jtiCheck.ok) {
    return res.status(400).json(errorShape(jtiCheck.code, jtiCheck.message, req.requestId));
  }
  const jti = jtiCheck.value;

  const quota = await withinQuota(req.project);
  if (!quota.ok) {
    return res
      .status(429)
      .json(errorShape("quota_exceeded", "Monthly operation limit reached", req.requestId, false, quota));
  }

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
    return res.json({ jti, revoked: true, first: true, state: "revoked" });
  } catch (err) {
    if (String(err.code) === "P2002") {
      await bumpUsage(req.project.id, "revokes");
      return res.json({ jti, revoked: true, first: false, state: "already_revoked" });
    }
    throw err;
  }
});

router.post("/tokens/consume", async (req, res) => {
  const jtiCheck = normalizeJti(req.body?.jti);
  if (!jtiCheck.ok) {
    return res.status(400).json(errorShape(jtiCheck.code, jtiCheck.message, req.requestId));
  }
  const jti = jtiCheck.value;

  const quota = await withinQuota(req.project);
  if (!quota.ok) {
    return res
      .status(429)
      .json(errorShape("quota_exceeded", "Monthly operation limit reached", req.requestId, false, quota));
  }

  const result = await consumeJti(req.project.id, jti);
  await bumpUsage(req.project.id, "revokes");
  return res.json({
    jti,
    state: result.state,
    first: result.first,
    admitted: result.first,
  });
});

router.post("/tokens/check", async (req, res) => {
  const jtiCheck = normalizeJti(req.body?.jti);
  if (!jtiCheck.ok) {
    return res.status(400).json(errorShape(jtiCheck.code, jtiCheck.message, req.requestId));
  }
  const jti = jtiCheck.value;
  const quota = await withinQuota(req.project);
  if (!quota.ok) {
    return res
      .status(429)
      .json(errorShape("quota_exceeded", "Monthly operation limit reached", req.requestId, false, quota));
  }
  const existing = await prisma.revocationEvent.findUnique({
    where: { projectId_jti: { projectId: req.project.id, jti } },
  });
  await bumpUsage(req.project.id, "checks");
  return res.json({
    jti,
    revoked: Boolean(existing),
    state: existing ? "revoked" : "fresh",
    usage: { used: quota.used + 1, limit: quota.limit },
  });
});

router.post("/tokens/revoke", async (req, res) => {
  const jtiCheck = normalizeJti(req.body?.jti);
  if (!jtiCheck.ok) {
    return res.status(400).json(errorShape(jtiCheck.code, jtiCheck.message, req.requestId));
  }
  const jti = jtiCheck.value;
  const quota = await withinQuota(req.project);
  if (!quota.ok) {
    return res
      .status(429)
      .json(errorShape("quota_exceeded", "Monthly operation limit reached", req.requestId, false, quota));
  }
  try {
    await prisma.revocationEvent.create({
      data: { projectId: req.project.id, jti, action: "revoke", outcome: "revoked" },
    });
    await bumpUsage(req.project.id, "revokes");
    return res.json({ jti, revoked: true, first: true, state: "revoked" });
  } catch (err) {
    if (String(err.code) === "P2002") {
      await bumpUsage(req.project.id, "revokes");
      return res.json({ jti, revoked: true, first: false, state: "already_revoked" });
    }
    throw err;
  }
});

router.post("/tokens/unrevoke", async (req, res) => {
  const jtiCheck = normalizeJti(req.body?.jti);
  if (!jtiCheck.ok) {
    return res.status(400).json(errorShape(jtiCheck.code, jtiCheck.message, req.requestId));
  }
  const jti = jtiCheck.value;

  await prisma.revocationEvent.deleteMany({
    where: { projectId: req.project.id, jti },
  });
  return res.json({ jti, state: "fresh", unrevoked: true });
});

router.get("/usage", async (req, res) => {
  const quota = await withinQuota(req.project);
  res.json({
    tier: req.project.tier,
    yearMonth: yearMonth(),
    ...quota,
  });
});

router.get("/analytics", async (req, res) => {
  const ym = yearMonth();
  const usage = await prisma.usageMonth.findUnique({
    where: { projectId_yearMonth: { projectId: req.project.id, yearMonth: ym } },
  });
  const events = await prisma.revocationEvent.groupBy({
    by: ["outcome"],
    where: { projectId: req.project.id },
    _count: { outcome: true },
  });

  const outcomes = {};
  for (const row of events) outcomes[row.outcome] = row._count.outcome;
  res.json({
    yearMonth: ym,
    checks: usage?.checks || 0,
    revokes: usage?.revokes || 0,
    outcomes,
  });
});

module.exports = router;
