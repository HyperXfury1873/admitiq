# AdmitiQ

[![PyPI](https://img.shields.io/pypi/v/admitiq.svg)](https://pypi.org/project/admitiq/)
[![npm](https://img.shields.io/npm/v/admitiq.svg)](https://www.npmjs.com/package/admitiq)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/HyperXfury1873/admitiq/blob/main/LICENSE)

**Signed, expiring, revocable tokens for QR codes and ticket links.**

A [LogicLitz](https://logiclitz.org) open-source project · Site: [admitiq.logiclitz.org](https://admitiq.logiclitz.org)

| | |
|--|--|
| **Website & tutorial** | https://admitiq.logiclitz.org |
| **Token playground** | https://admitiq.logiclitz.org/debugger |
| **Organization** | https://logiclitz.org |
| **Source** | https://github.com/HyperXfury1873/admitiq |
| **JavaScript twin** | [`npm install admitiq`](https://www.npmjs.com/package/admitiq) |

A QR code is just text with better marketing. AdmitiQ puts an **HMAC-signed (or ES256) token** under the QR or inside a URL so a scan can prove: we issued it, it hasn’t expired, and (optionally) it hasn’t been used yet.

Tokens are **cross-language**: issue in Python, verify in Node (and the reverse) with the same secret.

---

## Install

```bash
pip install admitiq

# optional extras
pip install "admitiq[qr]"     # QR images (qrcode + Pillow)
pip install "admitiq[ec]"     # ES256 / cryptography
pip install "admitiq[redis]"  # Redis single-use / revoke store
```

## Quick start

```python
from admitiq import issue, verify, issue_url, issue_qr
import os

SECRET = os.environ["ADMITIQ_SECRET"]  # keep on the server only

token = issue({"ticket_id": "T-1001", "seat": "A12"}, ttl_seconds=3600, secret=SECRET)
url = issue_url(
    "https://events.example/scan",
    {"ticket_id": "T-1001"},
    ttl_seconds=3600,
    secret=SECRET,
)
# issue_qr(..., output_path="ticket.png")  # needs admitiq[qr]

payload = verify(token, secret=SECRET)
print(payload["data"])  # {"ticket_id": ..., "seat": ...}
```

### FastAPI / Flask helpers

```python
from admitiq.frameworks import fastapi_dependency, flask_require_token
```

See the [Python guide](https://github.com/HyperXfury1873/admitiq/blob/main/docs/python.md) and the [Flask attendance example](https://github.com/HyperXfury1873/admitiq/tree/main/examples/flask-attendance).

### Key rotation

```python
from admitiq import verify_with_secrets
payload = verify_with_secrets(token, secrets=[NEW_SECRET, OLD_SECRET])
```

### ES256 (untrusted scanners)

```python
from admitiq.ec import generate_keypair, issue, verify
private_pem, public_pem = generate_keypair()
token = issue({"ticket_id": "T-1001"}, ttl_seconds=3600, private_key_pem=private_pem)
verify(token, public_key_pem=public_pem)  # scanner holds public key only
```

---

## Docs & guides

| Resource | URL |
|----------|-----|
| Interactive tutorial | https://admitiq.logiclitz.org/tutorial |
| Issue & verify playground | https://admitiq.logiclitz.org/debugger |
| Getting started | https://admitiq.logiclitz.org/getting-started |
| Python guide | https://github.com/HyperXfury1873/admitiq/blob/main/docs/python.md |
| Delivering tokens (QR / URL) | https://github.com/HyperXfury1873/admitiq/blob/main/docs/delivering-tokens.md |
| Key rotation | https://github.com/HyperXfury1873/admitiq/blob/main/docs/key-rotation.md |
| Security model | https://github.com/HyperXfury1873/admitiq/blob/main/SECURITY.md |
| Flask example | https://github.com/HyperXfury1873/admitiq/tree/main/examples/flask-attendance |
| What is AdmitiQ? | https://github.com/HyperXfury1873/admitiq/blob/main/docs/what-is-admitiq.md |

---

## Project links

These also appear in the PyPI sidebar:

- Homepage — https://admitiq.logiclitz.org  
- Documentation — https://admitiq.logiclitz.org/getting-started  
- LogicLitz — https://logiclitz.org  
- Source — https://github.com/HyperXfury1873/admitiq  
- Bug tracker — https://github.com/HyperXfury1873/admitiq/issues  
- Changelog — https://github.com/HyperXfury1873/admitiq/releases  

## License

MIT © [LogicLitz](https://logiclitz.org)
