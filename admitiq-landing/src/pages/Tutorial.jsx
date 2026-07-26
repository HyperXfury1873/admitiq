import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import { InteractiveTutorial } from "../tutorial/InteractiveTutorial.jsx";
import { TUTORIAL_CASES } from "../data/content.js";

export default function Tutorial() {
  return (
    <>
      <Seo
        title="Interactive tutorial — issue, deliver, verify"
        description={`Hands-on AdmitiQ tutorial with ${TUTORIAL_CASES.length} scenarios: tickets, attendance, coupons, access, links, parking, museum entry, NDA invites.`}
        path="/tutorial"
      />
      <PageHero
        kicker="Tutorial"
        title="Issue → carry → admit"
        subtitle="Browser demo using the same HMAC shape as the pip/npm packages. Secret stays local."
      />
      <section className="aq-section aq-section-wide" style={{ paddingTop: 8 }}>
        <InteractiveTutorial />
      </section>
    </>
  );
}
