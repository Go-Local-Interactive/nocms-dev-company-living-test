import * as React from "react";
import type { BlockProps } from "./types";
import {
  mediaUrl,
  mediaAlt,
  type PayloadBlockItem,
  type PayloadBlockLink,
} from "@/lib/payload";
import { lexicalToText } from "./Lexical";
import { FullbleedHero } from "@/components/layout/FullbleedHero";
import skinConfig from "@/skin.config";

/**
 * Hero — the five Golden Oaks hero patterns rendered from ONE block, driven by
 * `settings.variant` (falling back to `skin.config.heroVariant`):
 *
 *   - `video`       homepage immersive: full-bleed photo (video-ready) + dark
 *                   diagonal overlay + white serif h1 + two CTAs.
 *   - `fullbleed`   interior page header: full-bleed photo + overlay + centered
 *                   breadcrumb + h1 + tagline + animated scroll-cue.
 *   - `split-stats` two-column: sage/dark text panel (breadcrumb + h1 + tagline
 *                   + 3 icon stats) beside a hover-zoom image with caption.
 *   - `toprow`      compact sage band: breadcrumb + h1 + drop-cap intro +
 *                   decorative floral.
 *   - `stats`       compact cream/dark band: breadcrumb + h1 + drop-cap intro +
 *                   horizontal stats bar.
 *
 * Back-compat aliases (so existing data + `PageHero` callers don't break):
 *   `image` → fullbleed · `simple` → fullbleed-no-media · `search` → fullbleed+search.
 *
 * Editor contract: root `data-nocms-component="hero"`; every editable field
 * carries `data-payload-subfield` (+ `data-role` on text). Colors/overlay/fonts
 * are token-only — no hex/rgba literals live in this file (the overlay gradient
 * reads `--color-hero-overlay-*`).
 */

/* ── Variant resolution ─────────────────────────────────────────────────── */

type Layout = "video" | "fullbleed" | "split-stats" | "toprow" | "stats";

interface ResolvedVariant {
  layout: Layout;
  /** dark colour modifier (split-stats / stats). */
  dark: boolean;
  /** text-only fullbleed on the primary surface (the `simple` alias). */
  noMedia: boolean;
  /** render the community search form (the `search` alias / search variant). */
  search: boolean;
}

/** Map the raw variant string (+ aliases / `-dark` suffix) to a canonical
 *  layout plus modifier flags. Default falls back to `skin.config.heroVariant`. */
function resolveVariant(
  raw: string | null | undefined,
  tone?: string | null,
): ResolvedVariant {
  const v = (raw ?? skinConfig.heroVariant ?? "video").toLowerCase();
  const dark = tone === "dark" || v.endsWith("-dark");
  const base = v.replace(/-dark$/, "");
  switch (base) {
    case "video":
      return { layout: "video", dark, noMedia: false, search: false };
    case "split-stats":
      return { layout: "split-stats", dark, noMedia: false, search: false };
    case "toprow":
      return { layout: "toprow", dark, noMedia: false, search: false };
    case "stats":
      return { layout: "stats", dark, noMedia: false, search: false };
    // back-compat aliases:
    case "simple":
      return { layout: "fullbleed", dark, noMedia: true, search: false };
    case "search":
      return { layout: "fullbleed", dark, noMedia: false, search: true };
    case "image":
    case "fullbleed":
    default:
      return { layout: "fullbleed", dark, noMedia: false, search: false };
  }
}

/* ── CTA sourcing ───────────────────────────────────────────────────────── */

interface HeroCta {
  label: string;
  href: string;
}

/** Resolve the i-th CTA from a block's `items[]` (each item's `link`), falling
 *  back to the supplied default. */
function ctaFrom(
  items: PayloadBlockItem[] | null | undefined,
  i: number,
  fallback: HeroCta,
): HeroCta {
  const link: PayloadBlockLink | null | undefined = items?.[i]?.link;
  return {
    label: link?.label || fallback.label,
    href: link?.url || fallback.href,
  };
}

/** In-code GO default hero background (`public/golden-oaks/hero-garden.jpg`).
 *  The hero bg varies per page in the GO design (hero-about, hero-floorplans,
 *  …), which a single in-code default can't capture — so the seed sets a
 *  per-page `settings.image` (a string path/URL). The renderer resolves the bg
 *  defensively as `mediaUrl(media) || settings?.image || HERO_DEFAULT_IMAGE`:
 *  a real uploaded media wins, then the per-page `settings.image`, then this
 *  generic garden fallback so a media-less seeded hero is never blank. */
