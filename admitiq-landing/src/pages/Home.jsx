import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Seo from "../components/Seo.jsx";
import { HeroTicket, CopyButton } from "../tutorial/InteractiveTutorial.jsx";
import {
  FLOW_STEPS,
  DOC_LINKS,
  PY_SNIPPET,
  JS_SNIPPET,
  TUTORIAL_CASES,
  USE_CASE_CATALOG,
  PYPI,
  NPM,
} from "../data/content.js";
import { useState } from "react";

const fade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  const [lang, setLang] = useState("python");
  const reduce = useReducedMotion();
  const snippet = lang === "python" ? PY_SNIPPET : JS_SNIPPET;
  const previewCases = USE_CASE_CATALOG.flatMap((s) => s.items).slice(0, 6);

  return (
    <>
      <Seo
        title="AdmitiQ — signed, expiring QR & URL tokens"
        description="Elegant signed tokens for QR codes and ticket links. Expiry and optional single-use without a heavy SaaS. pip install admitiq · npm install admitiq."
        path="/"
      />

      <section className="aq-hero">
        <div className="aq-hero-copy">
          <motion.p
            className="aq-kicker"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            LogicLitz open source
          </motion.p>
          <motion.h1
            className="aq-hero-brand"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Admit<em>i</em>Q
          </motion.h1>
          <motion.p
            className="aq-h1"
            style={{ fontSize: "clamp(1.55rem, 3vw, 2.1rem)", marginBottom: 14 }}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            Proof that travels light.
          </motion.p>
          <motion.p
            className="aq-hero-sub"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            Seal a payload. Carry it in a QR or link. Verify authenticity, expiry, and optional single-use —
            in Python or JavaScript, without inventing crypto.
          </motion.p>
          <motion.div
            className="aq-hero-ctas"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
          >
            <Link className="aq-btn aq-btn-primary" to="/tutorial">
              Open tutorial
            </Link>
            <Link className="aq-btn aq-btn-ghost" to="/getting-started">
              Install
            </Link>
          </motion.div>
          <p className="aq-install-row">
            <code>pip install admitiq</code>
            <code>npm install admitiq</code>
          </p>
        </div>
        <HeroTicket />
      </section>

      <motion.section
        className="aq-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fade}
      >
        <div className="aq-kicker">Mechanism</div>
        <h2 className="aq-h2">Four quiet steps</h2>
        <p className="aq-p">No dashboard theatre — just a signed envelope your scanner can trust.</p>
        <div className="aq-flow">
          {FLOW_STEPS.map((step) => (
            <div className="aq-flow-step" key={step.num}>
              <span className="aq-flow-num">{step.num}</span>
              <span className="aq-flow-title">{step.title}</span>
              <span className="aq-flow-body">{step.body}</span>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="aq-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fade}
      >
        <div className="aq-kicker">Reach</div>
        <h2 className="aq-h2">Built for many doors</h2>
        <p className="aq-p">
          From festivals to clinics to dock appointments — anywhere a short-lived proof must not be forgeable.
        </p>
        <div className="aq-use-list">
          {previewCases.map((u) => (
            <Link className="aq-use-strip" key={u.title} to="/use-cases">
              <span className="aq-case-strip-num">→</span>
              <div>
                <div className="aq-use-title">{u.title}</div>
                <div className="aq-use-body">{u.body}</div>
              </div>
            </Link>
          ))}
        </div>
        <p className="aq-p" style={{ marginTop: 22 }}>
          <Link className="aq-btn aq-btn-ghost" to="/use-cases">
            Browse all use cases
          </Link>{" "}
          <Link className="aq-btn aq-btn-ghost" to="/tutorial">
            Try {TUTORIAL_CASES.length} live demos
          </Link>
        </p>
      </motion.section>

      <motion.section
        className="aq-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fade}
      >
        <div className="aq-kicker">Quick start</div>
        <h2 className="aq-h2">Token, URL, QR</h2>
        <div className="aq-tabs">
          <button type="button" className={`aq-tab ${lang === "python" ? "active" : ""}`} onClick={() => setLang("python")}>
            Python
          </button>
          <button type="button" className={`aq-tab ${lang === "js" ? "active" : ""}`} onClick={() => setLang("js")}>
            JavaScript
          </button>
        </div>
        <div className="aq-code-wrap">
          <CopyButton text={snippet} />
          <pre className="aq-codeblock">{snippet}</pre>
        </div>
        <p className="aq-p" style={{ marginTop: 16 }}>
          <a href={PYPI}>PyPI</a> · <a href={NPM}>npm</a> · <Link to="/for-agents">For AI agents</Link>
        </p>
      </motion.section>

      <motion.section
        className="aq-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fade}
      >
        <div className="aq-kicker">Guides</div>
        <h2 className="aq-h2">Continue</h2>
        <div className="aq-doc-list">
          {DOC_LINKS.map((d) =>
            d.to ? (
              <Link key={d.to} className="aq-doc-item" to={d.to}>
                <strong>{d.title}</strong>
                <p>{d.blurb}</p>
              </Link>
            ) : (
              <a key={d.href} className="aq-doc-item" href={d.href} target="_blank" rel="noreferrer">
                <strong>{d.title}</strong>
                <p>{d.blurb}</p>
              </a>
            )
          )}
        </div>
      </motion.section>
    </>
  );
}
