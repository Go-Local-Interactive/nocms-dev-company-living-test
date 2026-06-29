import * as React from "react";
import type { BlockProps } from "./types";
import type { LexicalNode } from "./types";
import { mediaUrl, mediaAlt } from "@/lib/payload";

/** FeatureSectionsBlock — the Golden Oaks alternating image/text storytelling
 *  primitive (the amenities/feature rows). Each row is a two-column grid (image
 *  + content); EVEN rows flip the image to the right via a `direction:rtl`
 *  trick on `md+`, and the whole thing resets to one stacked column
 *  (image-on-top) at ≤768px. Rows after the first carry a 1px top divider.
 *
 *  Content side: a 56px icon badge (primary-light bg, primary-stroke SVG), an
 *  `.fs-label` overline, an h3, a lead paragraph, a check-highlights list
 *  (round primary discs), and an arrow link whose gap grows on hover.
 *
 *  Variant: `settings.variant === "dark"` renders the rich-brown band — accent
 *  labels/checks/icons, white headings, translucent-white body — via tokens.
 *  One block, not two.
 *
 *  Data-flow convention (lexical `body` overrides the in-code GO defaults):
 *    - Each top-level h3 starts a row. The h3 text may be "Label — Title"
 *      (em-dash or " - "): the part before the dash is the `.fs-label`
 *      overline, the rest is the heading. With no dash, the default label for
 *      that slot is used.
 *    - The paragraph following an h3 is the row's lead description; a `list`
 *      following it is the check-highlights.
 *    - `mediaArray[i]` binds row i's photo (`data-payload-subfield`
 *      `mediaArray.${i}`). Photos optional (neutral gradient fallback).
 *  The seeder (P8) follows this same convention. */

interface FeatureRow {
  label: string;
  title: string;
  description: string;
  highlights: string[];
  link?: { text: string; href: string };
  icon: React.ReactNode;
}

// Token-stroked icon set (stroke:currentColor so the badge color drives it).
const ICONS: React.ReactNode[] = [
  // dining
  <>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </>,
  // wellness (leaf/heart)
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  // social (people)
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
  // living spaces (home)
  <>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </>,
  // safety (shield)
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  // transportation (truck)
  <>
    <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </>,
];

/** In-code GO default photos for the feature rows (`public/golden-oaks/…`),
 *  mapped from the mockup "Why People Choose Golden Oaks" section (home/care/
 *  family/pricing). Bound per row index when `mediaArray[i]` has no uploaded
 *  ref; cycles for rows beyond the 4th. */
const DEFAULT_IMAGES = [
  "/golden-oaks/why-home.jpg",
  "/golden-oaks/why-care.jpg",
  "/golden-oaks/why-family.jpg",
  "/golden-oaks/why-pricing.jpg",
];

const DEFAULT_ROWS: Omit<FeatureRow, "icon">[] = [
  {
    label: "Dining",
    title: "Chef-Prepared Dining",
    description:
      "Three restaurant-quality meals served daily, plus an all-day bistro and private dining options for family gatherings.",
    highlights: [
      "Farm-to-table seasonal menus",
      "Accommodations for dietary needs and allergies",
      "Casual bistro open throughout the day",
      "Private dining room for celebrations",
    ],
    link: { text: "View Sample Menus", href: "#" },
  },
  {
    label: "Wellness",
    title: "Wellness & Fitness Center",
    description:
      "A full-service wellness center with heated indoor pool, fitness equipment, group classes, and dedicated wellness staff.",
    highlights: [
      "Heated indoor pool and spa",
      "Personal training available",
      "Group classes: yoga, tai chi, water aerobics",
      "Walking trails through landscaped grounds",
    ],
    link: { text: "See Wellness Programs", href: "#" },
  },
  {
    label: "Social",
    title: "Social & Cultural Programs",
    description:
      "Over 50 monthly activities and events designed to keep you connected, creative, and engaged with your community.",
    highlights: [
      "Art studios, music rooms, and a library",
      "Live entertainment and lecture series",
      "Book clubs, game nights, and happy hours",
      "Off-campus outings and day trips",
    ],
    link: { text: "View Activities Calendar", href: "#" },
  },
];

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

/** Split an h3 like "Dining — Chef-Prepared Dining" into label + title. */
function splitLabel(heading: string, fallbackLabel: string): { label: string; title: string } {
  const m = heading.split(/\s+[—–]\s+| - /);
  if (m.length >= 2) return { label: m[0].trim(), title: m.slice(1).join(" - ").trim() };
  return { label: fallbackLabel, title: heading };
}

function parseRows(body: BlockProps["body"]): Omit<FeatureRow, "icon">[] {
  const children = body?.root?.children;
  if (!children?.length) return DEFAULT_ROWS;

  const rows: Omit<FeatureRow, "icon">[] = [];
  let current: Omit<FeatureRow, "icon"> | null = null;
  const flush = () => {
    if (current) rows.push(current);
    current = null;
  };

  for (const node of children) {
    if (node.type === "heading") {
      flush();
      const fallback = DEFAULT_ROWS[rows.length] ?? { label: "Feature", title: "", description: "", highlights: [] };
      const { label, title } = splitLabel(nodeText(node), fallback.label);
      current = { label, title, description: "", highlights: [] };
    } else if (node.type === "paragraph" && current) {
      const text = nodeText(node);
      if (text && !current.description) current.description = text;
    } else if (node.type === "list" && current) {
      current.highlights.push(...listItems(node));
    }
  }
  flush();
  return rows.length ? rows : DEFAULT_ROWS;
}

