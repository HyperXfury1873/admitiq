import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

// Real HMAC-SHA256 token format via Web Crypto — same structure as the pip/npm packages.

function b64urlEncode(bytes) {
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function utf8Bytes(str) {
  return new TextEncoder().encode(str);
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    utf8Bytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function demoIssue(payload, ttlSeconds, secret) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "QRT", v: 1 };
  const body = {
    iat: now,
    exp: now + ttlSeconds,
    jti: crypto.randomUUID(),
    data: payload,
  };
  const headerB64 = b64urlEncode(utf8Bytes(JSON.stringify(header)));
  const bodyB64 = b64urlEncode(utf8Bytes(JSON.stringify(body)));
  const signingInput = `${headerB64}.${bodyB64}`;
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, utf8Bytes(signingInput));
  const sigB64 = b64urlEncode(new Uint8Array(sig));
  return { token: `${headerB64}.${bodyB64}.${sigB64}`, jti: body.jti, exp: body.exp };
}

async function demoVerify(token, secret, usedJtis) {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "Malformed token" };
  const [headerB64, bodyB64, sigB64] = parts;
  const signingInput = `${headerB64}.${bodyB64}`;
  const key = await hmacKey(secret);

  const sigBytes = Uint8Array.from(
    atob(sigB64.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (sigB64.length % 4)) % 4)),
    (c) => c.charCodeAt(0)
  );

  const valid = await crypto.subtle.verify("HMAC", key, sigBytes, utf8Bytes(signingInput));
  if (!valid) return { ok: false, reason: "Signature mismatch — token was tampered with or forged" };

  const body = JSON.parse(atob(bodyB64.replace(/-/g, "+").replace(/_/g, "/")));
  const now = Math.floor(Date.now() / 1000);
  if (now > body.exp) return { ok: false, reason: `Expired at ${body.exp}` };
  if (usedJtis.has(body.jti)) return { ok: false, reason: "Already used (revoked)" };

  return { ok: true, data: body.data, jti: body.jti };
}

const PY_SNIPPET = `from admitiq import issue, verify, issue_url, issue_qr

# 1) Plain token
token = issue({"ticket_id": "abc123"}, ttl_seconds=3600, secret="secret")

# 2) Token inside a URL (deep link / web check-in)
url = issue_url(
    "https://example.com/scan",
    {"ticket_id": "abc123"},
    ttl_seconds=3600,
    secret="secret",
)

# 3) Token as a QR image (needs: pip install admitiq[qr])
issue_qr({"ticket_id": "abc123"}, ttl_seconds=3600, secret="secret", output_path="ticket.png")

payload = verify(token, secret="secret")
print(payload["data"])`;

const JS_SNIPPET = `const { issue, verify, issueUrl, issueQR } = require("admitiq");

// 1) Plain token
const token = issue({ ticketId: "abc123" }, 3600, "secret");

// 2) Token inside a URL
const url = issueUrl(
  "https://example.com/scan",
  { ticketId: "abc123" },
  3600,
  "secret"
);

// 3) Token as a QR image (needs: npm install qrcode)
await issueQR({ ticketId: "abc123" }, 3600, "secret", "ticket.png");

const payload = await verify(token, "secret");
console.log(payload.data);`;

const DOC_LINKS = [
  { href: "https://github.com/logiclitz/admitiq/blob/main/docs/what-is-admitiq.md", title: "What is AdmitiQ?", blurb: "Plain-English overview — start here if you're new." },
  { href: "https://github.com/logiclitz/admitiq/blob/main/docs/getting-started.md", title: "Getting started", blurb: "Install, issue, verify, and make a QR in minutes." },
  { href: "https://github.com/logiclitz/admitiq/blob/main/docs/python.md", title: "Python guide", blurb: "issue, URLs, QR, FastAPI, Flask, Redis, rotation." },
  { href: "https://github.com/logiclitz/admitiq/blob/main/docs/javascript.md", title: "JavaScript guide", blurb: "issue, URLs, QR, Express, Redis, rotation." },
  { href: "https://github.com/logiclitz/admitiq/blob/main/docs/delivering-tokens.md", title: "QR & URL delivery", blurb: "How to put tokens in QR codes and links." },
  { href: "https://github.com/logiclitz/admitiq/blob/main/SECURITY.md", title: "Security model", blurb: "What it protects, what it doesn't, key rotation." },
];

