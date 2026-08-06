const { test } = require("node:test");
const assert = require("node:assert/strict");
const { hashKey, yearMonth, tierLimit, normalizeJti, errorShape } = require("../src/db");

test("hashKey is stable sha256 hex", () => {
  const a = hashKey("aq_live_test");
  const b = hashKey("aq_live_test");
  assert.equal(a, b);
  assert.equal(a.length, 64);
});

test("yearMonth format", () => {
  assert.match(yearMonth(new Date("2026-07-26T00:00:00Z")), /^\d{4}-\d{2}$/);
});

test("tierLimit free default", () => {
  assert.ok(tierLimit("free") >= 1000);
  assert.ok(tierLimit("starter") > tierLimit("free"));
});

test("normalizeJti validates missing and max length", () => {
  const missing = normalizeJti("");
  assert.equal(missing.ok, false);
  assert.equal(missing.code, "jti_required");

  const tooLong = normalizeJti("x".repeat(257));
  assert.equal(tooLong.ok, false);
  assert.equal(tooLong.code, "jti_too_long");

  const good = normalizeJti(" abc ");
  assert.equal(good.ok, true);
  assert.equal(good.value, "abc");
});

test("errorShape returns stable envelope", () => {
  const e = errorShape("quota_exceeded", "limit reached", "req_1", false, { used: 10, limit: 10 });
  assert.equal(e.error.code, "quota_exceeded");
  assert.equal(e.error.message, "limit reached");
  assert.equal(e.error.request_id, "req_1");
  assert.equal(e.error.retryable, false);
  assert.deepEqual(e.error.details, { used: 10, limit: 10 });
});
