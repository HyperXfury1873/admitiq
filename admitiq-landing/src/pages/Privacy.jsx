import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import Article from "../components/Article.jsx";
import { LOGICLITZ, SITE_URL } from "../data/content.js";

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy policy — AdmitiQ"
        description="Privacy policy for admitiq.logiclitz.org. The AdmitiQ library runs on your infrastructure; this site is a static documentation and demo site."
        path="/privacy"
      />
      <PageHero
        kicker="Privacy"
        title="What we collect — and what we do not"
        subtitle="Short version: the library does not phone home. This website is a static site."
      />
      <Article>
        <p>
          This policy covers the public website at <strong>{SITE_URL}</strong> and how the AdmitiQ open-source
          library behaves when you install it in your own apps.
        </p>

        <h2>The AdmitiQ library</h2>
        <p>
          When you <code>pip install admitiq</code> or <code>npm install admitiq</code>, the code runs on{" "}
          <em>your</em> machines and servers. It does not send tokens, secrets, or analytics to LogicLitz. You
          control where secrets live and where any revocation or “already used” lists are stored.
        </p>
        <p>
          If you embed tokens in QR codes or URLs, those tokens may contain the business fields you chose to
          encode (seat numbers, guest names, and so on). Treat that payload as data you are responsible for
          under your own privacy notices.
        </p>

        <h2>This website</h2>
        <p>
          admitiq.logiclitz.org is a static documentation and demo site. The in-browser tutorial signs demo
          tokens locally in your browser with a temporary secret. Those demos are not stored on our servers.
        </p>
        <p>
          Like most sites, our host or CDN may keep standard server logs (IP address, user agent, requested URL,
          time). We do not use those logs to build marketing profiles. We do not sell personal data.
        </p>

        <h2>Cookies and tracking</h2>
        <p>
          We do not run advertising trackers on this site. If a hosting provider injects strictly necessary
          cookies for security or delivery, those are outside the AdmitiQ application itself.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy: reach LogicLitz via{" "}
          <a href={LOGICLITZ} target="_blank" rel="noreferrer">
            logiclitz.org
          </a>
          .
        </p>
        <p>
          Last updated: 26 July 2026.{" "}
          <Link to="/about">About AdmitiQ</Link>
        </p>
      </Article>
    </>
  );
}
