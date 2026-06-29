import * as React from "react";
import type { BlockProps } from "./types";
import { mediaUrl, mediaAlt } from "@/lib/payload";
import { lexicalToText, lexicalQAPairs } from "./Lexical";

/** CareLevelGridBlock — the visual centerpiece of every senior-living home /
 *  living-options page. A row of full-bleed overlay cards (Independent /
 *  Assisted / Memory / Respite): a photo fills the card, a bottom-anchored
 *  gradient darkens it for legibility, and the content (overline tag, serif
 *  title, description, "Learn more" pill) sits at the bottom. Two accent bars
 *  (top + bottom) grow from center to full width on hover/focus, cycling color
 *  per card. This is the mockup `.care-cards` / `.care-card` pattern
 *  (living-options) re-skinned 1:1 with Plan 00 tokens.
 *
 *  Data-flow convention (v1 — UNCHANGED across the re-skin):
 *    - Per-card titles + descriptions default to the four standard care
 *      levels below. The block's lexical body can override them by emitting
 *      heading/paragraph pairs (h3 → card title, paragraph → description) —
 *      same shape `FaqBlock` consumes. First pair maps to card 0, etc.
 *    - The block's `title` is the section heading; if the body contains no
 *      h3 pairs it renders as a normal intro paragraph below the heading.
 *    - `mediaArray[i]` binds the photo for card i. Photos are optional;
 *      cards without a photo still render (a neutral token gradient stands in).
 *
 *  Variant (`settings.variant`):
 *    - unset / "overlay" → the GO overlay card (fixed 480px on lg, 380px below).
 *    - "compact" → the homepage placement: shorter, no fixed 480px height.
 *    - "grid" → reserved for a future light-card layout; currently falls
 *      through to the overlay look (declared in the enum so seeded docs load).
 *
 *  The seeder (P8) and the agent's content tools should follow this same
 *  convention. */

interface CareLevel {
  title: string;
  /** Uppercase overline tag shown above the title (mockup `.care-card-tag`). */
  tag: string;
  description: string;
  href: string;
  /** In-code GO default photo for this card's slot (`public/golden-oaks/…`),
   *  used when `mediaArray[i]` carries no uploaded ref. */
  image: string;
}

const DEFAULT_CARE_LEVELS: CareLevel[] = [
  {
    title: "Independent Living",
    tag: "Active Lifestyle",
    description: "Maintenance-free residences with concierge amenities, social calendars, and the freedom to spend your days as you choose.",
    href: "/independent-living",
    image: "/golden-oaks/independent-living.jpg",
  },
  {
    title: "Assisted Living",
    tag: "Daily Support",
    description: "Personalized daily-living support — medication management, grooming, dining — delivered with dignity by familiar faces.",
    href: "/assisted-living",
    image: "/golden-oaks/assisted-living.jpg",
  },
  {
    title: "Memory Care",
    tag: "Specialized Care",
    description: "A secure, calm neighborhood with specialized programming for residents living with Alzheimer's and other dementias.",
    href: "/memory-care",
    image: "/golden-oaks/memory-care.jpg",
  },
  {
    title: "Respite Care",
    tag: "Short-Term Stays",
    description: "Short-term stays for recovery, travel, or a caregiver break — full access to community life, no long-term commitment.",
    href: "/respite-care",
    image: "/golden-oaks/care-health.jpg",
  },
];

/** Per-card accent cycle (mockup `.care-card:nth-child(n)` rules), token-driven
 *  so the `--color-primary` flip re-themes the whole set. Index → accent. */
const ACCENT_BAR = ["bg-primary", "bg-secondary", "bg-accent"] as const;
const TAG_COLOR = ["text-primary-light", "text-secondary-light", "text-accent-light"] as const;