const HERO_DEFAULT_IMAGE = "/golden-oaks/hero-garden.jpg";

/** Resolve a hero's background image from the fallback chain above. */
function heroBg(
  media: BlockProps["media"],
  settings: BlockProps["settings"],
): string {
  return mediaUrl(media) || settings?.image || HERO_DEFAULT_IMAGE;
}

const VIDEO_PRIMARY: HeroCta = { label: "Schedule a Tour", href: "/schedule-tour" };
const VIDEO_SECONDARY: HeroCta = {
  label: "Explore Living Options",
  href: "/living-options",
};

const isVideoUrl = (u?: string | null) => /\.(mp4|webm|ogg|mov)$/i.test(u || "");

/* ── Hero stats (split-stats + stats variants) ──────────────────────────── */

interface HeroStat {
  icon: string;
  value: string;
  label: string;
}

/** A stat = an item whose `icon` is a slug, `link.label` the big value, and
 *  `label` the caption (the flat-schema remap shared by the badge-style blocks). */
function statsFrom(items: PayloadBlockItem[] | null | undefined): HeroStat[] {
  if (!items) return [];
  return items
    .map((it) => ({
      icon: it.icon ?? "default",
      value: it.link?.label ?? "",
      label: it.label ?? "",
    }))
    .filter((s) => s.value || s.label);
}

/** Stat icon glyphs (exact mockup SVG paths). `stroke="currentColor"` so the
 *  chip's text colour — a token utility — drives the stroke, keeping it
 *  token-driven across the light / dark modifiers with no literal colours. */
