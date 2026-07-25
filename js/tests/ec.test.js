const test = require("node:test");
const assert = require("node:assert");
const { generateKeypair, issue, verify } = require("../src/ec");
const { InvalidSignatureError, TokenExpiredError } = require("../src/core");

test("EC generate keypair and roundtrip", async () => {
  const { privateKey, publicKey } = generateKeypair();
  const token = issue({ ticketId: "abc123" }, 60, privateKey);
  const payload = await verify(token, publicKey);
  assert.strictEqual(payload.data.ticketId, "abc123");
});

test("EC wrong public key rejected", async () => {
  const { privateKey } = generateKeypair();
  const { publicKey: wrongPublicKey } = generateKeypair();
  const token = issue({ ticketId: "abc123" }, 60, privateKey);
  await assert.rejects(() => verify(token, wrongPublicKey), InvalidSignatureError);
});

test("EC expired token throws", async () => {
  const { privateKey, publicKey } = generateKeypair();
  const token = issue({ ticketId: "abc123" }, -1, privateKey);
  await assert.rejects(() => verify(token, publicKey), TokenExpiredError);
});

test("EC verifyWithPublicKeys rotation", async () => {
  const { generateKeypair, issue, verifyWithPublicKeys } = require("../src/ec");
  const oldPair = generateKeypair();
  const newPair = generateKeypair();
  const token = issue({ ticketId: "abc123" }, 60, oldPair.privateKey);
  const payload = await verifyWithPublicKeys(token, [newPair.publicKey, oldPair.publicKey]);
  assert.strictEqual(payload.data.ticketId, "abc123");
});
