# Python guide

Install:

```bash
pip install admitiq
# optional extras:
pip install admitiq[qr]     # QR images
pip install admitiq[ec]     # ES256 asymmetric keys
pip install admitiq[redis]  # Redis single-use store
```

From this repo before publish:

```bash
pip install -e "./python[qr,ec,redis,dev]"
```

## Basic issue + verify

```python
from admitiq import issue, verify

SECRET = "change-me"

token = issue({"ticket_id": "abc123"}, ttl_seconds=3600, secret=SECRET)
payload = verify(token, secret=SECRET)
print(payload["data"])
```

## Handle errors

```python
from admitiq import (
    verify,
    TokenExpiredError,
    InvalidSignatureError,
    TokenRevokedError,
    UnsupportedTokenVersionError,
)

try:
    payload = verify(token, secret=SECRET)
except TokenExpiredError:
    print("Expired")
except InvalidSignatureError:
    print("Fake or damaged")
except TokenRevokedError:
    print("Already used")
except UnsupportedTokenVersionError:
    print("Token format too new/old for this library")
```

## URLs and QR codes

```python
from admitiq import issue_url, token_from_url, issue_qr, issue_url_qr

url = issue_url("https://example.com/scan", {"ticket_id": "x"}, ttl_seconds=3600, secret=SECRET)
payload = verify(token_from_url(url), secret=SECRET)

# QR of raw token (needs admitiq[qr])
issue_qr({"ticket_id": "x"}, ttl_seconds=3600, secret=SECRET, output_path="t.png")

# QR of full URL (web check-in)
issue_url_qr("https://example.com/scan", {"ticket_id": "x"}, ttl_seconds=3600, secret=SECRET, output_path="u.png")
```

See [delivering-tokens.md](delivering-tokens.md).

## Single-use (remember used tickets)

```python
used = set()

def already_used(jti: str) -> bool:
    return jti in used

payload = verify(token, secret=SECRET, is_revoked=already_used)
used.add(payload["jti"])  # mark used after you accept the scan
```

## Redis store (multiple servers)

```python
from admitiq import verify
from admitiq.stores import RedisRevocationStore

store = RedisRevocationStore(url="redis://localhost:6379/0")
payload = verify(token, secret=SECRET, is_revoked=store.is_revoked)
store.mark_used(payload["jti"])
```

## Key rotation

```python
from admitiq import issue, verify_with_secrets

# Issue only with the NEW secret
token = issue({"ticket_id": "x"}, ttl_seconds=3600, secret=NEW_SECRET)

# Verify accepts NEW or OLD during the transition window
payload = verify_with_secrets(token, secrets=[NEW_SECRET, OLD_SECRET])
```

See [key-rotation.md](key-rotation.md).

## Asymmetric signing (ES256)

Use when scanners should verify but **must not** be able to create new tickets.

```python
from admitiq import ec

private_key, public_key = ec.generate_keypair()
token = ec.issue({"ticket_id": "abc"}, ttl_seconds=3600, private_key_pem=private_key)
payload = ec.verify(token, public_key_pem=public_key)

# Rotation:
payload = ec.verify_with_public_keys(token, public_key_pems=[NEW_PUB, OLD_PUB])
```

## FastAPI

```python
from fastapi import Depends, FastAPI
from admitiq.frameworks import fastapi_dependency

app = FastAPI()
check = fastapi_dependency(secret="your-secret-key")

@app.post("/scan")
async def scan(payload: dict = Depends(check)):
    return {"ok": True, "data": payload["data"]}
```

Send JSON like: `{ "token": "<scanned token>" }`.

## Flask

```python
from flask import Flask, jsonify
from admitiq.frameworks import flask_require_token

app = Flask(__name__)

@app.post("/scan")
@flask_require_token(secret="your-secret-key")
def scan(admitiq_payload):
    return jsonify(ok=True, data=admitiq_payload["data"])
```

## Cross-language

A token from Python verifies in Node with the **same secret**. See `examples/cross-language/`.
