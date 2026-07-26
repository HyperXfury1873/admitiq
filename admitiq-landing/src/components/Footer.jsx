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
