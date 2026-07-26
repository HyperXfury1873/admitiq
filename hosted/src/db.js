const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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

module.exports = {
  prisma,
  hashKey,
  resolveProjectFromAuth,
  bumpUsage,
  withinQuota,
  yearMonth,
  tierLimit,
};
