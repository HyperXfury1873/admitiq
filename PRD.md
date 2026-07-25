# AdmitiQ — Product Requirements Document

**Signed, expiring, revocable QR code tokens. Open source, no AI, dual-published on pip and npm.**

Prepared for: [LogicLitz](https://logiclitz.org)
Status: v0.3.0 — core library, ES256, framework drop-ins, Redis store, key-rotation helpers,
token version gating, beginner docs, examples, and CI are complete. Hosted API, dashboard,
and public npm/PyPI publish are not yet done (see PUBLISH.md).

---

## 1. Problem

QR codes are everywhere — event tickets, attendance systems, coupons, access passes — but
almost every QR library in both the Python and JavaScript ecosystems only encodes plain
text or a URL. There is no signature, no expiry, and no way to detect reuse. Anyone who
screenshots a QR code can reuse it forever. Developers who need real security either:

- Roll their own signing logic on top of a bare QR generator, inconsistently, project by project, or
- Pay for an enterprise ticketing/access-control SaaS platform for what is fundamentally a small, well-defined problem

Nothing well-maintained combines "generate a QR code whose payload is signed, time-limited,
and revocable" as a simple, dependency-light library — and nothing does it with an identical
token format across Python and JavaScript, which matters for teams running mixed stacks.

## 2. Target Users

- **Primary**: developers building event ticketing, attendance/check-in systems, single-use
  coupons, or access passes — anyone currently rolling their own QR security or overpaying
  for an enterprise platform
- **Secondary (indirect)**: the end users who scan these QR codes (event attendees, students
  checking into class, customers redeeming a coupon) — they benefit from fraud-resistant
  codes without ever installing anything or knowing admitiq exists
- **Distribution audience**: this is a developer tool, so its natural home is GitHub, Hacker
  News, r/programming, dev.to, and Product Hunt/Peerlist's builder audience — a genuine
  audience match, unlike a consumer app targeting a different audience than these platforms' users

## 3. Product Principles

1. **The library is free, forever, fully self-hostable.** No calls to any server are required
   to issue or verify tokens. This is the trust layer — a developer must be able to fully
   audit and self-host the entire security-critical path.
2. **No AI anywhere.** Pure cryptography (HMAC-SHA256 in v1) and deterministic logic.
3. **Identical behavior across ecosystems.** A token issued in Python must verify correctly
   in Node, and vice versa. This is a real, uncommon feature and a core differentiator.
4. **Revenue lives in the hosted convenience layer, not the code.** See Section 7.

## 4. What's Built (v0.2.0)

**Core (HMAC-SHA256)**
- `issue(payload, ttl_seconds, secret)` — creates a compact signed token (header.body.signature,
  JWT-like structure)
- `verify(token, secret, is_revoked=None)` — validates signature (constant-time comparison),
  checks expiry, and calls an optional `is_revoked` callback for revocation/single-use checks
- `generate_qr(token, output_path)` — optional helper (requires the `qrcode` package) to
  render a token directly as a QR image
- Typed exceptions: `InvalidSignatureError`, `TokenExpiredError`, `TokenRevokedError`
- **Verified cross-language compatibility**: a token issued by the Python package was
  independently verified by the JS package using the same shared secret, and vice versa —
  this was actually tested, not just claimed

**Asymmetric signing (ES256 / ECDSA P-256)**
- `ec.generate_keypair()`, `ec.issue()`, `ec.verify()` in both languages — for cases where
  the verifier (e.g. an offline scanner app) shouldn't hold the power to issue new tokens
- **Verified cross-language ES256 compatibility**: a token signed with a private key in
  Python was verified using only the public key in Node

**Framework drop-ins (tested end-to-end, not just written)**
- Express middleware (`admitiq/express`) — verified with a live Express server
- FastAPI dependency (`admitiq.frameworks.fastapi_dependency`) — verified with FastAPI's TestClient
- Flask decorator (`admitiq.frameworks.flask_require_token`) — verified with Flask's test client

**Redis-backed revocation store (both languages, tested against a real Redis instance)**
- `RedisRevocationStore` — race-condition-safe `mark_used()`/`is_revoked()` for anyone
  running multiple servers checking the same tokens, without needing the hosted API yet

**Documentation**
- `SECURITY.md` — honest breakdown of the threat model: what's protected, what isn't
  (physical duplication before first scan, compromised secrets, opt-in-only revocation,
  clock skew), and when to choose HMAC vs. ES256
- Both READMEs rewritten to lead with the cross-language proof as the primary differentiator
- Full test suites: 9 tests (Python) + 9 tests (JS), all passing

## 5. Explicitly Out of Scope for Now (tracked for later phases)

- The hosted revocation/verification API (the actual monetization layer — see Section 7)
- The analytics/fraud-detection dashboard
- Team/org accounts, audit logs, SLA tiers
- Actual publication to PyPI/npm registries, GitHub repo creation, CI/CD setup, and any
  public launch activity — all of the code above exists correctly structured for
  publishing, but nothing has been published or made publicly installable yet

## 6. Non-Functional Requirements

- **Zero required dependencies** for the core signing/verification path (both languages) —
  this keeps the trust surface minimal and audit-friendly
- **Constant-time signature comparison** to avoid timing-attack side channels (already
  implemented via `hmac.compare_digest` in Python and `crypto.timingSafeEqual` in Node)
- **Semantic versioning** and a stable token format — breaking the wire format between
  versions would break cross-language compatibility, which is a core selling point.
  Wire format uses header `v`; breaking changes require a new `v` (see SECURITY.md)
- **Key rotation is an operational concern** — document and support verifying against a
  list of secrets/keys during a transition window; do not assume a single secret forever
- **Hosted API privacy** — when built, do not log/retain raw `data` payloads; prefer
  `jti` + outcome only (see SECURITY.md)
- **License: MIT** — permissive licensing removes any adoption friction for commercial use,
  which is what makes the eventual hosted-API upsell possible

## 7. Monetization (Open-Core Model)

| Tier | What it includes | Price |
|---|---|---|
| **Free (the library)** | Full issue/verify/QR generation, self-hosted revocation via your own `is_revoked` callback | $0 forever |
| **Hosted API — Starter** | Centralized revocation/single-use check via API call instead of self-hosting your own store; solves race conditions across multiple servers | Free up to 1,000 verifications/month, then ~$9–29/month scaling with volume |
| **Hosted API — Growth** | Higher volume, dashboard with scan analytics, basic fraud signals (e.g. same ticket scanned in two locations within minutes) | ~$49–99/month |
| **Team/Org** | Multiple team members, audit logs, uptime SLA | Custom pricing |

The library itself must never feel deliberately limited to push the paid tier — the paid
tier earns its price by solving a genuinely hard infrastructure problem (distributed,
race-condition-safe single-use enforcement), not by withholding basic functionality.

## 8. Success Metrics

- pip/npm weekly download counts (adoption signal)
- GitHub stars and issues opened (engagement signal — issues are a good sign, not just a support burden)
- Conversion rate from free library usage to hosted API signups
- Inbound [LogicLitz](https://logiclitz.org) client leads sourced from companies adopting this at scale

## 9. Risks

| Risk | Mitigation |
|---|---|
| Low adoption — nobody discovers the library | Prioritize genuinely useful documentation, a clear README, and launch on channels where the target developer audience already is (GitHub, HN, dev subreddits) |
| A well-funded competitor builds the same open-core model faster | Being first and well-documented matters; the token format itself becoming a small de facto standard is a stronger moat than the code |
| Hosted API revenue is small relative to build effort | This was flagged from the start as a slow-build, small-ticket model — success here is measured in reputation and warm leads as much as direct revenue |
| Security vulnerability in the signing implementation | Keep the cryptographic surface minimal, avoid inventing custom crypto, consider a professional security review before wide production adoption claims |
| Solo maintainer / bus factor | Stated openly in SECURITY.md; keep the crypto surface small enough to audit; welcome co-maintainers; consumers should pin versions |
| Breaking tokens already printed "in the wild" | Never mutate v1 in place; new wire versions via header `v` + major semver; migration policy in SECURITY.md |
| Secret leak forces mass invalidation | Document multi-secret verify during a rotation window; revoke `jti`s when a store exists |

---

*This PRD reflects the state of the project as of the v0.1.0 code drop in this document set. Revisit Section 7 pricing once real hosted-API usage data exists. AdmitiQ is part of the [LogicLitz](https://logiclitz.org) product family.*
