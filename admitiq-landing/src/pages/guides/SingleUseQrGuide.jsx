import { Link } from "react-router-dom";
import Seo from "../../components/Seo.jsx";
import PageHero from "../../components/PageHero.jsx";
import Article from "../../components/Article.jsx";

export default function SingleUseQrGuide() {
  return (
    <>
      <Seo
        title="Single-use QR codes — stop the second scan"
        description="How single-use QR tickets work: a unique token id, a used-list, and verify that rejects repeats. AdmitiQ helpers for Python and Node."
        path="/guides/single-use-qr"
        keywords="single use QR code, one time QR ticket, prevent QR reuse, revocable QR token"
      />
      <PageHero
        kicker="Guide"
        title="One good scan. Then it is done."
        subtitle="Signatures stop forgery. Single-use stops the friend who got the same screenshot."
      />
      <Article>
        <p>
          Expiry alone is not enough for many doors. If a pass is valid for three hours, two people can still
          walk in on the same image ten minutes apart. Single-use means: after the first successful verify, that
          token id is remembered as spent.
        </p>

        <h2>The moving parts</h2>
        <ul>
          <li>
            <strong>jti</strong> — a unique id baked into the token when you issue it.
          </li>
          <li>
            <strong>A store</strong> — memory for demos, Redis or a database when several scanners share state.
          </li>
          <li>
            <strong>A check on verify</strong> — if the id is already marked used, refuse.
          </li>
        </ul>
        <p>
          AdmitiQ leaves storage to you (including optional Redis helpers) because every venue wires this
          differently. The library’s job is to give you a stable id and a clean verify path.
        </p>

        <h2>What single-use does not fix</h2>
        <p>
          If two people scan at the exact same moment before either write lands, you still need transactional
          discipline in the store. If someone photographs a pass before any scan, you need staff process — or a
          shorter TTL, name checks, or both.
        </p>

        <p>
          See also: <Link to="/guides/secure-qr-codes">secure QR codes</Link> ·{" "}
          <Link to="/security">security model</Link> · <Link to="/tutorial">tutorial</Link>
        </p>
      </Article>
    </>
  );
}
