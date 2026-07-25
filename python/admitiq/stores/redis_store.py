"""
admitiq.stores.redis_store — optional Redis-backed revocation store.

A ready-made, race-condition-safe "has this token been used" store for
anyone running multiple servers/processes checking the same tokens, without
needing the hosted AdmitiQ API. Still fully self-hosted and free.

Requires the 'redis' package:
    pip install admitiq[redis]
"""
from typing import Optional


class RedisRevocationStore:
    """
    Usage:
        store = RedisRevocationStore(url="redis://localhost:6379/0")
        payload = verify(token, secret=SECRET, is_revoked=store.is_revoked)
        # only after you've decided to actually honor this scan:
        store.mark_used(payload["jti"])
    """

    def __init__(
        self,
        redis_client=None,
        url: Optional[str] = None,
        ttl_seconds: int = 86400,
        prefix: str = "admitiq:used:",
    ):
        """
        Args:
            redis_client: an existing redis.Redis instance (preferred if you already have one)
            url: alternatively, a redis:// URL to connect with
            ttl_seconds: how long to remember a used jti — should be >= your longest token TTL
            prefix: key prefix used in Redis
        """
        if redis_client is not None:
            self._client = redis_client
        else:
            try:
                import redis
            except ImportError as e:
                raise ImportError(
                    "RedisRevocationStore requires the 'redis' package. "
                    "Install it with: pip install admitiq[redis]"
                ) from e
            self._client = redis.Redis.from_url(url or "redis://localhost:6379/0")
        self._ttl = ttl_seconds
        self._prefix = prefix

    def mark_used(self, jti: str) -> bool:
        """
        Atomically mark a token as used. Returns True if this was the FIRST
        time it was marked (the scan should be allowed), False if it was
        already used (this is a reuse attempt and should be blocked).
        """
        key = f"{self._prefix}{jti}"
        was_set = self._client.set(key, "1", nx=True, ex=self._ttl)
        return bool(was_set)

    def is_revoked(self, jti: str) -> bool:
        """Pass this method directly as the `is_revoked` argument to verify()."""
        key = f"{self._prefix}{jti}"
        return bool(self._client.exists(key))
