# AdmitiQ Hosted API Overview

AdmitiQ Hosted API is an optional coordination service for distributed single-use enforcement.

The open-source libraries still perform signing and verification locally:

- Python: `admitiq`
- JavaScript: `admitiq`

The hosted API adds:

- atomic first-use enforcement across scanners/regions
- centralized revocation
- usage metering and plan limits
- billing and team/project management (commercial tier)

## Non-custodial model (v1)

AdmitiQ Cloud does not require your signing secrets or private keys for v1. You keep cryptographic custody in your own systems.

You send only token identifiers (`jti`) plus optional metadata required for coordination.

## When to use hosted vs self-hosted

Use self-hosted Redis/store when:

- you already operate central infrastructure
- your traffic and team are small
- you want full local control

Use hosted API when:

- you need multi-scanner atomic consume without building infra
- you want project quotas/billing controls
- you need team access controls and auditability

## Scope boundaries

- The library remains free and open source.
- Hosted API is an optional paid convenience layer.
- The paid layer should not remove core cryptographic capability from the free libraries.
