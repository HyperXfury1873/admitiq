import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="That AdmitiQ page does not exist." path="/404" />
      <PageHero kicker="404" title="Page not found" subtitle="Try the tutorial or getting started guides." />
      <section className="aq-section">
        <Link className="aq-btn aq-btn-primary" to="/">
          Home
        </Link>{" "}
        <Link className="aq-btn aq-btn-ghost" to="/tutorial">
          Tutorial
        </Link>
      </section>
    </>
  );
}
