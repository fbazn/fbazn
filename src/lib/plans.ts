export type PlanId = "starter" | "pro" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceId: string;
  description: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 10,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    description: "Everything you need to start sourcing profitable products.",
    features: [
      "Full dashboard access",
      "Lead vault",
      "FBA profit calculator",
      "Limited Chrome extension",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 25,
    priceId: process.env.STRIPE_PRICE_PRO!,
    description: "More data, deeper insights, and full Chrome extension.",
    features: [
      "Everything in Starter",
      "Full Chrome extension (sales/month data)",
      "Keepa integration",
      "Advanced opportunity scoring",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    priceId: process.env.STRIPE_PRICE_BUSINESS!,
    description: "Maximum power for serious sellers and teams.",
    features: [
      "Everything in Pro",
      "API access",
      "AI automations (coming soon)",
      "Priority support",
    ],
  },
];

export const PLAN_TRIAL_DAYS = 7;

export function getPlanById(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS.find((p) => p.priceId === priceId);
}
