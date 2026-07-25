"""
admitiq.frameworks — optional drop-in helpers for common web frameworks.

These are thin wrappers around verify() — you don't need them, the plain
verify() function works fine on its own. They just save a few lines of
boilerplate in the frameworks people reach for most often.

FastAPI support requires 'fastapi' installed (you already have it if you're
using FastAPI). Flask support requires 'flask' installed likewise. Neither
is a hard dependency of admitiq itself.
"""
from functools import wraps
from typing import Callable, Optional

from .core import AdmitiqError, verify


def fastapi_dependency(secret: str, is_revoked: Optional[Callable[[str], bool]] = None):
    """
    Build a FastAPI dependency that verifies an AdmitiQ token from the JSON
    request body (expects {"token": "..."}).

    Example:
        from fastapi import Depends
        check_ticket = fastapi_dependency(secret="...", is_revoked=my_check)

        @app.post("/scan")
        async def scan(payload: dict = Depends(check_ticket)):
            return {"ok": True, "data": payload["data"]}
    """
    from fastapi import HTTPException, Request

    async def dependency(request: Request):
        body = await request.json()
        token = body.get("token")
        if not token:
            raise HTTPException(status_code=400, detail="Missing QR token")
        try:
            return verify(token, secret=secret, is_revoked=is_revoked)
        except AdmitiqError as e:
            raise HTTPException(status_code=401, detail=str(e))

    return dependency


def flask_require_token(secret: str, is_revoked: Optional[Callable[[str], bool]] = None):
    """
    Flask route decorator that verifies an AdmitiQ token from the JSON request
    body (expects {"token": "..."}) and passes the decoded payload as the
    `admitiq_payload` keyword argument to your view function.

    Example:
        @app.route("/scan", methods=["POST"])
        @flask_require_token(secret="...", is_revoked=my_check)
        def scan(admitiq_payload):
            return {"ok": True, "data": admitiq_payload["data"]}
    """
    from flask import jsonify, request

    def decorator(view_func):
        @wraps(view_func)
        def wrapped(*args, **kwargs):
            body = request.get_json(silent=True) or {}
            token = body.get("token")
            if not token:
                return jsonify({"error": "Missing QR token"}), 400
            try:
                payload = verify(token, secret=secret, is_revoked=is_revoked)
            except AdmitiqError as e:
                return jsonify({"error": str(e)}), 401
            return view_func(*args, admitiq_payload=payload, **kwargs)

        return wrapped

    return decorator
