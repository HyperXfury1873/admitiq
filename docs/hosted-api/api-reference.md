# Hosted API Reference

Base URLs:

- Production: `https://api.admitiq.logiclitz.org`
- Local: `http://localhost:8787`

## Authentication

Use bearer keys:

`Authorization: Bearer aq_live_xxx`

Keys are environment scoped. Use different keys for `test` and `live`.

## Versioning

- URI major versioning (`/v1/...`)
- backward-compatible additions only within a major
- breaking changes require `/v2`

## Request contract

- `Content-Type: application/json`
- max body size: 32 KB (prototype default)
- `jti` should be a non-empty string
- clients should normalize Unicode identifiers consistently

## Error envelope

```json
{
  "error": {
    "code": "quota_exceeded",
    "message": "Monthly limit reached",
    "retryable": false,
    "request_id": "req_..."
  }
}
```

## Status code guidance

- `200` success
- `400` malformed input
- `401` invalid/missing key
- `403` scope/entitlement denied
- `404` not found
- `409` conflict/idempotency collision
- `422` semantically invalid request
- `429` rate limited
- `5xx` transient server error

## Idempotency

For mutating endpoints, send `Idempotency-Key` to safely retry on network uncertainty.

Server behavior:

- same key + same payload: return previous response
- same key + different payload: `409 idempotency_conflict`

## Endpoints (target contract)

- `POST /v1/tokens/consume`
- `POST /v1/tokens/check`
- `POST /v1/tokens/revoke`
- `POST /v1/tokens/unrevoke`
- `GET /v1/usage`
- `GET /v1/analytics`

Prototype endpoints under `hosted/` are transitional.
