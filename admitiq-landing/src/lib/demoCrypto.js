function b64urlEncode(bytes) {
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecodeToString(b64) {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (b64.length % 4)) % 4);
  return atob(padded);
}

function utf8Bytes(str) {
  return new TextEncoder().encode(str);
}

/** Split an AdmitiQ token like jwt.io — header · payload · signature (no crypto). */
export function decodeTokenParts(token) {
  if (!token || typeof token !== "string") {
    return { ok: false, error: "Paste an AdmitiQ token (header.payload.signature)." };
  }
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "Expected three base64url segments separated by dots." };
  }
  const [headerB64, payloadB64, signatureB64] = parts;
  try {
    const header = JSON.parse(b64urlDecodeToString(headerB64));
    const payload = JSON.parse(b64urlDecodeToString(payloadB64));
    return {
      ok: true,
      raw: trimmed,
      headerB64,
      payloadB64,
      signatureB64,
      header,
      payload,
    };
  } catch {
    return { ok: false, error: "Could not decode base64url JSON (not a valid AdmitiQ/JWT-shaped token)." };
  }
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    utf8Bytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function demoIssue(payload, ttlSeconds, secret) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "QRT", v: 1 };
  const body = {
    iat: now,
    exp: now + ttlSeconds,
    jti: crypto.randomUUID(),
    data: payload,
  };
  const headerB64 = b64urlEncode(utf8Bytes(JSON.stringify(header)));
  const bodyB64 = b64urlEncode(utf8Bytes(JSON.stringify(body)));
  const signingInput = `${headerB64}.${bodyB64}`;
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, utf8Bytes(signingInput));
  const sigB64 = b64urlEncode(new Uint8Array(sig));
  return { token: `${headerB64}.${bodyB64}.${sigB64}`, jti: body.jti, exp: body.exp };
}

export async function demoVerify(token, secret, usedJtis) {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "Malformed token" };
  const [headerB64, bodyB64, sigB64] = parts;
  const signingInput = `${headerB64}.${bodyB64}`;
  const key = await hmacKey(secret);

  const sigBytes = Uint8Array.from(
    atob(sigB64.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (sigB64.length % 4)) % 4)),
    (c) => c.charCodeAt(0)
  );

  const valid = await crypto.subtle.verify("HMAC", key, sigBytes, utf8Bytes(signingInput));
  if (!valid) return { ok: false, reason: "Signature mismatch — token was tampered with or forged" };

  const body = JSON.parse(atob(bodyB64.replace(/-/g, "+").replace(/_/g, "/")));
  const now = Math.floor(Date.now() / 1000);
  if (now > body.exp) return { ok: false, reason: `Expired at ${body.exp}` };
  if (usedJtis.has(body.jti)) return { ok: false, reason: "Already used (revoked)" };

  return { ok: true, data: body.data, jti: body.jti };
}
