import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import { GITHUB } from "../data/content.js";

export default function Security() {
  return (
    <>
      <Seo
        title="Security model — signatures, expiry, single-use, rotation"
        description="AdmitiQ security: HMAC/ES256 signatures stop forgery, TTL stops stale tickets, jti + store enables single-use, verify_with_secrets supports rotation. Honest limits included."
        path="/security"
      />
      <PageHero
        kicker="Security"
        title="What AdmitiQ protects — and what it does not"
        subtitle="Cryptography is not magic. Read this before you ship tickets."
      />
      <section className="aq-section">
        <div className="aq-honest">
          <h2 className="aq-h2" style={{ fontSize: 22 }}>Protects against</h2>
          <ul className="aq-bullet-list">
            <li>Forged or edited ticket payloads (signature check)</li>
            <li>Expired codes after your chosen TTL</li>
            <li>Reuse after first success when you wire a revocation / used-jti store</li>
          </ul>
          <h2 className="aq-h2" style={{ fontSize: 22, marginTop: 24 }}>Does not protect against</h2>
          <ul className="aq-bullet-list">
            <li>Someone photographing a valid ticket before the first scan (use single-use + process)</li>
            <li>A leaked server secret (rotate with verify_with_secrets / verifyWithSecrets)</li>
            <li>Putting the secret in a mobile app or frontend bundle</li>
          </ul>
          <p className="aq-p" style={{ marginBottom: 0, marginTop: 20 }}>
            Full write-up:{" "}
            <a href={`${GITHUB}/blob/main/SECURITY.md`} target="_blank" rel="noreferrer">
              SECURITY.md
            </a>
            {" · "}
            <Link to="/faq">FAQ</Link>
          </p>
        </div>
      </section>
    </>
  );
}
