# Getting started

Goal: create a token, verify it, and understand the result — in under 5 minutes.

## 1. Install

### Option A — from PyPI / npm (after publish)

```bash
pip install admitiq
# or
npm install admitiq
```

### Option B — from this repo (today)

```bash
# Python
cd python
pip install -e ".[qr,ec,dev]"

# JavaScript — from another Node project:
npm install /absolute/path/to/admitiq/js
```

## 2. Create a secret

Pick a long random string. **Never put it in the QR code or in frontend JavaScript.**

Examples:

```bash
# good enough for local demos
your-secret-key-change-me-in-production
```

In production, load it from an environment variable.

## 3. Issue a token (Python)

```python
from admitiq import issue

token = issue(
    {"ticket_id": "T-1001", "name": "Priya"},
    ttl_seconds=3600,          # valid for 1 hour
    secret="your-secret-key",
)
print(token)  # long string: header.body.signature
```

## 4. Verify a token (Python)

```python
from admitiq import verify, TokenExpiredError, InvalidSignatureError

try:
    payload = verify(token, secret="your-secret-key")
    print("OK:", payload["data"])
except TokenExpiredError:
    print("Too late — this ticket expired.")
except InvalidSignatureError:
    print("Fake or damaged ticket.")
```

## 5. Same thing in JavaScript

```javascript
const { issue, verify, TokenExpiredError, InvalidSignatureError } = require("admitiq");

const token = issue({ ticketId: "T-1001", name: "Priya" }, 3600, "your-secret-key");

try {
  const payload = await verify(token, "your-secret-key");
  console.log("OK:", payload.data);
} catch (err) {
  if (err instanceof TokenExpiredError) console.log("Expired");
  else if (err instanceof InvalidSignatureError) console.log("Fake / tampered");
  else throw err;
}
```

## 6. (Optional) Put it in a URL or QR

**URL (built-in, no extra package):**

```python
from admitiq import issue_url, token_from_url, verify
url = issue_url("https://example.com/scan", {"ticket_id": "T-1001"}, 3600, "your-secret-key")
payload = verify(token_from_url(url), secret="your-secret-key")
```

```javascript
const { issueUrl, tokenFromUrl, verify } = require("admitiq");
const url = issueUrl("https://example.com/scan", { ticketId: "T-1001" }, 3600, "your-secret-key");
const payload = await verify(tokenFromUrl(url), "your-secret-key");
```

**QR image** (needs `pip install admitiq[qr]` or `npm install qrcode`):

```python
from admitiq import issue_qr
issue_qr({"ticket_id": "T-1001"}, ttl_seconds=3600, secret="your-secret-key", output_path="ticket.png")
```

```javascript
const { issueQR } = require("admitiq");
await issueQR({ ticketId: "T-1001" }, 3600, "your-secret-key", "ticket.png");
```

More: [delivering-tokens.md](delivering-tokens.md).

## 7. What does a successful verify return?

Something like:

```json
{
  "iat": 1710000000,
  "exp": 1710003600,
  "jti": "unique-id-for-this-ticket",
  "data": { "ticket_id": "T-1001", "name": "Priya" }
}
```

- `data` — what you put in  
- `jti` — unique id (use this for “already used” tracking)  
- `exp` — unix expiry time  
- `iat` — issued-at time  

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Secret in the browser | Keep secrets on the server only |
| Forgot `await` in JS | `verify` is async — always `await` it |
| No revocation callback | Reuse is allowed unless you pass `is_revoked` / `isRevoked` |
| Different secrets | Issue and verify must use the same secret (or a rotation list) |

## Next

- [Python guide](python.md)  
- [JavaScript guide](javascript.md)  
- [Key rotation](key-rotation.md)  
- [Examples](../examples/README.md)
