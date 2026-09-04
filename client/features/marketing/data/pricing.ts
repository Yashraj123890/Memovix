export interface PricingTier {
  name: string;
  price: string;
  cadence?: string;
  featured?: boolean;
  cta: string;
  features: string[];
}

/**
 * SUGGESTED pricing structure — a starting point to adapt, not final numbers.
 * Prices are placeholders ("$—"); the page labels this section accordingly.
 */
export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    cta: "Start free",
    features: [
      "1 active project",
      "Files, memories & timeline",
      "AI assistant (limited questions)",
      "1 client portal",
    ],
  },
  {
    name: "Pro",
    price: "$—",
    cadence: "per user / mo",
    featured: true,
    cta: "Start free trial",
    features: [
      "Unlimited projects",
      "Unlimited AI questions with citations",
      "Meeting recording & extraction",
      "Requirements, deliverables & scope tracking",
      "Unlimited client portals",
    ],
  },
  {
    name: "Business",
    price: "Custom",
    cta: "Talk to us",
    features: [
      "Everything in Pro",
      "Advanced roles & permissions",
      "Audit logs & tenant isolation",
      "Priority support & onboarding",
    ],
  },
];
