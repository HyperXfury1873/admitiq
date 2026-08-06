// Generated from admitiq-cloud/packages/plans/index.js. Do not edit manually.
export const CLOUD_PLANS = [
  {
    "id": "free",
    "name": "Free",
    "monthlyOperations": 10000,
    "maxProjects": 1,
    "maxSeats": 1,
    "usdMonthly": 0,
    "inrMonthly": 0,
    "priceLabel": "$0",
    "inrPriceLabel": "₹0",
    "description": "Build, test, and run a small production integration.",
    "features": [
      "1 project · 1 seat",
      "10,000 shared monthly operations",
      "Optional top-ups when you hit a limit",
      "Community support"
    ]
  },
  {
    "id": "starter",
    "name": "Starter",
    "monthlyOperations": 100000,
    "maxProjects": 3,
    "maxSeats": 1,
    "usdMonthly": 19,
    "inrMonthly": 1499,
    "priceLabel": "$19",
    "inrPriceLabel": "₹1,499",
    "description": "For production apps and recurring events.",
    "features": [
      "3 projects · 1 seat",
      "100,000 shared monthly operations",
      "Optional ops, project, and seat top-ups",
      "Email support"
    ]
  },
  {
    "id": "growth",
    "name": "Growth",
    "monthlyOperations": 1000000,
    "maxProjects": 10,
    "maxSeats": 5,
    "usdMonthly": 79,
    "inrMonthly": 5999,
    "priceLabel": "$79",
    "inrPriceLabel": "₹5,999",
    "description": "For growing platforms with sustained coordination traffic.",
    "features": [
      "10 projects · 5 seats",
      "1,000,000 shared monthly operations",
      "Team roles and audit log",
      "Optional ops, project, and seat top-ups",
      "Priority email support"
    ]
  },
  {
    "id": "enterprise",
    "name": "Enterprise",
    "monthlyOperations": 10000000,
    "maxProjects": 100,
    "maxSeats": 50,
    "usdMonthly": null,
    "inrMonthly": null,
    "priceLabel": "Custom",
    "inrPriceLabel": "Custom",
    "description": "For contracted volume, deployment, and support requirements.",
    "features": [
      "Custom project and seat limits",
      "10M+ shared monthly operations",
      "Team roles and audit log",
      "Top-ups and custom commercial terms",
      "Security review support"
    ]
  }
];

export const CLOUD_TOP_UPS = [
  {
    "id": "ops",
    "kind": "ops",
    "units": 2000,
    "unitLabel": "operations",
    "inr": 99,
    "usd": 1.99,
    "inrPriceLabel": "₹99",
    "usdPriceLabel": "$1.99",
    "label": "+2,000 operations",
    "description": "Extra shared operations after your monthly plan quota."
  },
  {
    "id": "project",
    "kind": "project",
    "units": 1,
    "unitLabel": "project slot",
    "inr": 199,
    "usd": 2.99,
    "inrPriceLabel": "₹199",
    "usdPriceLabel": "$2.99",
    "label": "+1 project",
    "description": "Add one project slot beyond your plan’s project limit."
  },
  {
    "id": "seat",
    "kind": "seat",
    "units": 1,
    "unitLabel": "team seat",
    "inr": 299,
    "usd": 3.99,
    "inrPriceLabel": "₹299",
    "usdPriceLabel": "$3.99",
    "label": "+1 team seat",
    "description": "Add one team member seat beyond your plan’s seat limit."
  }
];
