const { test } = require("node:test");
const assert = require("node:assert/strict");
const { hashKey, yearMonth, tierLimit } = require("../src/db");

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
