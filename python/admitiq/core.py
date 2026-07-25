"""
admitiq.core — signed, expiring, revocable tokens for QR codes.

No AI, no required server, no vendor lock-in. Pure HMAC signing + expiry
checking + an optional hook for revocation/single-use enforcement.
"""
import base64
import hashlib
import hmac
import json
import time
import uuid
from typing import Any, Callable, Dict, Optional, Sequence

# Wire-format versions this library can verify. Breaking changes require a new v.
SUPPORTED_VERSIONS = (1,)


class AdmitiqError(Exception):
    """Base exception for all admitiq errors."""


class TokenExpiredError(AdmitiqError):
    """Raised when a token's expiry timestamp has passed."""


class InvalidSignatureError(AdmitiqError):
    """Raised when a token is malformed or its signature doesn't match."""


class TokenRevokedError(AdmitiqError):
    """Raised when the is_revoked callback reports this token as revoked/used."""


class UnsupportedTokenVersionError(AdmitiqError):
    """Raised when the token's header ``v`` is not supported by this library."""


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(message: bytes, secret: str) -> str:
    digest = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).digest()
    return _b64url_encode(digest)


def _assert_supported_version(header_b64: str) -> Dict[str, Any]:
    try:
        header = json.loads(_b64url_decode(header_b64))
    except (json.JSONDecodeError, ValueError) as e:
        raise InvalidSignatureError("Malformed token header") from e
    v = header.get("v")
    if v not in SUPPORTED_VERSIONS:
        raise UnsupportedTokenVersionError(
            f"Unsupported token version {v}. "
            f"This library supports: {', '.join(str(x) for x in SUPPORTED_VERSIONS)}"
        )
    return header


def issue(payload: Dict[str, Any], ttl_seconds: int, secret: str) -> str:
    """
    Create a signed, expiring AdmitiQ token.

    Args:
        payload: arbitrary JSON-serializable data to embed (e.g. {"ticket_id": "abc123"})
        ttl_seconds: how many seconds until this token expires
        secret: shared HMAC secret used to sign the token (keep this server-side only)

    Returns:
        A compact token string, safe to encode directly into a QR code.
    """
    now = int(time.time())
    header = {"alg": "HS256", "typ": "QRT", "v": 1}
    body = {
        "iat": now,
        "exp": now + ttl_seconds,
        "jti": uuid.uuid4().hex,
        "data": payload,
    }
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    body_b64 = _b64url_encode(json.dumps(body, separators=(",", ":")).encode())
    signing_input = f"{header_b64}.{body_b64}".encode()
    signature = _sign(signing_input, secret)
    return f"{header_b64}.{body_b64}.{signature}"


def verify(
    token: str,
    secret: str,
    is_revoked: Optional[Callable[[str], bool]] = None,
) -> Dict[str, Any]:
    """
    Verify a AdmitiQ token's signature, expiry, and (optionally) revocation status.

    Args:
        token: the token string decoded from the scanned QR code
        secret: the same HMAC secret used to issue the token
        is_revoked: optional callback that receives the token's jti (unique id)
            and returns True if that specific token has been revoked or already
            used. This is where you'd plug in your own database check, or a
            call to a hosted revocation service.

    Returns:
        The embedded payload dict (the "data" field passed to issue()), plus
        iat/exp/jti metadata.

    Raises:
        InvalidSignatureError: token is malformed or signature doesn't match
        TokenExpiredError: token's expiry timestamp has passed
        TokenRevokedError: is_revoked callback reported this token as revoked
        UnsupportedTokenVersionError: token header ``v`` is not supported
    """
    try:
        header_b64, body_b64, signature = token.split(".")
    except ValueError:
        raise InvalidSignatureError("Malformed token: expected 3 dot-separated parts")

    signing_input = f"{header_b64}.{body_b64}".encode()
    expected_signature = _sign(signing_input, secret)
    if not hmac.compare_digest(expected_signature, signature):
        raise InvalidSignatureError("Signature mismatch")

    # Version is inside the signed header — check only after the signature matches.
    _assert_supported_version(header_b64)

    body = json.loads(_b64url_decode(body_b64))

    if int(time.time()) > body["exp"]:
        raise TokenExpiredError(f"Token expired at {body['exp']}")

    if is_revoked is not None and is_revoked(body["jti"]):
        raise TokenRevokedError(f"Token {body['jti']} has been revoked")

    return body


def verify_with_secrets(
    token: str,
    secrets: Sequence[str],
    is_revoked: Optional[Callable[[str], bool]] = None,
) -> Dict[str, Any]:
    """
    Verify against multiple HMAC secrets (key-rotation window).

    Tries secrets in order; succeeds on the first valid signature.
    Non-signature errors (expired, revoked, unsupported version) propagate immediately.

    Args:
        token: token string from the QR scan
        secrets: current secret first, then previous secrets still in the rotation window
        is_revoked: optional revocation callback (same as ``verify``)
    """
    if not secrets:
        raise InvalidSignatureError("At least one secret is required")

    last_sig_error: Optional[InvalidSignatureError] = None
    for secret in secrets:
        try:
            return verify(token, secret=secret, is_revoked=is_revoked)
        except InvalidSignatureError as e:
            last_sig_error = e
            continue
    raise last_sig_error or InvalidSignatureError("Signature mismatch")
