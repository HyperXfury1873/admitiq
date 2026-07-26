import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import Article from "../components/Article.jsx";
import { LOGICLITZ, GITHUB } from "../data/content.js";

export default function About() {
  return (
    <>
      <Seo
        title="About AdmitiQ — a LogicLitz open-source project"
        description="AdmitiQ is built by LogicLitz. Learn who makes the signed QR and ticket token library, why it exists, and how to get involved."
        path="/about"
      />
      <PageHero
        kicker="About"
        title="A small library with a clear job"
        subtitle="AdmitiQ is open source. LogicLitz builds and maintains it."
      />
      <Article>
        <p>
          AdmitiQ started from a boring, expensive problem: teams keep shipping QR codes that anyone can
          screenshot and reuse. Fixing that usually means bolting on a custom signing scheme, expiry rules,
          and a used-list — or buying a heavy ticketing product you do not need.
        </p>
        <p>
          We wanted something quieter. A library you install, point at a secret, and use. Same token format in
          Python and JavaScript. No account required for the free package. No cloud dependency unless you choose
          to add your own store for single-use checks.
        </p>
        <h2>Who builds it</h2>
        <p>
          AdmitiQ is developed by{" "}
          <a href={LOGICLITZ} target="_blank" rel="noreferrer">
            LogicLitz
          </a>
          . LogicLitz works on practical software for teams that need reliable engineering without theatre.
        </p>
        <h2>What we will not pretend</h2>
        <p>
          AdmitiQ is not an identity provider, a payment system, or a full event platform. It signs short-lived
          proofs. Your product still owns guest lists, printers, scanners, and the business rules around them.
        </p>
        <h2>Get involved</h2>
        <p>
          Source, issues, and docs live on{" "}
          <a href={GITHUB} target="_blank" rel="noreferrer">
            GitHub
          </a>
          . If something is unclear, open an issue. If you ship AdmitiQ in production, we would rather hear the
          rough edges than a polished success story.
        </p>
        <p>
          <Link to="/why">Why AdmitiQ exists →</Link>
          {" · "}
          <Link to="/privacy">Privacy →</Link>
        </p>
      </Article>
    </>
  );
}
