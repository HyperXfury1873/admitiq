import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import { TokenInspector } from "../components/TokenInspector.jsx";
import { TtlControls, formatTtl } from "../components/TtlControls.jsx";
import { demoIssue, demoVerify } from "../lib/demoCrypto.js";

const DEFAULT_PAYLOAD = `{
  "ticketId": "T-1001",
  "seat": "A12"
}`;

export default function TokenDebugger() {
  const [mode, setMode] = useState("issue");
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("demo-secret-change-me");
  const [payloadText, setPayloadText] = useState(DEFAULT_PAYLOAD);
  const [ttlSeconds, setTtlSeconds] = useState(3600);
  const [verifyResult, setVerifyResult] = useState(null);
  const [issueError, setIssueError] = useState(null);
  const [busy, setBusy] = useState(false);

  const decodedOk = useMemo(() => {
    if (!token.trim()) return false;
    try {
      return token.trim().split(".").length === 3;
    } catch {
      return false;
    }
  }, [token]);

  useEffect(() => {
    setVerifyResult(null);
  }, [token, secret]);

  async function handleIssue() {
    setIssueError(null);
    setVerifyResult(null);
    let payload;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      setIssueError("Payload must be valid JSON.");
      return;
    }
    if (!secret.trim()) {
      setIssueError("Enter a signing secret.");
      return;
    }
    const ttl = Number(ttlSeconds);
    if (!Number.isFinite(ttl) || ttl < 1) {
      setIssueError("TTL must be a positive number of seconds.");
      return;
    }
    setBusy(true);
    try {
      const { token: t } = await demoIssue(payload, ttl, secret.trim());
      setToken(t);
      setMode("verify");
    } catch (e) {
      setIssueError(e?.message || "Could not issue token.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    setIssueError(null);
    if (!token.trim()) {
      setVerifyResult({ ok: false, reason: "Paste or issue a token first." });
      return;
    }
    if (!secret.trim()) {
      setVerifyResult({ ok: false, reason: "Enter the HMAC secret used to sign this token." });
      return;
    }
    setBusy(true);
    try {
      const result = await demoVerify(token.trim(), secret.trim(), null);
      setVerifyResult(result);
    } catch (e) {
      setVerifyResult({ ok: false, reason: e?.message || "Verify failed." });
    } finally {
      setBusy(false);
    }
  }

  const ttlNum = Number(ttlSeconds);
  const ttlOk = Number.isFinite(ttlNum) && ttlNum >= 1;

  return (
    <>
      <Seo
        title="Token playground — issue & verify AdmitiQ tokens"
        description="Issue and verify AdmitiQ tokens in your browser. Paste a token and secret to check the HMAC signature and expiry — like jwt.io, for AdmitiQ."
        path="/debugger"
        keywords="AdmitiQ token verify, AdmitiQ playground, decode verify HMAC token, jwt.io AdmitiQ"
      />
      <PageHero
        kicker="Playground"
        title="Issue & verify tokens"
        subtitle="A jwt.io-style frontend for AdmitiQ. Set TTL in seconds (or use presets), issue a token, then verify — all locally in your browser."
      />

      <section className="aq-section aq-debugger-section">
        <div className="aq-playground">
          <div className="aq-playground-modes" role="tablist" aria-label="Playground mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "issue"}
              className={`aq-deliver-tab${mode === "issue" ? " active" : ""}`}
              onClick={() => setMode("issue")}
            >
              Issue
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "verify"}
              className={`aq-deliver-tab${mode === "verify" ? " active" : ""}`}
              onClick={() => setMode("verify")}
            >
              Verify
            </button>
          </div>

          <div className="aq-playground-grid">
            <div className="aq-panel aq-playground-controls">
              {mode === "issue" ? (
                <>
                  <div className="aq-panel-title">1 · Issue</div>
                  <label className="aq-field">
                    Payload (JSON)
                    <textarea
                      className="aq-playground-textarea"
                      value={payloadText}
                      onChange={(e) => setPayloadText(e.target.value)}
                      rows={8}
                      spellCheck={false}
                    />
                  </label>

                  <TtlControls
                    id="playground-ttl"
                    value={ttlSeconds}
                    onChange={setTtlSeconds}
                    hint="Maps to ttl_seconds (Python) / ttlSeconds (JavaScript) in issue()."
                  />

                  <label className="aq-field" style={{ marginTop: 8 }}>
                    Secret (HMAC)
                    <input
                      type="text"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </label>

                  <div className="aq-demo-buttons">
                    <button
                      type="button"
                      className="aq-btn aq-btn-primary"
                      onClick={handleIssue}
                      disabled={busy || !ttlOk}
                    >
                      {busy
                        ? "Issuing…"
                        : ttlOk
                          ? `Issue token (${formatTtl(ttlNum)})`
                          : "Issue token"}
                    </button>
                  </div>
                  {issueError && <p className="aq-token-err">{issueError}</p>}
                  <p className="aq-deliver-hint">
                    Same crypto as <code>issue()</code> in the library. For QR/URL flows, use the{" "}
                    <Link to="/tutorial">interactive tutorial</Link>.
                  </p>
                </>
              ) : (
                <>
                  <div className="aq-panel-title">1 · Verify</div>
                  <label className="aq-field">
                    Encoded token
                    <textarea
                      className="aq-playground-textarea"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste an AdmitiQ token (header.payload.signature)"
                      rows={6}
                      spellCheck={false}
                    />
                  </label>
                  <label className="aq-field">
                    Secret (HMAC)
                    <input
                      type="text"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="Same secret used at issue time"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </label>
                  <div className="aq-demo-buttons">
                    <button
                      type="button"
                      className="aq-btn aq-btn-primary"
                      onClick={handleVerify}
                      disabled={busy || !token.trim()}
                    >
                      {busy ? "Verifying…" : "Verify signature"}
                    </button>
                    <button
                      type="button"
                      className="aq-btn"
                      onClick={() => {
                        setToken("");
                        setVerifyResult(null);
                      }}
                      disabled={!token}
                    >
                      Clear
                    </button>
                    <button type="button" className="aq-btn aq-btn-ghost" onClick={() => setMode("issue")}>
                      ← Back to issue
                    </button>
                  </div>
                  {verifyResult && (
                    <div className={`aq-status ${verifyResult.ok ? "ok" : "bad"}`} role="status">
                      <strong>{verifyResult.ok ? "Valid token" : "Invalid token"}</strong>
                      <span>
                        {verifyResult.reason ||
                          (verifyResult.ok ? "Signature matches and token is not expired." : "")}
                      </span>
                      {verifyResult.ok && verifyResult.jti && (
                        <span className="aq-verify-meta">
                          jti: {verifyResult.jti}
                          {verifyResult.exp
                            ? ` · exp: ${new Date(verifyResult.exp * 1000).toLocaleString()}`
                            : ""}
                        </span>
                      )}
                      {verifyResult.ok && verifyResult.data != null && (
                        <pre className="aq-token-json aq-verify-data">
                          {JSON.stringify(verifyResult.data, null, 2)}
                        </pre>
                      )}
                      {verifyResult.signatureValid === false && (
                        <span className="aq-verify-meta">Tip: wrong secret is the most common cause.</span>
                      )}
                      {verifyResult.expired && (
                        <span className="aq-verify-meta">Signature was OK — only expiry failed.</span>
                      )}
                    </div>
                  )}
                  <p className="aq-deliver-hint">
                    Checks HMAC-SHA256 and <code>exp</code> only. Single-use / revoke needs your store (see
                    tutorial).
                  </p>
                </>
              )}
            </div>

            <div className="aq-panel aq-playground-decode">
              <div className="aq-panel-title">2 · Decoded (read-only)</div>
              {decodedOk ? (
                <TokenInspector token={token.trim()} />
              ) : (
                <p className="aq-panel-empty">
                  Issue a token or paste one to see color-coded header · payload · signature — same idea as
                  jwt.io.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
