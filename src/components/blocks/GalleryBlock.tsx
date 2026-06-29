import * as React from "react";
import type { BlockProps } from "./types";
import { mediaArrayUrls } from "@/lib/payload";

/** GalleryBlock — the Golden Oaks "Life at Golden Oaks" gallery shelf
 *  (`gallery` component, in situ on Independent Living / Amenities as
 *  `<section class="gallery-shelf-section has-leaf-bg" id="gallery">`). An
 *  auto-scrolling, full-bleed horizontal strip of labeled photo cards with a
 *  centered CTA link below.
 *
 *  Replaces the old static masonry grid. The seamless infinite loop is done
 *  with ZERO client JS: the card list is rendered TWICE server-side and the
 *  track slides to `translateX(-50%)` via the `gallery-scroll` keyframe (in
 *  globals.css). The 2nd copy is `aria-hidden`. Under `prefers-reduced-motion`
 *  the animation stops, the track wraps to a centered grid, and the duplicate
 *  copy is hidden (`motion-reduce:hidden`) — the graceful-degradation path.
 *
 *  Data-flow convention:
 *    - `mediaArray` = the card photos; each card's LABEL is that media's `alt`
 *      (rendered as a real `<figcaption>`, editable + accessible — not a CSS
 *      `::after`). Empty ⇒ the 6 GO default scenes below.
 *    - `title` is the section `<h2>`.
 *    - The "View Full Photo Gallery" CTA targets `/photo-video-gallery`
 *      (in-code default).
 *
 *  Token-only: the card label scrim is `color-mix(... var(--color-text) …)`
 *  (the mockup's text-brown overlay alpha); the CTA is `--color-primary`. */

interface GalleryCard {
  url: string;
  alt: string;
}

const DEFAULT_CARDS: GalleryCard[] = [
  { url: "/golden-oaks/life-gardens.jpg", alt: "Our Gardens" },
  { url: "/golden-oaks/life-dining.jpg", alt: "Main Dining Room" },
  { url: "/golden-oaks/life-fitness.jpg", alt: "Fitness Center" },
  { url: "/golden-oaks/life-arts.jpg", alt: "Art Studio" },
  { url: "/golden-oaks/life-celebrations.jpg", alt: "Celebrations" },
  { url: "/golden-oaks/life-games.jpg", alt: "Game Room" },
];

const CTA_HREF = "/photo-video-gallery";
const CTA_LABEL = "View Full Photo Gallery";

/** The bottom label scrim — the mockup's top-fading text-brown overlay
 *  (alpha .75 → .35 → transparent), re-expressed via `color-mix` on the
 *  `--color-text` token so it stays literal-free and re-skins. */
const LABEL_SCRIM =
  "linear-gradient(to top," +
  "color-mix(in srgb, var(--color-text) 75%, transparent) 0%," +
  "color-mix(in srgb, var(--color-text) 35%, transparent) 60%," +
  "transparent 100%)";

function Card({
  card,
  index,
  real,
}: {
  card: GalleryCard;
  index: number;
  real: boolean;
}) {
  return (
    <figure
      {...(real ? { "data-array-index": index } : {})}
      className="group relative m-0 w-[340px] min-w-[340px] max-w-[340px] flex-shrink-0 overflow-hidden rounded-[var(--radius)] shadow-[var(--shadow-md)] transition-[transform,box-shadow] duration-[350ms] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)] [@media(max-width:768px)]:w-[280px] [@media(max-width:768px)]:min-w-[280px] [@media(max-width:768px)]:max-w-[280px] [@media(max-width:480px)]:w-[260px] [@media(max-width:480px)]:min-w-[260px] [@media(max-width:480px)]:max-w-[260px]" data-nocms-component="gallery-block"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.url}
        alt={card.alt}
        loading="lazy"
        className="block aspect-[4/3] h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        {...(real ? { "data-payload-subfield": `mediaArray.${index}` } : {})} data-role="media"
      />
      <figcaption
        className="absolute inset-x-0 bottom-0 px-5 pt-5 pb-[18px] text-[16px] font-semibold tracking-[0.02em] text-[var(--color-white)]"
        style={{ background: LABEL_SCRIM }}
      >
        {card.alt}
      </figcaption>
    </figure>
  );
}

export function GalleryBlock({ title, mediaArray }: BlockProps) {
  const seeded = mediaArrayUrls(mediaArray);
  const cards: GalleryCard[] = seeded.length > 0 ? seeded : DEFAULT_CARDS;

  return (
    <section
      data-nocms-component="gallery"
      className="has-leaf-bg relative overflow-hidden py-20 [@media(max-width:768px)]:py-12"
    >
      <div className="container relative z-[1] mx-auto max-w-[1200px] px-10 [@media(max-width:480px)]:px-5">
        {title && (
          <h2
            data-role="heading"
            data-payload-subfield="title"
            className="text-center font-heading text-[2.5rem] font-bold text-text [@media(max-width:480px)]:text-2xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h2>
        )}
      </div>

      {/* Full-bleed shelf. The track auto-scrolls (`gallery-scroll`), pauses on
          hover, and under reduced-motion stops + wraps to a centered grid. */}
      <div className="relative z-[1] mt-12 overflow-hidden [@media(max-width:768px)]:mt-8">
        <div className="flex w-max gap-7 py-5 [animation:gallery-scroll_35s_linear_infinite] hover:[animation-play-state:paused] [@media(max-width:480px)]:gap-4 motion-reduce:w-auto motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
          {/* Real copy — carries the editor-contract attrs. */}
          <div
            className="flex flex-shrink-0 gap-7 [@media(max-width:480px)]:gap-4 motion-reduce:flex-wrap motion-reduce:justify-center"
            data-payload-subfield="mediaArray"
            data-array-prop="mediaArray"
          >
            {cards.map((card, i) => (
              <Card key={`real-${i}`} card={card} index={i} real />
            ))}
          </div>
          {/* Duplicate copy — seamless -50% loop; hidden to AT and under
              reduced-motion (where one copy is enough). */}
          <div
            aria-hidden="true"
            className="flex flex-shrink-0 gap-7 [@media(max-width:480px)]:gap-4 motion-reduce:hidden"
          >
            {cards.map((card, i) => (
              <Card key={`dup-${i}`} card={card} index={i} real={false} />
            ))}
          </div>
        </div>
      </div>

      <div className="container relative z-[1] mx-auto max-w-[1200px] px-10 [@media(max-width:480px)]:px-5">
        <div className="mt-11 text-center [@media(max-width:768px)]:mt-8">
          <a
            href={CTA_HREF}
            className="group/cta inline-flex min-h-[44px] items-center gap-2 py-2.5 text-[18px] font-semibold text-primary transition-[gap,color] duration-200 hover:gap-3 hover:text-primary-dark focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [@media(max-width:768px)]:text-[16px]"
          >
            {CTA_LABEL}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5 transition-transform duration-200 group-hover/cta:translate-x-[3px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
