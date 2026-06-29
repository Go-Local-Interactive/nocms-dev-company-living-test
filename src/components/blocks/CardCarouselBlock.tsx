"use client";

import * as React from "react";
import type { BlockProps } from "./types";
import { mediaItemsUrls } from "@/lib/payload";
import { lexicalListItems, lexicalToText } from "./Lexical";

/** CardCarouselBlock — the Golden Oaks `card-carousel`: a horizontal
 *  scroll-snap row of linked cards with a header (h2 + two round prev/next
 *  buttons). In situ on Magnolia L13751 (`<section class="card-carousel
 *  section-sage has-branch-bg">` — "You Might Also Like", 5 floor-plan cards).
 *
 *  Mirrors `components/card-carousel/card-carousel.html`.
 *
 *  Client behavior + GRACEFUL DEGRADATION (non-negotiable):
 *    - The track is a native `overflow-x:auto` scroll-snap row — fully usable
 *      by touch / trackpad / keyboard WITHOUT JS. The prev/next buttons ENHANCE,
 *      they don't gate: prev/next `scrollBy(±(320+24), smooth)`, and a `scroll`
 *      listener toggles each button's `disabled` at the ends. If JS never runs,
 *      the row still scrolls.
 *    - `prefers-reduced-motion` drops the smooth scroll (`motion-reduce:
 *      scroll-auto`) so reduced-motion users get instant jumps.
 *
 *  Data-flow convention:
 *    - `items[]` — `item.media` = card image, `item.label` = `h3` title,
 *      `item.link.url` = card href, `item.text` (lexical) = EITHER a short list
 *      (rendered as the spec/meta row, last entry treated as the price line) OR
 *      a paragraph (rendered as a description). Empty ⇒ the 5 GO "You Might Also
 *      Like" floor-plan defaults so the block is never blank.
 *    - `title` is the section `<h2>`.
 *    - `settings.background` picks the P0 section surface (default `section-sage`
 *      + the `has-branch-bg` leaf overlay, matching the in-situ instance).
 *
 *  Token-only: card surface (`bg-white`), border (`border-text/10`), price
 *  (`text-primary-dark`), nav hover (`border-primary`/`bg-primary-light`) are
 *  all token utilities; the hover shadow is `color-mix(... var(--color-text) …)`.
 *  No hex / rgba. */

interface Card {
  image: string;
  alt: string;
  title: string;
  href: string;
  /** Spec/meta chips (e.g. "Studio", "1 Bath", "450 sq ft"). */
  meta?: string[];
  /** Price line, pushed to the card bottom. */
  price?: string;
  /** Plain description (alternative to meta+price). */
  description?: string;
}

/** The mockup's 5 "You Might Also Like" floor-plan cards (in situ on Magnolia). */
const DEFAULT_CARDS: Card[] = [
  {
    image: "/golden-oaks/fp-studio.jpg",
    alt: "The Azalea — cozy studio with modern finishes",
    title: "The Azalea",
    href: "/floor-plans/azalea",
    meta: ["Studio", "1 Bath", "450 sq ft"],
    price: "From $2,800/mo",
  },
  {
    image: "/golden-oaks/fp-oakwood.jpg",
    alt: "The Dogwood — bright one-bedroom suite",
    title: "The Dogwood",
    href: "/floor-plans/dogwood",
    meta: ["1 Bed", "1 Bath", "650 sq ft"],
    price: "From $3,800/mo",
  },
  {
    image: "/golden-oaks/fp-heritage.jpg",
    alt: "The Heritage — spacious one-bedroom with den",
    title: "The Heritage",
    href: "/floor-plans/heritage",
    meta: ["1 Bed + Den", "1 Bath", "750 sq ft"],
    price: "From $4,200/mo",
  },
  {
    image: "/golden-oaks/fp-oakwood-2.jpg",
    alt: "The Oakwood — two-bedroom suite with garden view",
    title: "The Oakwood",
    href: "/floor-plans/oakwood",
    meta: ["2 Bed", "2 Bath", "950 sq ft"],
    price: "From $5,600/mo",
  },
  {
    image: "/golden-oaks/fp-heritage-2.jpg",
    alt: "The Cypress — premium two-bedroom corner suite",
    title: "The Cypress",
    href: "/floor-plans/cypress",
    meta: ["2 Bed", "2 Bath", "1,100 sq ft"],
    price: "From $6,200/mo",
  },
];

const DEFAULT_TITLE = "You Might Also Like";

/** Map `settings.background` to a P0 section-surface utility; default keeps the
 *  in-situ `section-sage` band + the `has-branch-bg` leaf overlay. */
const BACKGROUND_CLASS: Record<string, string> = {
  base: "has-branch-bg",
  surface: "section-cream",
  cream: "section-cream",
  sage: "section-sage has-branch-bg",
  light: "section-light",
  sand: "section-sand",
  dark: "section-dark",
};

/** Card hover shadow — the mockup's text-brown alpha, via `color-mix` so it
 *  stays literal-free and re-skins. */
const CARD_HOVER_SHADOW =
  "hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)]";

