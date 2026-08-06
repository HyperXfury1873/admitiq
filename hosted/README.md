# AdmitiQ Hosted Revocation API (Public Prototype)

Optional convenience API for multi-scanner single-use / revoke without self-hosted Redis.

The free `admitiq` library does **not** require this service. Hosted features are opt-in.

This folder is a **public MIT prototype**. Commercial production implementation
should live in a separate private repository. See `docs/hosted-api/boundary.md`.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/v1/tokens/consume` | Atomic first-use consume |
| `POST` | `/v1/tokens/check` | Is this `jti` revoked? |
| `POST` | `/v1/tokens/revoke` | Mark `jti` revoked (idempotent) |
| `POST` | `/v1/tokens/unrevoke` | Remove revoked state |
| `GET` | `/v1/usage` | Metering summary for the API key |
| `GET` | `/v1/analytics` | Aggregate outcomes |
| `POST` | `/v1/billing/checkout` | Stripe checkout session (if configured) |
| `GET` | `/health` | Liveness |

Auth: `Authorization: Bearer <api_key>` (keys start with `aq_live_`).

Privacy: store **jti + timestamps + outcome only**. Never send or log token `data` payloads.

## Local run

```bash
cd hosted
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

## Stripe

Set `STRIPE_SECRET_KEY` and price IDs in `.env`. Checkout helpers are stubs until you create Products in Stripe Dashboard (Starter / Growth). Free tier default: **1000** billable checks/revokes per calendar month.

## SDK clients

```js
const { HostedRevocationStore } = require("admitiq/stores/hostedStore");
const store = new HostedRevocationStore({ apiKey: process.env.ADMITIQ_API_KEY });
```

```python
from admitiq.stores.hosted_store import HostedRevocationStore
store = HostedRevocationStore(api_key=os.environ["ADMITIQ_API_KEY"])
```