const TUTORIAL_CASES = [
  {
    id: "event",
    title: "Event tickets",
    blurb: "Print guest passes weeks early. Door checks signature, expiry, and single-use.",
    roleIssue: "Box office issues",
    roleScan: "Door scans",
    baseUrl: "https://events.example/checkin",
    ttlSeconds: 30 * 24 * 3600,
    ttlLabel: "~30 days (print early)",
    fields: [
      { key: "guest", label: "Guest name", default: "Priya Shah" },
      { key: "seat", label: "Seat", default: "A12" },
      { key: "event", label: "Event", default: "NightFest 2026" },
    ],
  },
  {
    id: "attendance",
    title: "Class attendance",
    blurb: "Short-lived classroom code. Second scan of the same code is blocked.",
    roleIssue: "Teacher issues",
    roleScan: "Student / kiosk scans",
    baseUrl: "https://campus.example/attend",
    ttlSeconds: 3600,
    ttlLabel: "1 hour",
    fields: [
      { key: "student", label: "Student", default: "Alex Kim" },
      { key: "class_id", label: "Class", default: "CS101" },
      { key: "session", label: "Session", default: "2026-08-01-am" },
    ],
  },
  {
    id: "coupon",
    title: "One-time coupon",
    blurb: "Discount link or QR for checkout. Tampering the amount fails the signature.",
    roleIssue: "Marketing issues",
    roleScan: "Checkout verifies",
    baseUrl: "https://shop.example/redeem",
    ttlSeconds: 7 * 24 * 3600,
    ttlLabel: "7 days",
    fields: [
      { key: "code", label: "Campaign code", default: "SAVE20" },
      { key: "discount_pct", label: "Discount %", default: "20" },
      { key: "order_min", label: "Min order", default: "50" },
    ],
  },
  {
    id: "access",
    title: "Access pass",
    blurb: "Visitor badge for a building. Same pattern as tickets — seal data, verify at the door.",
    roleIssue: "Reception issues",
    roleScan: "Lobby scanner",
    baseUrl: "https://access.example/gate",
    ttlSeconds: 8 * 3600,
    ttlLabel: "8 hours",
    fields: [
      { key: "visitor", label: "Visitor", default: "Jordan Lee" },
      { key: "host", label: "Host", default: "Sam Rivera" },
      { key: "floor", label: "Floor", default: "4" },
    ],
  },
  {
    id: "weblink",
    title: "Web check-in link",
    blurb: "Email a signed URL — no QR required. Same token, different carrier.",
    roleIssue: "Backend issues link",
    roleScan: "Guest opens link",
    baseUrl: "https://app.example/checkin",
    ttlSeconds: 48 * 3600,
    ttlLabel: "48 hours",
    preferUrl: true,
    fields: [
      { key: "booking_id", label: "Booking ID", default: "BK-90421" },
      { key: "guest", label: "Guest", default: "Morgan Ellis" },
      { key: "room", label: "Room", default: "214" },
    ],
  },
];

const USE_CASES = TUTORIAL_CASES.map((c) => ({ title: c.title, body: c.blurb }));

const FLOW_STEPS = [
  { num: "01", title: "Your data", body: "Guest name, seat, coupon code — whatever you need at the door." },
  { num: "02", title: "issue()", body: "Seal payload with issued-at, expiry, and unique id. Sign with HMAC-SHA256." },
  { num: "03", title: "Deliver", body: "Embed the token in a QR image, URL, SMS, or API response." },
  { num: "04", title: "verify()", body: "Scanner checks signature, expiry, and optional single-use. Admit or reject." },
];

const FAQ_ITEMS = [
  {
    q: "Do scanners need internet?",
    a: "Not for \"is this real?\" and \"has it expired?\" — if the scanner already has the secret or public key. Shared single-use across many doors needs a shared used-list (DB, Redis, or a future hosted API), which usually means network.",
  },
  {
    q: "Where are tickets stored?",
    a: "Nowhere in AdmitiQ. The token carries your data, expiry, and id. Optional single-use lives in your database or Redis. Guest lists and reprints are your app's job.",
  },
  {
    q: "We print cards a month early — how does expiry work?",
    a: "Pass ttl_seconds as \"seconds until the event ends\" (date math). Expiry is stored inside the token at issue time. Details in Getting started and the Python/JS guides.",
  },
  {
    q: "Is it only for QR codes?",
    a: "No. The token is a string. Helpers cover QR images and URLs/deep links. SMS, NFC, and barcodes can carry the same string; we do not ship half-baked helpers for every carrier.",
  },
];

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
                            <p className="aq-deliver-hint">Raw string from <code>issue()</code> — put anywhere.</p>
                            <div className="aq-mono-box">{token}</div>
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

