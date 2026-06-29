import * as React from "react";
import { ScrollCue } from "./ScrollCue.client";

/**
 * Shared full-bleed interior-header hero (mockup `.hero-fullbleed` /
 * `independent-living.html .page-hero`). The SINGLE source of truth for the
 * fullbleed DOM — both the block renderer (`HeroBlock`'s `fullbleed` variant)
 * and the route chrome (`PageHero`) delegate here so they render pixel-identical.
 *
 * Token-only: the overlay reads `--color-hero-overlay-from-soft` / `-to`; text
 * is `text-white`; the scroll-cue + its animation come from `globals.css`.
 *
 * Editor wiring is opt-in via `editable` (the block renderer passes `true` so
 * the title/body/media carry `data-payload-subfield` + `data-role`; `PageHero`,
 * being chrome, passes `false`).
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface FullbleedHeroProps {
  title: string;
  subtitle?: string;
  /** Background photo URL. When omitted, the `simple`/no-media variant renders
   *  on the primary surface instead of a photo. */
  image?: string;
  imageAlt?: string;
  breadcrumb?: BreadcrumbItem[];
  /** Extra content rendered between the tagline and the scroll-cue (e.g. the
   *  search form or CTA buttons from `PageHero`). */
  children?: React.ReactNode;
  showScrollCue?: boolean;
  /** Text-only on the primary surface (no photo + overlay) — the `simple` alias. */
  noMedia?: boolean;
  /** Attach the block editor contract (`data-payload-subfield` + `data-role`). */
  editable?: boolean;
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-base" data-role="breadcrumb" data-nocms-component="fullbleed-hero">
      <ol className="m-0 flex flex-wrap items-center justify-center gap-0 p-0">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center">
              {i > 0 && (
                <span aria-hidden="true" className="mx-2 font-normal text-white/65" data-role="text">
                  /
                </span>
              )}
              {last || !item.href ? (
                <span aria-current="page" className="font-semibold text-white">
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className="text-white transition-colors hover:text-sand">
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function FullbleedHero({
  title,
  subtitle,
  image,
  imageAlt = "",
  breadcrumb,
  children,
  showScrollCue = true,
  noMedia = false,
  editable = false,
}: FullbleedHeroProps) {
  const sub = editable
    ? { "data-payload-subfield": "body", "data-role": "subheading" }
    : { "data-role": "subheading" };
  const head = editable
    ? { "data-payload-subfield": "title", "data-role": "heading" }
    : { "data-role": "heading" };

  return (
    <>
      {!noMedia && image && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={image}
          alt={imageAlt}
          {...(editable ? { "data-payload-subfield": "media", "data-role": "media" } : { role: "presentation" })}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          loading="eager" data-role="media"
        />
      )}
      {!noMedia && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[2]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-hero-overlay-from-soft) 0%, var(--color-hero-overlay-to) 100%)",
          }}
        />
      )}

      <div className="relative z-[3] mx-auto w-full max-w-[800px] px-10">
        {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
        <h1
          {...head}
          className="mb-4 font-heading font-bold leading-[1.1] text-white text-[2rem] min-[481px]:text-[2.5rem] min-[769px]:text-[3.5rem]"
          style={{ textWrap: "balance" } as React.CSSProperties} data-role="heading"
        >
          {title}
        </h1>
        {subtitle && (
          <p
            {...sub}
            className="mx-auto mb-12 max-w-[70ch] font-body font-light leading-relaxed text-white/95 text-base min-[769px]:text-xl" data-role="subheading"
          >
            {subtitle}
          </p>
        )}
        {children}
        {showScrollCue && <ScrollCue />}
      </div>
    </>
  );
}
