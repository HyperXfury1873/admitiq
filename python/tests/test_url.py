from admitiq import issue, verify
from admitiq.url import embed_in_url, issue_url, token_from_url

SECRET = "url-test-secret"


def test_issue_url_embeds_verifiable_token():
    url = issue_url("https://example.com/scan", {"seat": "A1"}, ttl_seconds=60, secret=SECRET)
    assert url.startswith("https://example.com/scan?token=")
    token = token_from_url(url)
    payload = verify(token, secret=SECRET)
    assert payload["data"]["seat"] == "A1"


def test_embed_preserves_query():
    token = issue({"x": 1}, ttl_seconds=60, secret=SECRET)
    url = embed_in_url("https://example.com/scan?ref=web", token)
    assert "ref=web" in url
    assert "token=" in url
    assert token_from_url(url) == token


def test_custom_scheme():
    token = issue({"x": 1}, ttl_seconds=60, secret=SECRET)
    url = embed_in_url("myapp://checkin", token)
    assert url.startswith("myapp://checkin")
    assert token_from_url(url) == token


def test_token_from_url_missing():
    import pytest

    with pytest.raises(ValueError, match='No "token"'):
        token_from_url("https://example.com/scan")
