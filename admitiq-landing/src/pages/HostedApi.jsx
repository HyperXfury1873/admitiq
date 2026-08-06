import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import Article from "../components/Article.jsx";
import { Link } from "react-router-dom";

export default function HostedApi() {
  return (
    <>
      <Seo
        title="Hosted API — AdmitiQ Cloud coordination"
        description="Optional hosted AdmitiQ API for atomic single-use enforcement, revocation, org-scoped usage metering, and team controls."
        path="/hosted-api"
      />
      <PageHero
        kicker="Hosted API"
        title="Optional cloud coordination for single-use at scale"
        subtitle="Keep signing local. Use hosted coordination for distributed scanner consistency."
      />
      <Article>
        <p>
          AdmitiQ Cloud is optional. The open-source SDK remains fully usable without this service. Hosted API focuses
          on coordination: atomic consume, revocation, organization-wide usage, and billing controls.
        </p>
        <h2>What hosted adds</h2>
        <ul className="aq-bullet-list">
          <li>Atomic first-use decisions across scanners</li>
          <li>Central revocation and token activity visibility</li>
          <li>One organization plan with a shared monthly operations pool</li>
          <li>Project and team seat caps, with optional top-ups</li>
          <li>Test and live environments, roles, and audit log</li>
        </ul>
        <h2>What stays local</h2>
        <ul className="aq-bullet-list">
          <li>Token issuance and signature verification</li>
          <li>Secret/private key custody</li>
          <li>Your business payload design</li>
        </ul>
        <p>
          See <Link to="/pricing">Cloud pricing</Link> for plan caps and top-up prices.
        </p>
      </Article>
    </>
  );
}
