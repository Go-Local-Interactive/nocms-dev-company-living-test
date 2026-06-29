"use client";

import * as React from "react";
import type { BlockProps } from "./types";
import { lexicalToText } from "./Lexical";
import { skinConfig } from "@/lib/skin";

/** SearchResultsBlock — the Golden Oaks `search-results`: the site-search
 *  results page (`pages/search-results.html`). A sage search-header band
 *  (centered h1 + subtitle + a rounded search input bar with a primary
 *  magnifier submit and a stubbed auto-suggest dropdown) sits above the
 *  results area (`max-w` container): an optional "did-you-mean" banner, a meta
 *  row (results count + content-type filter chips: page/blog/faq/floorplan),
 *  the results list (each card = 120×80 thumb + a color-coded type pill + serif
 *  title link + 2-line excerpt + url), a "Load More" button, AND a no-results
 *  state (icon circle + message + popular-links grid + a phone CTA from
 *  `skinConfig.contactPhone`).
 *
 *  GRACEFUL DEGRADATION (non-negotiable): the search bar is a real GET `<form>`
 *  (action `/search`) so a no-JS visitor can still submit a query. JS layers
 *  the controlled input, the auto-suggest, and the client-side filter chips on
 *  top — without JS the full fixture renders and every result/popular link is a
 *  reachable `<a>`.
 *
 *  DATA: renders from a `results` array (default = the GO fixture below). The
 *  filter chips narrow the in-memory list by `type` (client `useState`); the
 *  input is controlled but SEARCH EXECUTION is out of scope — wiring the query
 *  to a backend / `?q=` search index is the consumer's hook (see the
 *  SEARCH-HOOK comment in `onSubmit`; default renders the fixture, or the
 *  no-results state when the active filter matches nothing).
 *
 *  Editor contract: root `data-nocms-component="search-results"`; h1/subtitle
 *  carry `data-role` + `data-payload-subfield`; result cards carry
 *  `data-array-index={i}`.
 *
 *  Token-only colors: header `bg-section-sage`, active chip `bg-primary/10
 *  text-primary border-primary`, type pills page=`text-primary bg-primary/10`,
 *  blog=`text-secondary bg-secondary/15`, faq=`text-accent bg-accent/10`,
 *  floorplan=`text-text bg-sand`. The `--color-primary` flip re-themes the
 *  lot. */

const DEFAULT_HEADING = "Search Golden Oaks";
const DEFAULT_SUBTITLE =
  "Find information about our community, services, and resources.";

const DEFAULT_QUERY = "senior living";

/** How many results show before "Load More". */
const INITIAL_VISIBLE = 6;

export type SearchResultType = "page" | "blog" | "faq" | "floorplan";

export interface SearchResult {
  type: SearchResultType;
  /** Pill label, e.g. "Page" / "Floor Plan". */
  typeLabel: string;
  title: string;
  excerpt: string;
  url: string;
  href: string;
  /** Thumbnail src (under public/); omit for the thumbless FAQ cards. */
  thumb?: string;
  thumbAlt?: string;
}

/** Filter chips (mockup `.search-filter-chip`), in bar order. */
const FILTERS: Array<{ value: "" | SearchResultType; label: string }> = [
  { value: "", label: "All" },
  { value: "page", label: "Pages" },
  { value: "blog", label: "Blog" },
  { value: "faq", label: "FAQ" },
  { value: "floorplan", label: "Floor Plans" },
];

/** Type-pill token classes (mockup `.search-result-type--*` color coding).
 *  Per spec: page=primary, blog=secondary, faq=accent, floorplan=text on sand. */
const TYPE_PILL: Record<SearchResultType, string> = {
  page: "text-primary bg-primary/10",
  blog: "text-secondary bg-secondary/15",
  faq: "text-accent bg-accent/10",
  floorplan: "text-text bg-sand",
};

