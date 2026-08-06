# Migration to Hosted API

## Migration paths

- In-memory revocation -> Hosted API
- Self-hosted Redis revocation -> Hosted API
- Hosted API -> self-hosted fallback

## Step-by-step

1. Keep existing local signing/verification unchanged.
2. Introduce hosted store in `test` environment only.
3. Gate admission on `mark_used`/`markUsed` first-use result.
4. Add retries/backoff and explicit fail policy.
5. Run shadow traffic comparison before cutover.
6. Cut over low-risk scanners first.
7. Roll out to all scanners after correctness validation.

## Rollback

- retain current Redis/local store path behind feature flag
- if hosted API degrades, switch fail strategy according to risk model:
  - fail-closed for high-security entry
  - fail-open for low-risk attendance check-in

## Data export/delete

Operators should support:

- project-level usage export
- revocation-state export (when policy allows)
- account and project deletion workflow
