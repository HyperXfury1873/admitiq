import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import { FAQ_ITEMS } from "../data/content.js";

export default function Faq() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <Seo
        title="FAQ — scanners, storage, expiry, QR vs URL"
        description="AdmitiQ FAQ: offline scanners, where tickets are stored, early print expiry, QR vs URL delivery, Python vs JavaScript, and AI agent guidance."
        path="/faq"
        jsonLd={faqLd}
      />
      <PageHero kicker="FAQ" title="Things people ask before shipping" />
      <section className="aq-section">
        <div className="aq-faq">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
