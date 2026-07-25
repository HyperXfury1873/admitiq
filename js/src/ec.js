/**
 * admitiq/ec — optional asymmetric (ES256 / ECDSA P-256) signing support.
 *
 * Use this instead of core.issue/verify when the verifier (e.g. a scanner
 * app on someone's phone, or a public endpoint) should NOT hold the same
 * secret used to issue tokens. The issuer signs with a private key; anyone
 * holding only the public key can verify a token but cannot forge new ones.
 *
 * Uses Node's built-in 'crypto' module — no extra dependency required.
 */
const crypto = require("crypto");
const {
  InvalidSignatureError,
  TokenExpiredError,
  TokenRevokedError,
  assertSupportedVersion,
} = require("./core");

function b64urlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(str) {
  let padded = str.replace(/-/g, "+").replace(/_/g, "/");
  while (padded.length % 4) padded += "=";
  return Buffer.from(padded, "base64");
}

/**
 * Generate a new EC (P-256) keypair.
 * @returns {{privateKey: string, publicKey: string}} PEM-encoded keys.
 */
function generateKeypair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "P-256",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { privateKey, publicKey };
}

/**
 * Create a token signed with an EC private key (algorithm: ES256).
 * @param {object} payload
 * @param {number} ttlSeconds
 * @param {string} privateKeyPem
 */
function issue(payload, ttlSeconds, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", typ: "QRT", v: 1 };
  const body = {
    iat: now,
    exp: now + ttlSeconds,
    jti: crypto.randomUUID(),
    data: payload,
  };
  const headerB64 = b64urlEncode(Buffer.from(JSON.stringify(header)));
  const bodyB64 = b64urlEncode(Buffer.from(JSON.stringify(body)));
  const signingInput = `${headerB64}.${bodyB64}`;
  // Default DER signature encoding matches Python's `cryptography` library default,
  // which is what makes tokens interoperable across both packages.
  const signature = crypto.sign("sha256", Buffer.from(signingInput), privateKeyPem);
  const signatureB64 = b64urlEncode(signature);
  return `${headerB64}.${bodyB64}.${signatureB64}`;
}

/**
 * Verify a token created by issue() using the corresponding EC public key.
 * @param {string} token
 * @param {string} publicKeyPem
 * @param {(jti: string) => (boolean|Promise<boolean>)} [isRevoked]
 */
async function verify(token, publicKeyPem, isRevoked) {
  const parts = typeof token === "string" ? token.split(".") : [];
  if (parts.length !== 3) {
    throw new InvalidSignatureError("Malformed token: expected 3 dot-separated parts");
  }
  const [headerB64, bodyB64, signatureB64] = parts;
  const signingInput = `${headerB64}.${bodyB64}`;
  const signature = b64urlDecode(signatureB64);

  const valid = crypto.verify(
    "sha256",
    Buffer.from(signingInput),
    publicKeyPem,
    signature
  );
  if (!valid) {
    throw new InvalidSignatureError("Signature mismatch");
  }

  assertSupportedVersion(headerB64);

  const body = JSON.parse(b64urlDecode(bodyB64).toString("utf-8"));
  const now = Math.floor(Date.now() / 1000);
  if (now > body.exp) {
    throw new TokenExpiredError(`Token expired at ${body.exp}`);
  }
  if (isRevoked) {
    const revoked = await isRevoked(body.jti);
    if (revoked) {
      throw new TokenRevokedError(`Token ${body.jti} has been revoked`);
    }
  }
  return body;
}

/**
 * Verify against multiple EC public keys (key-rotation window).
 * @param {string} token
 * @param {string[]} publicKeyPems - current public key first, then previous keys still in window
 * @param {(jti: string) => (boolean|Promise<boolean>)} [isRevoked]
 */
async function verifyWithPublicKeys(token, publicKeyPems, isRevoked) {
  if (!Array.isArray(publicKeyPems) || publicKeyPems.length === 0) {
    throw new InvalidSignatureError("At least one public key is required");
  }
  let lastSigError = null;
  for (const publicKeyPem of publicKeyPems) {
    try {
      return await verify(token, publicKeyPem, isRevoked);
    } catch (err) {
      if (err instanceof InvalidSignatureError) {
        lastSigError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastSigError || new InvalidSignatureError("Signature mismatch");
}

module.exports = { generateKeypair, issue, verify, verifyWithPublicKeys };
