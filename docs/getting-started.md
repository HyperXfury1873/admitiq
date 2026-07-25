# Getting started

**Goal:** create a token, verify it, and understand the result — in under 5 minutes.

**Prefer a visual tour?** Open the interactive tutorial first:  
→ **https://hyperxfury1873.github.io/admitiq/**

---

## 1. Install

### Python (recommended — live on PyPI)

```bash
pip install admitiq
```

Optional extras:

```bash
pip install "admitiq[qr]"      # QR image helpers
pip install "admitiq[ec]"      # ES256
pip install "admitiq[redis]"   # Redis single-use store
```

### JavaScript (Node)

```bash
npm install admitiq
```

If the npm package is not published yet, clone and install the `js/` folder:

```bash
git clone https://github.com/HyperXfury1873/admitiq.git
npm install ./admitiq/js
```

Optional peers:

```bash
npm install qrcode   # QR images
npm install redis    # Redis single-use store
```

### From this repo (contributors)

```bash
# Python
cd python && pip install -e ".[qr,ec,dev]"

# JavaScript — from another Node project:
npm install /absolute/path/to/admitiq/js
```

---

## 2. Create a secret

Pick a long random string. **Never put it in the QR code or in frontend JavaScript.**

```text
your-secret-key-change-me-in-production
```

In production, load it from an environment variable (for example `ADMITIQ_SECRET`).

---

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

---

## 6. Put it in a URL or QR (optional)

```python
from admitiq import issue_url

link = issue_url(
    "https://example.com/scan",
    {"ticket_id": "T-1001"},
    ttl_seconds=3600,
    secret="your-secret-key",
)
print(link)  # https://example.com/scan?t=...
```

```javascript
const { issueUrl } = require("admitiq");
const link = issueUrl("https://example.com/scan", { ticketId: "T-1001" }, 3600, "your-secret-key");
```

More detail: [delivering-tokens.md](delivering-tokens.md).

---

## 7. What to build next

| You want… | Go to… |
|-----------|--------|
| Full Python API | [python.md](python.md) |
| Full JavaScript API | [javascript.md](javascript.md) |
| Copy-paste demo apps | [../examples/README.md](../examples/README.md) |
| Rotate secrets safely | [key-rotation.md](key-rotation.md) |
| Threat model | [../SECURITY.md](../SECURITY.md) |
| Interactive UI | [landing.md](landing.md) |

---

## Common mistakes

1. Putting the **secret** in the browser or inside the QR — only the **token** goes there.  
2. Using a short / guessable secret.  
3. Expecting unlimited reuse — enable a revocation store for single-use tickets.  
4. Mixing TestPyPI tokens with real PyPI (maintainers only — see [publishing.md](publishing.md)).
