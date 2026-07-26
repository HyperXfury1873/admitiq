import { Link } from "react-router-dom";
import Seo from "../../components/Seo.jsx";
import PageHero from "../../components/PageHero.jsx";
import Article from "../../components/Article.jsx";

export default function SecureQrGuide() {
  return (
    <>
      <Seo
        title="How to make a secure QR code for tickets (not just a picture of text)"
        description="Plain QR codes can be copied forever. Learn how signed, expiring QR tickets work, and how AdmitiQ helps you issue and verify them in Python or JavaScript."
        path="/guides/secure-qr-codes"
        keywords="secure QR code, secure QR ticket, signed QR code, QR forgery, event ticket QR security"
      />
      <PageHero
        kicker="Guide"
        title="A QR code is only as strong as what you put inside it"
        subtitle="If the payload is plain text, the best camera in the room can steal entry."
      />
      <Article>
        <p>
          People search for “secure QR codes” after a bad night at the door: two guests with the same screenshot,
          a coupon redeemed twice, a visitor badge forwarded on WhatsApp. The scanner did its job. The data
          inside the code did not.
        </p>
        <p>
          A QR symbol is a transport. Security comes from the string it carries. That string should prove three
          things when you can: it was issued by you, it is still within its lifetime, and — if you need it —
          it has not already been accepted.
        </p>

        <h2>What “secure” usually means for tickets</h2>
        <ol>
          <li>Nobody can mint a valid code without your secret (or private key).</li>
          <li>Nobody can change seat, price, or guest fields without breaking the stamp.</li>
          <li>Codes die after a deadline you choose.</li>
          <li>Optional: the first good scan burns the code for later attempts.</li>
        </ol>

        <h2>A practical approach</h2>
        <p>
          Keep the signing secret on a server. Issue a token when you sell or print. Put that token in the QR
          (or in a link). At the door, verify. AdmitiQ is a small library for that pattern —{" "}
          <code>issue</code> / <code>verify</code>, plus helpers for QR images and URLs — in both Python and
          JavaScript.
        </p>
        <pre className="aq-codeblock">{`pip install admitiq
# or
npm install admitiq`}</pre>

        <h2>Common mistakes</h2>
        <ul>
          <li>Encoding only a database id and trusting that nobody guesses the next number.</li>
          <li>Putting the HMAC secret inside a mobile app “for offline mode.”</li>
          <li>Printing codes with no expiry “because the event is next month” — then forgetting reprints.</li>
        </ul>

        <p>
          Next: <Link to="/guides/single-use-qr">single-use QR codes</Link>,{" "}
          <Link to="/guides/expiring-tickets">expiring tickets</Link>, or the{" "}
          <Link to="/tutorial">interactive tutorial</Link>.
        </p>
      </Article>
    </>
  );
}
