"""
Tiny attendance desk: issue a code, then scan it (first OK, second blocked).

    cd examples/flask-attendance
    pip install -e ../../python flask
    python app.py

Then open http://localhost:3848
"""
from flask import Flask, jsonify, request, render_template_string

from admitiq import (
    InvalidSignatureError,
    TokenExpiredError,
    TokenRevokedError,
    issue,
    verify,
)

SECRET = "demo-secret-change-me"
used = set()
app = Flask(__name__)

PAGE = """
<!doctype html>
<html><head><meta charset="utf-8"><title>admitiq attendance demo</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 16px;line-height:1.5}
  pre{background:#f4f4f5;padding:12px;border-radius:4px;overflow:auto}
  button{margin-right:8px;margin-top:8px;padding:8px 12px;cursor:pointer}
</style></head><body>
<h1>admitiq — Flask attendance demo</h1>
<p>A <a href="https://logiclitz.org">LogicLitz</a> example. Issue a code, scan twice.</p>
<button id="issue">Issue code</button>
<button id="scan">Scan code</button>
<pre id="out">Click “Issue code” to start.</pre>
<script>
let token = null;
const out = document.getElementById("out");
document.getElementById("issue").onclick = async () => {
  const r = await fetch("/issue", { method: "POST" });
  const j = await r.json();
  token = j.token;
  out.textContent = "Issued:\\n" + token.slice(0, 48) + "...\\n\\nNow click Scan.";
};
document.getElementById("scan").onclick = async () => {
  if (!token) { out.textContent = "Issue a code first."; return; }
  const r = await fetch("/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const j = await r.json();
  out.textContent = JSON.stringify(j, null, 2);
};
</script>
</body></html>
"""


@app.get("/")
def home():
    return render_template_string(PAGE)


@app.post("/issue")
def issue_code():
    token = issue({"class_id": "CS101", "student": "demo"}, ttl_seconds=3600, secret=SECRET)
    return jsonify(token=token)


@app.post("/scan")
def scan_code():
    token = (request.get_json(silent=True) or {}).get("token")
    if not token:
        return jsonify(ok=False, error="missing token"), 400
    try:
        payload = verify(token, secret=SECRET, is_revoked=lambda jti: jti in used)
        used.add(payload["jti"])
        return jsonify(ok=True, data=payload["data"], jti=payload["jti"])
    except (TokenExpiredError, InvalidSignatureError, TokenRevokedError) as e:
        return jsonify(ok=False, error=str(e), type=type(e).__name__), 401


if __name__ == "__main__":
    print("admitiq flask demo → http://localhost:3848")
    app.run(port=3848, debug=True)
