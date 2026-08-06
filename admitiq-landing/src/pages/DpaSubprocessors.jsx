import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import Article from "../components/Article.jsx";

export default function DpaSubprocessors() {
  return (
    <>
      <Seo
        title="DPA and subprocessors — AdmitiQ"
        description="Data processing addendum and subprocessor list for AdmitiQ Cloud."
        path="/dpa-subprocessors"
      />
      <PageHero
        kicker="Compliance"
        title="DPA and subprocessors"
        subtitle="Processor commitments and vendor transparency for hosted services."
      />
      <Article>
        <p>
          <strong>Effective:</strong> 5 August 2026
        </p>
        <p>
          LogicLitz processes customer coordination and account data to operate AdmitiQ Cloud. Current subprocessors:
        </p>
        <ul className="aq-bullet-list">
          <li>Infrastructure host (VPS) for Postgres, Redis, API, worker, and dashboard</li>
          <li>Stripe — USD card payments when enabled</li>
          <li>Razorpay — INR payments when enabled</li>
        </ul>
        <p>
          Email delivery is not yet a production dependency. Contact{" "}
          <a href="mailto:contact@logiclitz.org">contact@logiclitz.org</a> or{" "}
          <a href="mailto:parth.hajari@logiclitz.org">parth.hajari@logiclitz.org</a> for DPA requests.
        </p>
      </Article>
    </>
  );
}