export default function AdmitiQLanding() {
  const [lang, setLang] = useState("python");
  const snippet = lang === "python" ? PY_SNIPPET : JS_SNIPPET;

  return (
    <div className="aq-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');

        .aq-root {
          --mist: #E8EDF4;
          --ink: #0E1520;
          --paper: #FFFFFF;
          --signal: #FF3B1F;
          --cobalt: #0047FF;
          --dim: #5A6578;
          --border: #C5CED9;
          --ok: #0A7A4B;
          --bad: #C41E12;
          font-family: 'IBM Plex Sans', sans-serif;
          background: var(--mist);
          color: var(--ink);
          line-height: 1.55;
          min-height: 100vh;
          background-image:
            repeating-linear-gradient(
              135deg,
              transparent,
              transparent 11px,
              rgba(14, 21, 32, 0.025) 11px,
              rgba(14, 21, 32, 0.025) 12px
            ),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .aq-root * { box-sizing: border-box; }
        .aq-mono { font-family: 'IBM Plex Mono', monospace; }
        .aq-brand { font-family: 'Syne', sans-serif; font-weight: 800; }
        .aq-ink { color: var(--ink); }

        /* ── Nav ── */
        .aq-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 5vw;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          background: rgba(232, 237, 244, 0.92);
          backdrop-filter: blur(10px);
          z-index: 100;
          flex-wrap: wrap;
          gap: 12px;
        }
        .aq-nav-mark {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.02em;
          text-decoration: none;
          color: var(--ink);
        }
        .aq-nav-mark em {
          font-style: normal;
          color: var(--signal);
        }
        .aq-nav-links {
          display: flex;
          gap: 22px;
          align-items: center;
          flex-wrap: wrap;
        }
        .aq-nav-link {
          color: var(--dim);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }
        .aq-nav-link:hover { color: var(--ink); }

        /* ── Hero ── */
        .aq-hero {
          min-height: calc(100vh - 57px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 40px;
          padding: 48px 5vw 64px;
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .aq-hero {
            grid-template-columns: 1fr;
            min-height: auto;
            padding-top: 40px;
            padding-bottom: 48px;
          }
        }
        .aq-hero-copy { position: relative; z-index: 2; }
        .aq-hero-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(56px, 10vw, 112px);
          line-height: 0.92;
          letter-spacing: -0.04em;
          margin: 0 0 28px;
          color: var(--ink);
        }
        .aq-hero-brand span { color: var(--signal); }
        .aq-h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: clamp(24px, 3.2vw, 38px);
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin: 0 0 18px;
        }
        .aq-hero-sub {
          font-size: 17px;
          color: var(--dim);
          max-width: 44ch;
          margin: 0 0 32px;
          line-height: 1.6;
        }
        .aq-hero-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .aq-btn {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 12px 20px;
          border: 2px solid var(--ink);
          background: var(--paper);
          color: var(--ink);
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        .aq-btn-primary {
          background: var(--signal);
          border-color: var(--signal);
          color: var(--paper);
        }
        .aq-btn-primary:hover { background: #E0321A; border-color: #E0321A; }
        .aq-btn-ghost {
          background: transparent;
          border-color: var(--border);
          color: var(--dim);
        }
        .aq-btn-ghost:hover { border-color: var(--ink); color: var(--ink); }
        .aq-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .aq-btn-back { margin-bottom: 4px; padding: 8px 0; border: none; background: none; }

        /* ── Hero ticket visual ── */
        .aq-hero-ticket-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 420px;
        }
        @media (max-width: 900px) {
          .aq-hero-ticket-wrap { min-height: 340px; margin-top: 12px; }
        }
        .aq-hero-ticket {
          position: relative;
          width: min(100%, 380px);
          background: var(--paper);
          border: 2px solid var(--ink);
          box-shadow: 8px 12px 0 rgba(14, 21, 32, 0.12);
          padding: 0;
        }
        .aq-ticket-perforation {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 14px;
          background:
            radial-gradient(circle at 50% 8px, var(--mist) 5px, transparent 5px) 0 0 / 14px 16px repeat-y;
          pointer-events: none;
        }
        .aq-ticket-perf-left { left: -7px; }
        .aq-ticket-perf-right { right: -7px; }
        .aq-ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 20px 24px 14px;
          border-bottom: 2px dashed var(--border);
        }
        .aq-ticket-series {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--dim);
          letter-spacing: 0.08em;
        }
        .aq-ticket-type {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.12em;
          color: var(--cobalt);
        }
        .aq-ticket-body { padding: 20px 24px 24px; }
        .aq-ticket-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }
        .aq-ticket-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--dim);
        }
        .aq-ticket-value {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px;
        }
        .aq-ticket-barcode {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 48px;
          margin-top: 20px;
          padding-top: 12px;
          border-top: 2px solid var(--ink);
        }
        .aq-ticket-barcode span {
          flex: 1;
          background: var(--ink);
          min-width: 2px;
        }
        .aq-ticket-stamp {
          position: absolute;
          top: 38%;
          right: 18%;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: 0.06em;
          color: var(--signal);
          border: 3px solid var(--signal);
          padding: 6px 14px;
          transform: rotate(-12deg);
          opacity: 0.88;
          pointer-events: none;
        }
        .aq-ticket-stub {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background: var(--mist);
          border-top: 2px dashed var(--border);
          font-size: 11px;
          color: var(--dim);
        }
        .aq-ticket-stub-dots {
          flex: 1;
          border-bottom: 2px dotted var(--border);
          height: 1px;
        }
        .aq-ticket-stub-id { color: var(--ink); }

        /* ── Sections ── */
        .aq-section {
          padding: 72px 5vw;
          max-width: 1080px;
          margin: 0 auto;
        }
        .aq-section-wide { max-width: 1180px; }
        .aq-kicker {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--cobalt);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 12px;
          font-weight: 600;
        }
        .aq-kicker-spaced { margin-top: 16px; }
        .aq-h2 {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: clamp(26px, 3.5vw, 36px);
          margin: 0 0 14px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .aq-p {
          color: var(--dim);
          font-size: 16px;
          margin: 0 0 20px;
          max-width: 58ch;
          line-height: 1.65;
        }
        .aq-p-tight { margin-bottom: 24px; }
        .aq-p code, .aq-deliver-hint code, .aq-demo-note code {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.88em;
          color: var(--cobalt);
          background: rgba(0, 71, 255, 0.06);
          padding: 1px 5px;
        }

        /* ── Flow ── */
        .aq-flow {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          margin-top: 36px;
          border-top: 2px solid var(--ink);
        }
        @media (max-width: 800px) {
          .aq-flow { grid-template-columns: 1fr 1fr; border-top: none; gap: 0; }
        }
        @media (max-width: 480px) {
          .aq-flow { grid-template-columns: 1fr; }
        }
        .aq-flow-step {
          padding: 24px 20px 28px 0;
          border-right: 1px solid var(--border);
          position: relative;
        }
        .aq-flow-step:last-child { border-right: none; }
        @media (max-width: 800px) {
          .aq-flow-step {
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding: 20px 0;
          }
        }
        .aq-flow-num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--signal);
          letter-spacing: 0.06em;
          display: block;
          margin-bottom: 10px;
        }
        .aq-flow-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 17px;
          display: block;
          margin-bottom: 8px;
        }
        .aq-flow-body {
          font-size: 14px;
          color: var(--dim);
          line-height: 1.5;
        }
        .aq-flow-arrow {
          position: absolute;
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--border);
          font-size: 14px;
        }
        .aq-flow-step:last-child .aq-flow-arrow { display: none; }
        @media (max-width: 800px) { .aq-flow-arrow { display: none; } }

        /* ── Workshop / tutorial ── */
        .aq-workshop {
          background: var(--paper);
          border: 2px solid var(--ink);
          padding: 32px 28px 36px;
          position: relative;
        }
        .aq-workshop::before,
        .aq-workshop::after {
          content: '';
          position: absolute;
          left: 28px;
          right: 28px;
          height: 6px;
          background:
            radial-gradient(circle at 6px 50%, var(--mist) 4px, transparent 4px) 0 0 / 12px 6px repeat-x;
        }
        .aq-workshop::before { top: -3px; }
        .aq-workshop::after { bottom: -3px; }
        .aq-workshop-head { margin-bottom: 24px; }
        .aq-case-list { display: flex; flex-direction: column; gap: 0; }
        .aq-case-strip {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          text-align: left;
          cursor: pointer;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          padding: 18px 4px;
          color: var(--ink);
          font-family: inherit;
        }
        .aq-case-strip:first-child { border-top: 1px solid var(--border); }
        .aq-case-strip:hover { background: rgba(0, 71, 255, 0.03); }
        .aq-case-strip-num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--signal);
          min-width: 28px;
        }
        .aq-case-strip-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .aq-case-strip-content strong {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
        }
        .aq-case-strip-content span {
          font-size: 14px;
          color: var(--dim);
          line-height: 1.45;
        }
        .aq-case-strip-arrow {
          font-family: 'IBM Plex Mono', monospace;
          color: var(--cobalt);
          font-size: 16px;
        }

        .aq-workshop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) { .aq-workshop-grid { grid-template-columns: 1fr; } }
        .aq-panel { padding: 0; }
        .aq-ticket-panel {
          background: var(--paper);
          border: 1px solid var(--border);
          padding: 18px 16px 20px;
          border-left: 3px solid var(--ink);
        }
        .aq-panel-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--cobalt);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 14px;
          font-weight: 600;
        }
        .aq-panel-empty { color: var(--dim); font-size: 14px; margin: 0; }
        .aq-field-grid { display: grid; gap: 12px; }
        .aq-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 13px;
          color: var(--dim);
          font-weight: 500;
        }
        .aq-field input {
          background: var(--mist);
          border: 1px solid var(--border);
          padding: 10px 12px;
          color: var(--ink);
          font-size: 14px;
          font-family: 'IBM Plex Sans', sans-serif;
        }
        .aq-field input:focus {
          outline: 2px solid var(--cobalt);
          outline-offset: -1px;
          border-color: var(--cobalt);
        }
        .aq-deliver-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 14px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
        }
        .aq-deliver-tab {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          padding: 7px 11px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--dim);
          cursor: pointer;
        }
        .aq-deliver-tab.active {
          background: var(--ink);
          color: var(--paper);
          border-color: var(--ink);
        }
        .aq-deliver-tab:hover:not(.active) { border-color: var(--border); color: var(--ink); }
        .aq-deliver-hint { font-size: 13px; color: var(--dim); margin: 0 0 10px; }
        .aq-mono-box {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          word-break: break-all;
          background: var(--mist);
          border: 1px solid var(--border);
          padding: 12px;
          max-height: 140px;
          overflow: auto;
          margin-bottom: 10px;
          color: var(--ink);
        }
        .aq-deliver-qr {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .aq-deliver-qr img {
          border: 2px solid var(--ink);
          padding: 8px;
          background: var(--paper);
        }
        .aq-status {
          margin-top: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13.5px;
          overflow: hidden;
        }
        .aq-status.ok {
          background: rgba(10, 122, 75, 0.08);
          border-left: 3px solid var(--ok);
          color: var(--ok);
        }
        .aq-status.bad {
          background: rgba(196, 30, 18, 0.06);
          border-left: 3px solid var(--bad);
          color: var(--bad);
        }
        .aq-status span { color: var(--dim); }
        .aq-panel-code { margin-top: 16px; }
        .aq-mini-code {
          margin: 0;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          white-space: pre-wrap;
          color: var(--ink);
          line-height: 1.5;
        }
        .aq-demo-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }
        .aq-demo-note { font-size: 13px; color: var(--dim); margin: 14px 0 0; }
        .aq-copy-btn {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--dim);
          background: var(--mist);
          border: 1px solid var(--border);
          padding: 5px 10px;
          cursor: pointer;
        }
        .aq-copy-btn:hover { color: var(--ink); border-color: var(--ink); }

        /* ── Use cases ── */
        .aq-use-list { margin-top: 28px; }
        .aq-use-strip {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 20px;
          padding: 20px 0;
          border-bottom: 1px solid var(--border);
          align-items: baseline;
        }
        @media (max-width: 560px) {
          .aq-use-strip { grid-template-columns: 1fr; gap: 6px; }
        }
        .aq-use-strip:first-child { border-top: 1px solid var(--border); }
        .aq-use-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
        }
        .aq-use-body { font-size: 15px; color: var(--dim); line-height: 1.55; }

        /* ── Docs ── */
        .aq-doc-list { margin-top: 24px; }
        .aq-doc-item {
          display: block;
          text-decoration: none;
          color: inherit;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }
        .aq-doc-item:first-child { border-top: 1px solid var(--border); }
        .aq-doc-item:hover strong { color: var(--signal); }
        .aq-doc-item strong {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: var(--ink);
          transition: color 0.15s;
        }
        .aq-doc-item p { margin: 6px 0 0; font-size: 14px; color: var(--dim); }

        /* ── Code ── */
        .aq-tabs {
          display: flex;
          gap: 0;
          margin: 24px 0 0;
          border-bottom: 2px solid var(--ink);
        }
        .aq-tab {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 10px 18px;
          cursor: pointer;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          color: var(--dim);
          background: transparent;
        }
        .aq-tab.active {
          background: var(--paper);
          color: var(--ink);
          border-bottom-color: var(--signal);
          font-weight: 600;
        }
        .aq-code-wrap { position: relative; }
        .aq-code-wrap .aq-copy-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 2;
        }
        .aq-codeblock {
          background: var(--paper);
          border: 2px solid var(--ink);
          border-top: none;
          padding: 24px 22px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          overflow-x: auto;
          white-space: pre;
          color: var(--ink);
          margin: 0;
          line-height: 1.55;
        }

        /* ── FAQ ── */
        .aq-faq { margin-top: 24px; }
        .aq-faq details {
          border-bottom: 1px solid var(--border);
          padding: 18px 0;
        }
        .aq-faq details:first-child { border-top: 1px solid var(--border); }
        .aq-faq summary {
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          list-style: none;
        }
        .aq-faq summary::-webkit-details-marker { display: none; }
        .aq-faq summary::before {
          content: '+';
          font-family: 'IBM Plex Mono', monospace;
          color: var(--signal);
          margin-right: 12px;
          font-weight: 600;
        }
        .aq-faq details[open] summary::before { content: '−'; }
        .aq-faq p { margin: 12px 0 0 24px; color: var(--dim); font-size: 15px; line-height: 1.6; }

        /* ── Security note ── */
        .aq-honest {
          background: var(--paper);
          border: 2px solid var(--ink);
          border-left: 4px solid var(--signal);
          padding: 28px 30px;
          margin-top: 24px;
        }

        /* ── Footer ── */
        .aq-footer {
          border-top: 2px solid var(--ink);
          padding: 32px 5vw;
          text-align: center;
          color: var(--dim);
          font-size: 13px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .aq-footer a { color: var(--dim); text-decoration: underline; text-underline-offset: 3px; }
        .aq-footer a:hover { color: var(--ink); }
      `}</style>

      <nav className="aq-nav">
        <a className="aq-nav-mark" href="#">Admit<em>iQ</em></a>
        <div className="aq-nav-links">
          <a className="aq-nav-link" href="#tutorial">Tutorial</a>
          <a className="aq-nav-link" href="#docs">Docs</a>
          <a className="aq-nav-link" href="https://github.com/logiclitz/admitiq" target="_blank" rel="noreferrer">GitHub</a>
          <a className="aq-nav-link" href="https://logiclitz.org" target="_blank" rel="noreferrer">LogicLitz</a>
        </div>
      </nav>

      <section className="aq-hero">
        <div className="aq-hero-copy">
          <motion.h2
            className="aq-hero-brand"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Admit<span>i</span>Q
          </motion.h2>
          <motion.h1
            className="aq-h1"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            Admit only what you signed.
          </motion.h1>
          <motion.p
            className="aq-hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            Signed, expiring, single-use tokens for QR codes and URLs — verify at the door without a database.
          </motion.p>
          <motion.div
            className="aq-hero-ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.a
              className="aq-btn aq-btn-primary"
              href="#tutorial"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={springHover}
            >
              Try the tutorial
            </motion.a>
            <motion.a
              className="aq-btn aq-btn-ghost"
              href="#docs"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={springHover}
            >
              View docs
            </motion.a>
          </motion.div>
        </div>
        <HeroTicket />
      </section>

      <motion.section
        className="aq-section"
        id="flow"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionReveal}
      >
        <div className="aq-kicker">How it works</div>
        <h2 className="aq-h2">Your data goes in a sealed envelope</h2>
        <p className="aq-p">
          You pass fields like name and seat. AdmitiQ wraps them with issued-at, expiry, and a unique id,
          then stamps the package. Put that string in a QR, a URL, or an API. On scan, verify opens it
          only if the stamp matches.
        </p>
        <div className="aq-flow">
          {FLOW_STEPS.map((step, i) => (
            <div className="aq-flow-step" key={step.num}>
              <span className="aq-flow-num">{step.num}</span>
              <span className="aq-flow-title">{step.title}</span>
              <span className="aq-flow-body">{step.body}</span>
              {i < FLOW_STEPS.length - 1 && <span className="aq-flow-arrow" aria-hidden="true">→</span>}
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="aq-section aq-section-wide"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionReveal}
      >
        <InteractiveTutorial />
      </motion.section>

      <motion.section
        className="aq-section"
        id="usecases"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionReveal}
      >
        <div className="aq-kicker">Use cases</div>
        <h2 className="aq-h2">Where teams actually use this</h2>
        <div className="aq-use-list">
          {USE_CASES.map((u) => (
            <div className="aq-use-strip" key={u.title}>
              <div className="aq-use-title">{u.title}</div>
              <div className="aq-use-body">{u.body}</div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="aq-section"
        id="docs"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionReveal}
      >
        <div className="aq-kicker">Documentation</div>
        <h2 className="aq-h2">Written for newcomers</h2>
        <p className="aq-p">
          Full guides live in the repo under <code>docs/</code>. Start with "What is AdmitiQ?", then Getting started.
        </p>
        <div className="aq-doc-list">
          {DOC_LINKS.map((d) => (
            <a key={d.href} className="aq-doc-item" href={d.href} target="_blank" rel="noreferrer">
              <strong>{d.title}</strong>
              <p>{d.blurb}</p>
            </a>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="aq-section"
        id="code"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionReveal}
      >
        <div className="aq-kicker">Quick start</div>
        <h2 className="aq-h2">Token, URL, and QR</h2>
        <div className="aq-tabs">
          <motion.button
            type="button"
            className={`aq-tab ${lang === "python" ? "active" : ""}`}
            onClick={() => setLang("python")}
            whileHover={{ y: -1 }}
            transition={springHover}
          >
            Python
          </motion.button>
          <motion.button
            type="button"
            className={`aq-tab ${lang === "js" ? "active" : ""}`}
            onClick={() => setLang("js")}
            whileHover={{ y: -1 }}
            transition={springHover}
          >
            JavaScript
          </motion.button>
        </div>
        <div className="aq-code-wrap">
          <CopyButton text={snippet} />
          <pre className="aq-codeblock">{snippet}</pre>
        </div>
      </motion.section>

      <motion.section
        className="aq-section"
        id="faq"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionReveal}
      >
        <div className="aq-kicker">FAQ</div>
        <h2 className="aq-h2">Things people ask before shipping</h2>
        <div className="aq-faq">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="aq-section"
        id="security"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionReveal}
      >
        <div className="aq-kicker">Being upfront</div>
        <h2 className="aq-h2">What this does not protect against</h2>
        <div className="aq-honest">
          <p className="aq-p" style={{ marginBottom: 12 }}>
            A signature cannot stop someone photographing a ticket <em>before</em> the first scan —
            use single-use (<code>jti</code> + your store) and process checks when that matters.
            Without an <code>is_revoked</code> callback, reuse is allowed on purpose.
            A leaked secret can forge valid tokens — rotate with <code>verifyWithSecrets</code> / <code>verify_with_secrets</code>.
          </p>
          <p className="aq-p" style={{ marginBottom: 0 }}>
            Full threat model: <code>SECURITY.md</code> in the repo. Built by{" "}
            <a href="https://logiclitz.org" target="_blank" rel="noreferrer" style={{ color: "var(--cobalt)" }}>LogicLitz</a>.
          </p>
        </div>
      </motion.section>

      <footer className="aq-footer">
        MIT licensed ·{" "}
        <a href="https://github.com/logiclitz/admitiq">github.com/logiclitz/admitiq</a>
        {" · a "}
        <a href="https://logiclitz.org" target="_blank" rel="noreferrer">LogicLitz</a> project
      </footer>
    </div>
  );
}
