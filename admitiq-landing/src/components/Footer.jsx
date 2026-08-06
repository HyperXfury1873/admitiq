import { Link } from "react-router-dom";
import { GITHUB, LOGICLITZ, FOOTER_COLUMNS } from "../data/content.js";

export default function Footer() {
  return (
    <footer className="aq-footer">
      <div className="aq-footer-grid">
        <div className="aq-footer-intro">
          <p className="aq-footer-brand">
            Admit<em>i</em>Q
          </p>
          <p className="aq-footer-credit">
            Developed by{" "}
            <a href={LOGICLITZ} target="_blank" rel="noreferrer">
              LogicLitz
            </a>
          </p>
          <p className="aq-footer-meta">MIT licensed open-source library</p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div className="aq-footer-col" key={col.title}>
            <h3 className="aq-footer-col-title">{col.title}</h3>
            <ul className="aq-footer-col-list">
              {col.links.map((l) => (
                <li key={l.to || l.href}>
                  {l.to ? (
                    <Link to={l.to}>{l.label}</Link>
                  ) : (
                    <a href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="aq-footer-badges" aria-label="Find AdmitiQ on launch platforms">
        <a
          className="aq-footer-badge aq-footer-badge-smol"
          href="https://smollaunchpad.com/projects/admitiq"
          target="_blank"
          rel="noreferrer"
          title="Smol LaunchPad Top 2 Daily Winner"
          aria-label="AdmitiQ on Smol LaunchPad — Top 2 Daily Winner"
        >
          <img
            src="https://r2.direasy-multi-tenant.focusapps.app/uploads/616d0b1a-3979-4b8c-94d1-b4f1fedd3ead/1783046775816/iwwixene3dh/top2-dark.svg"
            alt="Smol LaunchPad Top 2 Daily Winner"
            width="195"
            height="54"
            loading="lazy"
          />
        </a>
        <a
          className="aq-footer-badge"
          href="https://www.producthunt.com/products/admitiq-signed-expiring-tokens/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_campaign=admitiq"
          target="_blank"
          rel="noreferrer"
          aria-label="Review AdmitiQ on Product Hunt"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1279010&theme=neutral"
            alt="Review AdmitiQ — signed, expiring QR tokens on Product Hunt"
            width="250"
            height="54"
            loading="lazy"
          />
        </a>
        <a
          className="aq-footer-badge aq-footer-badge-peerlist"
          href="https://peerlist.io/logiclitz/project/admitiq--signed-expiring-qr--url-tokens"
          target="_blank"
          rel="noreferrer"
          aria-label="View and upvote AdmitiQ on Peerlist"
        >
          <img
            src="https://peerlist.io/api/v1/projects/embed/PRJH6A76MJQKLB67QF967EAPDE7E8Q?showUpvote=true&theme=dark"
            alt="View and upvote AdmitiQ — signed, expiring QR and URL tokens on Peerlist"
            height="72"
            loading="lazy"
          />
        </a>
        <a
          className="aq-footer-badge aq-footer-badge-peerpush"
          href="https://peerpush.com/p/admitiq-signed-expiring-qr-and-url-toke"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View and support AdmitiQ on PeerPush"
        >
          <img
            src="https://peerpush.com/p/admitiq-signed-expiring-qr-and-url-toke/badge.png"
            alt="View and support AdmitiQ — signed, expiring QR and URL tokens on PeerPush"
            width="230"
            loading="lazy"
          />
        </a>
      </div>

      <p className="aq-footer-bottom">
        © {new Date().getFullYear()}{" "}
        <a href={LOGICLITZ} target="_blank" rel="noreferrer">
          LogicLitz
        </a>
        {" · "}
        <a href={GITHUB} target="_blank" rel="noreferrer">
          Source on GitHub
        </a>
      </p>
    </footer>
  );
}
