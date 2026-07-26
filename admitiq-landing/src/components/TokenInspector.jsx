import { useMemo, useState } from "react";
import { decodeTokenParts } from "../lib/demoCrypto";

function JsonBlock({ value }) {
  return <pre className="aq-token-json">{JSON.stringify(value, null, 2)}</pre>;
}

/** jwt.io-style colored token + decoded header / payload panels. */
export function TokenInspector({ token, showPaste = false, className = "" }) {
  const [paste, setPaste] = useState("");
  const source = showPaste ? paste : token;
  const decoded = useMemo(() => (source ? decodeTokenParts(source) : null), [source]);

  return (
    <div className={`aq-token-inspector ${className}`.trim()}>
      {showPaste && (
        <label className="aq-token-paste">
          <span>Encoded token</span>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder="Paste an AdmitiQ token (eyJ… . eyJ… . …)"
            rows={4}
            spellCheck={false}
          />
        </label>
      )}

      {!source && showPaste && (
        <p className="aq-deliver-hint">Same shape as JWT: <code>header.payload.signature</code> — decode is local, no network.</p>
      )}

      {decoded && !decoded.ok && <p className="aq-token-err">{decoded.error}</p>}

      {decoded?.ok && (
        <>
          <div className="aq-token-encoded" aria-label="Color-coded token segments">
            <span className="aq-tok-h">{decoded.headerB64}</span>
            <span className="aq-tok-dot">.</span>
            <span className="aq-tok-p">{decoded.payloadB64}</span>
            <span className="aq-tok-dot">.</span>
            <span className="aq-tok-s">{decoded.signatureB64}</span>
          </div>

          <div className="aq-token-legend" aria-hidden="true">
            <span className="aq-tok-h">HEADER</span>
            <span className="aq-tok-p">PAYLOAD</span>
            <span className="aq-tok-s">SIGNATURE</span>
          </div>

          <div className="aq-token-panels">
            <div className="aq-token-panel aq-token-panel-h">
              <div className="aq-token-panel-label">HEADER</div>
              <p className="aq-token-panel-note">Algorithm &amp; type (typ: QRT)</p>
              <JsonBlock value={decoded.header} />
            </div>
            <div className="aq-token-panel aq-token-panel-p">
              <div className="aq-token-panel-label">PAYLOAD</div>
              <p className="aq-token-panel-note">Claims: iat, exp, jti, data</p>
              <JsonBlock value={decoded.payload} />
            </div>
            <div className="aq-token-panel aq-token-panel-s">
              <div className="aq-token-panel-label">SIGNATURE</div>
              <p className="aq-token-panel-note">HMAC-SHA256 of header.payload (verify with your secret)</p>
              <pre className="aq-token-json aq-token-sig">{decoded.signatureB64}</pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
