import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import { CopyButton } from "../tutorial/InteractiveTutorial.jsx";
import { GITHUB } from "../data/content.js";

const SNIP = `const {
  issue, verify, issueUrl, issueQR, verifyWithSecrets
} = require("admitiq");

const SECRET = process.env.ADMITIQ_SECRET;

const token = issue({ ticketId: "T-1001" }, 3600, SECRET);
const payload = await verify(token, SECRET);

const url = issueUrl("https://example.com/scan", { ticketId: "T-1001" }, 3600, SECRET);
// await issueQR({ ticketId: "T-1001" }, 3600, SECRET, "t.png");

const rotated = await verifyWithSecrets(token, [SECRET, process.env.ADMITIQ_SECRET_OLD]);`;

export default function JavaScriptPage() {
  return (
    <>
      <Seo
        title="JavaScript guide — npm install admitiq"
        description="Node AdmitiQ guide: issue, verify, issueUrl, issueQR, Express helpers, Redis store, and verifyWithSecrets for key rotation."
        path="/javascript"
        keywords="admitiq npm, npm install admitiq, node signed QR, express ticket QR"
      />
      <PageHero
        kicker="JavaScript"
        title="admitiq for Node.js"
        subtitle="npm install admitiq — tokens verify in Python with the same secret."
      />
      <section className="aq-section">
        <div className="aq-code-wrap">
          <CopyButton text={SNIP} />
          <pre className="aq-codeblock">{SNIP}</pre>
        </div>
        <ul className="aq-bullet-list">
          <li>
            Full guide:{" "}
            <a href={`${GITHUB}/blob/main/docs/javascript.md`} target="_blank" rel="noreferrer">
              docs/javascript.md
            </a>
          </li>
          <li>
            Express demo:{" "}
            <a href={`${GITHUB}/tree/main/examples/express-ticket-check`} target="_blank" rel="noreferrer">
              examples/express-ticket-check
            </a>
          </li>
          <li>
            <Link to="/python">Python twin API →</Link>
          </li>
        </ul>
      </section>
    </>
  );
}
