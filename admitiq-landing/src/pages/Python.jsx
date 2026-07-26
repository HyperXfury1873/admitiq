import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import { CopyButton } from "../tutorial/InteractiveTutorial.jsx";
import { GITHUB } from "../data/content.js";

const SNIP = `from admitiq import issue, verify, issue_url, issue_qr, verify_with_secrets

SECRET = "replace-me"  # load from env in production

token = issue({"ticket_id": "T-1001"}, ttl_seconds=3600, secret=SECRET)
payload = verify(token, secret=SECRET)

url = issue_url("https://example.com/scan", {"ticket_id": "T-1001"}, 3600, SECRET)
# issue_qr({"ticket_id": "T-1001"}, 3600, SECRET, output_path="t.png")

# Key rotation: try current then previous secrets
payload = verify_with_secrets(token, secrets=[SECRET, "old-secret"])`;

export default function PythonPage() {
  return (
    <>
      <Seo
        title="Python guide — pip install admitiq"
        description="Python AdmitiQ guide: issue, verify, issue_url, issue_qr, FastAPI/Flask helpers, Redis single-use store, and key rotation with verify_with_secrets."
        path="/python"
        keywords="admitiq python, pip install admitiq, python signed QR, fastapi ticket QR"
      />
      <PageHero
        kicker="Python"
        title="admitiq for Python"
        subtitle="pip install admitiq — same wire format as the Node package."
      />
      <section className="aq-section">
        <div className="aq-code-wrap">
          <CopyButton text={SNIP} />
          <pre className="aq-codeblock">{SNIP}</pre>
        </div>
        <ul className="aq-bullet-list">
          <li>
            Full guide:{" "}
            <a href={`${GITHUB}/blob/main/docs/python.md`} target="_blank" rel="noreferrer">
              docs/python.md
            </a>
          </li>
          <li>
            Flask demo:{" "}
            <a href={`${GITHUB}/tree/main/examples/flask-attendance`} target="_blank" rel="noreferrer">
              examples/flask-attendance
            </a>
          </li>
          <li>
            <Link to="/javascript">JavaScript twin API →</Link>
          </li>
        </ul>
      </section>
    </>
  );
}
