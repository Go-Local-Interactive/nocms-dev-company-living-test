import * as React from "react";
import type { BlockProps } from "./types";
import type { LexicalNode } from "./types";
import { mediaUrl, mediaAlt } from "@/lib/payload";

/** LifestyleCardsBlock — the Golden Oaks sage "lifestyle" section. A centered
 *  heading + lead paragraph over a grid of portrait photo cards with gradient
 *  caption overlays, then a CTA row. Renders on `.section-sage`.
 *
 *  Two layouts on ONE block, via `settings.variant`:
 *    - default `"cards"` (the isolated lifestyle-cards mockup): a 4-up portrait
 *      grid (→2 ≤900px →1 ≤480px), `aspect-[4/5]` (16/10 ≤480px), captions
 *      always visible, and a centered primary+secondary buttons row (stacking
 *      full-width ≤480px).
 *    - `"photo-grid"` (the homepage "A Day in the Life" block): a 6-up masonry
 *      grid (card 1 spans 2×2, card 4 spans two columns; →2 cols ≤1024px),
 *      captions revealed on hover, and a `.life-links` arrow-link row.
 *
 *  Caption gradients are derived from the dark tokens via `color-mix(...,
 *  transparent)` (NOT a raw rgba) so the re-skin flip re-themes them.
 *
 *  Data-flow convention (defaults render when the CMS is empty):
 *    - `title` = section heading; `body` lead paragraph = the centered
 *      intro (`data-payload-subfield="body"`).
 *    - `mediaArray[i]` binds card i's photo (`data-payload-subfield`
 *      `mediaArray.${i}`); the caption comes from the media `alt`, else a
 *      documented default caption for that slot.
 *  The seeder (P8) follows this same convention. */

interface LifeCard {
  src?: string;
  caption: string;
  alt: string;
}

const DEFAULT_CARDS: LifeCard[] = [
  { src: "/golden-oaks/life-dining.jpg", caption: "Chef-prepared meals, shared daily", alt: "Residents enjoying a shared meal in the Golden Oaks dining room" },
  { src: "/golden-oaks/life-gardens.jpg", caption: "Gardens to wander every morning", alt: "Residents walking through the Golden Oaks gardens" },
  { src: "/golden-oaks/life-arts.jpg", caption: "Creativity, classes, and connection", alt: "Residents in a Golden Oaks arts and crafts class" },
  { src: "/golden-oaks/life-celebrations.jpg", caption: "A community that celebrates together", alt: "Residents celebrating together at Golden Oaks" },
];

// Homepage "A Day in the Life" 6-up grid (masonry: card 1 large, card 4 wide).
const DEFAULT_PHOTO_GRID: LifeCard[] = [
  { src: "/golden-oaks/life-dining.jpg", caption: "Dining & Social Hours", alt: "Dining experience with social gathering" },
  { src: "/golden-oaks/life-arts.jpg", caption: "Arts & Crafts", alt: "Creative art and crafts class" },
  { src: "/golden-oaks/life-gardens.jpg", caption: "Gardens & Outdoors", alt: "Senior walking in garden" },
  { src: "/golden-oaks/life-games.jpg", caption: "Game Nights & Entertainment", alt: "Game night and social entertainment" },
  { src: "/golden-oaks/life-fitness.jpg", caption: "Fitness & Wellness", alt: "Fitness and wellness activity" },
  { src: "/golden-oaks/life-celebrations.jpg", caption: "Community Celebrations", alt: "Community gathering and celebration" },
];

const DEFAULT_LEAD_CARDS =
  "We understand that senior living is a significant decision. That's why we work with families to explore all available options, including VA benefits, long-term care insurance, Medicaid, and flexible payment plans. Let us help you navigate the financial aspects of moving to Golden Oaks.";
const DEFAULT_LEAD_PHOTO_GRID =
  "From morning yoga to evening socials, every day brings something to look forward to. Our residents enjoy a vibrant calendar of activities, wellness programs, and opportunities to build lasting friendships.";

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

function firstParagraph(body: BlockProps["body"]): string | undefined {
  const p = body?.root?.children?.find((c) => c.type === "paragraph");
  return p ? nodeText(p) || undefined : undefined;
}

/** Caption gradient (dark → transparent), derived from a token so the re-skin
 *  flip re-themes it. `cards` uses the sage-dark green; `photo-grid` the
 *  warmer text-brown, matching the two mockups. */
const CAPTION_GRADIENT: Record<string, string> = {
  cards:
    "linear-gradient(to top, color-mix(in srgb, var(--color-section-dark) 88%, transparent) 0%, color-mix(in srgb, var(--color-section-dark) 55%, transparent) 60%, transparent 100%)",
  "photo-grid":
    "linear-gradient(to top, color-mix(in srgb, var(--color-text) 75%, transparent) 0%, color-mix(in srgb, var(--color-text) 35%, transparent) 60%, transparent 100%)",
};

