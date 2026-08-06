# Single-Use Semantics

## Goal

Guarantee only one successful first-use for a given token identifier (`jti`) across concurrent scanners.

## Anti-pattern to avoid

Do not rely on:

1. `check(jti)` -> says not revoked
2. `revoke(jti)` -> mark used

This introduces TOCTOU race windows.

## Correct pattern

Use atomic consume:

`POST /v1/tokens/consume`

Possible outcomes:

- `first_use` (admit)
- `already_consumed` (reject)
- `expired` (reject)
- `revoked` (reject)

## Transitional pattern (current SDKs)

When using current hosted stores:

1. Verify cryptographically in your app.
2. Call `mark_used` / `markUsed`.
3. Admit only if result is `true` (`first`).
4. Reject if `false` (already consumed).

## Edge-case handling

- client timeout after consume may still have succeeded server-side
- retries must be idempotent
- scanner UI should present deterministic outcomes for duplicate scans
