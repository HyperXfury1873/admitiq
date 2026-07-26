"""
admitiq.stores.hosted_store — optional hosted revocation store.

Calls the AdmitiQ hosted API for multi-scanner single-use without Redis.
The core library never requires this service.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any, Optional


class HostedRevocationStore:
    """
    Usage:
        store = HostedRevocationStore(api_key=os.environ["ADMITIQ_API_KEY"])
        payload = verify(token, secret=SECRET, is_revoked=store.is_revoked)
        store.mark_used(payload["jti"])
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.admitiq.logiclitz.org",
        timeout: float = 10.0,
    ):
        if not api_key:
            raise ValueError("HostedRevocationStore requires api_key")
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout

    def _post(self, path: str, body: dict) -> dict:
        req = urllib.request.Request(
            f"{self._base_url}{path}",
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8", errors="replace")
            try:
                data = json.loads(raw)
            except Exception:
                data = {"error": raw}
            raise RuntimeError(data.get("error") or f"hosted_http_{e.code}") from e

    def mark_used(self, jti: str) -> bool:
        data = self._post("/v1/revoke", {"jti": jti})
        return bool(data.get("first"))

    def is_revoked(self, jti: str) -> bool:
        data = self._post("/v1/check", {"jti": jti})
        return bool(data.get("revoked"))
