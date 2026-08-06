# Hosted Boundary (Public vs Commercial)

AdmitiQ uses an open-core model:

- The cryptographic libraries remain open source (MIT) in this repository.
- The hosted SaaS control plane (dashboard, billing, operations) is commercial and proprietary.

## Important licensing fact

The existing `hosted/` directory is in this public MIT repository. Code already published under MIT remains MIT for recipients who obtained it. We cannot retroactively "close" that historical code.

Because of that:

1. Treat `hosted/` as a public prototype and reference implementation.
2. Build the commercial service as a new private repository (`admitiq-cloud`).
3. Keep protocol-level public docs and client SDK integrations in this repository.
4. Keep commercial implementation details, production infra, and dashboard source in the private repository.

## What remains public

- Python package (`python/`)
- JavaScript package (`js/`)
- Public API contract and integration docs
- Hosted store SDK clients:
  - `python/admitiq/stores/hosted_store.py`
  - `js/src/stores/hostedStore.js`
- Landing pages and public docs

## What stays proprietary (private repository)

- Production hosted API implementation
- Multi-tenant account system and dashboard
- Billing workflows and entitlement internals
- Operational runbooks, internal tooling, and on-call docs
- Fraud scoring internals and anti-abuse controls

## Artifact security rules

- No private source maps published publicly.
- No private container images in public registries.
- No production credentials in this repository.
- No internal-only ADRs/runbooks copied to public docs.

## Contributor/IP controls

- Require explicit contributor assignment/CLA for proprietary code.
- Require legal review for Terms, Privacy Policy, and DPA before GA.
- Keep a change log of boundary decisions and exceptions.
