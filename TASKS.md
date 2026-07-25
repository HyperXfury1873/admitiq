# AdmitiQ — Task List

Reference this file as the working checklist. AdmitiQ is a [LogicLitz](https://logiclitz.org)
product. Check items off as you go. Grouped by phase —
don't start Phase 2 infrastructure work until Phase 1 is actually published and has real users.

---

## Phase 0 — Already done (in this code drop)

- [x] Core signing/verification logic in Python (`admitiq/core.py`)
- [x] Core signing/verification logic in JavaScript (`src/core.js`)
- [x] Optional QR image generation helper, both languages
- [x] Typed exceptions for expired/invalid/revoked tokens, both languages
- [x] Test suites written and passing (core + EC + rotation helpers, both languages)
- [x] READMEs with quick-start examples, both languages — rewritten to lead with the
      cross-language compatibility proof as the primary differentiator
- [x] `pyproject.toml` and `package.json` packaging metadata
- [x] **Verified (not just claimed) cross-language interoperability**: Python-issued
      tokens verified by Node and vice versa, both for HMAC and ES256 modes
- [x] ES256 / asymmetric signing support (`admitiq.ec` / `admitiq/ec`) — for untrusted
      verifiers like offline scanner apps; tested same-language and cross-language
- [x] Express middleware drop-in (`admitiq/express`) — tested against a live server
- [x] FastAPI dependency drop-in (`admitiq.frameworks.fastapi_dependency`) — tested with TestClient
- [x] Flask decorator drop-in (`admitiq.frameworks.flask_require_token`) — tested with Flask's test client
- [x] Redis-backed revocation store, both languages — tested against a real Redis instance,
      including the actual "second scan gets blocked" reuse scenario
- [x] `SECURITY.md` — honest threat-model writeup (what's protected, what explicitly isn't)
- [x] Developer-facing landing page (see `landing/` folder)

## Phase 1 — Get it published and real

- [x] **Repo structure decision: monorepo.** One `HyperXfury1873/admitiq` repo with `python/`,
      `js/`, shared `SECURITY.md` / PRD / landing. Cross-language compatibility is the
      product differentiator — splitting into two repos would split issues, CI, and the
      security doc that both packages must stay aligned with. Publish to PyPI and npm from
      the same tree (two packages, one source of truth).
- [x] Create the public GitHub repo (`HyperXfury1873/admitiq`) and push this monorepo
- [x] Add a root-level `LICENSE` file (MIT, matches what's declared in packaging metadata)
- [x] Add a top-level `README.md` for the monorepo that links to both language-specific READMEs
- [x] Set up GitHub Actions CI: run both test suites on every push/PR
- [x] Newbie-friendly `docs/` + root `PUBLISH.md` (npm + PyPI step-by-step)
- [x] First-class key rotation helpers (`verify_with_secrets` / `verifyWithSecrets`, EC equivalents)
- [x] Token wire-format version gate (`v` / `UnsupportedTokenVersionError`)
- [ ] Register and publish to PyPI: see `PUBLISH.md` (`python -m build && twine upload`)
- [ ] Register and publish to npm: see `PUBLISH.md` (`npm publish`)
- [ ] Add badges to both READMEs: build status, license, npm/pip version
- [x] Write 2-3 real usage examples beyond the README (Express ticket-check, Flask attendance,
      cross-language scripts in `examples/`)
- [ ] Decide on and register the project domain (e.g. admitiq.dev) even before the hosted API exists —
      use it to host the landing page (already built, see `landing/`) and docs in the meantime
- [ ] Deploy the landing page (`landing/AdmitiQLanding.jsx`) somewhere real — Vercel/Netlify are
      the fastest path for a static React page like this
      (local Vite preview exists under `admitiq-landing/`)

## Phase 2 — Launch and get initial adoption

- [ ] Write a genuine, technical launch post: "Why QR codes need signatures" or similar —
      explain the actual problem, not just "we built a thing"
- [ ] Post to Hacker News (Show HN), r/programming, r/node, r/Python, dev.to
- [ ] Submit to Product Hunt, Peerlist, PeerPush — this audience is a strong match for a dev tool
- [ ] Respond to every comment/issue in the first two weeks — early credibility compounds
- [ ] Track: GitHub stars, pip/npm downloads, any inbound issues or PRs

## Phase 3 — Hosted revocation API (the actual revenue layer)

- [ ] Design the API: `POST /v1/verify` (given a token + your secret, returns validity +
      revocation status), `POST /v1/revoke` (mark a jti as used/revoked)
- [ ] Implement privacy rules from SECURITY.md: do not log/retain raw `data` payloads;
      meter and revoke on `jti` + outcome only
- [ ] Decide auth model for the hosted API (API key per project)
- [ ] Build with your existing stack: Node/Express + Prisma + Supabase (matches your other
      LogicLitz products, no new stack to learn)
- [ ] Add a thin SDK method in both the pip and npm packages: an optional `is_revoked` helper
      that calls the hosted API, so self-hosted and hosted usage share the same interface
- [ ] Implement metering/usage tracking per API key (needed before you can bill anyone)
- [ ] Integrate Stripe for the paid tiers (Starter/Growth from the PRD pricing table)
- [ ] Set a genuinely generous free tier (1,000 verifications/month) — the free tier's job is
      adoption, not maximizing early revenue

## Phase 4 — Dashboard and analytics (Growth tier)

- [ ] Simple web dashboard: scan counts over time, per-token status, basic geographic/time data
- [ ] Fraud signal: flag when the same jti is verified from meaningfully different times/places
      in a short window (exact heuristic TBD — start simple, refine from real data)
- [ ] Team/org accounts: multiple users per account, basic audit log of who revoked what

## Ongoing / Don't forget

- [ ] Re-validate that the free library never feels artificially limited — check this every
      time you're tempted to move a feature behind the paid tier
- [ ] Watch for inbound enterprise/agency interest — these are warm leads for [LogicLitz](https://logiclitz.org)'s
      core client services, not just admitiq users
- [ ] Revisit the pricing in PRD.md Section 7 once you have real usage data — the numbers
      there are a starting hypothesis, not a final answer
