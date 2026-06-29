import * as React from "react";
import type { BlockProps } from "./types";
import type { LexicalNode } from "./types";
import { mediaUrl, mediaAlt } from "@/lib/payload";

/** ResourceCardsBlock — the Golden Oaks "Helpful Resources" section: a centered
 *  heading + optional lead paragraph over a list of alternating image/content
 *  rows (guides, articles). Default white surface.
 *
 *  Each `.resource-row` is a two-column grid (gap-12, items-center, 48px
 *  vertical padding) with a 1px bottom divider; the first row drops its top
 *  padding and the last row drops its bottom border. EVEN rows flip the image
 *  to the right on `md+` (the mockup's rtl trick, here via `order`), resetting
 *  to one stacked column (image-on-top) at ≤768px. The content side carries a
 *  `.resource-tag` overline, a left-aligned h3, a paragraph, and a left-aligned
 *  CTA button (P0 `.btn` tokens — the homepage's `.btn-resource` is a primary
 *  button-style link).
 *
 *  Data-flow convention (defaults render when the CMS is empty):
 *    - `title` = section heading; the first `body` paragraph (one not attached
 *      to a row heading) = the centered lead (`data-payload-subfield="body"`).
 *    - Each top-level h3 starts a row. The h3 may be "Tag — Title" (em-dash or
 *      " - "): the part before the dash is the `.resource-tag` overline, the
 *      rest is the title. The paragraph following the h3 is the description.
 *    - `mediaArray[i]` binds row i's photo (`data-payload-subfield`
 *      `mediaArray.${i}`).
 *  The seeder (P8) follows this same convention. */

interface ResourceRow {
  tag: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}

const DEFAULT_ROWS: ResourceRow[] = [
  {
    tag: "Free Guide",
    title: "Your Guide to Senior Living",
    description:
      "A comprehensive, easy-to-understand guide that walks you through the decision-making process, questions to ask, and how to plan for your next chapter — including tips for caregivers on looking after your own well-being along the way.",
    cta: "Download Free Guide",
    href: "/senior-living-guide",
  },
  {
    tag: "Article",
    title: "Signs It's Time for Assisted Living",
    description:
      "Wondering if now is the right time? We explore the common signs that indicate you or your loved one might benefit from professional care and support.",
    cta: "Read Article",
    href: "/blog",
  },
  {
    tag: "Article",
    title: "Making the Move: What to Expect",
    description:
      "Considering a move to senior living? We walk you through what the transition looks like, from your first visit to settling in and feeling at home.",
    cta: "Read Article",
    href: "/blog",
  },
];

const DEFAULT_LEAD =
  "Whether you're planning ahead or navigating a sudden change — a fall, a diagnosis, a moment that shifted everything — you're in the right place. These resources are here to help you move forward with confidence.";

const DEFAULT_IMAGES = [
  "/golden-oaks/resource-guide.jpg",
  "/golden-oaks/resource-signs.jpg",
  "/golden-oaks/resource-conversation.jpg",
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

/** Split an h3 like "Free Guide — Your Guide…" into tag + title. */
function splitTag(heading: string, fallbackTag: string): { tag: string; title: string } {
  const parts = heading.split(/\s+[—–]\s+| - /);
  if (parts.length >= 2) return { tag: parts[0].trim(), title: parts.slice(1).join(" - ").trim() };
  return { tag: fallbackTag, title: heading };
}

function parse(body: BlockProps["body"]): { rows: ResourceRow[]; lead?: string } {
  const children = body?.root?.children;
  if (!children?.length) return { rows: DEFAULT_ROWS, lead: DEFAULT_LEAD };

  const rows: ResourceRow[] = [];
  let current: ResourceRow | null = null;
  let lead: string | undefined;
  const flush = () => {
    if (current) rows.push(current);
    current = null;
  };

  for (const node of children) {
    if (node.type === "heading") {
      flush();
      const fallback = DEFAULT_ROWS[rows.length] ?? { tag: "Resource", title: "", description: "", cta: "Learn More", href: "#" };
      const { tag, title } = splitTag(nodeText(node), fallback.tag);
      current = { tag, title, description: "", cta: fallback.cta, href: fallback.href };
    } else if (node.type === "paragraph") {
      const text = nodeText(node);
      if (!text) continue;
      if (current && !current.description) {
        current.description = text;
      } else if (!current && !lead) {
        lead = text; // a paragraph before any row heading is the lead
      }
    }
  }
  flush();

  if (rows.length === 0) return { rows: DEFAULT_ROWS, lead: lead ?? DEFAULT_LEAD };
  return { rows, lead };
}

export function ResourceCardsBlock({ title, body, mediaArray }: BlockProps) {
  const { rows, lead } = parse(body);
  const refs = mediaArray ?? [];

  return (
    <section
      data-nocms-component="resource-cards"
      className="bg-[var(--color-background)] py-20 px-6 sm:px-10 lg:px-16"
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
        {lead && (
          <div data-payload-subfield="body" className="max-w-[680px] mx-auto mt-4">
            <p className="text-center font-body text-lg text-[var(--color-neutral-700)] leading-relaxed" data-role="subheading">
              {lead}
            </p>
          </div>
        )}

        <div data-array-prop="mediaArray" data-payload-subfield="mediaArray" className="mt-12">
          {rows.map((row, i) => {
            const ref = refs[i];
            // Uploaded ref wins; else the in-code GO default photo for row i
            // (`||`, not `??`, so an empty/missing ref falls through; cycles
            // past the 3 defaults).
            const src = mediaUrl(ref) || DEFAULT_IMAGES[i % DEFAULT_IMAGES.length];
            const alt = mediaAlt(ref) || row.title;
            const flip = i % 2 === 1;
            return (
              <div
                key={`${row.title}-${i}`}
                data-array-index={i}
                className="group grid grid-cols-1 min-[769px]:grid-cols-2 gap-6 min-[769px]:gap-12 items-center py-12 first:pt-0 last:pb-0 border-b border-[var(--color-neutral-300)] last:border-b-0"
              >
                {/* Image side. Source order is image-first (stacks on top
                    ≤768px); even rows move it to column 2 on md+ via `order`. */}
                <div className={`flex justify-center ${flip ? "min-[769px]:order-2" : "min-[769px]:order-1"}`}>
                  <div className="w-full rounded-[var(--radius)] overflow-hidden aspect-[4/3] transition-transform duration-[400ms] group-hover:scale-[1.02]">
                    {src ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        data-payload-subfield={`mediaArray.${i}`}
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy" data-role="media"
                      />
                    ) : (
                      <div
                        data-payload-subfield={`mediaArray.${i}`}
                        aria-hidden="true"
                        className="w-full h-full bg-gradient-to-br from-[var(--color-primary-light)] via-[var(--color-surface)] to-[var(--color-accent-light)]"
                      />
                    )}
                  </div>
                </div>

                {/* Content side. */}
                <div className={`flex flex-col justify-center ${flip ? "min-[769px]:order-1" : "min-[769px]:order-2"}`}>
                  <span className="inline-block font-body text-base font-semibold uppercase tracking-[1.5px] text-[var(--color-overline)] mb-3">
                    {row.tag}
                  </span>
                  <h3 className="font-heading text-[22px] font-bold text-[var(--color-neutral-900)] text-left mb-3 leading-snug" data-role="heading-2">
                    {row.title}
                  </h3>
                  <p className="font-body text-base text-[var(--color-neutral-700)] leading-relaxed mb-5" data-role="subheading-2">
                    {row.description}
                  </p>
                  <a href={row.href} className="btn btn-primary self-start" data-role="cta">
                    {row.cta}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