const ARROW = (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round] transition-transform duration-200 group-hover/link:translate-x-0.5">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export function FeatureSectionsBlock({ title, body, mediaArray, settings }: BlockProps) {
  const dark = settings?.variant === "dark";
  const rows = parseRows(body);
  const photos = mediaArray ?? [];

  // Mockup .fs-label is secondary-dark (terracotta) in the default variant and
  // accent (gold) in the dark variant — both via tokens.
  const labelColor = dark ? "text-[var(--color-accent)]" : "text-[var(--color-secondary-dark)]";
  const headingColor = dark ? "text-[var(--color-white)]" : "text-[var(--color-neutral-900)]";
  const bodyColor = dark ? "text-[color-mix(in_srgb,var(--color-white)_80%,transparent)]" : "text-[var(--color-neutral-700)]";
  const iconBadge = dark ? "bg-[color-mix(in_srgb,var(--color-white)_12%,transparent)]" : "bg-[var(--color-primary-light)]";
  const iconStroke = dark ? "stroke-[var(--color-accent)]" : "stroke-[var(--color-primary)]";
  const checkDisc = dark ? "bg-[var(--color-accent)]" : "bg-[var(--color-primary)]";
  const linkColor = dark ? "text-[var(--color-sand)] hover:text-[var(--color-white)]" : "text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]";
  const dividerColor = dark
    ? "border-[color-mix(in_srgb,var(--color-white)_12%,transparent)]"
    : "border-[color-mix(in_srgb,var(--color-text)_11%,white)]";

  return (
    <section
      data-nocms-component="feature-sections"
      className={`px-6 sm:px-10 lg:px-16 ${dark ? "bg-[var(--color-section-brown)]" : ""}`}
    >
      <div className="max-w-[1200px] mx-auto">
        {title && (
          <h2
            data-role="heading"
            data-payload-subfield="title"
            className={`text-center font-heading text-4xl sm:text-[2.5rem] font-bold leading-tight pt-20 ${headingColor}`}
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h2>
        )}
        <div data-array-prop="mediaArray" data-payload-subfield="mediaArray">
          {rows.map((row, i) => {
            const photo = photos[i];
            // Uploaded ref wins; else the in-code GO default photo for row i
            // (`||`, not `??`, so an empty/missing ref falls through).
            const photoSrc = mediaUrl(photo) || DEFAULT_IMAGES[i % DEFAULT_IMAGES.length];
            const flip = i % 2 === 1;
            return (
              <div
                key={`${row.title}-${i}`}
                data-array-index={i}
                className={`grid grid-cols-1 min-[769px]:grid-cols-2 gap-7 min-[769px]:gap-16 items-center py-12 min-[769px]:py-20 ${
                  i > 0 ? `border-t ${dividerColor}` : ""
                }`}
              >
                {/* Image side. Source order is image-first so the ≤768px stack
                    puts the image on top; on md+, even (flipped) rows move the
                    image to column 2 via `order` (the mockup's rtl flip). */}
                <div
                  className={`group/img rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow-md)] ${
                    flip ? "min-[769px]:order-2" : "min-[769px]:order-1"
                  }`}
                >
                  {photoSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      data-payload-subfield={`mediaArray.${i}`}
                      src={photoSrc}
                      alt={mediaAlt(photo) || row.title}
                      className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover/img:scale-[1.04]"
                      loading="lazy" data-role="media"
                    />
                  ) : (
                    <div
                      data-payload-subfield={`mediaArray.${i}`}
                      aria-hidden="true"
                      className="w-full aspect-[4/3] bg-gradient-to-br from-[var(--color-primary-light)] via-[var(--color-surface)] to-[var(--color-accent-light)]"
                    />
                  )}
                </div>

                {/* Content side. */}
                <div
                  className={`flex flex-col justify-center ${flip ? "min-[769px]:order-1" : "min-[769px]:order-2"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex items-center justify-center w-14 h-14 rounded-[14px] mb-5 ${iconBadge}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-7 h-7 fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round] ${iconStroke}`}
                    >
                      {ICONS[i % ICONS.length]}
                    </svg>
                  </span>
                  <span className={`font-body text-base font-semibold uppercase tracking-[0.06em] mb-2 ${labelColor}`}>
                    {row.label}
                  </span>
                  <h3 className={`font-heading text-[1.75rem] font-bold leading-[1.25] mb-4 ${headingColor}`} data-role="heading-2">
                    {row.title}
                  </h3>
                  <p className={`font-body text-lg leading-relaxed mb-6 ${bodyColor}`}>{row.description}</p>
                  {row.highlights.length > 0 && (
                    <ul className="list-none p-0 mb-7 flex flex-col gap-3">
                      {row.highlights.map((h, hi) => (
                        <li key={hi} className={`flex items-start gap-2.5 font-body text-base leading-snug ${bodyColor}`}>
                          <span
                            aria-hidden="true"
                            className={`inline-flex items-center justify-center w-[22px] h-[22px] min-w-[22px] mt-px rounded-full ${checkDisc}`}
                          >
                            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-[var(--color-white)] stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                  {row.link && (
                    <a
                      href={row.link.href}
                      className={`group/link inline-flex items-center gap-2 font-body text-base font-semibold min-h-[44px] py-2.5 transition-[gap,color] duration-200 hover:gap-3 ${linkColor}`}
                    >
                      {row.link.text}
                      {ARROW}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
