# AdmitiQ (JavaScript / Node)

**A [LogicLitz](https://logiclitz.org) open-source project.**

Signed, expiring, revocable tokens for QR codes and links.

> New here? Start with: [../docs/what-is-admitiq.md](../docs/what-is-admitiq.md)

## Install

```bash
npm install admitiq
```npm install qrcode   # optional: QR images
npm install redis    # optional: Redis single-use store
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
| QR & URL delivery | [docs/delivering-tokens.md](../docs/delivering-tokens.md) |
| Key rotation | [docs/key-rotation.md](../docs/key-rotation.md) |
| Security | [SECURITY.md](../SECURITY.md) |
| Publish to npm | [PUBLISH.md](../PUBLISH.md) |
| Express demo | [examples/express-ticket-check](../examples/express-ticket-check) |

## License

MIT — [LogicLitz](https://logiclitz.org)
