# Why a QR code is not a ticket

*Launch post draft for AdmitiQ — adapt for HN / blog / Product Hunt.*

A QR code is a barcode with better marketing. By itself it carries text. If that text is a seat number or a coupon id, anyone with a camera has a forever pass.

AdmitiQ is a small open-source library that puts a **signed, expiring** token under the QR (or inside a URL). On scan you check:

1. Did we really issue this? (HMAC or ES256 signature)
2. Is it still within the lifetime you chose?
3. Optional: has this unique id already been accepted? (single-use / revoke)

It works the same in **Python** and **JavaScript**. A token from one language verifies in the other.

## Install

```bash
pip install admitiq
# or
npm install admitiq
```

## Sixty seconds

```python
from admitiq import issue, verify
token = issue({"ticket_id": "T-1001"}, ttl_seconds=3600, secret="your-secret")
print(verify(token, secret="your-secret")["data"])
```

```javascript
const { issue, verify } = require("admitiq");
const token = issue({ ticketId: "T-1001" }, 3600, "your-secret");
console.log((await verify(token, "your-secret")).data);
```

## Try it

Interactive tutorial (runs in the browser, no account):  
https://admitiq.logiclitz.org/tutorial

Why we built it: https://admitiq.logiclitz.org/why  
Secure QR guide: https://admitiq.logiclitz.org/guides/secure-qr-codes  
Source: https://github.com/HyperXfury1873/admitiq  

MIT · developed by [LogicLitz](https://logiclitz.org)

---

## Distribution checklist

- [ ] Publish this post on the LogicLitz blog or as a GitHub Discussion
- [ ] Show HN — title like: “Show HN: AdmitiQ – signed, expiring tokens for QR tickets (Python + JS)”
- [ ] r/programming, r/Python, r/node — link tutorial, not just the repo
- [ ] dev.to cross-post
- [ ] Product Hunt / Peerlist when registries + site are stable
- [ ] Reply to every early GitHub issue within a day for two weeks
- [ ] Track: GitHub stars, `pip`/`npm` download charts, inbound issues
