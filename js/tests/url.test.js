const test = require("node:test");
const assert = require("node:assert");
const { issue, verify } = require("../src/core");
const { embedInUrl, issueUrl, tokenFromUrl } = require("../src/url");

const SECRET = "url-test-secret";

test("issueUrl embeds a verifiable token", async () => {
  const url = issueUrl("https://example.com/scan", { seat: "A1" }, 60, SECRET);
  assert.ok(url.startsWith("https://example.com/scan?token="));
  const token = tokenFromUrl(url);
  const payload = await verify(token, SECRET);
  assert.strictEqual(payload.data.seat, "A1");
});

test("embedInUrl preserves existing query params", () => {
  const token = issue({ x: 1 }, 60, SECRET);
  const url = embedInUrl("https://example.com/scan?ref=web", token);
  assert.ok(url.includes("ref=web"));
  assert.ok(url.includes("token="));
  assert.strictEqual(tokenFromUrl(url), token);
});

test("custom schemes work", () => {
  const token = issue({ x: 1 }, 60, SECRET);
  const url = embedInUrl("myapp://checkin", token);
  assert.ok(url.startsWith("myapp://checkin"));
  assert.strictEqual(tokenFromUrl(url), token);
});

test("tokenFromUrl missing param throws", () => {
  assert.throws(() => tokenFromUrl("https://example.com/scan"), /No "token"/);
});
