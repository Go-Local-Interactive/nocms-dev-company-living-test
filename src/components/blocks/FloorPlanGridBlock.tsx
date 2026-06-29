import * as React from "react";
import type { BlockProps } from "./types";
import { mediaUrl, mediaAlt } from "@/lib/payload";
import { lexicalToText, lexicalQAPairs } from "./Lexical";

/** FloorPlanGridBlock — the rich floor-plan card grid that lives inside the
 *  `floor-plans` page (and is reused in the six detail pages' "other plans"
 *  grids). Each card mirrors the mockup `.floor-plan-card` / `.fp-*` pattern
 *  (floor-plans.html) re-skinned 1:1 with Plan 00 tokens: a 280px image well
 *  with a type badge, then the content block — serif name, a label-over-value
 *  spec row, a price line, an italic tagline, a ✓ feature checklist, and a
 *  "View details →" link to `/floor-plans/[slug]`.
 *
 *  Server-rendered: the mockup's image carousel + Compare button are Plan 06
 *  (client JS) — here the FIRST image renders statically with the hover-zoom;
 *  the Compare affordance is omitted.
 *
 *  Data-flow convention (mirrors CareLevelGridBlock — UNCHANGED across the
 *  re-skin, just feeds a richer card):
 *    - Per-card name + spec-line override via lexical body h3+paragraph pairs
 *      (h3 → card name, paragraph → spec line, e.g.
 *      "820 sq ft · 1 bed + den · 1 bath · From $3,800/mo"). The spec line is
 *      split: the "From $…" chunk → `.fp-price`, the remaining "·"-segments →
 *      `.fp-spec` rows. First pair maps to card 0.
 *    - The block's `title` is the section heading; body without h3 pairs
 *      renders as a plain intro paragraph below the heading.
 *    - `mediaArray[i]` binds the photo for card i.
 *    - The type badge, tagline, and feature checklist come from the per-index
 *      DEFAULT_FLOOR_PLANS fallbacks (no atom carries them yet — a future seed
 *      could ride them on the `items` atom; not added now to avoid scope creep).
 *
 *  Variant (`settings.variant`):
 *    - unset / "grid" → the default 2-up grid (1-col ≤768).
 *    - "featured" → a single wide card per row (media beside content, like
 *      CareLevelCardBlock) for a "featured plan" placement on detail pages.
 *    - "compact" → a dense 3-up grid with no feature checklist. */

interface FloorPlan {
  slug: string;
  name: string;
  /** The card type badge (mockup `.fp-badge`, e.g. "1 Bedroom + Den"). */
  type: string;
  /** Label-over-value spec rows for `.fp-specs` (Square Feet / Bathrooms / …). */
  specs: { label: string; value: string }[];
  /** The `.fp-price` line, e.g. "From $3,800/mo". */
  priceFrom: string;
  /** The italic `.fp-tagline` "best for …" line. */
  tagline: string;
  /** The `.fp-features` ✓ checklist. */
  features: string[];
  /** In-code GO default photo for the card's image well (`public/golden-oaks/
   *  fp-*.jpg`), used when `mediaArray[i]` carries no uploaded ref. */
  image: string;
}