/** The GO default fixture (mockup's 12 result cards). */
const DEFAULT_RESULTS: SearchResult[] = [
  {
    type: "page",
    typeLabel: "Page",
    title: "Amenities & Services",
    excerpt:
      "Discover the full range of amenities available to our residents — from our farm-to-table dining program and wellness center to creative arts studios and beautifully landscaped gardens.",
    url: "goldenoaks.com/amenities-services",
    href: "/amenities",
    thumb: "/golden-oaks/life-community.jpg",
  },
  {
    type: "blog",
    typeLabel: "Blog",
    title: "7 Signs It May Be Time to Consider Senior Living",
    excerpt:
      "Recognizing when a loved one needs more support isn't always easy. Here are seven meaningful indicators that it may be time to explore senior living options.",
    url: "goldenoaks.com/blog/signs-time-for-senior-living",
    href: "/blog/signs-time-for-senior-living",
    thumb: "/golden-oaks/resource-guide.jpg",
  },
  {
    type: "faq",
    typeLabel: "FAQ",
    title: "What is included in the monthly cost?",
    excerpt:
      "Our all-inclusive monthly fee covers your residence, three daily meals, housekeeping, utilities, scheduled transportation, social programming, and access to all community amenities.",
    url: "goldenoaks.com/faq#monthly-cost",
    href: "/faq",
  },
  {
    type: "floorplan",
    typeLabel: "Floor Plan",
    title: "The Magnolia — 2 Bedroom Suite",
    excerpt:
      "Our most spacious option at 850 sq ft, featuring two bedrooms, a full kitchen, walk-in closets, and a private balcony overlooking the courtyard gardens.",
    url: "goldenoaks.com/floor-plans/magnolia",
    href: "/floor-plans/magnolia",
    thumb: "/golden-oaks/hero-floorplans.jpg",
  },
  {
    type: "page",
    typeLabel: "Page",
    title: "Memory Care Services",
    excerpt:
      "Our memory care neighborhood provides specialized support for residents living with Alzheimer's disease and other forms of dementia in a safe, nurturing environment.",
    url: "goldenoaks.com/memory-care",
    href: "/memory-care",
    thumb: "/golden-oaks/why-care.jpg",
  },
  {
    type: "blog",
    typeLabel: "Blog",
    title: "Understanding Medicare Coverage for Senior Living",
    excerpt:
      "Navigating Medicare benefits for senior living can be confusing. This guide breaks down what's covered, what isn't, and alternative funding options for families.",
    url: "goldenoaks.com/blog/medicare-coverage-guide",
    href: "/blog/medicare-coverage-guide",
    thumb: "/golden-oaks/care-health.jpg",
  },
  {
    type: "page",
    typeLabel: "Page",
    title: "Dining at Golden Oaks",
    excerpt:
      "Our culinary team prepares three chef-crafted meals daily using locally sourced ingredients, with menus that accommodate dietary needs and personal preferences.",
    url: "goldenoaks.com/dining",
    href: "/dining",
    thumb: "/golden-oaks/life-dining.jpg",
  },
  {
    type: "faq",
    typeLabel: "FAQ",
    title: "Can I bring my own furniture and belongings?",
    excerpt:
      "Yes — we encourage residents to bring furniture, photos, and personal items that make their new home feel familiar and comfortable. Our team can help with space planning.",
    url: "goldenoaks.com/faq#personal-belongings",
    href: "/faq",
  },
  {
    type: "blog",
    typeLabel: "Blog",
    title: "How to Talk to a Parent About Senior Living",
    excerpt:
      "Starting the conversation about senior living can feel daunting. Our guide offers compassionate, practical advice for approaching this important family discussion.",
    url: "goldenoaks.com/blog/talking-to-parents",
    href: "/blog/talking-to-parents",
    thumb: "/golden-oaks/life-fitness.jpg",
  },
  {
    type: "floorplan",
    typeLabel: "Floor Plan",
    title: "The Dogwood — 1 Bedroom Apartment",
    excerpt:
      "A comfortable 620 sq ft one-bedroom layout with an open-concept living area, full kitchen, generous closet space, and a sunny reading nook by the window.",
    url: "goldenoaks.com/floor-plans/dogwood",
    href: "/floor-plans/dogwood",
    thumb: "/golden-oaks/hero-floorplans.jpg",
  },
  {
    type: "page",
    typeLabel: "Page",
    title: "Our Care Philosophy",
    excerpt:
      "At Golden Oaks, we believe every resident deserves personalized attention. Our person-centered approach puts individual needs, preferences, and life history at the heart of everything we do.",
    url: "goldenoaks.com/about/care-philosophy",
    href: "/about/care-philosophy",
    thumb: "/golden-oaks/life-community.jpg",
  },
  {
    type: "faq",
    typeLabel: "FAQ",
    title: "What levels of care do you offer?",
    excerpt:
      "We offer three levels of care — independent living, assisted living, and memory care — so residents can age in place as their needs change over time.",
    url: "goldenoaks.com/faq#care-levels",
    href: "/faq",
  },
];

/** Stubbed auto-suggest rows (mockup `.search-suggest-item`). */
const SUGGESTIONS: Array<{ label: string; type: string; icon: React.ReactNode }> =
  [
    {
      label: "Senior living options",
      type: "Page",
      icon: (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </>
      ),
    },
    {
      label: "Senior living costs & pricing",
      type: "FAQ",
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </>
      ),
    },
    {
      label: "Signs it may be time for senior living",
      type: "Blog",
      icon: (
        <>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </>
      ),
    },
  ];

