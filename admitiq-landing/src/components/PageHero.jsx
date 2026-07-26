export default function PageHero({ kicker, title, subtitle, children }) {
  return (
    <header className="aq-page-hero aq-section">
      {kicker && <div className="aq-kicker">{kicker}</div>}
      <h1 className="aq-h2">{title}</h1>
      {subtitle && <p className="aq-p">{subtitle}</p>}
      {children}
    </header>
  );
}
