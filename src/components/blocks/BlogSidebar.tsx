"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search, AlignLeft, ChevronDown } from "lucide-react";
import { BlogControls } from "./BlogControls";
import type { BlogCategory } from "@/lib/payload";

/**
 * BlogSidebar — the Golden Oaks blog/resource sidebar (ports
 * `blog-sidebar.html`): three sections — Search, Sort By, and a data-driven
 * "Browse by Category" nav. Categories come from `deriveCategories(posts)`
 * (NOT a hardcoded list), so swapping posts in Payload re-populates the list.
 *
 * Query state from the URL (client): the active category, sort, and search
 * default are read from `useSearchParams`, NOT props — because the template
 * builds with `output: "export"`, which can't read `searchParams` on the
 * server. Clicking a `?category=` link is a client-side same-page nav; this
 * re-reads the params so the active highlight + form values track the URL with
 * no server round-trip (the sibling `BlogGrid`/`BlogArchiveList` islands
 * re-filter the same way). `activeSlug`/`sort`/`query` props remain as SSR /
 * no-JS fallbacks until hydration.
 *
 * Functional WITHOUT JS:
 *   - Category links are real `<a href="{basePath}?category={slug}">`s. The
 *     "All" entry links back to `basePath`.
 *   - Search + Sort live in one GET `<form action={basePath}>` (the
 *     `BlogControls` island): Enter in the search box submits; the visually-
 *     hidden submit applies the sort with no JS; with JS the select auto-submits.
 *   - The active `category` rides along as a hidden field so search/sort keep it.
 *
 * Presentational chrome — no editable fields / `data-role`. Token-only, so
 * flipping `--color-primary` re-tints the active category + focus rings.
 *
 * Responsive: ≤1024 the sidebar flips to a horizontal wrap bar (sections flex,
 * categories become rounded pill chips); ≤768 each section is full-width.
 */

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "az", label: "A — Z" },
] as const;

const ICON = "w-[18px] h-[18px] text-muted pointer-events-none";

// Shared input/select chrome (mockup .blog-sidebar-search input / select).
const FIELD =
  "w-full min-h-11 font-body text-base text-text bg-white border-2 border-neutral-300 rounded-[var(--radius)] outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-[3px] focus:ring-primary-light placeholder:text-muted";

export interface BlogSidebarProps {
  categories: BlogCategory[];
  /** Slug of the active category (defaults to "all"). */
  activeSlug?: string;
  /** Route the search/sort form posts to + category links hang off. */
  basePath?: string;
  /** Current sort value (preserved through the form). */
  sort?: string;
  /** Current search query (preserved through the form). */
  query?: string;
}

export function BlogSidebar({
  categories,
  activeSlug: activeSlugProp = "all",
  basePath = "/blog",
  sort: sortProp,
  query: queryProp,
}: BlogSidebarProps) {
  // URL params win over props once hydrated (static export reads them client-
  // side). Before hydration the props provide the SSR / no-JS fallback.
  const params = useSearchParams();
  const activeSlug = params.get("category") ?? activeSlugProp;
  const sort = params.get("sort") ?? sortProp;
  const query = params.get("q") ?? queryProp;

  return (
    <aside
      data-nocms-component="blog-sidebar"
      aria-label="Blog navigation"
      className="flex flex-col gap-8 min-[1025px]:sticky min-[1025px]:top-24 [@media(max-width:1024px)]:flex-row [@media(max-width:1024px)]:flex-wrap [@media(max-width:1024px)]:gap-4 [@media(max-width:1024px)]:pb-6 [@media(max-width:1024px)]:mb-8"
    >
      {/* keying on the query resets the uncontrolled search/sort inputs to the
          current URL after a same-page navigation. */}
      <BlogControls action={basePath} key={`${activeSlug}|${sort ?? ""}|${query ?? ""}`}>
        {/* Preserve the active category when searching / sorting. */}
        {activeSlug && activeSlug !== "all" && (
          <input type="hidden" name="category" value={activeSlug} />
        )}

        {/* Search */}
        <div className="flex flex-col gap-3 [@media(max-width:1024px)]:flex-1 [@media(max-width:1024px)]:min-w-[200px] [@media(max-width:768px)]:min-w-full">
          <span className="text-base font-semibold text-muted uppercase tracking-wide" data-role="text">
            Search
          </span>
          <div className="relative">
            <Search className={`${ICON} absolute left-3.5 top-1/2 -translate-y-1/2`} strokeWidth={2} aria-hidden="true" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search articles..."
              aria-label="Search articles"
              className={`${FIELD} py-3.5 pl-11 pr-4`}
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="flex flex-col gap-3 [@media(max-width:1024px)]:flex-1 [@media(max-width:1024px)]:min-w-[200px] [@media(max-width:768px)]:min-w-full">
          <span className="text-base font-semibold text-muted uppercase tracking-wide" data-role="text-2">
            Sort By
          </span>
          <div className="relative">
            <AlignLeft className={`${ICON} absolute left-3.5 top-1/2 -translate-y-1/2`} strokeWidth={2} aria-hidden="true" />
            <select
              name="sort"
              defaultValue={sort ?? "recent"}
              aria-label="Sort articles"
              className={`${FIELD} appearance-none cursor-pointer py-3.5 pl-11 pr-10`}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4 text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* No-JS fallback: apply search/sort without the auto-submit island. */}
        <button type="submit" className="sr-only" data-role="text-3">
          Apply filters
        </button>
      </BlogControls>

      {/* Browse by Category */}
      <div className="flex flex-col gap-3 [@media(max-width:1024px)]:basis-full [@media(max-width:1024px)]:flex-1 [@media(max-width:768px)]:min-w-full">
        <span className="text-base font-bold text-primary mb-2 [@media(max-width:1024px)]:mb-0" data-role="text-4">
          Browse by Category
        </span>
        <nav
          aria-label="Article categories"
          className="flex flex-col gap-0 [@media(max-width:1024px)]:flex-row [@media(max-width:1024px)]:flex-wrap [@media(max-width:1024px)]:gap-2"
        >
          {categories.map((cat) => {
            const active = cat.slug === activeSlug;
            const href = cat.slug === "all" ? basePath : `${basePath}?category=${cat.slug}`;
            return (
              <a
                key={cat.slug}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  // base list-link (desktop): left-border indicator
                  "flex items-center min-h-11 px-3 py-2.5 text-base no-underline border-l-[3px] rounded-r-[4px] transition-[color,border-color,background]",
                  // ≤1024 pill-chip form: drop the left border, become a rounded chip
                  "[@media(max-width:1024px)]:border-l-0 [@media(max-width:1024px)]:rounded-full [@media(max-width:1024px)]:px-4 [@media(max-width:1024px)]:py-2 [@media(max-width:1024px)]:border-2",
                  active
                    ? // active: list = primary-light bg + left primary border; chip = primary border
                      "text-primary-dark font-bold border-l-primary bg-primary-light [@media(max-width:1024px)]:border-primary"
                    : // idle: hover tints to primary/sage (list) or primary border (chip)
                      "text-neutral-700 border-l-transparent hover:text-primary hover:bg-section-sage hover:border-l-primary-light [@media(max-width:1024px)]:border-neutral-300 [@media(max-width:1024px)]:hover:border-primary [@media(max-width:1024px)]:hover:bg-transparent",
                ].join(" ")}
              >
                {cat.label}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