const STAT_ICONS: Record<string, React.ReactNode> = {
  "layout-grid": (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  heart: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  ),
  box: (
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  camera: (
    <>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  home: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
  bed: (
    <>
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </>
  ),
  bath: (
    <>
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.7 3 4 3.7 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <line x1="10" y1="5" x2="8" y2="7" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="7" y1="19" x2="7" y2="21" />
      <line x1="17" y1="19" x2="17" y2="21" />
    </>
  ),
  ruler: (
    <>
      <path d="M21.3 15.3a1 1 0 0 1 0 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L2.7 8.7a1 1 0 0 1 0-1.4l4.6-4.6a1 1 0 0 1 1.4 0z" />
      <path d="m7.5 10.5 2 2" />
      <path d="m10.5 7.5 2 2" />
      <path d="m13.5 10.5 2 2" />
      <path d="m10.5 13.5 2 2" />
    </>
  ),
  utensils: (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2a2 2 0 0 0 2-2V2" />
      <path d="M5 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </>
  ),
  leaf: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </>
  ),
  "dollar-sign": (
    <>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
  bus: (
    <>
      <path d="M8 6v6" />
      <path d="M15 6v6" />
      <path d="M2 12h19.6" />
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
      <circle cx="7" cy="18" r="2" />
      <path d="M9 18h5" />
      <circle cx="16" cy="18" r="2" />
    </>
  ),
  palette: (
    <>
      <circle cx="13.5" cy="6.5" r=".5" />
      <circle cx="17.5" cy="10.5" r=".5" />
      <circle cx="8.5" cy="7.5" r=".5" />
      <circle cx="6.5" cy="12.5" r=".5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
  video: (
    <>
      <path d="m22 8-6 4 6 4V8z" />
      <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  "message-circle": (
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
  ),
  "thumbs-up": (
    <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z" />
  ),
  default: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
};

function StatIcon({ slug, className = "h-5 w-5" }: { slug: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className} data-nocms-component="hero-block"
    >
      {STAT_ICONS[slug] ?? STAT_ICONS.default}
    </svg>
  );
}

/* ── Shared overlay gradient (token-driven, alpha baked into the tokens) ──── */

const overlayGradient = (soft: boolean): React.CSSProperties => ({
  background: `linear-gradient(135deg, var(--color-hero-overlay-${
    soft ? "from-soft" : "from"
  }) 0%, var(--color-hero-overlay-to) 100%)`,
});

/* ── video / immersive variant (homepage) ──────────────────────────────── */

function VideoHero({ title, body, media, items, settings }: BlockProps) {
  const subtitle = lexicalToText(body) || undefined;
  // Uploaded media wins, then per-page `settings.image`, then the GO default.
  const bg = heroBg(media, settings);
  const showVideo = isVideoUrl(bg);
  const primary = ctaFrom(items, 0, VIDEO_PRIMARY);
  const secondary = ctaFrom(items, 1, VIDEO_SECONDARY);

  return (
    <section
      data-nocms-component="hero"
      className="relative w-full overflow-hidden flex items-center justify-center text-center text-white h-[60vh] min-h-[400px] min-[481px]:h-[65vh] min-[481px]:min-h-[450px] min-[769px]:h-[70vh] min-[769px]:min-h-[500px] min-[1025px]:h-[85vh] min-[1025px]:min-h-[600px]"
    >
      {/* Static image fallback (always present; the video layers above it on desktop). */}
      {bg && !showVideo && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          data-payload-subfield="media"
          data-role="media"
          src={bg}
          alt={mediaAlt(media)}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          loading="eager"
        />
      )}
      {showVideo && (
        <video
          data-payload-subfield="media"
          className="absolute left-1/2 top-1/2 z-0 hidden h-auto min-h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 object-cover min-[769px]:block motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        >
          <source src={bg ?? undefined} />
        </video>
      )}

      {/* Dark diagonal overlay (green → brown), token-driven. */}
      <div aria-hidden="true" className="absolute inset-0 z-[2]" style={overlayGradient(false)} />

      <div className="relative z-[3] mx-auto w-full max-w-3xl px-6 sm:px-10 lg:px-16">
        {title && (
          <h1
            data-role="heading"
            data-payload-subfield="title"
            className="font-heading font-bold leading-[1.1] text-white mb-6 text-[1.85rem] min-[481px]:text-[2.25rem] min-[769px]:text-[2.75rem] min-[1025px]:text-[4rem]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            data-role="subheading"
            data-payload-subfield="body"
            className="font-body font-light leading-relaxed text-white/95 mb-12 text-base min-[769px]:text-xl mx-auto max-w-2xl"
          >
            {subtitle}
          </p>
        )}
        <div className="flex flex-col flex-wrap items-center justify-center gap-3 min-[769px]:flex-row min-[769px]:gap-5">
          <a
            href={primary.href}
            data-payload-subfield="primaryCta"
            className="btn btn-secondary w-full min-w-[240px] min-[481px]:w-auto" data-role="cta"
          >
            {primary.label}
          </a>
          <a
            href={secondary.href}
            data-payload-subfield="secondaryCta"
            className="btn btn-outline w-full min-w-[240px] min-[481px]:w-auto" data-role="cta-2"
          >
            {secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Inline community-search form (back-compat `search` variant) ─────────── */

function HeroSearchForm() {
  return (
    <form
      action="/communities"
      method="get"
      className="mx-auto mb-12 flex max-w-xl flex-col items-stretch gap-3 rounded-lg bg-white/95 p-2 shadow-lg sm:flex-row"
    >
      <label htmlFor="hero-search" className="sr-only" data-role="text">
        City or ZIP code
      </label>
      <input
        id="hero-search"
        name="q"
        type="search"
        placeholder="City or ZIP code"
        className="flex-1 rounded-md border-0 bg-transparent px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <button type="submit" className="btn btn-primary" data-role="cta-3">
        Find Community
      </button>
    </form>
  );
}

/* ── fullbleed variant (interior page header) ───────────────────────────── */

function FullbleedHeroBlock({
  title,
  body,
  media,
  settings,
  noMedia,
  search,
}: BlockProps & { noMedia: boolean; search: boolean }) {
  const subtitle = lexicalToText(body) || undefined;
  // `noMedia` (the `simple` alias) is intentionally photo-less (text on the
  // primary surface) — keep it blank. Otherwise resolve uploaded media →
  // per-page `settings.image` → GO default so the header is never blank.
  const bg = noMedia ? undefined : heroBg(media, settings);

  return (
    <section
      data-nocms-component="hero"
      className={`relative flex w-full items-center justify-center overflow-hidden text-center text-white h-[380px] min-[481px]:h-[450px] min-[769px]:h-[600px] ${
        noMedia ? "bg-primary" : ""
      }`}
    >
      <FullbleedHero
        title={title ?? ""}
        subtitle={subtitle}
        image={bg ?? undefined}
        imageAlt={mediaAlt(media)}
        noMedia={noMedia}
        editable
      >
        {search && <HeroSearchForm />}
      </FullbleedHero>
    </section>
  );
}

/* ── split-stats variant (two-column: text + image, with icon stats) ────── */

function SplitStatsHero({ title, body, media, items, settings, dark }: BlockProps & { dark: boolean }) {
  const subtitle = lexicalToText(body) || undefined;
  // Uploaded media wins, then per-page `settings.image`, then the GO default.
  const bg = heroBg(media, settings);
  const stats = statsFrom(items).slice(0, 3);
  const caption = mediaAlt(media);

  return (
    <section
      data-nocms-component="hero"
      className={`grid min-h-[500px] grid-cols-1 overflow-hidden min-[769px]:grid-cols-2 ${
        dark ? "bg-section-dark" : "bg-section-sage"
      }`}
    >
      {/* Left text panel */}
      <div className="flex items-center px-6 py-10 min-[769px]:py-12 min-[769px]:pl-0 min-[769px]:pr-10 min-[1025px]:py-[60px] min-[1025px]:pr-[60px]">
        <div className="ml-0 max-w-full min-[769px]:ml-auto min-[769px]:max-w-[560px] min-[769px]:pl-8 min-[1025px]:pl-10">
          <h1
            data-role="heading"
            data-payload-subfield="title"
            className={`mb-4 font-heading font-bold leading-[1.1] text-[1.75rem] min-[481px]:text-[2rem] min-[769px]:text-[2.4rem] min-[1025px]:text-[3rem] ${
              dark ? "text-white" : "text-neutral-900"
            }`}
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              data-role="subheading"
              data-payload-subfield="body"
              className={`mb-7 text-base leading-relaxed min-[769px]:text-[1.15rem] ${
                dark ? "text-white/85" : "text-neutral-700"
              }`}
            >
              {subtitle}
            </p>
          )}
          {stats.length > 0 && (
            <div
              className={`flex flex-wrap gap-x-5 gap-y-4 border-t pt-7 min-[769px]:flex-nowrap min-[769px]:gap-6 ${
                dark ? "border-white/20" : "border-neutral-300"
              }`}
            >
              {stats.map((stat, i) => (
                <div
                  key={`${stat.label}-${i}`}
                  className="group flex flex-1 basis-[calc(33.333%-1rem)] items-start gap-3.5 min-[769px]:basis-auto"
                >
                  <div
                    className={`flex h-11 w-11 min-w-11 items-center justify-center rounded-[10px] transition-[background-color,color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:text-white group-hover:bg-primary ${
                      dark ? "bg-white/12 text-sand" : "bg-primary-light text-primary-dark"
                    }`}
                  >
                    <StatIcon slug={stat.icon} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span
                      data-payload-subfield="statValue"
                      className={`font-heading text-[1.35rem] font-bold leading-[1.1] ${
                        dark ? "text-white" : "text-primary-dark"
                      }`}
                    >
                      {stat.value}
                    </span>
                    <span
                      data-payload-subfield="statLabel"
                      className={`text-base font-medium leading-[1.3] ${
                        dark ? "text-white/85" : "text-neutral-500"
                      }`}
                    >
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right image panel (mobile: first/top + fixed height; desktop: fills the
          grid row driven by the text column, never the image's intrinsic height —
          the <img> is absolutely positioned so it contributes no layout height) */}
      <div className="group relative order-first h-[240px] overflow-hidden min-[481px]:h-[320px] min-[769px]:order-none min-[769px]:h-auto">
        {bg && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            data-payload-subfield="media"
            data-role="media"
            src={bg}
            alt={caption}
            className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
          />
        )}
        {caption && (
          <div
            data-payload-subfield="mediaCaption"
            className="absolute inset-x-0 bottom-0 px-5 pb-[18px] pt-5 text-base font-semibold tracking-[0.02em] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(to top, var(--color-hero-overlay-to) 0%, color-mix(in srgb, var(--color-hero-overlay-to) 50%, transparent) 60%, transparent 100%)",
            }}
          >
            {caption}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Compact band heroes (toprow + stats) ───────────────────────────────── */

/** Decorative right-aligned floral wash (mockup `.hero-toprow/.hero-stats::before`).
 *  `aria-hidden`; the image path is a URL (not a colour) so it stays
 *  literal-free. On dark `stats`, the floral fades to 8% opacity. */
function FloralBackdrop({ faded }: { faded?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-y-0 right-0 w-[45%] bg-cover bg-center bg-no-repeat min-[481px]:w-[50%] min-[769px]:w-[55%] ${
        faded ? "opacity-[0.08]" : ""
      }`}
      style={{ backgroundImage: "url(/golden-oaks/hero-flowers.png)" }}
    />
  );
}

/** Shared compact-band shell: sage/cream/dark background, vertical padding that
 *  tightens at 768/480, the floral backdrop, and a centered max-w-1200 content
 *  wrapper. `toprow` and `stats` both render their content as children. */
function BandHero({
  bg,
  faded,
  children,
}: {
  bg: string;
  faded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      data-nocms-component="hero"
      className={`relative overflow-hidden py-7 min-[481px]:py-8 min-[769px]:pb-12 min-[769px]:pt-10 ${bg}`}
    >
      <FloralBackdrop faded={faded} />
      <div className="relative z-[1] mx-auto max-w-[1200px] px-6 min-[769px]:px-8 min-[1025px]:px-10">
        {children}
      </div>
    </section>
  );
}

/** h1 shared by both band variants (2.75rem → 2.25 → 2 → 1.5, line-height 1.15). */
function BandHeading({ title, dark }: { title: string; dark: boolean }) {
  return (
    <h1
      data-role="heading"
      data-payload-subfield="title"
      className={`mb-6 font-heading font-bold leading-[1.15] text-[1.5rem] min-[481px]:text-[2rem] min-[769px]:text-[2.25rem] min-[1025px]:text-[2.75rem] ${
        dark ? "text-white" : "text-neutral-900"
      }`}
      style={{ textWrap: "balance" } as React.CSSProperties}
    >
      {title}
    </h1>
  );
}

/* ── toprow variant (sage band: breadcrumb + h1 + drop-cap intro + floral) ── */

function ToprowHero({ title, body }: BlockProps) {
  const intro = lexicalToText(body) || undefined;
  return (
    <BandHero bg="bg-section-sage">
      <BandHeading title={title ?? ""} dark={false} />
      {intro && (
        <div className="content-intro">
          <p
            data-role="subheading"
            data-payload-subfield="body"
            className="has-drop-cap mb-0"
          >
            {intro}
          </p>
        </div>
      )}
    </BandHero>
  );
}

/* ── stats variant (cream/dark band: + horizontal stats bar) ─────────────── */

function StatsHero({ title, body, items, dark }: BlockProps & { dark: boolean }) {
  const intro = lexicalToText(body) || undefined;
  const stats = statsFrom(items);
  return (
    <BandHero bg={dark ? "bg-section-dark" : "bg-section-cream"} faded={dark}>
      <BandHeading title={title ?? ""} dark={dark} />
      {intro && (
        <div className="content-intro">
          <p
            data-role="subheading"
            data-payload-subfield="body"
            className={`has-drop-cap mb-0 ${dark ? "has-drop-cap--dark text-neutral-300" : ""}`}
          >
            {intro}
          </p>
        </div>
      )}
      {stats.length > 0 && (
        <div
          className={`mt-7 flex flex-col gap-4 border-t pt-7 min-[481px]:grid min-[481px]:grid-cols-2 min-[481px]:gap-6 min-[1025px]:flex min-[1025px]:flex-row min-[1025px]:justify-between ${
            dark ? "border-white/15" : "border-neutral-300"
          }`}
        >
          {stats.map((stat, i) => (
            <div key={`${stat.label}-${i}`} className="flex items-center gap-3.5">
              <div
                className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg min-[1025px]:h-11 min-[1025px]:w-11 min-[1025px]:rounded-[10px] ${
                  dark ? "bg-white/12 text-accent-light" : "bg-primary-light text-primary"
                }`}
              >
                <StatIcon slug={stat.icon} className="h-[18px] w-[18px] min-[1025px]:h-[22px] min-[1025px]:w-[22px]" />
              </div>
              <div className="flex flex-col">
                <span
                  data-payload-subfield="statValue"
                  className={`font-heading text-[22px] font-bold leading-[1.1] min-[481px]:text-[24px] min-[1025px]:text-[28px] ${
                    dark ? "text-white" : "text-primary"
                  }`}
                >
                  {stat.value}
                </span>
                <span
                  data-payload-subfield="statLabel"
                  className={`mt-0.5 text-base ${dark ? "text-neutral-300" : "text-neutral-500"}`}
                >
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </BandHero>
  );
}

/* ── Dispatcher ─────────────────────────────────────────────────────────── */

export function HeroBlock(props: BlockProps) {
  const { layout, dark, noMedia, search } = resolveVariant(
    props.settings?.variant,
    props.settings?.tone,
  );

  switch (layout) {
    case "video":
      return <VideoHero {...props} />;
    case "fullbleed":
      return <FullbleedHeroBlock {...props} noMedia={noMedia} search={search} />;
    case "split-stats":
      return <SplitStatsHero {...props} dark={dark} />;
    case "toprow":
      return <ToprowHero {...props} />;
    case "stats":
      return <StatsHero {...props} dark={dark} />;
    default:
      return <FullbleedHeroBlock {...props} noMedia={noMedia} search={search} />;
  }
}
