import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import Article from "../components/Article.jsx";
import { Link } from "react-router-dom";

export default function CloudPrivacy() {
  return (
    <>
      <Seo
        title="Cloud privacy — AdmitiQ"
        description="Privacy policy summary for AdmitiQ Cloud hosted coordination."
        path="/cloud-privacy"
      />
      <PageHero
        kicker="Cloud Privacy"
        title="Hosted privacy model"
        subtitle="Data minimization for account, usage, and coordination records."
      />
      <Article>
        <ul className="aq-bullet-list">
          <li>We store peppered JTI digests and admission outcomes—not your signing keys.</li>
          <li>Account passwords are Argon2id hashes; API secrets are shown once and stored hashed.</li>
          <li>Do not send personal payloads unless your own design requires it.</li>
          <li>After a paid plan ends, token activity may be retained up to 30 days, then purged.</li>
        </ul>
        <p>
          Privacy contact: <a href="mailto:contact@logiclitz.org">contact@logiclitz.org</a> ·{" "}
          <a href="mailto:parth.hajari@logiclitz.org">parth.hajari@logiclitz.org</a> ·{" "}
          <Link to="/dpa-subprocessors">DPA and subprocessors</Link> · <Link to="/terms-cloud">Terms</Link>
        </p>
      </Article>
    </>
  );
}
