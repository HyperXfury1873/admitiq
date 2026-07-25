"""
admitiq.qr — optional QR image generation helpers.

Requires the 'qrcode' package:
    pip install admitiq[qr]

You can encode either a raw token or a full URL (from issue_url / embed_in_url).
"""
from typing import Any, Dict, Optional

from .core import issue
from .url import issue_url, token_from_url


def generate_qr(content: str, output_path: Optional[str] = None):
    """
    Render a string (token or URL) as a QR code image.

    Args:
        content: token or URL to encode in the QR
        output_path: if provided, saves the image and returns the path.
            If omitted, returns a PIL Image object instead.
    """
    try:
        import qrcode
    except ImportError as e:
        raise ImportError(
            "Generating QR images requires the 'qrcode' package. "
            "Install it with: pip install admitiq[qr]"
        ) from e

    img = qrcode.make(content)
    if output_path:
        img.save(output_path)
        return output_path
    return img


def issue_qr(
    payload: Dict[str, Any],
    ttl_seconds: int,
    secret: str,
    output_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Issue a token and render it as a QR image in one step."""
    token = issue(payload, ttl_seconds=ttl_seconds, secret=secret)
    qr = generate_qr(token, output_path=output_path)
    return {"token": token, "qr": qr}


def issue_url_qr(
    base_url: str,
    payload: Dict[str, Any],
    ttl_seconds: int,
    secret: str,
    output_path: Optional[str] = None,
    param: str = "token",
) -> Dict[str, Any]:
    """
    Issue a token embedded in a URL, then render that URL as a QR image.

    Scanning carries the full link (useful for web check-in pages).
    """
    url = issue_url(base_url, payload, ttl_seconds=ttl_seconds, secret=secret, param=param)
    token = token_from_url(url, param=param)
    qr = generate_qr(url, output_path=output_path)
    return {"token": token, "url": url, "qr": qr}
