import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { NAV, GITHUB } from "../data/content.js";

const MOBILE_MQ = "(max-width: 880px)";

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => {
      if (!mq.matches) setOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="aq-nav" aria-label="Primary">
      <Link className="aq-nav-mark" to="/" onClick={() => setOpen(false)}>
        <img className="aq-nav-logo" src="/favicon.svg" width={28} height={28} alt="" />
        AdmitiQ
      </Link>

      <button
        type="button"
        className="aq-nav-toggle"
        aria-expanded={open}
        aria-controls="aq-primary-links"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="aq-nav-toggle-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div
        id="aq-primary-links"
        className={`aq-nav-links${open ? " is-open" : ""}`}
      >
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) => `aq-nav-link${isActive ? " aq-nav-link-active" : ""}`}
            to={item.to}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
        <a className="aq-nav-link" href={GITHUB} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>

      {open ? (
        <button
          type="button"
          className="aq-nav-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </nav>
  );
}
