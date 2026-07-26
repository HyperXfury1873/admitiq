# AdmitiQ

[![npm](https://img.shields.io/npm/v/admitiq.svg)](https://www.npmjs.com/package/admitiq)
[![PyPI](https://img.shields.io/pypi/v/admitiq.svg)](https://pypi.org/project/admitiq/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/HyperXfury1873/admitiq/blob/main/LICENSE)

**Signed, expiring, revocable tokens for QR codes and ticket links.**

A [LogicLitz](https://logiclitz.org) open-source project · Site: [admitiq.logiclitz.org](https://admitiq.logiclitz.org)

| | |
|--|--|
| **Website & tutorial** | https://admitiq.logiclitz.org |
| **Token playground** | https://admitiq.logiclitz.org/debugger |
| **Organization** | https://logiclitz.org |
| **Source** | https://github.com/HyperXfury1873/admitiq |
| **Python twin** | [`pip install admitiq`](https://pypi.org/project/admitiq/) |

A QR code is just text with better marketing. AdmitiQ puts an **HMAC-signed (or ES256) token** under the QR or inside a URL so a scan can prove: we issued it, it hasn’t expired, and (optionally) it hasn’t been used yet.

Tokens are **cross-language**: issue in Node, verify in Python (and the reverse) with the same secret.

---

## Install

```bash
npm install admitiq

# optional peers
npm install qrcode   # QR PNG helpers
npm install redis    # Redis single-use / revoke store
```

## Quick start

```javascript
const { issue, verify, issueUrl, issueQR } = require("admitiq");

const SECRET = process.env.ADMITIQ_SECRET; // keep on the server only

const token = issue({ ticketId: "T-1001", seat: "A12" }, 3600, SECRET);
const url = issueUrl("https://events.example/scan", { ticketId: "T-1001" }, 3600, SECRET);
// await issueQR({ ticketId: "T-1001" }, 3600, SECRET, "ticket.png"); // needs qrcode

const payload = await verify(token, SECRET);
console.log(payload.data); // { ticketId, seat }
```

### Express middleware

```javascript
const { admitiq } = require("admitiq/express");
app.get("/scan", admitiq({ secret: process.env.ADMITIQ_SECRET }), (req, res) => {
  res.json({ ok: true, ticket: req.admitiq.data });
});
```

### Key rotation

```javascript
const { verifyWithSecrets } = require("admitiq");
await verifyWithSecrets(token, [process.env.ADMITIQ_SECRET, process.env.ADMITIQ_SECRET_OLD]);
```

### ES256 (untrusted scanners)

```javascript
const { generateKeypair, issue, verify } = require("admitiq/ec");
const { privateKey, publicKey } = generateKeypair();
const token = issue({ ticketId: "T-1001" }, 3600, privateKey);
await verify(token, publicKey); // scanner holds public key only
```

---

## Docs & guides

| Resource | URL |
|----------|-----|
| Interactive tutorial | https://admitiq.logiclitz.org/tutorial |
| Issue & verify playground | https://admitiq.logiclitz.org/debugger |
| Getting started | https://admitiq.logiclitz.org/getting-started |
| JavaScript guide | https://github.com/HyperXfury1873/admitiq/blob/main/docs/javascript.md |
| Delivering tokens (QR / URL) | https://github.com/HyperXfury1873/admitiq/blob/main/docs/delivering-tokens.md |
| Key rotation | https://github.com/HyperXfury1873/admitiq/blob/main/docs/key-rotation.md |
| Security model | https://github.com/HyperXfury1873/admitiq/blob/main/SECURITY.md |
| Express example | https://github.com/HyperXfury1873/admitiq/tree/main/examples/express-ticket-check |
| What is AdmitiQ? | https://github.com/HyperXfury1873/admitiq/blob/main/docs/what-is-admitiq.md |

---

## Links

- **Product site:** [admitiq.logiclitz.org](https://admitiq.logiclitz.org)
- **LogicLitz:** [logiclitz.org](https://logiclitz.org)
- **GitHub:** [HyperXfury1873/admitiq](https://github.com/HyperXfury1873/admitiq)
- **Issues:** https://github.com/HyperXfury1873/admitiq/issues
- **Python package:** https://pypi.org/project/admitiq/

## License

MIT © [LogicLitz](https://logiclitz.org)
