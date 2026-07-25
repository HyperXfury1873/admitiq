"""
admitiq.url — embed tokens in URLs / deep links (and pull them back out).

The token is still a plain signed string. These helpers only attach it to a
URL you provide (default query param: \"token\").
"""
from typing import Any, Dict, Optional
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from .core import issue

DEFAULT_PARAM = "token"


def embed_in_url(base_url: str, token: str, param: str = DEFAULT_PARAM) -> str:
    """
    Attach an existing token to a base URL as a query parameter.

    Works with https:// links and custom schemes (e.g. myapp://checkin).
    Existing query parameters are preserved; ``param`` is set/replaced.
    """
    if not base_url or not isinstance(base_url, str):
        raise ValueError("base_url must be a non-empty string")
    if not token or not isinstance(token, str):
        raise ValueError("token must be a non-empty string")

    parts = urlsplit(base_url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query[param] = token
    new_query = urlencode(query)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, new_query, parts.fragment))


def issue_url(
    base_url: str,
    payload: Dict[str, Any],
    ttl_seconds: int,
    secret: str,
    param: str = DEFAULT_PARAM,
) -> str:
    """Issue a token and return a URL with it embedded."""
    token = issue(payload, ttl_seconds=ttl_seconds, secret=secret)
    return embed_in_url(base_url, token, param=param)


def token_from_url(url: str, param: str = DEFAULT_PARAM) -> str:
    """Extract a token from a URL's query string."""
    if not url or not isinstance(url, str):
        raise ValueError("url must be a non-empty string")
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    token = query.get(param)
    if not token:
        raise ValueError(f'No "{param}" query parameter found in URL')
    return token
