import * as React from "react";
import type { BlockProps } from "./types";
import type { LexicalNode } from "./types";

/** PricingCardsBlock — the Golden Oaks "Honest Pricing" tier grid, rendered on
 *  the required cream band (`.section-cream`). An auto-fit grid of tier cards
 *  collapses to a single centered column at ≤768px. Each card has a
 *  center-growing top accent bar on hover whose color cycles primary →
 *  secondary → accent, a `.pricing-tag` pill on the featured tier, a
 *  `.pricing-amount` with a muted `/month` period, a checkmark feature list,
 *  and a full-width primary CTA. Below the grid: an italic disclaimer and a
 *  centered secondary CTA. An optional intro paragraph sits under the heading.
 *
 *  Variant: the FEATURED tier ("Most Popular") is white-surfaced, primary
 *  bordered, and scaled 1.03. It is selected per-tier (not a second block):
 *    - canonical: a tier's price paragraph carries a `★` marker or the word
 *      "featured" / "most popular" (case-insensitive);
 *    - fallback: block-level `settings.variant === "featured"` forces the
 *      middle tier featured (matches the homepage default).
 *
 *  Data-flow convention (lexical `body` overrides the in-code GO defaults):
 *    - The block `title` is the section heading (`data-payload-subfield="title"`).
 *    - Inside `body`, each TIER = an h3 (tier name) + a paragraph (the price,
 *      shaped `$3,200 /month`; append `★` to mark it featured) + a check `list`
 *      (the feature bullets). Tiers map left→right.
 *    - Non-tier paragraphs (no following list, not a price line): the FIRST is
 *      the intro under the heading; an ITALIC one (or the last) is the
 *      disclaimer below the grid.
 *  The seeder (P8) follows this same convention. */

interface PricingTier {
  name: string;
  /** numeric/currency portion, e.g. "$3,200" */
  amount: string;
  /** trailing period, e.g. "/month" */
  period: string;
  features: string[];
  featured: boolean;
  cta: string;
  href: string;
}

const DEFAULT_TIERS: PricingTier[] = [
  {
    name: "Independent Living",
    amount: "$3,200",
    period: "/month",
    features: [
      "Spacious 1 & 2-bedroom apartments",
      "Utilities included (electricity, water, internet)",
      "Maintenance-free living",
      "Access to fitness center and programs",
    ],
    featured: false,
    cta: "Request Detailed Pricing",
    href: "/request-pricing",
  },
  {
    name: "Assisted Living",
    amount: "$4,500",
    period: "/month",
    features: [
      "Private room with personal care",
      "Medication management & monitoring",
      "Assistance with ADLs (bathing, dressing)",
      "Three nutritious meals daily",
    ],
    featured: true,
    cta: "Request Detailed Pricing",
    href: "/request-pricing",
  },
  {
    name: "Memory Care",
    amount: "$5,800",
    period: "/month",
    features: [
      "Specialized dementia care environment",
      "Trained memory care staff (enhanced ratio)",
      "Secure, therapeutic activity program",
      "Behavioral health support & monitoring",
    ],
    featured: false,
    cta: "Request Detailed Pricing",
    href: "/request-pricing",
  },
];

const DEFAULT_INTRO =
  "We believe you deserve to know what care costs upfront. No hidden fees, no surprises. Below is a starting point — every family's situation is unique, and we'll work with you to find the right plan.";
const DEFAULT_DISCLAIMER =
  "Every family is unique. Pricing varies based on apartment size, care level, and individual needs. We're committed to walking you through every option — no pressure, just honest conversations about what works for your family.";
const DEFAULT_CTA = "Get Your Personalized Quote";
const DEFAULT_CTA_HREF = "/request-pricing";
const FEATURED_TAG = "Most Popular";

/* DOCUMENTED LITERAL EXCEPTION (per the plan's cross-cutting requirement #1):
   the checkmark feature-disc fill is a CSS `url()` data-URI on a ::before
   pseudo-element, which cannot read a CSS custom property — so the forest-green
   stroke (`%234D654C` = --color-primary) is the one allowed hardcoded hex in
   this file. The disc background uses the --color-primary-light token. */
const CHECK_DISC_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234D654C' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E\")";

const PRICE_RE = /\$[\d,.]+/;
const FEATURED_RE = /★|\bfeatured\b|\bmost popular\b/i;