const DEFAULT_FLOOR_PLANS: FloorPlan[] = [
  {
    slug: "azalea",
    name: "The Garden Studio",
    type: "Studio",
    specs: [
      { label: "Square Feet", value: "450" },
      { label: "Bathrooms", value: "1" },
    ],
    priceFrom: "From $3,200/mo",
    tagline: "Singles who want cozy efficiency",
    features: ["Kitchenette", "Walk-in closet", "Private bath with grab bars", "Emergency call system"],
    image: "/golden-oaks/fp-studio.jpg",
  },
  {
    slug: "dogwood",
    name: "The Dogwood",
    type: "1 Bedroom",
    specs: [
      { label: "Square Feet", value: "650" },
      { label: "Bathrooms", value: "1" },
    ],
    priceFrom: "From $3,800/mo",
    tagline: "Singles or couples wanting more space",
    features: ["Full kitchen", "Separate bedroom", "Walk-in closet", "Private patio/balcony"],
    image: "/golden-oaks/fp-oakwood.jpg",
  },
  {
    slug: "heritage",
    name: "The Heritage",
    type: "1 Bedroom + Den",
    specs: [
      { label: "Square Feet", value: "750" },
      { label: "Bathrooms", value: "1" },
    ],
    priceFrom: "From $4,200/mo",
    tagline: "Active individuals who want a hobby or office space",
    features: ["Full kitchenette with dishwasher", "Separate bedroom", "Versatile den/office", "Garden-level patio"],
    image: "/golden-oaks/fp-heritage.jpg",
  },
  {
    slug: "magnolia",
    name: "The Magnolia",
    type: "2 Bedroom",
    specs: [
      { label: "Square Feet", value: "900" },
      { label: "Bathrooms", value: "2" },
    ],
    priceFrom: "From $5,400/mo",
    tagline: "Couples or those wanting a guest room",
    features: ["Full kitchen with breakfast bar", "Master suite with walk-in closet", "Guest bedroom", "In-unit laundry"],
    image: "/golden-oaks/fp-magnolia.jpg",
  },
  {
    slug: "oakwood",
    name: "The Oakwood",
    type: "2 Bedroom",
    specs: [
      { label: "Square Feet", value: "950" },
      { label: "Bathrooms", value: "2" },
    ],
    priceFrom: "From $5,600/mo",
    tagline: "Couples or families who want space for overnight guests",
    features: ["Full kitchen with pantry", "Master suite with en-suite bath", "Second bedroom", "Garden views"],
    image: "/golden-oaks/fp-oakwood-2.jpg",
  },
  {
    slug: "cypress",
    name: "The Cypress",
    type: "2 Bedroom Premium",
    specs: [
      { label: "Square Feet", value: "1,100" },
      { label: "Bathrooms", value: "2" },
    ],
    priceFrom: "From $6,200/mo",
    tagline: "Those who want the finest finishes and maximum space",
    features: ["Premium kitchen with quartz counters", "Master suite with dual closets", "Dedicated laundry room", "Wrap-around corner views"],
    image: "/golden-oaks/fp-heritage-2.jpg",
  },
];

/** Split a free-text spec line into label-over-value spec rows + a price.
 *  Lines look like "820 sq ft · 1 bed + den · 1 bath · From $3,800/mo".
 *  The "From $…" segment becomes the price; every other "·"-segment becomes a
 *  spec row whose label is sniffed from the unit (sq ft → Square Feet, bath →
 *  Bathrooms, bed → Bedrooms) and whose value is the leading number. */
