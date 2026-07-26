# AdmitiQ (JavaScript / Node)

[![npm](https://img.shields.io/npm/v/admitiq.svg)](https://www.npmjs.com/package/admitiq)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)

**A [LogicLitz](https://logiclitz.org) open-source project.**

Signed, expiring, revocable tokens for QR codes and links.

> New here? Start with the [interactive tutorial](https://admitiq.logiclitz.org) or [../docs/what-is-admitiq.md](../docs/what-is-admitiq.md).

## Install

```bash
npm install admitiq
npm install qrcode   # optional: QR images
npm install redis    # optional: Redis single-use store
```

If the package is not on the npm registry yet:

```bash
git clone https://github.com/HyperXfury1873/admitiq.git
npm install ./admitiq/js
```

## Tiny example

```javascript
const { issue, verify, issueUrl, issueQR } = require("admitiq");

const token = issue({ ticketId: "abc123" }, 3600, "your-secret-key");
const url = issueUrl("https://example.com/scan", { ticketId: "abc123" }, 3600, "your-secret-key");
// await issueQR({ ticketId: "abc123" }, 3600, "your-secret-key", "ticket.png"); // needs qrcode

const payload = await verify(token, "your-secret-key");
console.log(payload.data);
```

A Python app can verify this same token with the same secret (`pip install admitiq`).

## More

| Topic | Link |
|-------|------|
| Full JS guide | [docs/javascript.md](../docs/javascript.md) |
| Getting started | [docs/getting-started.md](../docs/getting-started.md) |
| Landing / tutorial | [docs/landing.md](../docs/landing.md) |
| QR & URL delivery | [docs/delivering-tokens.md](../docs/delivering-tokens.md) |
| Key rotation | [docs/key-rotation.md](../docs/key-rotation.md) |
| Security | [SECURITY.md](../SECURITY.md) |
| Publish to npm | [PUBLISH.md](../PUBLISH.md) |
| Express demo | [examples/express-ticket-check](../examples/express-ticket-check) |

## License

MIT — [LogicLitz](https://logiclitz.org)
