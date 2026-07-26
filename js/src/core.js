/**
 * admitiq/core — signed, expiring, revocable tokens for QR codes.
 *
 * No AI, no required server, no vendor lock-in. Pure HMAC signing + expiry
 * checking + an optional hook for revocation/single-use enforcement.
 */
const crypto = require("crypto");

/** Wire-format versions this library can verify. Breaking changes require a new v. */
const SUPPORTED_VERSIONS = Object.freeze([1]);

class AdmitiqError extends Error {}
class TokenExpiredError extends AdmitiqError {}
class InvalidSignatureError extends AdmitiqError {}
class TokenRevokedError extends AdmitiqError {}
class UnsupportedTokenVersionError extends AdmitiqError {}

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

function assertSecret(secret) {
  if (typeof secret !== "string" || secret.length === 0) {
    throw new InvalidSignatureError("HMAC secret must be a non-empty string");
  }
}

function assertTtlSeconds(ttlSeconds) {
  if (typeof ttlSeconds !== "number" || !Number.isFinite(ttlSeconds)) {
    throw new InvalidSignatureError("ttlSeconds must be a finite number");
  }
}

/** Validate signed body claims after signature verification. */
function assertTokenBody(body) {
  if (!body || typeof body !== "object") {
    throw new InvalidSignatureError("Malformed token body");
  }
  if (typeof body.exp !== "number" || !Number.isFinite(body.exp)) {
    throw new InvalidSignatureError("Token missing valid exp claim");
  }
  if (typeof body.jti !== "string" || body.jti.length === 0) {
    throw new InvalidSignatureError("Token missing valid jti claim");
  }
}

function sign(message, secret) {
  const digest = crypto.createHmac("sha256", secret).update(message).digest();
  return b64urlEncode(digest);
}

function assertSupportedVersion(headerB64) {
  let header;
  try {
    header = JSON.parse(b64urlDecode(headerB64).toString("utf-8"));
  } catch {
    throw new InvalidSignatureError("Malformed token header");
  }
  const v = header.v;
  if (!SUPPORTED_VERSIONS.includes(v)) {
    throw new UnsupportedTokenVersionError(
      `Unsupported token version ${v}. This library supports: ${SUPPORTED_VERSIONS.join(", ")}`
    );
  }
  return header;
}

/**
 * Create a signed, expiring AdmitiQ token.
 * @param {object} payload - arbitrary JSON-serializable data (e.g. {ticketId: "abc123"})
 * @param {number} ttlSeconds - seconds until this token expires
 * @param {string} secret - shared HMAC secret used to sign the token (server-side only)
 * @returns {string} compact token string, safe to encode directly into a QR code
 */
function issue(payload, ttlSeconds, secret) {
  assertSecret(secret);
  assertTtlSeconds(ttlSeconds);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "QRT", v: 1 };
  const body = {
    iat: now,
    exp: now + ttlSeconds,
    jti: crypto.randomUUID(),
    data: payload,
  };
  const headerB64 = b64urlEncode(Buffer.from(JSON.stringify(header)));
  const bodyB64 = b64urlEncode(Buffer.from(JSON.stringify(body)));
  const signingInput = `${headerB64}.${bodyB64}`;
  const signature = sign(signingInput, secret);
  return `${headerB64}.${bodyB64}.${signature}`;
}

/**
 * Verify a AdmitiQ token's signature, expiry, and (optionally) revocation status.
 * @param {string} token
 * @param {string} secret
 * @param {(jti: string) => (boolean|Promise<boolean>)} [isRevoked] - optional callback,
 *   receives the token's jti (unique id) and returns true if it's been revoked/used.
 * @returns {Promise<object>} the embedded payload (iat, exp, jti, data)
 * @throws {InvalidSignatureError|TokenExpiredError|TokenRevokedError|UnsupportedTokenVersionError}
 */
async function verify(token, secret, isRevoked) {
  assertSecret(secret);
  const parts = typeof token === "string" ? token.split(".") : [];
  if (parts.length !== 3) {
    throw new InvalidSignatureError("Malformed token: expected 3 dot-separated parts");
  }
  const [headerB64, bodyB64, signature] = parts;
  const signingInput = `${headerB64}.${bodyB64}`;
  const expectedSignature = sign(signingInput, secret);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    throw new InvalidSignatureError("Signature mismatch");
  }

  // Version is inside the signed header — check only after the signature matches.
  assertSupportedVersion(headerB64);

  let body;
  try {
    body = JSON.parse(b64urlDecode(bodyB64).toString("utf-8"));
  } catch {
    throw new InvalidSignatureError("Malformed token body");
  }
  assertTokenBody(body);

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
 * Verify against multiple HMAC secrets (key-rotation window).
 * Tries secrets in order; succeeds on the first valid signature.
 * Non-signature errors (expired, revoked, unsupported version) propagate immediately.
 *
 * @param {string} token
 * @param {string[]} secrets - current secret first, then previous secrets still in window
 * @param {(jti: string) => (boolean|Promise<boolean>)} [isRevoked]
 */
async function verifyWithSecrets(token, secrets, isRevoked) {
  if (!Array.isArray(secrets) || secrets.length === 0) {
    throw new InvalidSignatureError("At least one secret is required");
  }
  let lastSigError = null;
  for (const secret of secrets) {
    try {
      return await verify(token, secret, isRevoked);
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

module.exports = {
  issue,
  verify,
  verifyWithSecrets,
  SUPPORTED_VERSIONS,
  assertSupportedVersion,
  assertSecret,
  assertTtlSeconds,
  assertTokenBody,
  AdmitiqError,
  TokenExpiredError,
  InvalidSignatureError,
  TokenRevokedError,
  UnsupportedTokenVersionError,
};
