# AdmitiQ (Python)

**A [LogicLitz](https://logiclitz.org) open-source project.**

Signed, expiring, revocable tokens for QR codes and links.

> New here? Start with: [../docs/what-is-admitiq.md](../docs/what-is-admitiq.md)

## Install

```bash
pip install admitiq
pip install admitiq[qr]     # optional: QR images
pip install admitiq[ec]     # optional: ES256
pip install admitiq[redis]  # optional: Redis single-use store
```

## Tiny example

```python
from admitiq import issue, verify, issue_url, issue_qr

token = issue({"ticket_id": "abc123"}, ttl_seconds=3600, secret="your-secret-key")
url = issue_url("https://example.com/scan", {"ticket_id": "abc123"}, ttl_seconds=3600, secret="your-secret-key")
# issue_qr(..., output_path="ticket.png")  # needs: pip install admitiq[qr]

payload = verify(token, secret="your-secret-key")
print(payload["data"])
```

A Node app can verify this same token with the same secret (`npm install admitiq`).

## More

| Topic | Link |
|-------|------|
| Full Python guide | [docs/python.md](../docs/python.md) |
| QR & URL delivery | [docs/delivering-tokens.md](../docs/delivering-tokens.md) |
| Key rotation | [docs/key-rotation.md](../docs/key-rotation.md) |
| Security | [SECURITY.md](../SECURITY.md) |
| Publish to PyPI | [PUBLISH.md](../PUBLISH.md) |
| Flask demo | [examples/flask-attendance](../examples/flask-attendance) |

## License

MIT — [LogicLitz](https://logiclitz.org)
