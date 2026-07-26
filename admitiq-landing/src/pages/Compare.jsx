import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";

export default function Compare() {
  return (
    <>
      <Seo
        title="AdmitiQ vs plain QR vs JWT — comparison"
        description="Compare AdmitiQ to plain QR codes and generic JWTs for event tickets, attendance, and coupons. When to choose signed expiring QR tokens."
        path="/compare"
      />
      <PageHero
        kicker="Compare"
        title="AdmitiQ vs plain QR vs JWT"
        subtitle="Pick the simplest tool that matches the threat."
      />
      <section className="aq-section">
        <div className="aq-compare-table" role="table">
          <div className="aq-compare-row aq-compare-head" role="row">
            <div role="columnheader">Need</div>
            <div role="columnheader">Plain QR</div>
            <div role="columnheader">Generic JWT</div>
            <div role="columnheader">AdmitiQ</div>
          </div>
          {[
            ["Stop casual forgery", "No", "Yes", "Yes"],
            ["Built-in expiry helpers for tickets", "No", "Manual", "Yes"],
            ["QR + URL helpers", "N/A", "DIY", "Yes"],
            ["Single-use / revoke helpers", "No", "DIY", "Yes (store)"],
            ["Python ↔ JS same token", "N/A", "Possible", "First-class"],
            ["Ticket-shaped DX", "N/A", "Generic", "Purpose-built"],
          ].map((row) => (
            <div className="aq-compare-row" role="row" key={row[0]}>
              {row.map((cell) => (
                <div role="cell" key={cell}>
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="aq-p" style={{ marginTop: 24 }}>
          <Link to="/getting-started">Install AdmitiQ →</Link>
        </p>
      </section>
    </>
  );
}
