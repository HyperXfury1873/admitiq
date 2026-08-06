# Hosted API Quickstart

## 1) Create project and API key

1. Create an organization and project in the hosted dashboard.
2. Create separate `test` and `live` environments.
3. Generate an API key (`aq_live_...`) with least-privilege scopes.
4. Store it in your secret manager as `ADMITIQ_API_KEY`.

## 2) Keep signing local

Issue and verify AdmitiQ tokens in your own backend using the OSS SDK.
Use hosted API only for revocation/single-use coordination.

## 3) Python integration

```python
import os
from admitiq import issue, verify, TokenRevokedError
from admitiq.stores.hosted_store import HostedRevocationStore

SECRET = os.environ["ADMITIQ_SECRET"]
store = HostedRevocationStore(api_key=os.environ["ADMITIQ_API_KEY"])

token = issue({"ticket_id": "A-123"}, ttl_seconds=3600, secret=SECRET)
payload = verify(token, secret=SECRET, is_revoked=store.is_revoked)

# Gate entry on first-use result
first = store.mark_used(payload["jti"])
if not first:
    raise TokenRevokedError("Token already consumed")
```

## 4) JavaScript integration

```javascript
const { issue, verify, TokenRevokedError } = require("admitiq");
const { HostedRevocationStore } = require("admitiq/stores/hostedStore");

const SECRET = process.env.ADMITIQ_SECRET;
const store = new HostedRevocationStore({ apiKey: process.env.ADMITIQ_API_KEY });

const token = issue({ ticketId: "A-123" }, 3600, SECRET);
const payload = await verify(token, SECRET, store.isRevoked.bind(store));

const first = await store.markUsed(payload.jti);
if (!first) {
  throw new TokenRevokedError("Token already consumed");
}
```

## 5) Recommended scanner flow

Prefer a single atomic endpoint (`/v1/tokens/consume`) once available.
Until then, always enforce the `first` result returned by `mark_used`/`markUsed`.

## 6) Operational defaults

- timeout: 2-5s
- retry: exponential backoff with jitter for 429/5xx
- fail mode: explicit policy per route (`fail-open` or `fail-closed`)
