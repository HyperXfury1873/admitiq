"""Verify the token written by issue_js.js."""
from pathlib import Path

from admitiq import verify

SECRET = "shared-cross-lang-secret"
token = Path("token_from_js.txt").read_text(encoding="utf-8").strip()
payload = verify(token, secret=SECRET)
print("Python verified Node token:", payload["data"])
