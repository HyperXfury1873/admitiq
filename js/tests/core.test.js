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
