"""
admitiq.ec — optional asymmetric (ES256 / ECDSA P-256) signing support.

Use this instead of core.issue/verify when the verifier (e.g. a scanner app
running on someone's phone, or a public endpoint) should NOT hold the same
secret used to issue tokens. The issuer signs with a private key; anyone
holding only the public key can verify a token but cannot forge new ones.

Requires the 'cryptography' package:
    pip install admitiq[ec]
"""
import json
import time
import uuid
from typing import Any, Callable, Dict, Optional, Sequence, Tuple

from .core import (
    InvalidSignatureError,
    TokenExpiredError,
    TokenRevokedError,
    _assert_supported_version,
    _b64url_decode,
    _b64url_encode,
)


def generate_keypair() -> Tuple[str, str]:
    """
    Generate a new EC (P-256 / secp256r1) keypair.

    Returns:
        (private_key_pem, public_key_pem) — both as PEM-encoded strings.
        Keep the private key secret (it issues tokens); the public key can be
        shared freely with anything that only needs to verify tokens.
    """
    try:
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.primitives.asymmetric import ec
    except ImportError as e:
        raise ImportError(
            "Asymmetric signing requires the 'cryptography' package. "
            "Install it with: pip install admitiq[ec]"
        ) from e

    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("ascii")
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("ascii")
    return private_pem, public_pem


def issue(payload: Dict[str, Any], ttl_seconds: int, private_key_pem: str) -> str:
    """Create a token signed with an EC private key (algorithm: ES256)."""
    try:
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import ec
    except ImportError as e:
        raise ImportError(
            "Asymmetric signing requires the 'cryptography' package. "
            "Install it with: pip install admitiq[ec]"
        ) from e

    private_key = serialization.load_pem_private_key(
        private_key_pem.encode("ascii"), password=None
    )

    now = int(time.time())
    header = {"alg": "ES256", "typ": "QRT", "v": 1}
    body = {
        "iat": now,
        "exp": now + ttl_seconds,
        "jti": uuid.uuid4().hex,
        "data": payload,
    }
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    body_b64 = _b64url_encode(json.dumps(body, separators=(",", ":")).encode())
    signing_input = f"{header_b64}.{body_b64}".encode()

    signature = private_key.sign(signing_input, ec.ECDSA(hashes.SHA256()))
    signature_b64 = _b64url_encode(signature)
    return f"{header_b64}.{body_b64}.{signature_b64}"


def verify(
    token: str,
    public_key_pem: str,
    is_revoked: Optional[Callable[[str], bool]] = None,
) -> Dict[str, Any]:
    """Verify a token created by issue() using the corresponding EC public key."""
    try:
        from cryptography.exceptions import InvalidSignature
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import ec
    except ImportError as e:
        raise ImportError(
            "Asymmetric verification requires the 'cryptography' package. "
            "Install it with: pip install admitiq[ec]"
        ) from e

    try:
        header_b64, body_b64, signature_b64 = token.split(".")
    except ValueError:
        raise InvalidSignatureError("Malformed token: expected 3 dot-separated parts")

    public_key = serialization.load_pem_public_key(public_key_pem.encode("ascii"))
    signing_input = f"{header_b64}.{body_b64}".encode()
    signature = _b64url_decode(signature_b64)

    try:
        public_key.verify(signature, signing_input, ec.ECDSA(hashes.SHA256()))
    except InvalidSignature:
        raise InvalidSignatureError("Signature mismatch")

    _assert_supported_version(header_b64)

    body = json.loads(_b64url_decode(body_b64))

    if int(time.time()) > body["exp"]:
        raise TokenExpiredError(f"Token expired at {body['exp']}")

    if is_revoked is not None and is_revoked(body["jti"]):
        raise TokenRevokedError(f"Token {body['jti']} has been revoked")

    return body


def verify_with_public_keys(
    token: str,
    public_key_pems: Sequence[str],
    is_revoked: Optional[Callable[[str], bool]] = None,
) -> Dict[str, Any]:
    """
    Verify against multiple EC public keys (key-rotation window).

    Tries keys in order; succeeds on the first valid signature.
    """
    if not public_key_pems:
        raise InvalidSignatureError("At least one public key is required")

    last_sig_error: Optional[InvalidSignatureError] = None
    for public_key_pem in public_key_pems:
        try:
            return verify(token, public_key_pem=public_key_pem, is_revoked=is_revoked)
        except InvalidSignatureError as e:
            last_sig_error = e
            continue
    raise last_sig_error or InvalidSignatureError("Signature mismatch")