export function CardCarouselBlock({ title, items, settings }: BlockProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [prevDisabled, setPrevDisabled] = React.useState(true);
  const [nextDisabled, setNextDisabled] = React.useState(false);

  const bg = settings?.background
    ? (BACKGROUND_CLASS[settings.background] ?? "section-sage has-branch-bg")
    : "section-sage has-branch-bg";

  const itemImages = mediaItemsUrls(items);
  const cards: Card[] =
    items && items.length > 0
      ? items.map((it, i) => {
          const listItems = lexicalListItems(it.text);
          const isMeta = listItems.length > 0;
          // A list → meta chips; the last chip becomes the price line if it
          // reads like one (starts with a currency symbol / "From"). Otherwise
          // a paragraph → description.
          let meta: string[] | undefined;
          let price: string | undefined;
          let description: string | undefined;
          if (isMeta) {
            const last = listItems[listItems.length - 1];
            if (/^(from\b|\$|£|€)/i.test(last.trim())) {
              meta = listItems.slice(0, -1);
              price = last;
            } else {
              meta = listItems;
            }
          } else {
            description = lexicalToText(it.text) || undefined;
          }
          return {
            // Uploaded item media only. An authored card without media renders
            // the neutral token gradient well (see card.image guard below) — we
            // do NOT borrow a DEFAULT_CARDS (Golden Oaks floor-plan) photo here,
            // which would put unrelated demo images on real content (e.g. the
            // funding-method cards). DEFAULT_CARDS stays the no-items demo state.
            image: itemImages[i]?.url || "",
            alt: itemImages[i]?.alt || it.label || "",
            title: it.label || `Card ${i + 1}`,
            href: it.link?.url || "#",
            meta,
            price,
            description,
          };
        })
      : DEFAULT_CARDS;

  const scrollByCard = React.useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * (320 + 24), behavior: "smooth" });
  }, []);

  // Toggle button `disabled` at the ends (mockup `updateButtons`). The native
  // scroll-snap row works without this — it only dims the buttons appropriately.
  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      setPrevDisabled(track.scrollLeft <= 0);
      setNextDisabled(
        track.scrollLeft + track.offsetWidth >= track.scrollWidth - 2,
      );
    };
    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [cards.length]);

  return (
    <section
      data-nocms-component="card-carousel"
      className={`relative overflow-hidden py-20 [@media(max-width:768px)]:py-12 ${bg}`}
    >
      <div className="container relative z-[1] mx-auto max-w-[1200px] px-10 [@media(max-width:480px)]:px-5">
        <div className="mb-9 flex items-center justify-between gap-4 [@media(max-width:768px)]:mb-7">
          {title && (
            <h2
              data-role="heading"
              data-payload-subfield="title"
              className="m-0 font-heading text-[2rem] font-bold text-text [@media(max-width:480px)]:text-2xl"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              {title}
            </h2>
          )}
          <div className="flex flex-shrink-0 gap-2">
            <NavButton
              dir={-1}
              label="Previous cards"
              disabled={prevDisabled}
              onClick={() => scrollByCard(-1)}
            />
            <NavButton
              dir={1}
              label="Next cards"
              disabled={nextDisabled}
              onClick={() => scrollByCard(1)}
            />
          </div>
        </div>

        {/* Native scroll-snap track — usable without JS; smooth scroll dropped
            under reduced-motion. */}
        <div
          ref={trackRef}
          data-array-prop="items"
          data-payload-subfield="items"
          className="flex snap-x snap-mandatory scroll-smooth gap-6 overflow-x-auto pb-1 [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
        >
          {cards.map((card, i) => (
            <a
              key={i}
              href={card.href}
              data-array-index={i}
              className={`group flex w-[320px] min-w-[320px] max-w-[320px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius)] border border-text/10 bg-white text-inherit no-underline transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] ${CARD_HOVER_SHADOW} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [@media(max-width:768px)]:w-[280px] [@media(max-width:768px)]:min-w-[280px] [@media(max-width:768px)]:max-w-[280px]`}
            >
              <div className="aspect-[16/10] overflow-hidden">
                {card.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    data-payload-subfield={`items.${i}.media`}
                    src={card.image}
                    alt={card.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" data-role="media"
                  />
                ) : (
                  <div
                    data-payload-subfield={`items.${i}.media`}
                    aria-hidden="true"
                    className="h-full w-full bg-gradient-to-br from-primary/15 via-surface to-accent/20"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3
                  data-payload-subfield={`items.${i}.label`}
                  className="mb-2 font-heading text-[20px] text-neutral-900" data-role="heading-2"
                >
                  {card.title}
                </h3>
                {card.meta && card.meta.length > 0 && (
                  <div
                    data-payload-subfield={`items.${i}.text`}
                    className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[16px] text-neutral-500"
                  >
                    {card.meta.map((m, j) => (
                      <span key={j} className="inline-flex items-center gap-1">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
                {card.description && (
                  <p
                    data-payload-subfield={`items.${i}.text`}
                    className="m-0 text-[16px] leading-[1.6] text-neutral-700" data-role="subheading"
                  >
                    {card.description}
                  </p>
                )}
                {card.price && (
                  <div className="mt-auto text-[17px] font-semibold text-primary-dark">
                    {card.price}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function NavButton({
  dir,
  label,
  disabled,
  onClick,
}: {
  dir: 1 | -1;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-neutral-300 bg-white transition-[border-color,background-color] duration-200 hover:border-primary hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-neutral-300 disabled:hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5 text-neutral-700"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {dir === -1 ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  );
}
