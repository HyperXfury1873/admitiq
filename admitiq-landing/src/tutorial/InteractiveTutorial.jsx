import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { demoIssue, demoVerify } from "../lib/demoCrypto.js";
import { TokenInspector } from "../components/TokenInspector.jsx";
import { TUTORIAL_CASES } from "../data/content.js";

async function makeQrDataUrl(text) {
  return QRCode.toDataURL(text, {
    width: 220,
    margin: 2,
    color: { dark: "#0E1520", light: "#FFFFFF" },
  });
}

const springHover = { type: "spring", stiffness: 400, damping: 22 };

const sectionReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <motion.button
      className="aq-copy-btn"
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={springHover}
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "copied" : "copy"}
    </motion.button>
  );
}

function HeroTicket() {
  return (
    <motion.div
      className="aq-hero-ticket-wrap"
      initial={{ opacity: 0, x: 60, rotate: 4 }}
      animate={{ opacity: 1, x: 0, rotate: -2 }}
      transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="aq-hero-ticket"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="aq-ticket-perforation aq-ticket-perf-left" aria-hidden="true" />
        <div className="aq-ticket-perforation aq-ticket-perf-right" aria-hidden="true" />
        <div className="aq-ticket-header">
          <span className="aq-ticket-series">ADM-2026</span>
          <span className="aq-ticket-type">ADMIT ONE</span>
        </div>
        <div className="aq-ticket-body">
          <div className="aq-ticket-row">
            <span className="aq-ticket-label">EVENT</span>
            <span className="aq-ticket-value">NightFest</span>
          </div>
          <div className="aq-ticket-row">
            <span className="aq-ticket-label">SEAT</span>
            <span className="aq-ticket-value">A-12</span>
          </div>
          <div className="aq-ticket-row">
            <span className="aq-ticket-label">VALID</span>
            <span className="aq-ticket-value aq-mono">exp: 3600s</span>
          </div>
          <div className="aq-ticket-barcode" aria-hidden="true">
            {Array.from({ length: 32 }).map((_, i) => (
              <span key={i} style={{ height: `${40 + (i % 5) * 8}%` }} />
            ))}
          </div>
        </div>
        <motion.div
          className="aq-ticket-stamp"
          initial={{ scale: 1.6, opacity: 0, rotate: -18 }}
          animate={{ scale: 1, opacity: 1, rotate: -12 }}
          transition={{ delay: 0.7, duration: 0.45, type: "spring", stiffness: 280, damping: 18 }}
        >
          SIGNED
        </motion.div>
        <div className="aq-ticket-stub">
          <span className="aq-mono">jti</span>
          <span className="aq-ticket-stub-dots" aria-hidden="true" />
          <span className="aq-mono aq-ticket-stub-id">7f3a…c91e</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InteractiveTutorial() {
  const [secret] = useState("demo-secret-" + Math.random().toString(36).slice(2, 8));
  const [caseId, setCaseId] = useState(null);
  const [fields, setFields] = useState({});
  const [token, setToken] = useState(null);
  const [url, setUrl] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [deliverTab, setDeliverTab] = useState("token");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const usedJtis = useRef(new Set());

  const selected = TUTORIAL_CASES.find((c) => c.id === caseId) || null;

  function selectCase(c) {
    const next = {};
    c.fields.forEach((f) => {
      next[f.key] = f.default;
    });
    setCaseId(c.id);
    setFields(next);
    setToken(null);
    setUrl(null);
    setQrToken(null);
    setQrUrl(null);
    setDeliverTab(c.preferUrl ? "url" : "token");
    setStatus(null);
    setScanCount(0);
    usedJtis.current = new Set();
  }

  function clearCase() {
    setCaseId(null);
    setToken(null);
    setUrl(null);
    setQrToken(null);
    setQrUrl(null);
    setStatus(null);
    setScanCount(0);
    usedJtis.current = new Set();
  }

  async function handleIssue() {
    if (!selected) return;
    setBusy(true);
    setStatus(null);
    try {
      const payload = { ...fields };
      const { token: t } = await demoIssue(payload, selected.ttlSeconds, secret);
      const link = `${selected.baseUrl}?token=${encodeURIComponent(t)}`;
      const [qTok, qLink] = await Promise.all([makeQrDataUrl(t), makeQrDataUrl(link)]);
      usedJtis.current = new Set();
      setToken(t);
      setUrl(link);
      setQrToken(qTok);
      setQrUrl(qLink);
      setScanCount(0);
      setDeliverTab(selected.preferUrl ? "url" : "qr-token");
      setStatus({
        ok: true,
        title: "Issued",
        detail: `${selected.roleIssue}: sealed payload with ${selected.ttlLabel} expiry. Same as issue() + issueUrl() / issueQR() in the library.`,
      });
    } catch (err) {
      setStatus({ ok: false, title: "Issue failed", detail: err.message || String(err) });
    } finally {
      setBusy(false);
    }
  }

  async function handleScan() {
    if (!token) {
      setStatus({ ok: false, title: "Nothing to scan", detail: "Issue a pass first." });
      return;
    }
    const result = await demoVerify(token, secret, usedJtis.current);
    if (result.ok) {
      usedJtis.current.add(result.jti);
      setScanCount((n) => n + 1);
      setStatus({
        ok: true,
        title: `${selected.roleScan}: allowed`,
        detail: `verify() returned data: ${JSON.stringify(result.data)}. jti marked used (single-use).`,
      });
    } else {
      setStatus({
        ok: false,
        title: `${selected?.roleScan || "Scanner"}: blocked`,
        detail: result.reason,
      });
    }
  }

  async function handleTamper() {
    if (!token) {
      setStatus({ ok: false, title: "Nothing to tamper", detail: "Issue a pass first." });
      return;
    }
    const tampered = token.slice(0, -3) + "xyz";
    const result = await demoVerify(tampered, secret, usedJtis.current);
    setStatus({
      ok: false,
      title: "Tampered token rejected",
      detail: result.ok
        ? "Unexpected allow — should not happen"
        : `${result.reason}. Mirrors InvalidSignatureError in code.`,
    });
  }

  function handleReissueFresh() {
    usedJtis.current = new Set();
    setToken(null);
    setUrl(null);
    setQrToken(null);
    setQrUrl(null);
    setScanCount(0);
    setStatus({
      ok: true,
      title: "Cleared",
      detail: "Used-list reset. Edit fields and issue again.",
    });
  }

  return (
    <div className="aq-workshop" id="tutorial">
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <div className="aq-workshop-head">
              <div className="aq-kicker">Interactive tutorial</div>
              <h2 className="aq-h2">Pick a use case</h2>
              <p className="aq-p aq-p-tight">
                Same crypto as the library: issue → deliver (token / URL / QR) → verify.
                Choose what you want to build, then try it with a real UI.
              </p>
            </div>
            <div className="aq-case-list">
              {TUTORIAL_CASES.map((c, i) => (
                <motion.button
                  key={c.id}
                  type="button"
                  className="aq-case-strip"
                  onClick={() => selectCase(c)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  whileHover={{ x: 6 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="aq-case-strip-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="aq-case-strip-content">
                    <strong>{c.title}</strong>
                    <span>{c.blurb}</span>
                  </span>
                  <span className="aq-case-strip-arrow">→</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
          >
            <div className="aq-workshop-head">
              <motion.button
                type="button"
                className="aq-btn aq-btn-ghost aq-btn-back"
                onClick={clearCase}
                whileHover={{ x: -3 }}
                transition={springHover}
              >
                ← All use cases
              </motion.button>
              <div className="aq-kicker aq-kicker-spaced">{selected.title}</div>
              <h2 className="aq-h2">{selected.blurb}</h2>
              <p className="aq-p aq-p-tight">
                <strong className="aq-ink">{selected.roleIssue}</strong>
                {" → deliver → "}
                <strong className="aq-ink">{selected.roleScan}</strong>
                {" · TTL "}{selected.ttlLabel}
              </p>
            </div>

            <div className="aq-workshop-grid">
              <div className="aq-panel aq-ticket-panel">
                <div className="aq-panel-title">1 · Your data (goes into issue)</div>
                <div className="aq-field-grid">
                  {selected.fields.map((f) => (
                    <label key={f.key} className="aq-field">
                      <span>{f.label}</span>
                      <input
                        value={fields[f.key] || ""}
                        onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      />
                    </label>
                  ))}
                </div>
                <div className="aq-demo-buttons">
                  <motion.button
                    type="button"
                    className="aq-btn aq-btn-primary"
                    disabled={busy}
                    onClick={handleIssue}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springHover}
                  >
                    {busy ? "Issuing…" : "Issue pass"}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="aq-btn aq-btn-ghost"
                    onClick={handleReissueFresh}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springHover}
                  >
                    Clear
                  </motion.button>
                </div>
                <p className="aq-demo-note">
                  Calls the same HMAC format as <code>issue(payload, ttl, secret)</code>. Secret stays in this browser demo only.
                </p>
              </div>

              <div className="aq-panel aq-ticket-panel">
                <div className="aq-panel-title">2 · Deliver (token · URL · QR)</div>
                <AnimatePresence mode="wait">
                  {!token ? (
                    <motion.p
                      key="empty"
                      className="aq-panel-empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Issue a pass to generate a token, check-in link, and QR images.
                    </motion.p>
                  ) : (
                    <motion.div
                      key="deliver"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="aq-deliver-tabs">
                        {[
                          { id: "token", label: "Token" },
                          { id: "url", label: "URL / link" },
                          { id: "qr-token", label: "QR of token" },
                          { id: "qr-url", label: "QR of URL" },
                        ].map((t) => (
                          <motion.button
                            key={t.id}
                            type="button"
                            className={`aq-deliver-tab ${deliverTab === t.id ? "active" : ""}`}
                            onClick={() => setDeliverTab(t.id)}
                            whileHover={{ y: -1 }}
                            transition={springHover}
                          >
                            {t.label}
                          </motion.button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        {deliverTab === "token" && (
                          <motion.div
                            key="token"
                            className="aq-deliver-body"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.25 }}
                          >
                            <p className="aq-deliver-hint">
                              Same idea as jwt.io — color-coded <code>header.payload.signature</code>, decoded locally.
                            </p>
                            <TokenInspector token={token} />
                            <CopyButton text={token} />
                          </motion.div>
                        )}
                        {deliverTab === "url" && (
                          <motion.div
                            key="url"
                            className="aq-deliver-body"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.25 }}
                          >
                            <p className="aq-deliver-hint">Same as <code>issueUrl(baseUrl, …)</code> / <code>issue_url</code>.</p>
                            <div className="aq-mono-box">{url}</div>
                            <CopyButton text={url} />
                          </motion.div>
                        )}
                        {deliverTab === "qr-token" && (
                          <motion.div
                            key="qr-token"
                            className="aq-deliver-body aq-deliver-qr"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.25 }}
                          >
                            <p className="aq-deliver-hint">Same as <code>issueQR()</code> / <code>issue_qr()</code> — encodes the token.</p>
                            {qrToken && <img src={qrToken} alt="QR code of token" width={220} height={220} />}
                            <a className="aq-btn" href={qrToken} download={`${selected.id}-token.png`}>Download PNG</a>
                          </motion.div>
                        )}
                        {deliverTab === "qr-url" && (
                          <motion.div
                            key="qr-url"
                            className="aq-deliver-body aq-deliver-qr"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.25 }}
                          >
                            <p className="aq-deliver-hint">Same as <code>issueUrlQR()</code> / <code>issue_url_qr()</code> — scan opens the link.</p>
                            {qrUrl && <img src={qrUrl} alt="QR code of URL" width={220} height={220} />}
                            <a className="aq-btn" href={qrUrl} download={`${selected.id}-url.png`}>Download PNG</a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="aq-panel aq-ticket-panel">
                <div className="aq-panel-title">3 · Verify (scan)</div>
                <p className="aq-deliver-hint">
                  {selected.roleScan}. First success marks <code>jti</code> used. Second scan should fail. Tamper should fail.
                </p>
                <div className="aq-demo-buttons">
                  <motion.button
                    type="button"
                    className="aq-btn aq-btn-primary"
                    onClick={handleScan}
                    disabled={!token}
                    whileHover={token ? { scale: 1.02 } : {}}
                    whileTap={token ? { scale: 0.98 } : {}}
                    transition={springHover}
                  >
                    Scan / verify
                  </motion.button>
                  <motion.button
                    type="button"
                    className="aq-btn"
                    onClick={handleTamper}
                    disabled={!token}
                    whileHover={token ? { scale: 1.02 } : {}}
                    whileTap={token ? { scale: 0.98 } : {}}
                    transition={springHover}
                  >
                    Try tampering
                  </motion.button>
                </div>
                <p className="aq-demo-note">Successful scans this pass: {scanCount}</p>
                <AnimatePresence>
                  {status && (
                    <motion.div
                      className={`aq-status ${status.ok ? "ok" : "bad"}`}
                      initial={{ opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <strong>{status.title}</strong>
                      <span>{status.detail}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {token && (
                <motion.div
                  className="aq-panel aq-ticket-panel aq-panel-code"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="aq-panel-title">Matching library calls</div>
                  <pre className="aq-mini-code">{`# Python
from admitiq import issue, issue_url, issue_qr, issue_url_qr, verify
payload = ${JSON.stringify(fields, null, 0)}
token = issue(payload, ttl_seconds=${selected.ttlSeconds}, secret="…")
url = issue_url("${selected.baseUrl}", payload, ${selected.ttlSeconds}, "…")
issue_qr(payload, ${selected.ttlSeconds}, "…", output_path="pass.png")

# JavaScript
const { issue, issueUrl, issueQR, issueUrlQR, verify } = require("admitiq");
const token = issue(${JSON.stringify(fields)}, ${selected.ttlSeconds}, "…");
const url = issueUrl("${selected.baseUrl}", ${JSON.stringify(fields)}, ${selected.ttlSeconds}, "…");
await issueQR(${JSON.stringify(fields)}, ${selected.ttlSeconds}, "…", "pass.png");`}</pre>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export { InteractiveTutorial, CopyButton, springHover, sectionReveal, HeroTicket };