function nodeText(n: LexicalNode | undefined): string {
  if (!n) return "";
  const out: string[] = [];
  const walk = (x: LexicalNode) => {
    if (x.type === "text" && typeof x.text === "string") out.push(x.text);
    x.children?.forEach(walk);
  };
  walk(n);
  return out.join(" ").trim();
}

function listItems(n: LexicalNode): string[] {
  if (n.type !== "list" || !n.children) return [];
  return n.children
    .filter((c) => c.type === "listitem")
    .map((c) => nodeText(c))
    .filter(Boolean);
}

function isItalicParagraph(n: LexicalNode): boolean {
  const FORMAT_ITALIC = 1 << 1;
  const child = n.children?.find((c) => c.type === "text");
  return Boolean(child && typeof child.format === "number" && child.format & FORMAT_ITALIC);
}

/** Fold the lexical body into tiers + intro/disclaimer per the documented
 *  convention. An h3 starts a tier; the following price paragraph + check list
 *  fill it. Stray paragraphs become intro / disclaimer copy. */
function parseBody(
  body: BlockProps["body"],
  forceMiddleFeatured: boolean,
): { tiers: PricingTier[]; intro?: string; disclaimer?: string } {
  const children = body?.root?.children;
  if (!children?.length) {
    const tiers = DEFAULT_TIERS.map((t, i) => ({
      ...t,
      featured: forceMiddleFeatured ? i === 1 : t.featured,
    }));
    return { tiers, intro: DEFAULT_INTRO, disclaimer: DEFAULT_DISCLAIMER };
  }

  const tiers: PricingTier[] = [];
  const looseParas: { text: string; italic: boolean }[] = [];
  let current: PricingTier | null = null;

  const flush = () => {
    if (current) tiers.push(current);
    current = null;
  };

  for (const node of children) {
    if (node.type === "heading") {
      flush();
      current = {
        name: nodeText(node),
        amount: "",
        period: "",
        features: [],
        featured: false,
        cta: DEFAULT_TIERS[tiers.length]?.cta ?? "Request Detailed Pricing",
        href: DEFAULT_TIERS[tiers.length]?.href ?? "/request-pricing",
      };
    } else if (node.type === "paragraph") {
      const text = nodeText(node);
      if (!text) continue;
      if (current && !current.amount && PRICE_RE.test(text)) {
        const priceMatch = text.match(PRICE_RE);
        const amount = priceMatch ? priceMatch[0] : text;
        const rest = text.slice((priceMatch?.index ?? 0) + amount.length).replace(FEATURED_RE, "").trim();
        current.amount = amount;
        current.period = rest || "/month";
        if (FEATURED_RE.test(text)) current.featured = true;
      } else {
        looseParas.push({ text, italic: isItalicParagraph(node) });
      }
    } else if (node.type === "list" && current) {
      current.features.push(...listItems(node));
    }
  }
  flush();

  if (tiers.length === 0) {
    const fallback = DEFAULT_TIERS.map((t, i) => ({
      ...t,
      featured: forceMiddleFeatured ? i === 1 : t.featured,
    }));
    return {
      tiers: fallback,
      intro: looseParas[0]?.text ?? DEFAULT_INTRO,
      disclaimer: looseParas.find((p) => p.italic)?.text ?? looseParas[looseParas.length - 1]?.text ?? DEFAULT_DISCLAIMER,
    };
  }

  // Backfill amounts/features from defaults so a sparse body still renders well.
  tiers.forEach((t, i) => {
    const d = DEFAULT_TIERS[i];
    if (!t.amount) t.amount = d?.amount ?? "";
    if (!t.period) t.period = d?.period ?? "/month";
    if (t.features.length === 0 && d) t.features = d.features;
  });
  if (forceMiddleFeatured && !tiers.some((t) => t.featured) && tiers[1]) {
    tiers[1].featured = true;
  }

  const intro = looseParas.find((p) => !p.italic)?.text;
  const disclaimer = looseParas.find((p) => p.italic)?.text ?? (looseParas.length > 1 ? looseParas[looseParas.length - 1].text : undefined);
  return { tiers, intro, disclaimer };
}

