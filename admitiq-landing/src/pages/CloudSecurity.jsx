import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import Article from "../components/Article.jsx";

export default function CloudSecurity() {
  return (
    <>
      <Seo
        title="Cloud security — AdmitiQ Hosted API"
        description="Security model for the AdmitiQ hosted coordination service: API key controls, tenant isolation, and data minimization."
        path="/cloud-security"
      />
      <PageHero
        kicker="Cloud Security"
        title="Security model for hosted coordination"
        subtitle="Least privilege, tenant isolation, auditability, and data minimization."
      />
      <Article>
        <ul className="aq-bullet-list">
          <li>API keys are hash-stored and revocable</li>
          <li>Project/environment tenant boundaries enforced server-side</li>
          <li>Operational access is audited</li>
          <li>Hosted service does not require your signing secret/private key in v1</li>
        </ul>
      </Article>
    </>
  );
}
