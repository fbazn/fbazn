export type PlanId = "starter" | "pro" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceId: string;
  description: string;
  features: string[];
  comingSoon: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    description: "For organised sourcing, product review, and basic profit checks.",
    comingSoon: false,
    features: [
      "Up to 200 product lookups/day",
      "1 linked Seller account",
      "FBA Profit Calculator",
      "Supplier and product management",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 25,
    priceId: process.env.STRIPE_PRICE_PRO!,
    description: "For sellers who want unlimited lookups and deeper product insight.",
    comingSoon: false,
    features: [
      "Unlimited product lookups",
      "1 linked Seller account",
      "Historical product data",
      "Predicted product data",
      "Everything in Starter",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    priceId: process.env.STRIPE_PRICE_BUSINESS!,
    description: "Maximum power for high-volume sellers and small teams.",
    comingSoon: false,
    features: [
      "Everything in Pro",
      "Amazon inventory management",
      "Team access",
      "Repricer",
      "Product suggestions",
      "Daily reporting to your email",
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
