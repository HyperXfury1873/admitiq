import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import Article from "../components/Article.jsx";

export default function WhyAdmitiq() {
  return (
    <>
      <Seo
        title="Why AdmitiQ — signed QR tickets without the SaaS weight"
        description="Why teams use AdmitiQ instead of plain QR codes or a full ticketing platform: signatures, expiry, optional single-use, and the same token in Python and JavaScript."
        path="/why"
      />
      <PageHero
        kicker="Why AdmitiQ"
        title="Because a QR code is not a ticket"
        subtitle="A QR only carries text. AdmitiQ puts a signed, time-limited proof inside that text."
      />
      <Article>
        <p>
          Most “QR ticket” apps encode a database id or a plain string. That works until someone forwards a
          screenshot. Then you are stuck arguing about whether the code was already scanned, or whether the
          payload was edited in a hex editor for fun.
        </p>
        <p>
          AdmitiQ treats the code as a sealed envelope. You put fields in. The library stamps issued-at, expiry,
          and a unique id, then signs the package. On scan, verify checks the stamp. If the stamp fails, you
          refuse entry — no mystery.
        </p>

        <h2>What you get that plain QR libraries do not</h2>
        <ul>
          <li>
            <strong>Authenticity.</strong> Forged or tweaked payloads fail the signature.
          </li>
          <li>
            <strong>Expiry.</strong> Old printouts stop working when you say they should.
          </li>
          <li>
            <strong>Optional single-use.</strong> Mark a token id as used after the first good scan.
          </li>
          <li>
            <strong>QR and URL helpers.</strong> Same token in an image or a deep link.
          </li>
          <li>
            <strong>Two languages, one format.</strong> Issue in Python, verify in Node — or the reverse.
          </li>
        </ul>

        <h2>What AdmitiQ is not</h2>
        <p>
          It will not replace your CRM, seat map, or payment flow. It will not stop someone photographing a
          still-valid pass before the first scan — that is a process problem, and single-use helps only after the
          first successful verify. Read the{" "}
          <Link to="/security">security notes</Link> before you ship.
        </p>

        <h2>Who should care</h2>
        <p>
          Event ops printing badges early. Teachers projecting a short-lived attendance code. Retail teams
          issuing one-shot coupons. Facilities handing visitor passes. Anyone who needs a proof that travels
          offline for a few hours or days without standing up a full ticketing SaaS.
        </p>

        <p>
          <Link className="aq-btn aq-btn-primary" to="/tutorial">
            Try the tutorial
          </Link>{" "}
          <Link className="aq-btn aq-btn-ghost" to="/getting-started">
            Install
          </Link>
        </p>
      </Article>
    </>
  );
}
