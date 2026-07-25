import pytest

cryptography = pytest.importorskip("cryptography")

from admitiq import ec
from admitiq.core import InvalidSignatureError, TokenExpiredError


def test_generate_keypair_and_roundtrip():
    priv, pub = ec.generate_keypair()
    token = ec.issue({"ticket_id": "abc123"}, ttl_seconds=60, private_key_pem=priv)
    payload = ec.verify(token, public_key_pem=pub)
    assert payload["data"]["ticket_id"] == "abc123"


def test_wrong_public_key_rejected():
    priv, _pub = ec.generate_keypair()
    _priv2, pub2 = ec.generate_keypair()
    token = ec.issue({"ticket_id": "abc123"}, ttl_seconds=60, private_key_pem=priv)
    with pytest.raises(InvalidSignatureError):
        ec.verify(token, public_key_pem=pub2)


def test_expired_ec_token_raises():
    priv, pub = ec.generate_keypair()
    token = ec.issue({"ticket_id": "abc123"}, ttl_seconds=-1, private_key_pem=priv)
    with pytest.raises(TokenExpiredError):
        ec.verify(token, public_key_pem=pub)


def test_verify_with_public_keys_rotation():
    old_priv, old_pub = ec.generate_keypair()
    _new_priv, new_pub = ec.generate_keypair()
    token = ec.issue({"ticket_id": "abc123"}, ttl_seconds=60, private_key_pem=old_priv)
    payload = ec.verify_with_public_keys(
        token, public_key_pems=[new_pub, old_pub]
    )
    assert payload["data"]["ticket_id"] == "abc123"