function splitSpecLine(line: string): { specs: { label: string; value: string }[]; price: string } {
  const parts = line.split(/\s*[·•|]\s*/).filter(Boolean);
  const priceIdx = parts.findIndex((p) => /\$/.test(p) || /^from\b/i.test(p));
  const price = priceIdx === -1 ? "" : parts[priceIdx];
  const specParts = parts.filter((_, i) => i !== priceIdx);
  const specs = specParts.map((seg) => {
    const lower = seg.toLowerCase();
    let label = "Detail";
    if (/sq\s*\.?\s*ft|square\s*f/.test(lower)) label = "Square Feet";
    else if (/bath/.test(lower)) label = "Bathrooms";
    else if (/bed/.test(lower)) label = "Bedrooms";
    // Value: prefer the leading number/measurement; else the whole segment.
    const num = seg.match(/[\d.,]+\+?/);
    const value = label === "Detail" ? seg : num ? num[0] : seg;
    return { label, value };
  });
  return { specs, price };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function FloorPlanGridBlock({ title, body, mediaArray, settings }: BlockProps) {
  const variant = settings?.variant;
  const featured = variant === "featured";
  const compact = variant === "compact";

  const overrides = lexicalQAPairs(body);
  const hasOverrides = overrides.length > 0;
  const intro = hasOverrides ? undefined : lexicalToText(body) || undefined;
  const photos = mediaArray ?? [];

  const cards: FloorPlan[] = hasOverrides
    ? overrides.map((o, i) => {
        const plan = DEFAULT_FLOOR_PLANS[i];
        const split = splitSpecLine(o.a);
        const name = o.q || plan?.name || `Floor Plan ${i + 1}`;
        const slug = o.q ? slugify(o.q) : plan?.slug || slugify(name);
        return {
          slug,
          name,
          type: plan?.type || "Floor Plan",
          specs: split.specs.length ? split.specs : plan?.specs || [],
          priceFrom: split.price || plan?.priceFrom || "",
          tagline: plan?.tagline || "",
          features: plan?.features || [],
          image: (plan ?? DEFAULT_FLOOR_PLANS[i % DEFAULT_FLOOR_PLANS.length]).image,
        };
      })
    : DEFAULT_FLOOR_PLANS;

  const gridCols = featured
    ? "grid-cols-1"
    : compact
      ? "grid-cols-1 min-[641px]:grid-cols-2 min-[1025px]:grid-cols-3"
      : "grid-cols-1 min-[769px]:grid-cols-2";
  const gridGap = compact ? "gap-6" : "gap-10";

  return (
    <section
      data-nocms-component="floor-plan-grid"
      className="py-20 px-6 sm:px-10 lg:px-16 bg-background"
    >
      <div className="max-w-7xl mx-auto">
        {(title || intro) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {title && (
              <h2
                data-role="heading"
                data-payload-subfield="title"
                className="font-heading text-4xl sm:text-5xl font-bold text-text tracking-tight"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                {title}
              </h2>
            )}
            {intro && (
              <p
                data-role="subheading"
                data-payload-subfield="body"
                className="mt-4 font-body text-lg text-muted leading-relaxed"
              >
                {intro}
              </p>
            )}
          </div>
        )}
        <div
          data-array-prop="mediaArray"
          data-payload-subfield="mediaArray"
          className={`grid ${gridCols} ${gridGap}`}
        >
          {cards.map((plan, i) => {
            const photo = photos[i];
            // Uploaded ref wins; else the in-code GO default photo for this
            // plan (`||`, not `??`, so an empty/missing ref falls through).
            const photoSrc = mediaUrl(photo) || plan.image;
            const showFeatures = !compact && plan.features.length > 0;
            return (
              <a
                key={`${plan.slug}-${i}`}
                href={`/floor-plans/${plan.slug}`}
                data-array-index={i}
                className={`group relative flex overflow-hidden rounded-[--radius] border border-text/5 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-light hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  featured
                    ? "flex-col min-[769px]:flex-row"
                    : "flex-col"
                }`}
              >
                {/* Image well — fixed 280px (full-height beside content in the
                    featured variant), gradient fallback, hover-zoom photo. */}
                <div
                  className={`relative overflow-hidden bg-gradient-to-br from-primary-light to-surface ${
                    featured
                      ? "h-[280px] min-[769px]:h-auto min-[769px]:w-2/5 min-[769px]:shrink-0"
                      : "h-[280px]"
                  }`}
                >
                  {photoSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      data-payload-subfield={`mediaArray.${i}`}
                      src={photoSrc}
                      alt={mediaAlt(photo) || `${plan.name} floor plan`}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy" data-role="media"
                    />
                  ) : (
                    <div
                      data-payload-subfield={`mediaArray.${i}`}
                      aria-hidden="true"
                      className="h-full w-full"
                    />
                  )}
                  {/* Type badge */}
                  {plan.type && (
                    <span className="absolute top-4 right-4 z-10 rounded-full bg-secondary px-4 py-2 font-body text-sm font-semibold text-white">
                      {plan.type}
                    </span>
                  )}
                </div>
                {/* Content */}
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="mb-4 font-heading text-2xl font-bold text-text" data-role="heading-2">
                    {plan.name}
                  </h3>
                  {plan.specs.length > 0 && (
                    <div className="mb-5 flex gap-6">
                      {plan.specs.map((spec, si) => (
                        <div key={si} className="flex flex-col gap-1">
                          <span className="font-body text-sm font-medium text-muted">
                            {spec.label}
                          </span>
                          <span className="font-body text-base font-semibold text-text">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {plan.priceFrom && (
                    <p className="mb-4 font-heading text-2xl font-bold text-secondary">
                      {plan.priceFrom.replace(/^from\s+/i, "Starting at ")}
                    </p>
                  )}
                  {plan.tagline && (
                    <p className="mb-6 font-body text-base italic text-muted" data-role="subheading-2">
                      {plan.tagline}
                    </p>
                  )}
                  {showFeatures && (
                    <ul className="mb-7 space-y-3 rounded-[--radius] bg-section-sage p-5">
                      {plan.features.map((feature, fi) => (
                        <li
                          key={fi}
                          className="flex items-start gap-3 font-body text-base text-text"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 font-bold text-primary" data-role="text"
                          >
                            &#10003;
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <span
                    aria-hidden="true"
                    className="mt-auto inline-flex items-center gap-1 font-body text-base font-semibold text-primary transition-all group-hover:gap-2" data-role="text-2"
                  >
                    View details
                    <span aria-hidden="true" data-role="text-3">&rarr;</span>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
