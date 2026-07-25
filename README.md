# AdmitiQ

**A [LogicLitz](https://logiclitz.org) open-source project.**

> Signed, expiring, revocable tokens for QR codes and links — so a scan can prove a code is real, still valid, and hasn’t already been used.

Package name on pip/npm: **`admitiq`**.

Most QR libraries only encode plain text. Anyone who screenshots the code can reuse it forever. **AdmitiQ** puts a small signed token *under* the QR or URL instead.

```text
You put data in  →  AdmitiQ signs it  →  QR image / URL / string
Someone scans it →  AdmitiQ verifies  →  accept or reject
```

Works the same in **Python** and **JavaScript**. A token from one language verifies in the other.

---

## 60-second start (pick one)

### Python

```bash
pip install admitiq
```

```python
from admitiq import issue, verify

token = issue({"ticket_id": "abc123"}, ttl_seconds=3600, secret="your-secret-key")
payload = verify(token, secret="your-secret-key")
print(payload["data"])  # {"ticket_id": "abc123"}
```

### JavaScript (Node)

```bash
npm install admitiq
```

```javascript
const { issue, verify } = require("admitiq");

const token = issue({ ticketId: "abc123" }, 3600, "your-secret-key");
const payload = await verify(token, "your-secret-key");
console.log(payload.data); // { ticketId: "abc123" }
```

> **Not published yet?** Install from this repo:
> ```bash
> pip install -e ./python
> # or
> npm install ./js
> ```
> Full publish steps: [docs/publishing.md](docs/publishing.md) · [PUBLISH.md](PUBLISH.md).

---

## What you get

| Feature | What it means for you |
|--------|------------------------|
| **Signed** | Fake / edited tickets fail verification |
| **Expiring** | Old codes stop working after a time you choose |
| **Revocable / single-use** | Optional: block a code after first scan |
| **Cross-language** | Issue in Python, verify in Node (or the reverse) |
| **QR + URL helpers** | `issue_qr` / `issue_url` and JS equivalents |
| **No required server** | Library works fully offline / self-hosted |
| **No AI** | Pure cryptography (HMAC or ES256) |

---

## Repo layout

```text
admitiq/
  python/          # PyPI package (admitiq)
  js/              # npm package (admitiq)
  docs/            # Beginner-friendly documentation
  examples/        # Express, Flask, cross-language demos
  landing/         # AdmitiQLanding.jsx (keep in sync with admitiq-landing/src)
  admitiq-landing/ # Vite preview app — run `npm run dev` here
  SECURITY.md      # Threat model, rotation, privacy
  PUBLISH.md       # How to publish to npm + PyPI
```

Preview the landing page:

```bash
cd admitiq-landing
npm install
npm run dev
```

---

## Documentation (start here if you’re new)

1. [What is AdmitiQ?](docs/what-is-admitiq.md)  
2. [Getting started](docs/getting-started.md)  
3. [Python guide](docs/python.md)  
4. [JavaScript guide](docs/javascript.md)  
5. [QR & URL delivery](docs/delivering-tokens.md)  
6. [Key rotation](docs/key-rotation.md)  
7. [Security model](SECURITY.md)  
8. [Publishing to npm & PyPI](docs/publishing.md)  

Also: [python/README.md](python/README.md) · [js/README.md](js/README.md)

---

## Run tests locally

```bash
# Python
cd python && pip install -e ".[dev,ec]" && pytest -q

# JavaScript
cd js && npm test
```

---

## License

MIT © [LogicLitz](https://logiclitz.org)
