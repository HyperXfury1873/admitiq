# Hosted Launch Gates

Use this gate list before inviting production traffic.

## Security gates

- [ ] API key hashing and one-time reveal verified
- [ ] No signing secrets/private keys accepted or stored by hosted API v1
- [ ] Tenant-isolation tests passing
- [ ] Webhook signature validation and replay handling implemented
- [ ] Secret scanning and dependency scanning enabled in CI

## Correctness and concurrency gates

- [ ] Atomic consume endpoint returns exactly one first-use success under concurrency tests
- [ ] Retry/idempotency behavior documented and tested
- [ ] Quota behavior deterministic under concurrent requests
- [ ] Error envelope stable across 4xx/5xx responses

## Billing and entitlement gates

- [ ] Stripe products/prices configured in live mode
- [ ] Entitlement updates from webhooks are tested for duplicates/reordering
- [ ] Grace/cancel/recovery paths tested end-to-end

## Reliability and operations gates

- [ ] Health/readiness probes wired to deployment platform
- [ ] Alerting and dashboards configured
- [ ] Backup/restore drill completed against production-like data
- [ ] Incident comms template and escalation policy in place

## Launch process gates

- [ ] Beta cohort sign-off
- [ ] Public docs updated (hosted overview, API reference, migration, privacy)
- [ ] Terms, cloud privacy, and DPA pages published
- [ ] Rollback plan tested
