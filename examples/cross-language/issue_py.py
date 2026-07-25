"""Issue a token with Python; Node will verify it (see verify_js.js)."""
from pathlib import Path

from admitiq import issue

SECRET = "shared-cross-lang-secret"
token = issue({"ticket_id": "cross-py", "from": "python"}, ttl_seconds=3600, secret=SECRET)
Path("token_from_python.txt").write_text(token, encoding="utf-8")
print("Wrote token_from_python.txt")
print(token[:40] + "...")
