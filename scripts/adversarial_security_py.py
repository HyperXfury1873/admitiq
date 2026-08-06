"""Adversarial security probes against AdmitiQ Python core."""
import json
import math
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "python"))

from admitiq.core import (  # noqa: E402
    InvalidSignatureError,
    TokenExpiredError,
    UnsupportedTokenVersionError,
    issue,
    verify,
    _b64url_encode,
    _b64url_decode,
    _sign,
)


def section(title):
    print(f"\n=== {title} ===")


def ok(cond, msg):
    status = "PASS" if cond else "FAIL"
    print(f"  [{status}] {msg}")
    return cond


failures = 0


def expect(cond, msg):
    global failures
    if not ok(cond, msg):
        failures += 1


section("1. Empty / weak secrets")
try:
    t = issue({"x": 1}, 60, "")
    verify(t, "")
    expect(False, "empty secret should be rejected (currently ACCEPTED — forgeable)")
except Exception as e:
    expect(True, f"empty secret rejected: {type(e).__name__}: {e}")

try:
    t = issue({"x": 1}, 60, "a")
    verify(t, "a")
    expect(True, "single-char secret still works (weak but accepted by design unless min length)")
except Exception as e:
    expect(False, f"unexpected: {e}")

section("2. NaN / Inf TTL (Python JSON)")
for bad in [float("nan"), float("inf"), float("-inf")]:
    try:
        t = issue({"x": 1}, bad, "secret")
        # If issue succeeds, try verify — NaN exp is never > now
        try:
            body = verify(t, "secret")
            expect(
                False,
                f"ttl={bad!r} issued and verified — permanent/non-expiring token (CRITICAL)",
            )
        except Exception as e:
            expect(True, f"ttl={bad!r} issued but verify failed: {type(e).__name__}")
    except Exception as e:
        expect(True, f"ttl={bad!r} rejected at issue: {type(e).__name__}: {e}")

section("3. Negative / zero TTL")
try:
    t = issue({"x": 1}, 0, "secret")
    try:
        verify(t, "secret")
        # zero TTL: exp == now, check is `now > exp` so equal may still pass
        expect(True, "ttl=0 issued; verify behavior noted (may accept for current second)")
    except TokenExpiredError:
        expect(True, "ttl=0 correctly expired immediately or within second")
except Exception as e:
    expect(True, f"ttl=0 rejected: {e}")

try:
    t = issue({"x": 1}, -10, "secret")
    try:
        verify(t, "secret")
        expect(False, "negative TTL verified as valid")
    except TokenExpiredError:
        expect(True, "negative TTL correctly expired")
except Exception as e:
    expect(True, f"negative TTL rejected at issue: {e}")

section("4. Tamper / alg confusion / version")
t = issue({"seat": "A1"}, 3600, "secret")
parts = t.split(".")
# Change payload seat without resigning
body = json.loads(_b64url_decode(parts[1]))
body["data"]["seat"] = "VIP"
tampered = f"{parts[0]}.{_b64url_encode(json.dumps(body, separators=(',', ':')).encode())}.{parts[2]}"
try:
    verify(tampered, "secret")
    expect(False, "tampered payload accepted")
except InvalidSignatureError:
    expect(True, "tampered payload rejected")

# Rewrite header alg to none, resign with empty? Classic: change alg without resigning
header = json.loads(_b64url_decode(parts[0]))
header["alg"] = "none"
hdr = _b64url_encode(json.dumps(header, separators=(",", ":")).encode())
# Without resigning — should fail signature
none_tok = f"{hdr}.{parts[1]}.{parts[2]}"
try:
    verify(none_tok, "secret")
    expect(False, "alg=none rewrite without resign accepted")
except InvalidSignatureError:
    expect(True, "alg=none rewrite fails signature (good)")

# Resign with same secret after alg=none — HMAC path still verifies (alg not enforced)
signing = f"{hdr}.{parts[1]}".encode()
sig = _sign(signing, "secret")
none_signed = f"{hdr}.{parts[1]}.{sig}"
try:
    verify(none_signed, "secret")
    expect(
        True,
        "alg=none in header still verifies via HMAC path (documented — alg not enforced)",
    )
except Exception as e:
    expect(False, f"unexpected reject after resign: {e}")

# Unsupported version
header2 = {"alg": "HS256", "typ": "QRT", "v": 99}
h2 = _b64url_encode(json.dumps(header2, separators=(",", ":")).encode())
si = f"{h2}.{parts[1]}".encode()
tok99 = f"{h2}.{parts[1]}.{_sign(si, 'secret')}"
try:
    verify(tok99, "secret")
    expect(False, "v=99 accepted")
except UnsupportedTokenVersionError:
    expect(True, "v=99 rejected")

section("5. Missing / malformed claims (crafted body)")
# Build body without exp, sign it
header = {"alg": "HS256", "typ": "QRT", "v": 1}
body_no_exp = {"iat": int(time.time()), "jti": "abc", "data": {"x": 1}}
hb = _b64url_encode(json.dumps(header, separators=(",", ":")).encode())
bb = _b64url_encode(json.dumps(body_no_exp, separators=(",", ":")).encode())
si = f"{hb}.{bb}".encode()
tok = f"{hb}.{bb}.{_sign(si, 'secret')}"
try:
    verify(tok, "secret")
    expect(False, "token without exp accepted (should require exp)")
except KeyError:
    expect(True, "missing exp raises KeyError (not InvalidSignatureError — API smell)")
except Exception as e:
    expect(True, f"missing exp rejected as {type(e).__name__}: {e}")

# exp as string
body_str = {"iat": int(time.time()), "exp": "9999999999", "jti": "x", "data": {}}
bb = _b64url_encode(json.dumps(body_str, separators=(",", ":")).encode())
si = f"{hb}.{bb}".encode()
tok = f"{hb}.{bb}.{_sign(si, 'secret')}"
try:
    verify(tok, "secret")
    # Python may compare int > str and throw TypeError
    expect(True, "string exp somehow verified (type coercion risk)")
except TypeError:
    expect(True, "string exp raises TypeError (not clean AdmitiqError)")
except Exception as e:
    expect(True, f"string exp: {type(e).__name__}: {e}")

section("6. Malformed tokens")
for bad in ["", "a", "a.b", "a.b.c.d", "...", "!!!!"]:
    try:
        verify(bad, "secret")
        expect(False, f"malformed accepted: {bad!r}")
    except Exception:
        expect(True, f"malformed rejected: {bad!r}")

section("7. Wrong secret / truncated signature")
t = issue({"x": 1}, 60, "correct")
try:
    verify(t, "wrong")
    expect(False, "wrong secret accepted")
except InvalidSignatureError:
    expect(True, "wrong secret rejected")

parts = t.split(".")
trunc = f"{parts[0]}.{parts[1]}.{parts[2][:-4]}"
try:
    verify(trunc, "correct")
    expect(False, "truncated sig accepted")
except InvalidSignatureError:
    expect(True, "truncated sig rejected")

section("8. JSON NaN in payload data (not exp)")
# Standard json.dumps rejects NaN by default in strict modes? Python allows NaN
try:
    t = issue({"n": float("nan")}, 60, "secret")
    body = verify(t, "secret")
    expect(True, f"NaN in data payload round-trips (JSON allows): {body['data']}")
except Exception as e:
    expect(True, f"NaN in data rejected: {e}")

print(f"\n=== DONE — {failures} FAIL(s) ===")
sys.exit(1 if failures else 0)
