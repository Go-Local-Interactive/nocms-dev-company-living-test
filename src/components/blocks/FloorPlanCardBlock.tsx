import * as React from "react";
import type { BlockProps } from "./types";
import { mediaUrl, mediaAlt } from "@/lib/payload";
import { Lexical } from "./Lexical";
import type { LexicalNode, LexicalRoot } from "./types";

/** FloorPlanCardBlock — the singular floor-plan detail spotlight on pages with
 *  slugs like `floor-plans/azalea`: the singular analog of the grid card. A
 *  large photo on one side, the plan name + spec box + descriptive prose +
 *  Schedule / Request-Pricing CTAs on the other. Re-skinned 1:1 with Plan 00
 *  tokens to match the grid card's visual language (the mockup `.fp-*` family).
 *
 *  Data-flow convention (mirrors CareLevelCardBlock):
 *    - `title` → h1 plan name (serif, page-hero scale).
 *    - `media` → main photo (left/top on mobile).
 *    - `body` (lexical) is parsed two ways:
 *      • Any top-level **list** is treated as the spec list. Each entry is
 *        rendered in a token-surfaced box styled like the grid card's
 *        `.fp-specs`/`.fp-spec`: a quantitative entry ("900 sq ft",
 *        "2 bathrooms") becomes a label-over-value stack; everything else
 *        becomes a ✓ feature row (check in text-primary).
 *      • Everything else (paragraphs, headings) renders as the descriptive
 *        prose below the heading.
 *    - CTAs are fixed: primary "Schedule a Tour" → /schedule-tour (terracotta),
 *      secondary "Request Pricing" → /request-pricing (outline).
 *
 *  Variant (`settings.variant`):
 *    - unset → media-left / text-right (the default).
 *    - "split" → reads reversed (media-right / text-left) so alternating
 *      detail sections can flip sides like the mockup feature-sections. */

function nodeToText(n: LexicalNode): string {
  const out: string[] = [];
  const walk = (x: LexicalNode) => {
    if (x.type === "text" && typeof x.text === "string") out.push(x.text);
    x.children?.forEach(walk);
  };
  walk(n);
  return out.join(" ").trim();
}

/** A spec list entry: a quantitative one splits into a label-over-value stack
 *  (mockup `.fp-spec`); anything else is a ✓ feature row. */
interface Spec {
  text: string;
  /** When set, render as a label-over-value stack instead of a feature row. */
  label?: string;
  value?: string;
}

function classifySpec(raw: string): Spec {
  const lower = raw.toLowerCase();
  // Quantitative specs: a leading number + a known unit → label-over-value.
  const num = raw.match(/^[\d.,]+\+?/);
  if (num) {
    if (/sq\s*\.?\s*ft|square\s*f/.test(lower))
      return { text: raw, label: "Square Feet", value: num[0] };
    if (/bath/.test(lower)) return { text: raw, label: "Bathrooms", value: num[0] };
    if (/bed/.test(lower)) return { text: raw, label: "Bedrooms", value: num[0] };
  }
  return { text: raw };
}

function extractSpecsAndProse(body: LexicalRoot | null | undefined): {
  specs: Spec[];
  prose: LexicalRoot | null;
} {
  if (!body?.root?.children) return { specs: [], prose: null };
  const specs: Spec[] = [];
  const proseChildren: LexicalNode[] = [];
  for (const node of body.root.children) {
    if (node.type === "list" && node.children?.length) {
      for (const li of node.children) {
        if (li.type === "listitem") specs.push(classifySpec(nodeToText(li)));
      }
    } else {
      proseChildren.push(node);
    }
  }
  const prose: LexicalRoot | null = proseChildren.length
    ? { ...body, root: { ...body.root, children: proseChildren } }
    : null;
  return { specs, prose };
}

/** In-code GO default photo for this single-image, per-page block. The mockup
 *  image is plan-specific (azalea/magnolia/…), so the seed can set a per-page
 *  `settings.image`; the renderer resolves uploaded media → `settings.image` →
 *  this representative floor-plan default so it is never blank. */
const FLOOR_PLAN_CARD_DEFAULT_IMAGE = "/golden-oaks/fp-magnolia.jpg";

export function FloorPlanCardBlock({ title, body, media, settings }: BlockProps) {
  // Uploaded media wins, then per-page `settings.image`, then the GO default.
  const photo = mediaUrl(media) || settings?.image || FLOOR_PLAN_CARD_DEFAULT_IMAGE;
  const { specs, prose } = extractSpecsAndProse(body);
  const split = settings?.variant === "split";

  const quantSpecs = specs.filter((s) => s.label);
  const featureSpecs = specs.filter((s) => !s.label);

  return (
    <section
      data-nocms-component="floor-plan-card"
      className="py-20 px-6 sm:px-10 lg:px-16 bg-background"
    >
      <div
        className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start ${
          split ? "lg:[&>div:first-child]:order-2" : ""
        }`}
      >
        <div className="relative">
          {photo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              data-payload-subfield="media"
              src={photo}
              alt={mediaAlt(media) || title || "Floor plan"}
              className="w-full aspect-[4/3] object-cover rounded-[--radius] shadow-lg"
              loading="eager" data-role="media"
            />
          ) : (
            <div
              data-payload-subfield="media"
              aria-hidden="true"
              className="w-full aspect-[4/3] rounded-[--radius] bg-gradient-to-br from-primary-light to-surface"
            />
          )}
        </div>
        <div>
          {title && (
            <h1
              data-role="heading"
              data-payload-subfield="title"
              className="font-heading text-[2.5rem] sm:text-[3.5rem] font-bold leading-[1.1] text-text tracking-tight mb-4"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              {title}
            </h1>
          )}
          {specs.length > 0 && (
            <div
              data-payload-subfield="body"
              className="mb-8 rounded-[--radius] bg-surface border border-text/5 p-6"
            >
              {quantSpecs.length > 0 && (
                <div className="flex flex-wrap gap-8">
                  {quantSpecs.map((spec, i) => (
                    <div
                      key={i}
                      data-array-index={specs.indexOf(spec)}
                      className="flex flex-col gap-1"
                    >
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
              {featureSpecs.length > 0 && (
                <ul
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
                    quantSpecs.length > 0 ? "mt-6 pt-6 border-t border-text/5" : ""
                  }`}
                >
                  {featureSpecs.map((spec, i) => (
                    <li
                      key={i}
                      data-array-index={specs.indexOf(spec)}
                      className="flex items-start gap-3 font-body text-base text-text"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 font-bold text-primary" data-role="text"
                      >
                        &#10003;
                      </span>
                      <span>{spec.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {prose && (
            <Lexical
              value={prose}
              subfield="body"
              className="font-body text-base text-muted leading-relaxed mb-8 space-y-4 [&>h2]:font-heading [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-text [&>h2]:mt-6 [&>h2]:mb-2 [&>h3]:font-heading [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-text [&>h3]:mt-4 [&>h3]:mb-2"
            />
          )}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <a
              href="/schedule-tour"
              className="inline-flex items-center justify-center bg-secondary text-white font-semibold px-8 py-4 rounded-[--radius] text-base shadow-lg hover:bg-secondary-dark hover:shadow-xl hover:-translate-y-0.5 transition-all" data-role="cta"
            >
              Schedule a Tour
            </a>
            <a
              href="/request-pricing"
              className="inline-flex items-center justify-center border-2 border-text/20 text-text hover:bg-surface font-medium px-8 py-4 rounded-[--radius] text-base transition-all" data-role="text-2"
            >
              Request Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
