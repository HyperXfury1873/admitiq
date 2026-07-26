const test = require("node:test");
const assert = require("node:assert");
const {
  issue,
  verify,
  TokenExpiredError,
  InvalidSignatureError,
  TokenRevokedError,
} = require("../src/core");

const SECRET = "test-secret";

test("issue and verify roundtrip", async () => {
  const token = issue({ ticketId: "abc123" }, 60, SECRET);
  const payload = await verify(token, SECRET);
  assert.strictEqual(payload.data.ticketId, "abc123");
  assert.ok(payload.iat && payload.exp && payload.jti);
});

test("expired token throws", async () => {
  const token = issue({ ticketId: "abc123" }, -1, SECRET);
  await assert.rejects(() => verify(token, SECRET), TokenExpiredError);
});

test("tampered signature throws", async () => {
  const token = issue({ ticketId: "abc123" }, 60, SECRET);
  const tampered = token.slice(0, -2) + "xx";
  await assert.rejects(() => verify(tampered, SECRET), InvalidSignatureError);
});

test("wrong secret throws", async () => {
  const token = issue({ ticketId: "abc123" }, 60, SECRET);
  await assert.rejects(() => verify(token, "wrong-secret"), InvalidSignatureError);
});

test("revoked token throws", async () => {
  const token = issue({ ticketId: "abc123" }, 60, SECRET);
  await assert.rejects(
    () => verify(token, SECRET, () => true),
    TokenRevokedError
  );
});

test("malformed token throws", async () => {
  await assert.rejects(() => verify("not-a-real-token", SECRET), InvalidSignatureError);
});

test("verifyWithSecrets accepts previous secret during rotation", async () => {
  const { verifyWithSecrets } = require("../src/core");
  const token = issue({ ticketId: "abc123" }, 60, "old-secret");
  const payload = await verifyWithSecrets(token, ["new-secret", "old-secret"]);
  assert.strictEqual(payload.data.ticketId, "abc123");
});

test("verifyWithSecrets rejects when no secret matches", async () => {
  const { verifyWithSecrets } = require("../src/core");
  const token = issue({ ticketId: "abc123" }, 60, SECRET);
  await assert.rejects(
    () => verifyWithSecrets(token, ["a", "b"]),
    InvalidSignatureError
  );
});

test("rejects empty HMAC secret", () => {
  assert.throws(() => issue({ ticketId: "x" }, 60, ""), InvalidSignatureError);
});

test("rejects non-finite ttlSeconds", () => {
  assert.throws(() => issue({ ticketId: "x" }, NaN, SECRET), InvalidSignatureError);
  assert.throws(() => issue({ ticketId: "x" }, Infinity, SECRET), InvalidSignatureError);
});

test("rejects token missing exp claim", async () => {
  const crypto = require("crypto");
  function b64urlEncode(buffer) {
    return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function sign(message, secret) {
    return b64urlEncode(crypto.createHmac("sha256", secret).update(message).digest());
  }
  const header = { alg: "HS256", typ: "QRT", v: 1 };
  const body = { iat: Math.floor(Date.now() / 1000), jti: "abc", data: { x: 1 } };
  const hb = b64urlEncode(Buffer.from(JSON.stringify(header)));
  const bb = b64urlEncode(Buffer.from(JSON.stringify(body)));
  const si = `${hb}.${bb}`;
  const tok = `${si}.${sign(si, SECRET)}`;
  await assert.rejects(() => verify(tok, SECRET), InvalidSignatureError);
});
