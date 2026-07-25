# JavaScript guide

Install:

```bash
npm install admitiq
# optional QR images:
npm install qrcode
# optional Redis store:
npm install redis
```

From this repo before publish:

```bash
npm install /path/to/admitiq/js
```

Requires **Node 16+**.

## Basic issue + verify

```javascript
const { issue, verify } = require("admitiq");

const SECRET = "change-me";
const token = issue({ ticketId: "abc123" }, 3600, SECRET);
const payload = await verify(token, SECRET);
console.log(payload.data);
```

## Handle errors

```javascript
const {
  verify,
  TokenExpiredError,
  InvalidSignatureError,
  TokenRevokedError,
  UnsupportedTokenVersionError,
} = require("admitiq");

try {
  const payload = await verify(token, SECRET);
} catch (err) {
  if (err instanceof TokenExpiredError) console.log("Expired");
  else if (err instanceof InvalidSignatureError) console.log("Fake or damaged");
  else if (err instanceof TokenRevokedError) console.log("Already used");
  else if (err instanceof UnsupportedTokenVersionError) console.log("Bad token version");
  else throw err;
}
```

## URLs and QR codes

```javascript
const { issueUrl, tokenFromUrl, issueQR, issueUrlQR, verify } = require("admitiq");

const url = issueUrl("https://example.com/scan", { ticketId: "x" }, 3600, SECRET);
const payload = await verify(tokenFromUrl(url), SECRET);

// QR of raw token (needs npm install qrcode)
await issueQR({ ticketId: "x" }, 3600, SECRET, "t.png");

// QR of full URL
await issueUrlQR("https://example.com/scan", { ticketId: "x" }, 3600, SECRET, "u.png");
```

See [delivering-tokens.md](delivering-tokens.md).

## Single-use

```javascript
const used = new Set();

const payload = await verify(token, SECRET, (jti) => used.has(jti));
used.add(payload.jti);
```

## Redis store

```javascript
const { createClient } = require("redis");
const { verify } = require("admitiq");
const { RedisRevocationStore } = require("admitiq/stores/redisStore");

const client = createClient({ url: "redis://localhost:6379" });
await client.connect();
const store = new RedisRevocationStore({ client });

const payload = await verify(token, SECRET, store.isRevoked.bind(store));
await store.markUsed(payload.jti);
```

## Key rotation

```javascript
const { issue, verifyWithSecrets } = require("admitiq");

const token = issue({ ticketId: "x" }, 3600, NEW_SECRET);
const payload = await verifyWithSecrets(token, [NEW_SECRET, OLD_SECRET]);
```

See [key-rotation.md](key-rotation.md).

## Asymmetric signing (ES256)

```javascript
const { generateKeypair, issue, verify, verifyWithPublicKeys } = require("admitiq/ec");

const { privateKey, publicKey } = generateKeypair();
const token = issue({ ticketId: "abc" }, 3600, privateKey);
const payload = await verify(token, publicKey);

// Rotation:
await verifyWithPublicKeys(token, [NEW_PUBLIC, OLD_PUBLIC]);
```

## Express middleware

```javascript
const express = require("express");
const { admitiqMiddleware } = require("admitiq/express");

const app = express();
app.use(express.json());

app.post("/scan", admitiqMiddleware({ secret: "your-secret-key" }), (req, res) => {
  res.json({ ok: true, data: req.admitiq.data });
});
```

POST body: `{ "token": "<scanned token>" }`.

## Cross-language

A token from Node verifies in Python with the **same secret**. See `examples/cross-language/`.
