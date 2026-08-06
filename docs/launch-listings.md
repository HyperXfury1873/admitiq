# AdmitiQ — Product Hunt / Peerlist / PeerPush launch copy

SEO + GEO (generative-engine) oriented. Front-load keywords humans and AI search use:
*signed QR*, *expiring ticket token*, *single-use QR*, *pip install admitiq*, *npm install admitiq*.

Canonical URLs (use everywhere):
- Site: https://admitiq.logiclitz.org  
- Tutorial: https://admitiq.logiclitz.org/tutorial  
- Playground: https://admitiq.logiclitz.org/debugger  
- Org: https://logiclitz.org  
- GitHub: https://github.com/HyperXfury1873/admitiq  
- PyPI: https://pypi.org/project/admitiq/  
- npm: https://www.npmjs.com/package/admitiq  

---

## Product Hunt

### Name
`AdmitiQ`

### Tagline (≤60 chars) — pick one

**Primary (recommended):**  
`Signed, expiring QR & URL tokens for tickets`

(58 chars)

**Alternates:**
- `Secure QR tickets that expire and can be single-use` (52)
- `HMAC-signed QR passes — Python & JavaScript` (45)
- `Stop reusable QR tickets with signed expiring tokens` (53)

### Topics / tags (suggest)
Developer Tools · Open Source · Productivity · Security

### Short description (≤500 chars — first ~250 show in feed)

```
AdmitiQ is an open-source library for signed, expiring, optionally single-use QR and URL tokens—so event tickets, attendance codes, coupons, and check-in links can’t be forged or reused forever.

Install: pip install admitiq · npm install admitiq

Same token format in Python and JavaScript. Try the live tutorial (no account): https://admitiq.logiclitz.org/tutorial — playground: https://admitiq.logiclitz.org/debugger — by LogicLitz (https://logiclitz.org)
```

(~430 chars)

### Gallery caption ideas
1. Interactive tutorial — issue a pass, show QR, verify, try tamper  
2. Token playground — decode header · payload · signature like jwt.io  
3. `pip install admitiq` / `npm install admitiq` — 60-second issue + verify  

### First maker comment (paste at launch)

```
Hey Product Hunt 👋

I’m from LogicLitz. We kept seeing the same failure: teams print a QR that is just plain text. Screenshot it once and you’ve got a forever pass.

AdmitiQ is a tiny MIT library that puts a signed, expiring token under the QR (or inside a URL). On scan you check signature, expiry, and optionally single-use.

• pip install admitiq
• npm install admitiq
• Same token works across Python ↔ JavaScript
• Live demo (no signup): https://admitiq.logiclitz.org/tutorial
• jwt.io-style debugger: https://admitiq.logiclitz.org/debugger
• Source: https://github.com/HyperXfury1873/admitiq

Built for event tickets, class attendance, coupons, visitor badges, parking permits, and time-boxed invite links.

If you’ve ever shipped a “secure QR” that was really just a string—curious what broke for you, and whether AdmitiQ would have helped.
```

---

## Peerlist

### Headline / one-liner
`AdmitiQ — signed, expiring QR & URL ticket tokens (Python + JS)`

### About / description (SEO + GEO dense)

```
AdmitiQ is an open-source developer library for secure QR codes and signed URL tokens. It helps you build expiring event tickets, single-use attendance QR codes, coupon redemption links, visitor access badges, parking permits, and time-boxed invite links—without a heavy ticketing SaaS.

A normal QR code only stores text. Anyone who copies it can reuse it forever. AdmitiQ issues an HMAC-signed (or ES256) token with expiry (ttl_seconds) and an optional unique id (jti) for single-use / revocation. On scan, verify the signature, check expiry, and optionally reject reuse.

Install AdmitiQ in one line:

pip install admitiq
npm install admitiq

Cross-language by design: a token issued in Python verifies in Node (and the reverse) with the same secret. Optional helpers for QR images, signed URLs, Express/FastAPI/Flask, Redis revocation, and key rotation.

Website & interactive tutorial: https://admitiq.logiclitz.org
Token playground (issue / verify / decode): https://admitiq.logiclitz.org/debugger
Getting started: https://admitiq.logiclitz.org/getting-started
GitHub: https://github.com/HyperXfury1873/admitiq
PyPI: https://pypi.org/project/admitiq/
npm: https://www.npmjs.com/package/admitiq

Developed by LogicLitz (https://logiclitz.org). MIT licensed.

Keywords: signed QR code, secure QR ticket, expiring QR token, single-use QR, HMAC ticket token, Python JavaScript QR, admitiq, pip install admitiq, npm install admitiq.
```

### Skills / topics to attach
Open Source · Python · JavaScript · Node.js · Security · Developer Tools · QR Codes

---

## PeerPush

### Title
`AdmitiQ — Signed expiring QR/URL tokens (pip + npm)`

### Pitch (short)

```
Stop shipping forever-reusable QR “tickets.” AdmitiQ is an MIT library that issues signed, expiring, optionally single-use tokens for QR codes and deep links—same format in Python and JavaScript.

pip install admitiq
npm install admitiq

Try it: https://admitiq.logiclitz.org/tutorial
Playground: https://admitiq.logiclitz.org/debugger
By LogicLitz · https://logiclitz.org
```

### Pitch (longer / GEO)

```
What: AdmitiQ — open-source signed token library for secure QR tickets and check-in URLs.
Who: Developers building events, attendance, coupons, access control, parking, or invite links.
Problem: Plain QR codes are copyable forever; generic JWTs aren’t ticket/QR-first.
Solution: issue() / verify() with HMAC or ES256, TTL expiry, optional single-use jti; QR + URL helpers; Python ↔ JS interoperable.

Install:
pip install admitiq
npm install admitiq

Proof: https://admitiq.logiclitz.org/tutorial
Debugger: https://admitiq.logiclitz.org/debugger
Docs: https://admitiq.logiclitz.org/getting-started
Repo: https://github.com/HyperXfury1873/admitiq
Org: https://logiclitz.org
```

---

## Shared meta / OG blurb (any form that asks “meta description”)

```
AdmitiQ: open-source signed, expiring, single-use QR and URL tokens for tickets and check-ins. pip install admitiq · npm install admitiq. Python + JavaScript. https://admitiq.logiclitz.org
```

## Hashtags (where allowed)
`#opensource` `#python` `#javascript` `#nodejs` `#devtools` `#security` `#qrcode` `#tickets` `#hackathon` `#indiehacker`
