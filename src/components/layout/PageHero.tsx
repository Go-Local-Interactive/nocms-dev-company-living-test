"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Search } from "lucide-react";
import { FullbleedHero, type BreadcrumbItem } from "./FullbleedHero";

interface HeroCta {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

interface PageHeroProps {
  /** Old variant vocabulary, mapped onto the shared fullbleed/video hero:
   *  `image`→fullbleed · `simple`→fullbleed-no-media · `search`→fullbleed+search ·
   *  `video`→video backdrop. */
  variant?: "video" | "search" | "image" | "simple";
  title: string;
  subtitle?: string;
  ctas?: HeroCta[];
  breadcrumb?: BreadcrumbItem[];
  backgroundImage?: string;
  videoSrcs?: string[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

/**
 * Interior-page header chrome. Delegates the full-bleed image + overlay + h1 +
 * tagline + scroll-cue to the shared `<FullbleedHero>` so it renders DOM
 * identical to `HeroBlock`'s `fullbleed` variant. Adds the route-supplied
 * extras (CTAs, search form, optional video backdrop) as children.
 *
 * This is chrome, not a block — its root keeps `data-nocms-component=
 * "layout/page-hero"` and it does NOT carry `data-payload-subfield`s (the
 * inner fullbleed markup is shared but the editable wiring is block-only).
 */
export function PageHero({
  variant = "image",
  title,
  subtitle,
  ctas = [],
  breadcrumb,
  // GO default hero bg (matches HeroBlock's in-code `HERO_DEFAULT_IMAGE`). A
  // caller-supplied `backgroundImage` (e.g. a page-specific hero) overrides it.
  backgroundImage = "/golden-oaks/hero-garden.jpg",
  videoSrcs = [],
  searchPlaceholder = "Search our community...",
  onSearch,
}: PageHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isSimple = variant === "simple";
  const isVideo = variant === "video";
  const isSearch = variant === "search";

  useEffect(() => {
    if (!isVideo || videoSrcs.length === 0) return;
    const el = videoRef.current;
    if (!el) return;
    el.src = videoSrcs[0];
    el.load();
    el.play().then(() => setVideoReady(true)).catch(() => {});
  }, [isVideo, videoSrcs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <section
      data-nocms-component="layout/page-hero"
      className={`relative flex w-full items-center justify-center overflow-hidden text-center text-white h-[380px] min-[481px]:h-[450px] min-[769px]:h-[600px] ${
        isSimple ? "bg-primary" : ""
      }`}
    >
      {isVideo && videoSrcs.length > 0 && (
        <video
          ref={videoRef}
          className={`absolute left-1/2 top-1/2 z-[1] hidden h-auto min-h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 md:block motion-reduce:hidden ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          muted
          playsInline
          loop
          aria-hidden="true"
        />
      )}

      <FullbleedHero
        title={title}
        subtitle={subtitle}
        image={backgroundImage}
        breadcrumb={breadcrumb}
        noMedia={isSimple}
        showScrollCue={!isSearch}
      >
        {isSearch && (
          <form onSubmit={handleSearch} className="mx-auto mb-8 max-w-xl">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg bg-white py-4 pl-12 pr-4 text-base text-text shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Search"
              />
            </div>
          </form>
        )}

        {ctas.length > 0 && (
          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {ctas.map((cta) => (
              <a
                key={cta.href}
                href={cta.href}
                className={`btn ${cta.variant === "secondary" ? "btn-outline" : "btn-secondary"}`}
              >
                {cta.label}
                {cta.variant !== "secondary" && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
              </a>
            ))}
          </div>
        )}
      </FullbleedHero>
    </section>
  );
}
