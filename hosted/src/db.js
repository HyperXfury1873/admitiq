const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const JTI_MAX_LEN = 256;

function yearMonth(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function hashKey(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function tierLimit(tier) {
  const free = Number(process.env.FREE_TIER_LIMIT || 1000);
  if (tier === "starter") return 25000;
  if (tier === "growth") return 250000;
  return free;
}

async function resolveProjectFromAuth(header) {
  if (!header || !header.startsWith("Bearer ")) return null;
  const raw = header.slice(7).trim();
  if (!raw) return null;

  const bootstrap = (process.env.ADMITIQ_API_KEYS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (bootstrap.includes(raw)) {
    let project = await prisma.project.findFirst({ where: { name: "bootstrap" } });
    if (!project) {
      project = await prisma.project.create({ data: { name: "bootstrap", tier: "free" } });
    }
    return project;
  }

  const key = await prisma.apiKey.findUnique({
    where: { keyHash: hashKey(raw) },
    include: { project: true },
  });
  if (!key || key.revokedAt) return null;
  return key.project;
}

async function bumpUsage(projectId, field) {
  const ym = yearMonth();
  const row = await prisma.usageMonth.upsert({
    where: { projectId_yearMonth: { projectId, yearMonth: ym } },
    create: { projectId, yearMonth: ym, checks: field === "checks" ? 1 : 0, revokes: field === "revokes" ? 1 : 0 },
    update: field === "checks" ? { checks: { increment: 1 } } : { revokes: { increment: 1 } },
  });
  return row;
}

async function withinQuota(project) {
  const ym = yearMonth();
  const usage = await prisma.usageMonth.findUnique({
    where: { projectId_yearMonth: { projectId: project.id, yearMonth: ym } },
  });
  const used = (usage?.checks || 0) + (usage?.revokes || 0);
  return { ok: used < tierLimit(project.tier), used, limit: tierLimit(project.tier) };
}

function normalizeJti(input) {
  const jti = String(input || "").trim().normalize("NFKC");
  if (!jti) return { ok: false, code: "jti_required", message: "jti is required" };
  if (jti.length > JTI_MAX_LEN) {
    return { ok: false, code: "jti_too_long", message: `jti exceeds ${JTI_MAX_LEN} chars` };
  }
  return { ok: true, value: jti };
}

function errorShape(code, message, requestId, retryable = false, details = undefined) {
  return {
    error: {
      code,
      message,
      retryable,
      request_id: requestId,
      ...(details ? { details } : {}),
    },
  };
}

async function consumeJti(projectId, jti) {
  try {
    await prisma.revocationEvent.create({
      data: {
        projectId,
        jti,
        action: "consume",
        outcome: "consumed",
      },
    });
    return { first: true, state: "consumed" };
  } catch (err) {
    if (String(err.code) === "P2002") {
      return { first: false, state: "already_consumed" };
    }
    throw err;
  }
}

module.exports = {
  prisma,
  hashKey,
  resolveProjectFromAuth,
  bumpUsage,
  withinQuota,
  yearMonth,
  tierLimit,
  normalizeJti,
  errorShape,
  consumeJti,
};
