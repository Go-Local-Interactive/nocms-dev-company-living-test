import { Check, ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  featured?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

interface PricingCardsProps {
  plans?: PricingPlan[];
  heading?: string;
  subtitle?: string;
}

const defaultPlans: PricingPlan[] = [
  {
    name: "Independent Living",
    price: "$2,800",
    period: "/month",
    description: "Active, maintenance-free living with full access to community amenities and social programming.",
    features: [
      "Spacious private apartment",
      "Three chef-prepared meals daily",
      "Weekly housekeeping & linen service",
      "200+ monthly activities",
      "Fitness center & pool access",
      "24-hour security & emergency response",
      "All utilities included",
    ],
    ctaText: "Schedule a Tour",
    ctaHref: "/schedule-tour",
  },
  {
    name: "Assisted Living",
    price: "$4,200",
    period: "/month",
    description: "Personalized daily support in a warm, home-like environment that honors independence.",
    features: [
      "Everything in Independent Living",
      "Personalized care plan",
      "Medication management",
      "Bathing & dressing assistance",
      "Health monitoring & assessments",
      "Physical therapy coordination",
      "Family communication portal",
    ],
    featured: true,
    ctaText: "Get Personalized Quote",
    ctaHref: "/contact",
  },
  {
    name: "Memory Care",
    price: "$5,800",
    period: "/month",
    description: "Specialized care for Alzheimer's and dementia in a secure, purposeful environment.",
    features: [
      "Everything in Assisted Living",
      "Secured neighborhood",
      "Evidence-based memory programs",
      "Trained dementia care specialists",
      "Sensory stimulation activities",
      "Family support groups",
      "Cognitive engagement therapy",
    ],
    ctaText: "Learn More",
    ctaHref: "/living-options/memory-care",
  },
];

export function PricingCards({
  plans = defaultPlans,
  heading = "Transparent, Honest Pricing",
  subtitle = "No hidden fees, no surprises. Every plan includes our full suite of amenities and services.",
}: PricingCardsProps) {
  return (
    <section className="bg-background py-16 lg:py-24" data-nocms-component="content/pricing-cards">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text mb-4" data-role="heading">
            {heading}
          </h2>
          {subtitle && <p className="text-muted text-lg max-w-2xl mx-auto" data-role="subheading">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {(plans ?? []).map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 flex flex-col transition-shadow hover:shadow-lg ${
                plan.featured
                  ? "border-primary shadow-md ring-2 ring-primary-light bg-background"
                  : "border-text/10 bg-surface"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary">
                    <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <h3 className="font-heading text-xl font-bold text-text mb-2">{plan.name}</h3>
              <p className="text-muted text-sm mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="font-heading text-4xl font-bold text-primary">{plan.price}</span>
                {plan.period && <span className="text-muted text-sm">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-text text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                href={plan.ctaHref ?? "/contact"}
                variant={plan.featured ? "primary" : "outline"}
                size="md"
                className="w-full"
              >
                {plan.ctaText ?? "Get Started"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-muted text-sm mt-10">
          Prices shown are starting rates. Actual costs depend on apartment size and care needs. Contact us for a personalized quote.
        </p>
      </div>
    </section>
  );
}
