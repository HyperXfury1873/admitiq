import pytest

from admitiq.core import (
    InvalidSignatureError,
    TokenExpiredError,
    TokenRevokedError,
    issue,
    verify,
)

SECRET = "test-secret"


def test_issue_and_verify_roundtrip():
    token = issue({"ticket_id": "abc123"}, ttl_seconds=60, secret=SECRET)
    payload = verify(token, secret=SECRET)
    assert payload["data"]["ticket_id"] == "abc123"
    assert "iat" in payload and "exp" in payload and "jti" in payload


def test_expired_token_raises():
    token = issue({"ticket_id": "abc123"}, ttl_seconds=-1, secret=SECRET)
    with pytest.raises(TokenExpiredError):
        verify(token, secret=SECRET)


def test_tampered_signature_raises():
    token = issue({"ticket_id": "abc123"}, ttl_seconds=60, secret=SECRET)
    tampered = token[:-2] + "xx"
    with pytest.raises(InvalidSignatureError):
        verify(tampered, secret=SECRET)


def test_wrong_secret_raises():
    token = issue({"ticket_id": "abc123"}, ttl_seconds=60, secret=SECRET)
    with pytest.raises(InvalidSignatureError):
        verify(token, secret="wrong-secret")


def test_revoked_token_raises():
    token = issue({"ticket_id": "abc123"}, ttl_seconds=60, secret=SECRET)
    with pytest.raises(TokenRevokedError):
        verify(token, secret=SECRET, is_revoked=lambda jti: True)


def test_malformed_token_raises():
    with pytest.raises(InvalidSignatureError):
        verify("not-a-real-token", secret=SECRET)


def test_verify_with_secrets_rotation():
    from admitiq.core import verify_with_secrets

    token = issue({"ticket_id": "abc123"}, ttl_seconds=60, secret="old-secret")
    payload = verify_with_secrets(token, secrets=["new-secret", "old-secret"])
    assert payload["data"]["ticket_id"] == "abc123"


def test_verify_with_secrets_all_fail():
    from admitiq.core import verify_with_secrets

    token = issue({"ticket_id": "abc123"}, ttl_seconds=60, secret=SECRET)
    with pytest.raises(InvalidSignatureError):
        verify_with_secrets(token, secrets=["a", "b"])
