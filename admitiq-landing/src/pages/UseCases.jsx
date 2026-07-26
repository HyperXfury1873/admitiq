import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import { USE_CASE_CATALOG, TUTORIAL_CASES } from "../data/content.js";

export default function UseCases() {
  const total = USE_CASE_CATALOG.reduce((n, s) => n + s.items.length, 0);

  return (
    <>
      <Seo
        title="Use cases — events, campuses, retail, travel, healthcare, logistics"
        description={`AdmitiQ use cases across ${USE_CASE_CATALOG.length} sectors: event tickets, attendance, coupons, visitor badges, parking, hotels, clinics, warehouse docks, NDA links, and more.`}
        path="/use-cases"
      />
      <PageHero
        kicker="Use cases"
        title={`${total}+ ways teams seal a pass`}
        subtitle="Same library — different doors. Pick a pattern, then try a live demo in the tutorial."
      />
      <section className="aq-section" style={{ paddingTop: 12 }}>
        <p className="aq-p">
          Interactive demos available for:{" "}
          {TUTORIAL_CASES.map((c) => c.title).join(" · ")}.
        </p>
        <p style={{ marginTop: 18 }}>
          <Link className="aq-btn aq-btn-primary" to="/tutorial">
            Open interactive tutorial
          </Link>
        </p>

        {USE_CASE_CATALOG.map((sector) => (
          <div className="aq-sector" key={sector.sector}>
            <h2 className="aq-sector-title">{sector.sector}</h2>
            <div className="aq-use-list">
              {sector.items.map((u) => (
                <div className="aq-use-strip" key={u.title}>
                  <span className="aq-case-strip-num">·</span>
                  <div>
                    <div className="aq-use-title">{u.title}</div>
                    <div className="aq-use-body">{u.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
