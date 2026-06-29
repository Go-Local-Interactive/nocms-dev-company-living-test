import * as React from "react";
import type { BlockProps } from "./types";
import { mediaUrl, mediaAlt } from "@/lib/payload";
import { Lexical } from "./Lexical";
import type { LexicalNode, LexicalRoot } from "./types";

/** CareLevelCardBlock — renders a single care level as a detail "hero card"
 *  on pages like `/assisted-living` or `/memory-care`. The singular analog of
 *  `CareLevelGridBlock`: where the grid shows every level at a glance, this
 *  spotlights one with a large photo beside the name, an optional
 *  "what's included" list, descriptive prose, and the standard tour CTAs.
 *
 *  Data-flow convention (mirrors FloorPlanCardBlock):
 *    - `title` → h1 care-level name.
 *    - `media` → main photo (left/top on mobile).
 *    - `body` (lexical) is parsed two ways:
 *      • Any top-level **list** becomes the "what's included" feature list
 *        (e.g. medication management, dining, housekeeping).
 *      • Everything else (paragraphs, headings) renders as the descriptive
 *        prose below the heading.
 *    - CTAs are fixed: primary "Schedule a Tour" → /schedule-tour,
 *      secondary "Explore Living Options" → /living-options.
 *
 *  Variant (`settings.variant`):
 *    - unset → media-left / text-right (the default).
 *    - "split" → reads reversed (media-right / text-left) so alternating
 *      care-type sections can flip sides like the mockup feature-sections. */

function nodeToText(n: LexicalNode): string {
  const out: string[] = [];
  const walk = (x: LexicalNode) => {
    if (x.type === "text" && typeof x.text === "string") out.push(x.text);
    x.children?.forEach(walk);
  };
  walk(n);
  return out.join(" ").trim();
}

function extractFeaturesAndProse(body: LexicalRoot | null | undefined): {
  features: string[];
  prose: LexicalRoot | null;
} {
  if (!body?.root?.children) return { features: [], prose: null };
  const features: string[] = [];
  const proseChildren: LexicalNode[] = [];
  for (const node of body.root.children) {
    if (node.type === "list" && node.children?.length) {
      for (const li of node.children) {
        if (li.type === "listitem") features.push(nodeToText(li));
      }
    } else {
      proseChildren.push(node);
    }
  }
  const prose: LexicalRoot | null = proseChildren.length
    ? { ...body, root: { ...body.root, children: proseChildren } }
    : null;
  return { features, prose };
}

/** In-code GO default photo for this single-image, per-page block. The mockup
 *  image is page-specific (assisted/memory/respite …), so the seed can set a
 *  per-page `settings.image`; the renderer resolves uploaded media →
 *  `settings.image` → this generic care default so it is never blank. */
const CARE_CARD_DEFAULT_IMAGE = "/golden-oaks/care-health.jpg";

export function CareLevelCardBlock({ title, body, media, settings }: BlockProps) {
  // Uploaded media wins, then per-page `settings.image`, then the GO default.
  const photo = mediaUrl(media) || settings?.image || CARE_CARD_DEFAULT_IMAGE;
  const { features, prose } = extractFeaturesAndProse(body);
  const split = settings?.variant === "split";

  return (
    <section
      data-nocms-component="care-level-card"
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
              alt={mediaAlt(media) || title || "Care level"}
              className="w-full aspect-[4/3] object-cover rounded-[--radius] shadow-lg"
              loading="eager" data-role="media"
            />
          ) : (
            <div
              data-payload-subfield="media"
              aria-hidden="true"
              className="w-full aspect-[4/3] rounded-[--radius] bg-gradient-to-br from-primary/15 via-surface to-accent/20"
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
          {prose && (
            <Lexical
              value={prose}
              subfield="body"
              className="font-body text-base text-muted leading-relaxed mb-8 space-y-4 [&>h2]:font-heading [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-text [&>h2]:mt-6 [&>h2]:mb-2 [&>h3]:font-heading [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-text [&>h3]:mt-4 [&>h3]:mb-2"
            />
          )}
          {features.length > 0 && (
            <ul
              data-payload-subfield="body"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 p-5 rounded-[--radius] bg-surface border border-text/5"
            >
              {features.map((feature, i) => (
                <li
                  key={i}
                  data-array-index={i}
                  className="flex items-start gap-2 font-body text-sm text-text"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <a
              href="/schedule-tour"
              className="inline-flex items-center justify-center bg-secondary text-white font-semibold px-8 py-4 rounded-[--radius] text-base shadow-lg hover:bg-secondary-dark hover:shadow-xl hover:-translate-y-0.5 transition-all" data-role="cta"
            >
              Schedule a Tour
            </a>
            <a
              href="/living-options"
              className="inline-flex items-center justify-center border-2 border-text/20 text-text hover:bg-surface font-medium px-8 py-4 rounded-[--radius] text-base transition-all" data-role="text"
            >
              Explore Living Options
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
