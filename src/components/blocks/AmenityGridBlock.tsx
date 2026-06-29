import * as React from "react";
import type { BlockProps } from "./types";
import { mediaUrl, mediaAlt } from "@/lib/payload";
import { lexicalToText, lexicalQAPairs } from "./Lexical";

/** AmenityGridBlock — the Golden Oaks icon-card grid of community amenities
 *  (dining, library, garden, fitness, etc.). Each card centers a circular icon
 *  (or a photo) above a serif title + muted description on a token surface card
 *  that lifts on hover. Mirrors the mockup `.icon-cards` family (Plan 00); the
 *  per-card accent tint cycles so the grid reads as a varied set.
 *
 *  ONE block, two layouts via `settings.variant` and a section-bg switch via
 *  `settings.background` (one block, NOT N):
 *    - `variant: "icon"`  — DEFAULT. Circular accent-tinted icon at the top of
 *                           each card; `mediaArray[i]` (if present) still
 *                           photo-replaces the icon for that card.
 *    - `variant: "image"` — photo-topped cards (4:3 image well, no icon). The
 *                           `mediaArray[i]` photo fills the well; a token
 *                           gradient stands in when a card has no photo.
 *    - `settings.background` ∈ {base, surface (default), dark, accent} — swaps
 *                           the section band + text color. `dark` →
 *                           `--color-section-dark` (green) with white titles +
 *                           lighter body (matches the `feature-sections-dark` /
 *                           `icon-cards-brown` placements). Token-only.
 *
 *  Data-flow convention (UNCHANGED across the re-skin):
 *    - Each heading/paragraph pair in the body is one amenity: h3 = name,
 *      paragraph = description.
 *    - `mediaArray[i]` is an optional photo for amenity i — in the `icon`
 *      variant it replaces the icon circle; in the `image` variant it fills the
 *      card's image well.
 *    - Empty body falls back to 6 default amenities. */

interface Amenity {
  name: string;
  description: string;
  icon: React.ReactNode;
}

const ICONS = {
  dining: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7a3 3 0 0 0 3 3v10" /><path d="M9 2v20" /><path d="M9 9V2" /><path d="M21 2v20" /><path d="M21 9c-3 0-5-2-5-5V2" />
    </svg>
  ),
  library: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  garden: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12" /><path d="M12 12c-3 0-5-2-5-5 3 0 5 2 5 5z" /><path d="M12 12c3 0 5-2 5-5-3 0-5 2-5 5z" /><path d="M5 17h14" />
    </svg>
  ),
  fitness: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16" /><path d="M18 4v16" /><path d="M2 8v8" /><path d="M22 8v8" /><path d="M6 12h12" />
    </svg>
  ),
  theater: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 22h8" /><path d="M12 18v4" />
    </svg>
  ),
  spa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4-4 4-12 0-16-4 4-4 12 0 16z" /><path d="M2 22c4 0 8-2 10-6" /><path d="M22 22c-4 0-8-2-10-6" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
};

const DEFAULT_AMENITIES: Amenity[] = [
  { name: "Restaurant Dining", description: "Three chef-prepared meals daily in a relaxed dining room — seasonal menus, dietary accommodations, and tables that fill with conversation.", icon: ICONS.dining },
  { name: "Library & Lounges", description: "Quiet corners with floor-to-ceiling bookshelves, reading chairs, and a curated rotation of newspapers, magazines, and large-print titles.", icon: ICONS.library },
  { name: "Gardens & Walking Paths", description: "Landscaped courtyards, raised garden beds, and shaded paths that invite a morning stroll or an afternoon with the grandchildren.", icon: ICONS.garden },
  { name: "Fitness Center", description: "Senior-friendly equipment, group classes, and chair yoga led by certified instructors who tailor every session to the room.", icon: ICONS.fitness },
  { name: "Theater & Performance Hall", description: "Tiered seating for movie nights, live music, lectures, and the occasional grandkid recital — popcorn included.", icon: ICONS.theater },
  { name: "Salon & Spa", description: "On-site hair, nail, and spa services so residents never have to leave the community to feel pampered.", icon: ICONS.spa },
];

/** In-code GO default photos for the `image`-variant card wells
 *  (`public/golden-oaks/life-*.jpg`), bound per card index when `mediaArray[i]`
 *  has no uploaded ref. The default `icon` variant keeps its icon circle (these
 *  are only used when the card actually leads with a photo well). */
const DEFAULT_IMAGES = [
  "/golden-oaks/life-dining.jpg",
  "/golden-oaks/life-arts.jpg",
  "/golden-oaks/life-gardens.jpg",
  "/golden-oaks/life-fitness.jpg",
  "/golden-oaks/life-celebrations.jpg",
  "/golden-oaks/life-community.jpg",
];

function pickIcon(name: string): React.ReactNode {
  const n = name.toLowerCase();
  if (n.includes("dining") || n.includes("restaurant") || n.includes("cafe")) return ICONS.dining;
  if (n.includes("library") || n.includes("book") || n.includes("read")) return ICONS.library;
  if (n.includes("garden") || n.includes("courtyard") || n.includes("outdoor")) return ICONS.garden;
  if (n.includes("fitness") || n.includes("gym") || n.includes("yoga")) return ICONS.fitness;
  if (n.includes("theater") || n.includes("cinema") || n.includes("performance")) return ICONS.theater;
  if (n.includes("salon") || n.includes("spa") || n.includes("beauty")) return ICONS.spa;
  return ICONS.default;
}

/** Per-card icon-circle accent tint, cycled by index. Token-only (a token bg at
 *  an opacity + a token text color) so the `--color-primary` flip re-themes the
 *  whole set. On a dark section the tint is a translucent wash of the accent. */
