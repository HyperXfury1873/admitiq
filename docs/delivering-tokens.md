# Delivering tokens: QR codes and URLs

A admitiq token is a **string**. Crypto does not care whether that string lives in a QR image,
a web link, SMS, or an API body.

The library includes helpers for the two most common carriers: **QR** and **URL**.

Other carriers (NFC, barcodes, email body) can use the same string — we do not ship
platform-specific helpers for those, because they are app/OS specific and easy to misuse.

---

## URLs / deep links

### Python

```python
from admitiq import issue_url, token_from_url, verify, embed_in_url, issue

url = issue_url(
    "https://example.com/scan",
    {"ticket_id": "T-1"},
    ttl_seconds=3600,
    secret="secret",
)
# → https://example.com/scan?token=eyJ...

token = token_from_url(url)
payload = verify(token, secret="secret")

# Or attach an existing token:
token = issue({"ticket_id": "T-1"}, ttl_seconds=3600, secret="secret")
url = embed_in_url("myapp://checkin", token)
```

### JavaScript

```javascript
const { issueUrl, tokenFromUrl, verify, embedInUrl, issue } = require("admitiq");

const url = issueUrl(
  "https://example.com/scan",
  { ticketId: "T-1" },
  3600,
  "secret"
);

const token = tokenFromUrl(url);
const payload = await verify(token, "secret");

const existing = issue({ ticketId: "T-1" }, 3600, "secret");
const deepLink = embedInUrl("myapp://checkin", existing);
```

Default query parameter name is `token`. Pass a different `param` if you need another name.

---

## QR images

Optional dependency:

```bash
pip install admitiq[qr]
# or
npm install qrcode
```

### Encode a raw token

```python
from admitiq import issue_qr
result = issue_qr({"ticket_id": "T-1"}, ttl_seconds=3600, secret="secret", output_path="ticket.png")
# result["token"], result["qr"]
```

```javascript
const { issueQR } = require("admitiq");
const { token, qr } = await issueQR({ ticketId: "T-1" }, 3600, "secret", "ticket.png");
```

### Encode a full URL in the QR (web check-in)

Scanning opens/carries the link, not only the opaque token:

```python
from admitiq import issue_url_qr
result = issue_url_qr(
    "https://example.com/scan",
    {"ticket_id": "T-1"},
    ttl_seconds=3600,
    secret="secret",
    output_path="ticket.png",
)
# result["url"], result["token"], result["qr"]
```

```javascript
const { issueUrlQR } = require("admitiq");
const { url, token, qr } = await issueUrlQR(
  "https://example.com/scan",
  { ticketId: "T-1" },
  3600,
  "secret",
  "ticket.png"
);
```

You can also call `generate_qr(content)` / `generateQR(content)` on any string (token or URL).

---

## What we intentionally skip

| Carrier | Why no first-class helper |
|---------|---------------------------|
| SMS / email | Just put the URL or token in the message body |
| NFC | Platform NDEF APIs differ; keep in your app |
| Barcodes | Length limits often break long tokens |

---

## Next

- [Getting started](getting-started.md)
- [Python guide](python.md)
- [JavaScript guide](javascript.md)
- [Security](../SECURITY.md)