export function CareLevelGridBlock({ title, body, mediaArray, settings }: BlockProps) {
  const variant = settings?.variant;
  const compact = variant === "compact";

  const overrides = lexicalQAPairs(body);
  const hasOverrides = overrides.length > 0;
  const intro = hasOverrides ? undefined : lexicalToText(body) || undefined;
  const photos = mediaArray ?? [];

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const cards = hasOverrides
    ? overrides.map((o, i) => {
        const cardTitle = o.q || DEFAULT_CARE_LEVELS[i]?.title || "Care Level";
        return {
          title: cardTitle,
          tag: DEFAULT_CARE_LEVELS[i]?.tag || "Living Option",
          description: o.a || DEFAULT_CARE_LEVELS[i]?.description || "",
          href: DEFAULT_CARE_LEVELS[i]?.href || `/${slugify(cardTitle)}`,
          image: DEFAULT_CARE_LEVELS[i % DEFAULT_CARE_LEVELS.length].image,
        };
      })
    : DEFAULT_CARE_LEVELS.map((care, i) => {
        const o = overrides[i];
        return {
          title: o?.q || care.title,
          tag: care.tag,
          description: o?.a || care.description,
          href: care.href,
          image: care.image,
        };
      });

  /* Card height: GO default 480px >=1025 / 380px <=1024 (mockup `.care-card`
     + the @768 override). Compact drops the fixed height for tighter homepage
     placement. */
  const cardHeight = compact
    ? "h-auto min-h-[340px]"
    : "h-[380px] min-[1025px]:h-[480px]";

  return (
    <section
      data-nocms-component="care-level-grid"
      className="py-20 px-6 sm:px-10 lg:px-16 bg-surface"
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
          className="grid grid-cols-1 min-[769px]:grid-cols-2 min-[1025px]:grid-cols-3 gap-6 mt-12"
        >
          {cards.map((care, i) => {
            const photo = photos[i];
            // Uploaded ref wins; else the in-code GO default photo for this slot.
            // `||` (not `??`) so an empty/missing ref falls through to the default.
            const photoSrc = mediaUrl(photo) || care.image;
            const accent = ACCENT_BAR[i % ACCENT_BAR.length];
            const tagColor = TAG_COLOR[i % TAG_COLOR.length];
            return (
              <a
                key={care.title}
                href={care.href}
                data-array-index={i}
                className={`group relative block overflow-hidden rounded-[--radius] ${cardHeight} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
              >
                {/* Top accent bar — grows center-out on hover/focus */}
                <span
                  aria-hidden="true"
                  className={`absolute top-0 left-1/2 z-20 -translate-x-1/2 h-1.5 w-0 ${accent} transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full group-focus-within:w-full`}
                />
                {/* Photo (or token gradient fallback), zooms on hover */}
                {photoSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    data-payload-subfield={`mediaArray.${i}`}
                    src={photoSrc}
                    alt={mediaAlt(photo) || care.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy" data-role="media"
                  />
                ) : (
                  <div
                    data-payload-subfield={`mediaArray.${i}`}
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary/30 via-surface to-accent/30 transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
                {/* Bottom-anchored legibility gradient (mockup rgba green/brown
                    stops → primary-dark/text tokens at opacity) */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-text/55 to-transparent"
                />
                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-8 text-white">
                  <span
                    className={`mb-3 inline-block font-body text-base font-semibold uppercase tracking-[0.094em] ${tagColor}`}
                  >
                    {care.tag}
                  </span>
                  <h3 className="mb-3 font-heading text-[26px] font-bold leading-tight text-white" data-role="heading-2">
                    {care.title}
                  </h3>
                  <p className="mb-5 font-body text-base leading-relaxed text-white/85" data-role="subheading-2">
                    {care.description}
                  </p>
                  <span
                    aria-hidden="true"
                    className="inline-flex translate-y-3 items-center gap-2 rounded-[--radius] border-2 border-sand bg-sand px-6 py-2.5 font-body text-base font-semibold text-primary-dark opacity-0 transition-all duration-[350ms] ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(max-width:768px)]:translate-y-0 [@media(max-width:768px)]:opacity-100" data-role="text"
                  >
                    Learn more
                    <span aria-hidden="true" data-role="text-2">&rarr;</span>
                  </span>
                </div>
                {/* Bottom accent bar — grows center-out on hover/focus */}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-1/2 z-20 -translate-x-1/2 h-1.5 w-0 ${accent} transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full group-focus-within:w-full`}
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