const ACCENT_TINTS = [
  "bg-primary/10 text-primary",
  "bg-accent/15 text-accent",
  "bg-secondary/15 text-secondary",
  "bg-primary/10 text-primary",
  "bg-accent/15 text-accent",
  "bg-secondary/15 text-secondary",
];
const ACCENT_TINTS_DARK = [
  "bg-primary-light/15 text-primary-light",
  "bg-accent/20 text-accent-light",
  "bg-secondary/20 text-secondary-light",
  "bg-primary-light/15 text-primary-light",
  "bg-accent/20 text-accent-light",
  "bg-secondary/20 text-secondary-light",
];

type Background = "base" | "surface" | "dark" | "accent";

/** Section band + text-color classes per `settings.background`. The band is
 *  always a token utility — never a literal. `dark` flips titles/body to white. */
const SECTION_BG: Record<Background, string> = {
  base: "bg-background",
  surface: "bg-surface",
  dark: "bg-section-dark text-white",
  accent: "bg-section-sand",
};

function resolveBackground(b: string | null | undefined): Background {
  if (b === "base" || b === "dark" || b === "accent") return b;
  return "surface";
}

export function AmenityGridBlock({ title, body, mediaArray, settings }: BlockProps) {
  const imageVariant = settings?.variant === "image";
  const background = resolveBackground(settings?.background);
  const dark = background === "dark";

  const overrides = lexicalQAPairs(body);
  const hasOverrides = overrides.length > 0;
  const intro = hasOverrides ? undefined : lexicalToText(body) || undefined;
  const photos = mediaArray ?? [];

  const amenities: Amenity[] = hasOverrides
    ? overrides.map((o, i) => {
        const fallback = DEFAULT_AMENITIES[i] ?? DEFAULT_AMENITIES[0];
        const name = o.q || fallback.name;
        return { name, description: o.a || fallback.description, icon: pickIcon(name) };
      })
    : DEFAULT_AMENITIES;

  const tints = dark ? ACCENT_TINTS_DARK : ACCENT_TINTS;

  // Token-only card surface + text. On dark the card is a translucent-white
  // panel with white heading + lighter body; on light it's the background
  // surface with the standard text/muted treatment.
  const cardCls = dark
    ? "bg-white/[0.06] border-white/15"
    : "bg-background border-text/5";
  const headingCls = dark ? "text-white" : "text-text";
  const bodyCls = dark ? "text-white/85" : "text-muted";

  return (
    <section
      data-nocms-component="amenity-grid"
      data-variant={imageVariant ? "image" : "icon"}
      data-background={background}
      className={`py-20 px-6 sm:px-10 lg:px-16 ${SECTION_BG[background]}`}
    >
      <div className="max-w-7xl mx-auto">
        {(title || intro) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {title && (
              <h2
                data-role="heading"
                data-payload-subfield="title"
                className={`font-heading text-4xl sm:text-5xl font-bold tracking-tight ${headingCls}`}
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                {title}
              </h2>
            )}
            {intro && (
              <p
                data-role="subheading"
                data-payload-subfield="body"
                className={`mt-4 font-body text-lg leading-relaxed ${bodyCls}`}
              >
                {intro}
              </p>
            )}
          </div>
        )}
        <div
          data-array-prop="mediaArray"
          data-payload-subfield="mediaArray"
          className="grid grid-cols-1 min-[769px]:grid-cols-2 min-[1025px]:grid-cols-3 gap-6"
        >
          {amenities.map((a, i) => {
            const photo = photos[i];
            const photoSrc = mediaUrl(photo);
            // The `image` variant always shows a photo well: uploaded ref wins,
            // else the in-code GO default for card i (`||`, not `??`). The icon
            // variant only photo-replaces the icon when a ref is actually
            // present (an empty card keeps its icon circle), so it does NOT use
            // the default photo.
            const wellSrc = photoSrc || DEFAULT_IMAGES[i % DEFAULT_IMAGES.length];
            const tint = tints[i % tints.length];
            // In the `image` variant the card always leads with a media well;
            // in the default `icon` variant a photo (when present) replaces the
            // icon circle for that card.
            const showImageWell = imageVariant;
            const showPhotoForIcon = !imageVariant && !!photoSrc;
            return (
              <article
                key={i}
                data-array-index={i}
                className={`group rounded-[--radius] border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden ${cardCls}`}
              >
                {showImageWell ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    data-payload-subfield={`mediaArray.${i}`}
                    src={wellSrc}
                    alt={mediaAlt(photo) || a.name}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy" data-role="media"
                  />
                ) : null}
                <div className="p-7 text-center">
                  {!imageVariant &&
                    (showPhotoForIcon ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        data-payload-subfield={`mediaArray.${i}`}
                        src={photoSrc}
                        alt={mediaAlt(photo) || a.name}
                        className="mx-auto mb-5 h-16 w-16 rounded-full object-cover"
                        loading="lazy" data-role="media-2"
                      />
                    ) : (
                      <div
                        data-payload-subfield={`mediaArray.${i}`}
                        className={`mx-auto mb-5 h-16 w-16 rounded-full flex items-center justify-center ${tint}`}
                      >
                        <span className="h-8 w-8 block">{a.icon}</span>
                      </div>
                    ))}
                  <h3 className={`font-heading text-xl font-semibold mb-2 ${headingCls}`} data-role="heading-2">
                    {a.name}
                  </h3>
                  <p className={`font-body text-sm leading-relaxed ${bodyCls}`}>
                    {a.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
