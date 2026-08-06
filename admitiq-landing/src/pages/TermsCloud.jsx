import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import Article from "../components/Article.jsx";
import { Link } from "react-router-dom";

export default function TermsCloud() {
  return (
    <>
      <Seo
        title="Cloud terms — AdmitiQ"
        description="Terms of Service for AdmitiQ Cloud hosted coordination."
        path="/terms-cloud"
      />
      <PageHero
        kicker="Terms"
        title="AdmitiQ Cloud Terms of Service"
        subtitle="Commercial terms for the optional hosted coordination API."
      />
      <Article>
        <p>
          <strong>Effective:</strong> 5 August 2026 · Operator: LogicLitz
        </p>
        <p>
          Full Cloud terms live with the service console for the active deployment. Summary:
        </p>
        <ul>
          <li>Subscriptions are billed per organization, not per project.</li>
          <li>Operations are a shared monthly pool across the organization’s projects.</li>
          <li>Project and seat limits are hard caps; optional top-ups raise a single limit.</li>
          <li>There are no automatic overage charges. Over-quota API calls fail without billing.</li>
          <li>Regional INR and USD prices are local market prices, not FX conversions of each other.</li>
        </ul>
        <p>
          Support: <a href="mailto:contact@logiclitz.org">contact@logiclitz.org</a> ·{" "}
          <a href="mailto:parth.hajari@logiclitz.org">parth.hajari@logiclitz.org</a> · Related:{" "}
          <Link to="/cloud-privacy">Privacy</Link>, <Link to="/dpa-subprocessors">DPA</Link>
        </p>
      </Article>
    </>
  );
}
