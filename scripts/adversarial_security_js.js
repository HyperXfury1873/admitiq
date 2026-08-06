/**
 * Adversarial security probes against AdmitiQ JS core.
 */
const path = require("path");
const core = require(path.join(__dirname, "..", "js", "src", "core.js"));
const crypto = require("crypto");

const { issue, verify, InvalidSignatureError, TokenExpiredError, UnsupportedTokenVersionError } = core;

function b64urlEncode(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function sign(message, secret) {
  return b64urlEncode(crypto.createHmac("sha256", secret).update(message).digest());
}

let failures = 0;
function ok(cond, msg) {
  console.log(`  [${cond ? "PASS" : "FAIL"}] ${msg}`);
  if (!cond) failures++;
}
function section(t) {
  console.log(`\n=== ${t} ===`);
}

async function main() {
  section("1. Empty secret");
  try {
    const t = issue({ x: 1 }, 60, "");
    await verify(t, "");
    ok(false, "empty secret should be rejected (currently ACCEPTED — forgeable)");
  } catch (e) {
    ok(true, `empty secret rejected: ${e.constructor.name}`);
  }

  section("2. NaN / Inf TTL");
  for (const bad of [NaN, Infinity, -Infinity]) {
    try {
      const t = issue({ x: 1 }, bad, "secret");
      try {
        await verify(t, "secret");
        // JS: now + NaN = NaN; now > NaN is false → never expires
        ok(false, `ttl=${bad} issued and verified — permanent token (CRITICAL if reachable)`);
      } catch (e) {
        ok(true, `ttl=${bad} verify failed: ${e.constructor.name}: ${e.message}`);
      }
    } catch (e) {
      ok(true, `ttl=${bad} rejected at issue: ${e.message}`);
    }
  }

  section("3. Missing exp claim");
  {
    const header = { alg: "HS256", typ: "QRT", v: 1 };
    const body = { iat: Math.floor(Date.now() / 1000), jti: "abc", data: { x: 1 } };
    const hb = b64urlEncode(Buffer.from(JSON.stringify(header)));
    const bb = b64urlEncode(Buffer.from(JSON.stringify(body)));
    const si = `${hb}.${bb}`;
    const tok = `${si}.${sign(si, "secret")}`;
    try {
      await verify(tok, "secret");
      ok(false, "token without exp accepted (JS: now > undefined is false)");
    } catch (e) {
      ok(true, `missing exp rejected: ${e.constructor.name}`);
    }
  }

  section("4. Tamper");
  {
    const t = issue({ seat: "A1" }, 3600, "secret");
    const [h, b, s] = t.split(".");
    const body = JSON.parse(Buffer.from(b.replace(/-/g, "+").replace(/_/g, "/") + "==", "base64").toString());
    body.data.seat = "VIP";
    const bb = b64urlEncode(Buffer.from(JSON.stringify(body)));
    try {
      await verify(`${h}.${bb}.${s}`, "secret");
      ok(false, "tampered accepted");
    } catch (e) {
      ok(e instanceof InvalidSignatureError, "tampered rejected");
    }
  }

  section("5. Wrong secret / malformed");
  {
    const t = issue({ x: 1 }, 60, "correct");
    try {
      await verify(t, "wrong");
      ok(false, "wrong secret accepted");
    } catch (e) {
      ok(e instanceof InvalidSignatureError, "wrong secret rejected");
    }
    for (const bad of ["", "a.b", "a.b.c.d"]) {
      try {
        await verify(bad, "secret");
        ok(false, `malformed accepted ${bad}`);
      } catch {
        ok(true, `malformed rejected ${JSON.stringify(bad)}`);
      }
    }
  }

  section("6. Version gate");
  {
    const header = { alg: "HS256", typ: "QRT", v: 99 };
    const body = { iat: 1, exp: Math.floor(Date.now() / 1000) + 60, jti: "x", data: {} };
    const hb = b64urlEncode(Buffer.from(JSON.stringify(header)));
    const bb = b64urlEncode(Buffer.from(JSON.stringify(body)));
    const si = `${hb}.${bb}`;
    const tok = `${si}.${sign(si, "secret")}`;
    try {
      await verify(tok, "secret");
      ok(false, "v=99 accepted");
    } catch (e) {
      ok(e instanceof UnsupportedTokenVersionError, "v=99 rejected");
    }
  }

  section("7. Concurrent single-use race (memory pattern)");
  {
    const used = new Set();
    const isRevoked = (jti) => used.has(jti);
    const t = issue({ x: 1 }, 60, "secret");
    // Simulate check-then-act race: both verify before either marks
    const r1 = await verify(t, "secret", isRevoked);
    const r2 = await verify(t, "secret", isRevoked);
    ok(r1.jti === r2.jti, "both scans pass before mark_used (documented race — NOT atomic)");
    used.add(r1.jti);
    try {
      await verify(t, "secret", isRevoked);
      ok(false, "third scan after mark should fail");
    } catch {
      ok(true, "after mark_used, reuse rejected");
    }
  }

  console.log(`\n=== DONE — ${failures} FAIL(s) ===`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
