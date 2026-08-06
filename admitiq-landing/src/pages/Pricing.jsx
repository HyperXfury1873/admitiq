import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import Article from "../components/Article.jsx";
import { CLOUD_PLANS, CLOUD_TOP_UPS } from "../data/cloudPlans.generated.js";
import { planPriceLabel, topUpPriceLabel, usePricingCurrency } from "../lib/pricingLocale.js";

export default function Pricing() {
  const { currency, setCurrency, ready, isIndia } = usePricingCurrency();
  const other = isIndia ? "USD" : "INR";

  return (
    <>
      <Seo
        title="Pricing — AdmitiQ Cloud"
        description="One organization plan with a shared operations pool, project and seat caps, and optional charm-priced top-ups for ops, projects, and team seats."
        path="/pricing"
      />
      <PageHero
        kicker="Pricing"
        title="One plan per organization"
        subtitle="The library stays free. Cloud is optional — shared ops across projects, with top-ups when you hit a limit."
      />
      <Article>
        <p className="aq-notice" style={{ padding: "1rem 1.1rem", border: "1px solid currentColor", borderRadius: "8px" }}>
          <strong>Launch:</strong> Cloud is free for everyone right now (Free plan starter pack). Paid upgrades (Starter /
          Growth), top-ups, and card checkout are <strong>coming soon</strong>. Sign up and use the Free plan today — no
          card required.
        </p>

        <p>
          You buy a plan for your <strong>organization</strong>, not for each project. All projects share one monthly
          operations pool. Project slots and team seats are capped by plan; if you need more, buy a top-up instead of a
          second subscription.
        </p>

        <p>
          Prices shown in <strong>{currency}</strong>
          {ready ? (
            <>
              {" "}
              (
              <button
                type="button"
                className="aq-text-btn"
                onClick={() => setCurrency(other)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "inherit",
                  textDecoration: "underline",
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                show {other}
              </button>
              )
            </>
          ) : null}
          . Checkout (Stripe / Razorpay) — coming soon. Taxes may apply when billing launches.
        </p>

        {CLOUD_PLANS.map((plan) => {
          const price = planPriceLabel(plan, currency);
          const isCustom = price === "Custom";
          const isFree = plan.id === "free";
          return (
            <section key={plan.id}>
              <h2>
                {plan.name} · {price}
                {isCustom ? "" : "/month"}
                {!isFree && !isCustom ? " · Coming soon" : isFree ? " · Available now" : ""}
              </h2>
              <p>
                <strong>
                  {plan.monthlyOperations.toLocaleString(isIndia ? "en-IN" : "en-US")}
                  {plan.id === "enterprise" ? "+" : ""} shared operations/month
                </strong>
                {" · "}
                {plan.maxProjects} project{plan.maxProjects === 1 ? "" : "s"} · {plan.maxSeats} seat
                {plan.maxSeats === 1 ? "" : "s"}
              </p>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>
          );
        })}

        <h2>Top-ups · Coming soon</h2>
        <p>
          When billing launches, you will be able to purchase charm-priced add-ons for ops, project slots, and seats when
          you hit a Free-plan limit.
        </p>
        <ul>
          {CLOUD_TOP_UPS.map((pack) => (
            <li key={pack.id}>
              <strong>
                {pack.label} — {topUpPriceLabel(pack, currency)}
              </strong>
              {" · "}
              {pack.description}
            </li>
          ))}
        </ul>

        <h2>How billing will work</h2>
        <ul>
          <li>Hard monthly ops cap — over-quota requests fail and are not billed.</li>
          <li>No automatic overages; grow with top-ups or by upgrading the plan (when available).</li>
          <li>
            {isIndia
              ? "Razorpay for India (INR). International cards use Stripe (USD)."
              : "Stripe for international cards (USD). India checkout uses Razorpay (INR)."}
          </li>
          <li>Regional prices are local market prices, not a currency conversion of each other.</li>
          <li>Usage resets each UTC calendar month for the organization.</li>
          <li>Quota-rejected, unauthorized, and invalid requests do not consume operations.</li>
        </ul>
      </Article>
    </>
  );
}
