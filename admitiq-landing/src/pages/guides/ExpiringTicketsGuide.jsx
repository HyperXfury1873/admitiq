import { Link } from "react-router-dom";
import Seo from "../../components/Seo.jsx";
import PageHero from "../../components/PageHero.jsx";
import Article from "../../components/Article.jsx";

export default function ExpiringTicketsGuide() {
  return (
    <>
      <Seo
        title="Expiring QR tickets — print early, die on time"
        description="How expiring QR tickets and passes work. Set TTL when you issue, verify rejects after expiry. Useful for events printed weeks ahead and short classroom codes."
        path="/guides/expiring-tickets"
        keywords="expiring QR code, expiring ticket QR, TTL QR token, print tickets early"
      />
      <PageHero
        kicker="Guide"
        title="Print in June. Refuse entry in December."
        subtitle="Expiry lives inside the token — not in a spreadsheet you hope someone updates."
      />
      <Article>
        <p>
          Box offices print early. Teachers need a code that vanishes after class. Parking permits should not
          work next Tuesday. Expiry is the simplest control most teams underuse.
        </p>

        <h2>How AdmitiQ handles it</h2>
        <p>
          When you call <code>issue</code>, you pass <code>ttl_seconds</code> (or the JS equivalent). The library
          stores an absolute expiry inside the signed body. Later, <code>verify</code> compares that to the
          current time. If the clock says the pass is late, verification fails — even if the signature is fine.
        </p>
        <p>
          For an event on a known date, compute seconds until doors close (or until the after-party ends) and
          use that as the TTL when printing.
        </p>

        <h2>Clock skew</h2>
        <p>
          Scanners and issuers should live in the same rough time zone reality. A few minutes of skew is usually
          fine; hours of wrong device clocks are not. NTP on kiosks is dull and worth it.
        </p>

        <h2>Pairing with single-use</h2>
        <p>
          Expiry alone allows reuse until the deadline. Many doors want both: dead after midnight, and dead after
          the first successful scan. See the{" "}
          <Link to="/guides/single-use-qr">single-use guide</Link>.
        </p>

        <p>
          <Link to="/getting-started">Install AdmitiQ</Link> · <Link to="/why">Why AdmitiQ</Link>
        </p>
      </Article>
    </>
  );
}