export function LifestyleCardsBlock({ title, body, mediaArray, settings }: BlockProps) {
  const variant = settings?.variant === "photo-grid" ? "photo-grid" : "cards";
  const photoGrid = variant === "photo-grid";
  const defaults = photoGrid ? DEFAULT_PHOTO_GRID : DEFAULT_CARDS;
  const refs = mediaArray ?? [];

  const lead = firstParagraph(body) ?? (photoGrid ? DEFAULT_LEAD_PHOTO_GRID : DEFAULT_LEAD_CARDS);

  // Bind mediaArray[i] over the default slots: a provided ref overrides the
  // default photo; its alt (if any) overrides the default caption.
  const cards: LifeCard[] = defaults.map((d, i) => {
    const ref = refs[i];
    // Uploaded ref wins; else the in-code GO default photo for this slot.
    // `||` (not `??`) so an empty-string/missing ref falls through to the default.
    const src = mediaUrl(ref) || d.src;
    const alt = mediaAlt(ref) || d.alt;
    return { src, caption: mediaAlt(ref) || d.caption, alt };
  });

  const gradient = CAPTION_GRADIENT[variant];

  return (
    <section
      data-nocms-component="lifestyle-cards"
      className="bg-[var(--color-section-sage)] py-20 px-6 sm:px-10 lg:px-16"
    >
      <div className="max-w-[1200px] mx-auto">
        {title && (
          <h2
            data-role="heading"
            data-payload-subfield="title"
            className="text-center font-heading text-4xl sm:text-[2.5rem] font-bold text-[var(--color-neutral-900)] leading-tight mb-6"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h2>
        )}
        {lead && (
          <div data-payload-subfield="body" className="max-w-[700px] mx-auto mb-8">
            <p className="text-center font-body text-lg text-[var(--color-neutral-700)] leading-relaxed" data-role="subheading">
              {lead}
            </p>
          </div>
        )}

        <div
          data-array-prop="mediaArray"
          data-payload-subfield="mediaArray"
          className={
            photoGrid
              ? "grid gap-4 mt-12 mb-12 grid-cols-2 min-[1025px]:grid-cols-4 min-[1025px]:[grid-template-rows:auto_auto]"
              : "grid gap-5 mt-8 mb-12 grid-cols-1 min-[481px]:grid-cols-2 min-[901px]:grid-cols-4"
          }
        >
          {cards.map((card, i) => {
            // Masonry spans for the photo-grid: card 1 = 2×2, card 4 = 2 cols.
            // Mockup resets cards 1 & 4 to single cells at <=768 (2-col grid all
            // single), spans them full-width only in the 769-1024 2-col range, and
            // applies the 4-col masonry (row-span) at >=1025.
            const span =
              photoGrid && i === 0
                ? "min-[769px]:col-span-2 min-[1025px]:row-span-2"
                : photoGrid && i === 3
                  ? "min-[769px]:col-span-2"
                  : "";
            return (
              <div
                key={i}
                data-array-index={i}
                className={`group relative overflow-hidden rounded-[var(--radius)] shadow-[var(--shadow-md)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] ${
                  photoGrid ? "min-h-[220px]" : "aspect-[4/5] [@media(max-width:480px)]:aspect-[16/10] rounded-[12px]"
                } ${span}`}
              >
                {card.src ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    data-payload-subfield={`mediaArray.${i}`}
                    src={card.src}
                    alt={card.alt}
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
                <div
                  className={`absolute inset-x-0 bottom-0 px-4 pt-[18px] pb-4 font-body text-base font-semibold text-[var(--color-white)] tracking-[0.02em] ${
                    photoGrid
                      ? "translate-y-full transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                      : ""
                  }`}
                  style={{ background: gradient }}
                >
                  {card.caption}
                </div>
              </div>
            );
          })}
        </div>

        {photoGrid ? (
          <div className="flex flex-wrap justify-center gap-8">
            <a href="/activities-events" className="btn-link inline-flex items-center gap-1 font-body text-base" data-role="cta">
              See Our Events Calendar <span aria-hidden="true" data-role="text">&rarr;</span>
            </a>
            <a href="/photo-video-gallery" className="btn-link inline-flex items-center gap-1 font-body text-base" data-role="cta-2">
              View Photo Gallery <span aria-hidden="true" data-role="text-2">&rarr;</span>
            </a>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-5 [@media(max-width:480px)]:flex-col">
            <a href="/senior-living-guide" className="btn btn-primary [@media(max-width:480px)]:w-full" data-role="cta-3">
              Download Financial Guide
            </a>
            <a href="/contact" className="btn btn-secondary [@media(max-width:480px)]:w-full" data-role="cta-4">
              Speak with Our Team
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
