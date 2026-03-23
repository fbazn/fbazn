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
    price: 10,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    description: "Everything you need to start sourcing profitable products on Amazon.",
    comingSoon: false,
    features: [
      "Chrome Extension → Review Queue",
      "Full Review Queue with slide-over panel",
      "Bulk convert, archive & delete",
      "Sourcing List & Archived Products",
      "Suppliers directory",
      "FBA Profit Calculator",
      "Dashboard stats",
      "Up to 250 products",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 25,
    priceId: process.env.STRIPE_PRICE_PRO!,
    description: "Deeper data, inventory tracking, and full export for serious sellers.",
    comingSoon: true,
    features: [
      "Everything in Starter",
      "Inventory import & dashboard (CSV + SP-API)",
      "Inbound order tracking (supplier + Amazon)",
      "Invoice OCR & item confirmation",
      "Keepa price history charts",
      "Advanced lead scoring",
      "CSV export",
      "Up to 1,000 products",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    priceId: process.env.STRIPE_PRICE_BUSINESS!,
    description: "Maximum power for high-volume sellers and small teams.",
    comingSoon: true,
    features: [
      "Everything in Pro",
      "Unlimited products",
      "Team seats (up to 5 users)",
      "Automated lead generation",
      "AI chat assistant",
      "API access",
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