// Per-card top accent bar + price color cycle (primary → secondary → accent),
// all via P0 tokens. Index modulo 3 so a 4th+ tier wraps cleanly.
const ACCENT_BARS = ["bg-[var(--color-primary)]", "bg-[var(--color-secondary)]", "bg-[var(--color-accent)]"];
const PRICE_COLORS = [
  "text-[var(--color-primary-dark)]",
  "text-[var(--color-secondary-dark)]",
  "text-[var(--color-warm-brown)]",
];

export function PricingCardsBlock({ title, body, settings }: BlockProps) {
  const forceMiddleFeatured = settings?.variant === "featured";
  const { tiers, intro, disclaimer } = parseBody(body, forceMiddleFeatured);

  return (
    <section
      data-nocms-component="pricing-cards"
      className="bg-[var(--color-section-cream)] py-20 px-6 sm:px-10 lg:px-16"
    >
      <div className="max-w-[1200px] mx-auto">
        {title && (
          <h2
            data-role="heading"
            data-payload-subfield="title"
            className="text-center font-heading text-4xl sm:text-[2.5rem] font-bold text-[var(--color-neutral-900)] leading-tight"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h2>
        )}
        {intro && (
          <div data-payload-subfield="body" className="mt-6 max-w-[680px] mx-auto">
            <p
              data-role="subheading"
              className="text-center font-body text-lg text-[var(--color-neutral-700)] leading-relaxed"
            >
              {intro}
            </p>
          </div>
        )}

        <div
          data-payload-subfield="body"
          className="mt-16 mb-14 grid gap-10 items-start mx-auto max-w-[480px] md:max-w-none"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))" }}
        >
          {tiers.map((tier, i) => {
            const accent = ACCENT_BARS[i % ACCENT_BARS.length];
            const priceColor = tier.featured
              ? "text-[var(--color-neutral-900)]"
              : PRICE_COLORS[i % PRICE_COLORS.length];
            return (
              <div
                key={`${tier.name}-${i}`}
                data-array-index={i}
                className={`group relative block overflow-hidden p-10 rounded-[var(--radius)] transition-[transform,box-shadow] duration-[350ms] hover:-translate-y-1 ${
                  tier.featured
                    ? "bg-[var(--color-white)] border border-[var(--color-primary)] scale-[1.03] hover:scale-[1.03] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
                    : "bg-[var(--color-linen)] border border-[var(--color-neutral-300)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
                }`}
              >
                {/* Center-growing top accent bar on hover (color cycles per card). */}
                <span
                  aria-hidden="true"
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-1 w-0 ${accent} transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full`}
                />
                {tier.featured && (
                  <span className="inline-flex items-center gap-1 mb-6 px-4 py-1.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] font-body text-base font-semibold tracking-wide">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true" className="-mt-px">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {FEATURED_TAG}
                  </span>
                )}
                <h3 className="font-heading text-[1.75rem] font-bold text-[var(--color-neutral-900)] mb-5 leading-tight" data-role="heading-2">
                  {tier.name}
                </h3>
                <div
                  className={`font-heading text-[28px] font-bold ${priceColor} mb-7 pb-5 border-b border-[color-mix(in_srgb,var(--color-text)_11%,white)]`}
                >
                  {tier.amount}{" "}
                  <span className="font-body text-base font-normal text-[var(--color-neutral-500)]">
                    {tier.period}
                  </span>
                </div>
                <ul className="list-none mb-8">
                  {tier.features.map((feature, fi) => (
                    <li
                      key={fi}
                      className="flex items-center gap-3 py-2.5 font-body text-base text-[var(--color-neutral-700)] border-b border-[color-mix(in_srgb,var(--color-text)_11%,white)] last:border-b-0"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block w-5 h-5 min-w-5 rounded-full bg-[var(--color-primary-light)] bg-no-repeat bg-center"
                        style={{ backgroundImage: CHECK_DISC_DATA_URI, backgroundSize: "12px" }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href={tier.href} className="btn btn-primary w-full" data-role="cta">
                  {tier.cta}
                </a>
              </div>
            );
          })}
        </div>

        {disclaimer && (
          <p className="max-w-[680px] mx-auto mb-10 text-center font-body text-base italic text-[var(--color-neutral-500)] leading-relaxed" data-role="subheading-2">
            {disclaimer}
          </p>
        )}
        <div className="text-center">
          <a href={DEFAULT_CTA_HREF} className="btn btn-secondary" data-role="cta-2">
            {DEFAULT_CTA}
          </a>
        </div>
      </div>
    </section>
  );
}
