# Security model — what AdmitiQ protects against, and what it doesn't

AdmitiQ is a [LogicLitz](https://logiclitz.org) open-source project.

Being upfront about limits here is deliberate. A tool that oversells its guarantees in a
security-adjacent space is worse than one that's honest about a narrower scope.

## What AdmitiQ protects against

- **Forgery** — someone creating a fake ticket/coupon/pass from scratch. Both the HMAC
  (`core`) and ECDSA (`ec`) signing modes make this computationally infeasible without
  the signing secret or private key.
- **Tampering** — modifying the data inside a legitimate token (e.g. changing a seat
  number or discount percentage). Any change invalidates the signature.
- **Expired use** — a token being used after its intended validity window. Checked
  against server/verifier time at the moment of `verify()`.
- **Reuse / double-spending** — a token being used more than once (e.g. a screenshotted
  ticket shared with someone else), **when you wire up an `is_revoked` check** (either
  your own store, the bundled `RedisRevocationStore`, or the hosted API). This is opt-in,
  not automatic — see below.

## What AdmitiQ does NOT protect against

- **Physical duplication before first use.** If someone photographs a paper ticket or
  screenshots a QR code *before* it's ever scanned, and gets to a scanner first, AdmitiQ
  has no way to know which copy is the "real" one — it only knows the token itself is
  valid and hasn't been used yet. This is a physical/procedural problem (e.g., staggered
  entry, ID checks), not something any software signature can fix.
- **Compromised secrets.** If your HMAC secret or EC private key leaks, an attacker can
  forge valid tokens indistinguishable from real ones. Treat these exactly like any other
  production credential — environment variables, secret managers, never committed to
  source control.
- **Revocation you didn't implement.** Calling `verify()` without an `is_revoked`
  argument means reuse is never checked — the library will happily verify the same valid,
  unexpired token a thousand times. This is a deliberate default (many use cases, like a
  single admission check with no re-entry requirement, don't need single-use enforcement)
  but it means reuse protection is something *you* opt into, not something automatic.
- **Man-in-the-middle on your own verification endpoint.** AdmitiQ secures the token
  itself; it doesn't replace HTTPS, authentication on your API, or general application
  security practices for whatever service is calling `verify()`.
- **Clock skew across distributed systems.** Expiry checks rely on the verifying
  machine's clock. In distributed setups, keep clocks synced (NTP) — a verifier with a
  badly wrong clock could reject valid tokens early or accept expired ones.

## Choosing HMAC vs ECDSA (`core` vs `ec`)

- **Use `core` (HMAC-SHA256)** when the same trusted system both issues and verifies
  tokens — e.g. a single backend that generates tickets and also runs the scanning
  endpoint. Simpler, no key management overhead beyond one shared secret.
- **Use `ec` (ECDSA P-256 / ES256)** when the verifier should NOT be trusted with the
  power to issue new tokens — e.g. an offline scanner app on staff phones that only
  needs the public key. A compromised scanner device can't be used to mint new valid
  tickets, only to check them.

## The `alg` header field is informational — by design

Tokens carry a header like `{ "alg": "HS256", "typ": "QRT", "v": 1 }` (or `"ES256"` for
asymmetric tokens). **`verify()` does not read or enforce `alg`.** You choose the
verifier yourself: call `core.verify()` for HMAC tokens or `ec.verify()` for ES256
tokens. That is intentional.

Trusting a caller-controlled `alg` field to pick the verification algorithm is the classic
JWT "algorithm confusion" attack class (e.g. an attacker rewrites `alg` to `none` or
switches HS256↔RS256). AdmitiQ avoids that entire class by making algorithm selection a
code-path decision, not a header decision. The `alg` value is there for human inspection
and tooling; it is not part of the security control plane.

## Token format versioning and migration

The header includes `"v": 1` — the wire-format version. **v1 is the stable contract:**
any breaking change to the header/body structure, claimed fields, or default signing
behavior ships as a new `v` (and a major library semver bump), never as a silent change
to v1.

Tokens already printed or "in the wild" keep verifying under the version they were
issued with. Libraries that support multiple versions will accept all still-supported `v`
values during a transition; libraries that have dropped an old version will reject those
tokens as malformed/unsupported. **Do not change v1 in place** — that would invalidate
physical tickets with no recovery path. Prefer additive, optional fields only when they
can be ignored by older verifiers; anything that changes verification semantics needs a
new `v`.

## Key rotation

If an HMAC secret (or EC keypair) is leaked or you simply want to rotate on a schedule,
switching the secret overnight breaks every outstanding unexpired token — including
printed QR codes that may still be valid for days or weeks.

Recommended pattern during a transition window:

1. **Issue** new tokens with the *new* secret / private key only.
2. **Verify** against a short list of currently accepted secrets (or public keys): try the
   primary first, then fall back to previous ones still in the window. Reject only if
   none verify.
3. Keep previous secrets in the accept-list until the longest outstanding TTL you care
   about has elapsed (plus a small buffer for clock skew), then remove them.
4. On a confirmed leak: shorten that window aggressively, revoke known `jti`s if you have
   a revocation store, and treat any token that only verifies under the leaked secret as
   untrusted once the window closes.

The library's `verify()` takes a single secret/key today; for rotation windows use
`verify_with_secrets` / `verifyWithSecrets` (HMAC) or `verify_with_public_keys` /
`verifyWithPublicKeys` (ES256). See [docs/key-rotation.md](docs/key-rotation.md).
ES256 rotation is the same idea with a list of public keys.

## Hosted API: data handling and privacy (intent, before it ships)

The future hosted revocation/verification API will see token material you send it —
including whatever you put in the `data` payload (names, emails, ticket buyer info, etc.).
Policy intent, locked in before build pressure:

- **Do not log or retain raw `data` payloads** beyond what is required to complete the
  request. Prefer storing only `jti`, timestamps, and verification outcome for metering
  and revocation.
- If analytics need aggregates later, derive them without persisting PII from `data`.
- Secrets/private keys used for local signing must never be required by the hosted
  revocation path beyond whatever auth the API key model needs — the hosted layer is for
  revocation coordination, not for becoming a custodial vault of customer PII by default.

This is a product commitment to implement against; it is not yet live behavior.

## Governance and bus factor

AdmitiQ is maintained by [LogicLitz](https://logiclitz.org) and is currently
**solo-maintained**. There is no multi-committer rotation, paid security retainer, or
guaranteed response SLA on GitHub issues. That is an honest adoption risk: if you depend
on this in production, pin versions, read the (small) signing code yourself, and have a
fallback plan if upstream goes quiet. Contributions and additional maintainers are welcome
precisely because this gap is real.

## Reporting a vulnerability

This is an open-source project without a dedicated security team. If you find a real
issue in the signing/verification logic, please open a GitHub issue marked clearly as a
security concern, or reach out directly rather than posting exploit details publicly
before a fix ships.
