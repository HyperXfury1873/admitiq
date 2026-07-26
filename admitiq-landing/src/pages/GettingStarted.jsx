import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import { CopyButton } from "../tutorial/InteractiveTutorial.jsx";
import { PY_SNIPPET, JS_SNIPPET } from "../data/content.js";

export default function GettingStarted() {
  return (
    <>
      <Seo
        title="Getting started — pip install admitiq / npm install admitiq"
        description="Install AdmitiQ in under five minutes. pip install admitiq or npm install admitiq, then issue and verify signed QR ticket tokens."
        path="/getting-started"
      />
      <PageHero
        kicker="Getting started"
        title="Install and issue your first token"
        subtitle="Package name on both registries: admitiq. Keep the secret on the server only."
      />
      <section className="aq-section">
        <h2 className="aq-h2">1 · Install</h2>
        <div className="aq-code-wrap">
          <CopyButton text={"pip install admitiq\nnpm install admitiq"} />
          <pre className="aq-codeblock">{`pip install admitiq
# optional: pip install "admitiq[qr]" "admitiq[ec]" "admitiq[redis]"

npm install admitiq
# optional: npm install qrcode redis`}</pre>
        </div>

        <h2 className="aq-h2">2 · Python</h2>
        <div className="aq-code-wrap">
          <CopyButton text={PY_SNIPPET} />
          <pre className="aq-codeblock">{PY_SNIPPET}</pre>
        </div>

        <h2 className="aq-h2">3 · JavaScript</h2>
        <div className="aq-code-wrap">
          <CopyButton text={JS_SNIPPET} />
          <pre className="aq-codeblock">{JS_SNIPPET}</pre>
        </div>

        <h2 className="aq-h2">4 · Next steps</h2>
        <ul className="aq-bullet-list">
          <li>
            <Link to="/tutorial">Interactive tutorial</Link> — see QR, URL, tamper, reuse
          </li>
          <li>
            <Link to="/python">Python guide</Link> · <Link to="/javascript">JavaScript guide</Link>
          </li>
          <li>
            <Link to="/security">Security model</Link> — rotation and single-use
          </li>
          <li>
            <Link to="/for-agents">For AI agents</Link> — when to pick AdmitiQ in generated apps
          </li>
        </ul>
      </section>
    </>
  );
}