/** Popular links shown in the no-results state (mockup `.search-popular-link`). */
const POPULAR_LINKS: Array<{ label: string; href: string; icon: React.ReactNode }> =
  [
    {
      label: "Our Community",
      href: "/about-us",
      icon: (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </>
      ),
    },
    {
      label: "Care Options",
      href: "/living-options",
      icon: (
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      ),
    },
    {
      label: "Floor Plans",
      href: "/floor-plans",
      icon: (
        <>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </>
      ),
    },
    {
      label: "Pricing",
      href: "/request-pricing",
      icon: (
        <>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      ),
    },
    {
      label: "Schedule a Tour",
      href: "/schedule-tour",
      icon: (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      ),
    },
    {
      label: "Contact Us",
      href: "/contact-us",
      icon: (
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      ),
    },
  ];

function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`;
}

export function SearchResultsBlock({
  title,
  body,
  results = DEFAULT_RESULTS,
}: BlockProps & { results?: SearchResult[] }) {
  const heading = title || DEFAULT_HEADING;
  const subtitle = lexicalToText(body) || DEFAULT_SUBTITLE;

  const [query, setQuery] = React.useState(DEFAULT_QUERY);
  const [activeFilter, setActiveFilter] = React.useState<"" | SearchResultType>(
    "",
  );
  const [allLoaded, setAllLoaded] = React.useState(false);
  const [suggestOpen, setSuggestOpen] = React.useState(false);

  // The full list narrowed by the active type filter (mockup `data-type`).
  const matching = React.useMemo(
    () =>
      activeFilter
        ? results.filter((r) => r.type === activeFilter)
        : results,
    [results, activeFilter],
  );

  // What's actually rendered: capped at INITIAL_VISIBLE until "Load More".
  const visible = allLoaded ? matching : matching.slice(0, INITIAL_VISIBLE);
  const remaining = matching.length - visible.length;
  const noResults = matching.length === 0;

  const selectFilter = (value: "" | SearchResultType) => {
    setActiveFilter(value);
    setAllLoaded(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestOpen(false);
    // ── SEARCH HOOK ───────────────────────────────────────────────────
    // Presentational by default: execution is out of scope. A consumer wires
    // the query to their backend / search index here, e.g. navigate to
    //   `/search?q=${encodeURIComponent(query)}`
    // and render the returned hits into the `results` prop. The default build
    // renders the fixture (or the no-results state when a filter matches none).
    // ──────────────────────────────────────────────────────────────────
  };

  return (
    <section data-nocms-component="search-results">
      {/* Search header band */}
      <div className="bg-section-sage px-10 pb-10 pt-12 text-center [@media(max-width:768px)]:px-6 [@media(max-width:768px)]:pb-8 [@media(max-width:768px)]:pt-9">
        <div className="mx-auto max-w-[700px]">
          <h1
            data-role="heading"
            data-payload-subfield="title"
            className="mb-2 font-heading text-[2rem] font-bold leading-[1.2] text-neutral-900 [@media(max-width:768px)]:text-[1.65rem]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {heading}
          </h1>
          <p
            data-role="subheading"
            data-payload-subfield="body"
            className="mb-7 font-body text-lg text-neutral-500"
          >
            {subtitle}
          </p>

          <form
            role="search"
            action="/search"
            method="get"
            onSubmit={onSubmit}
            className="relative mx-auto max-w-[600px]"
          >
            <label htmlFor="search-input" className="sr-only">
              {heading}
            </label>
            <input
              type="search"
              id="search-input"
              name="q"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestOpen(e.target.value.length > 1);
              }}
              onFocus={() => setSuggestOpen(query.length > 1)}
              onBlur={() => window.setTimeout(() => setSuggestOpen(false), 150)}
              placeholder="What are you looking for?"
              aria-label={heading}
              autoComplete="off"
              className="box-border w-full rounded-[var(--radius)] border-2 border-neutral-300 bg-background py-4 pl-6 pr-14 font-body text-lg text-neutral-900 transition-[border-color,box-shadow] placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 [@media(max-width:768px)]:py-3.5 [@media(max-width:768px)]:pl-5 [@media(max-width:768px)]:pr-13 [@media(max-width:768px)]:text-base"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[calc(var(--radius)-4px)] border-0 bg-primary transition-colors hover:bg-primary-dark" data-role="cta"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Auto-suggest dropdown (stubbed — presentational only) */}
            {suggestOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-[var(--radius)] border border-neutral-300 bg-background text-left shadow-lg">
                {SUGGESTIONS.map((s) => (
                  <a
                    key={s.label}
                    href="/search"
                    className="flex items-center gap-3.5 border-b border-neutral-100 px-5 py-3.5 font-body text-base text-neutral-700 transition-colors last:border-b-0 hover:bg-section-sage"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-light">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-4 w-4 text-primary-dark"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {s.icon}
                      </svg>
                    </span>
                    <span className="flex-1">{s.label}</span>
                    <span className="font-body text-base font-medium text-neutral-500">
                      {s.type}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Results area */}
      <div className="mx-auto max-w-[900px] px-10 pb-20 [@media(max-width:768px)]:px-6 [@media(max-width:768px)]:pb-15">
        {/* Meta row: count + filter chips */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-300 pb-5 pt-6 [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:items-start">
          <div className="font-body text-base font-medium text-neutral-500">
            <strong className="text-neutral-900">{matching.length}</strong>{" "}
            {matching.length !== 1 ? "results" : "result"} for{" "}
            &ldquo;
            <strong className="text-neutral-900">{query || DEFAULT_QUERY}</strong>
            &rdquo;
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.value;
              return (
                <button
                  key={f.value || "all"}
                  type="button"
                  onClick={() => selectFilter(f.value)}
                  aria-pressed={isActive}
                  className={`rounded-[20px] border-2 px-4 py-1.5 font-body text-base font-semibold transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary-dark"
                      : "border-transparent bg-neutral-100 text-neutral-500 hover:bg-primary-light hover:text-primary-dark"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {noResults ? (
          /* No-results state */
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-section-sage">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-9 w-9 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h2 className="mb-3 font-heading text-2xl text-neutral-900" data-role="heading-2">
              We couldn&apos;t find a match
            </h2>
            <p className="mx-auto mb-9 max-w-[500px] font-body text-lg leading-[1.6] text-neutral-500" data-role="subheading-2">
              Try different keywords, check your spelling, or browse one of these
              popular pages:
            </p>
            <div className="mx-auto mb-10 grid max-w-[640px] grid-cols-3 gap-4 [@media(max-width:768px)]:grid-cols-2 [@media(max-width:480px)]:grid-cols-1">
              {POPULAR_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 rounded-[var(--radius)] border border-transparent bg-section-sage px-5 py-4 font-body text-base font-semibold text-neutral-900 transition-[border-color,box-shadow] hover:border-primary-light hover:shadow-md"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5 flex-shrink-0 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {link.icon}
                  </svg>
                  {link.label}
                </a>
              ))}
            </div>
            <p className="font-body text-lg text-neutral-700" data-role="subheading-3">
              Or give us a call — we&apos;re happy to help.
              {skinConfig.contactPhone && (
                <>
                  <br />
                  <a
                    href={telHref(skinConfig.contactPhone)}
                    className="font-bold text-primary-dark underline"
                  >
                    {skinConfig.contactPhone}
                  </a>
                </>
              )}
            </p>
          </div>
        ) : (
          <>
            {/* Results list */}
            <div data-payload-subfield="body" className="flex flex-col">
              {visible.map((r, i) => (
                <article
                  key={`${r.url}-${i}`}
                  data-array-index={i}
                  data-type={r.type}
                  className="flex items-start gap-5 border-b border-neutral-100 py-6 last:border-b-0 [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:gap-3"
                >
                  {r.thumb && (
                    <div className="h-20 w-[120px] min-w-[120px] flex-shrink-0 overflow-hidden rounded-[var(--radius)] bg-neutral-100 [@media(max-width:768px)]:h-40 [@media(max-width:768px)]:w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.thumb}
                        alt={r.thumbAlt || ""}
                        loading="lazy"
                        className="block h-full w-full object-cover" data-role="media"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span
                      className={`mb-2 inline-block rounded-[20px] px-3 py-0.5 font-body text-base font-semibold leading-[1.4] ${TYPE_PILL[r.type]}`}
                    >
                      {r.typeLabel}
                    </span>
                    <div className="mb-1.5 font-heading text-[1.15rem] font-bold leading-[1.3] text-neutral-900">
                      <a href={r.href} className="text-inherit hover:text-primary">
                        {r.title}
                      </a>
                    </div>
                    <p className="line-clamp-2 font-body text-base leading-[1.6] text-neutral-700" data-role="subheading-4">
                      {r.excerpt}
                    </p>
                    <span className="mt-1 block font-body text-base text-primary">
                      {r.url}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More */}
            {remaining > 0 && (
              <div className="pt-8 text-center">
                <button
                  type="button"
                  onClick={() => setAllLoaded(true)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-transparent bg-primary-light px-8 py-3 font-body text-lg font-semibold text-primary-dark transition-colors hover:bg-primary hover:text-white" data-role="cta-2"
                >
                  Show More Results ({remaining} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
