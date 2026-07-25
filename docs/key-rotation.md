# Key rotation

When you change an HMAC secret (or EC keypair), old tokens would normally fail forever — including printed QR tickets still within their TTL.

admitiq supports a **transition window**: issue with the new key, verify against a list of keys.

## HMAC (shared secret)

**Python**

```python
from admitiq import issue, verify_with_secrets

NEW = "secret-2026-07"
OLD = "secret-2026-01"

# Always issue with NEW
token = issue({"ticket_id": "1"}, ttl_seconds=86400, secret=NEW)

# Accept NEW or OLD while old tickets may still exist
payload = verify_with_secrets(token, secrets=[NEW, OLD])
```

**JavaScript**

```javascript
const { issue, verifyWithSecrets } = require("admitiq");

const NEW = "secret-2026-07";
const OLD = "secret-2026-01";

const token = issue({ ticketId: "1" }, 86400, NEW);
const payload = await verifyWithSecrets(token, [NEW, OLD]);
```

### How long to keep OLD?

Keep `OLD` in the list until:

`longest ticket TTL you care about + a small clock-skew buffer`

Then remove it. After a **confirmed leak**, shorten that window and revoke known `jti`s if you can.

## ES256 (public keys)

**Python:** `ec.verify_with_public_keys(token, public_key_pems=[NEW_PUB, OLD_PUB])`  
**JavaScript:** `verifyWithPublicKeys(token, [NEW_PUB, OLD_PUB])`

Issue only with the new private key.

## Order matters

Put the **current** secret/key first. That keeps the common path fast.

## More detail

See [SECURITY.md](../SECURITY.md) — “Key rotation” and “Token format versioning”.
