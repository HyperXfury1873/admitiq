/**
 * Stripe helpers — create Checkout sessions for Starter/Growth.
 * Configure STRIPE_SECRET_KEY and price IDs in .env before enabling billing.
 */
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // lazy require so local free-tier work without Stripe installed config
  const Stripe = require("stripe");
  return new Stripe(key);
}

async function createCheckoutSession({ projectId, tier, successUrl, cancelUrl }) {
  const stripe = getStripe();
  if (!stripe) {
    const err = new Error("stripe_not_configured");
    err.status = 501;
    throw err;
  }
  const price =
    tier === "growth" ? process.env.STRIPE_PRICE_GROWTH : process.env.STRIPE_PRICE_STARTER;
  if (!price) {
    const err = new Error("stripe_price_missing");
    err.status = 501;
    throw err;
  }
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { projectId, tier },
  });
}

module.exports = { getStripe, createCheckoutSession };
