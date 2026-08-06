import { useEffect, useState } from "react";

const STORAGE_KEY = "admitiq-pricing-currency";
const INDIA_TIMEZONES = new Set(["Asia/Kolkata", "Asia/Calcutta"]);

/**
 * INR and USD catalog prices are regional (charm) prices, not FX conversions.
 * Never display both side-by-side — that implies a broken exchange rate.
 */
export function detectPricingCurrency() {
  if (typeof window === "undefined") return "USD";

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (INDIA_TIMEZONES.has(tz)) return "INR";
  } catch {
    /* ignore */
  }

  const locales = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  for (const tag of locales) {
    try {
      const region = new Intl.Locale(tag).maximize().region;
      if (region === "IN") return "INR";
    } catch {
      if (/-IN\b/i.test(tag)) return "INR";
    }
  }

  return "USD";
}

function readStoredCurrency() {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "INR" || value === "USD" ? value : null;
  } catch {
    return null;
  }
}

export function usePricingCurrency() {
  const [currency, setCurrencyState] = useState("USD");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCurrencyState(readStoredCurrency() || detectPricingCurrency());
    setReady(true);
  }, []);

  function setCurrency(next) {
    if (next !== "INR" && next !== "USD") return;
    setCurrencyState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  return { currency, setCurrency, ready, isIndia: currency === "INR" };
}

export function planPriceLabel(plan, currency) {
  if (plan.usdMonthly === null && plan.inrMonthly === null) return "Custom";
  return currency === "INR" ? plan.inrPriceLabel : plan.priceLabel;
}

export function topUpPriceLabel(pack, currency) {
  return currency === "INR" ? pack.inrPriceLabel : pack.usdPriceLabel;
}
