"use client";

import * as React from "react";

/** TabbedAccordion — the Golden Oaks `accordion` `tabbed` variant: the FAQ
 *  layout (mockup `components/tabbed-accordion/`, in situ on `pages/faq.html`).
 *  A sage pill tab bar ("All" + one tab per category) + an inline search input
 *  sit above a category-grouped accordion of `<details>`/`.ta-item` cards.
 *
 *  Selected by `AccordionBlock` when `settings.variant === "tabbed"`. The plain
 *  `accordion` (default) flat-list variant stays in `AccordionBlock`.
 *
 *  Behavior (mockup engine, ported): clicking a tab filters visible categories
 *  (`activeCategory`); typing in search filters items by question/answer
 *  substring AND disables the category tabs (forces "All"); a "no results"
 *  empty state shows when nothing matches. Arrow/Home/End keys move focus
 *  across tabs (`role="tablist"`/`role="tab"`/`aria-selected`).
 *
 *  GRACEFUL DEGRADATION (non-negotiable): the accordion cards are native
 *  `<details>/<summary>` — fully open-able with JS disabled. The tab bar +
 *  search ENHANCE; with no JS every item is still reachable (all categories
 *  render). No `max-height` measuring — the chevron rotates via `group-open:`.
 *
 *  OMITTED for v1 (follow-up): the fixed left-edge "What's On This Page" sticky
 *  page-menu sidebar — it's page chrome (not block content) and `display:none`
 *  ≤1024 anyway. The tab bar + search + accordion is the 1:1 core.
 *
 *  Token-only: tab bar `bg-section-sage`, active tab `bg-background text-primary
 *  shadow-sm`, search focus `border-primary ring-primary/15`, category heading
 *  `text-primary-dark border-primary-light`. The `--color-primary` flip
 *  re-themes the lot. */

export interface FaqCategory {
  /** Display label; "" renders as a single "All" group with no heading. */
  category: string;
  items: Array<{ q: string; a: string }>;
}

export function TabbedAccordion({
  categories,
  title,
  intro,
}: {
  categories: FaqCategory[];
  title?: string;
  intro?: string;
}) {
  // Tabs only exist when categories are actually labeled.
  const labeled = categories.filter((c) => c.category.trim().length > 0);
  const hasTabs = labeled.length > 0;

  const [activeCategory, setActiveCategory] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const tablistRef = React.useRef<HTMLDivElement>(null);

  const isSearching = query.trim().length > 0;
  const q = query.trim().toLowerCase();

  // Filter → the categories actually rendered, with their items narrowed by the
  // active tab + the search query (mockup `renderAccordion`).
  const visible: FaqCategory[] = React.useMemo(() => {
    return categories
      .map((group) => {
        const items = group.items.filter((it) => {
          if (!isSearching) return true;
          return (
            it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)
          );
        });
        return { category: group.category, items };
      })
      .filter((group) => {
        if (group.items.length === 0) return false;
        if (isSearching || activeCategory === "all") return true;
        return group.category === activeCategory;
      });
  }, [categories, activeCategory, isSearching, q]);

  const totalVisible = visible.reduce((n, g) => n + g.items.length, 0);

  const tabs = ["all", ...labeled.map((c) => c.category)];

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    const els = Array.from(
      tablistRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      ) ?? [],
    );
    const idx = els.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % els.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + els.length) % els.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = els.length - 1;
    else return;
    e.preventDefault();
    els[next]?.focus();
    els[next]?.click();
  };

  // Whether to show a category heading above a group (mockup: shown in "All" or
  // while searching, hidden when a single category is isolated).
  const showHeadings = isSearching || activeCategory === "all";

  return (
    <section
      data-nocms-component="accordion"
      className="bg-section-cream pb-20 [@media(max-width:480px)]:pb-12"
    >
      <div className="mx-auto max-w-[1200px] px-10 pt-16 [@media(max-width:768px)]:px-6 [@media(max-width:768px)]:pt-10 [@media(max-width:480px)]:pt-7">
        {(title || intro) && (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {title && (
              <h2
                data-role="heading"
                data-payload-subfield="title"
                className="font-heading text-4xl font-bold tracking-tight text-text sm:text-5xl"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                {title}
              </h2>
            )}
            {intro && (
              <p
                data-role="subheading"
                data-payload-subfield="body"
                className="mt-4 font-body text-lg leading-relaxed text-muted"
              >
                {intro}
              </p>
            )}
          </div>
        )}

        {/* Tab bar + inline search (sage pill bar). Search sits full-width above
            the tab strip ≤768. */}
        <div className="mb-14 flex items-center gap-1.5 rounded-[var(--radius)] border border-section-sage bg-section-sage p-1.5 [@media(max-width:768px)]:mb-10 [@media(max-width:768px)]:flex-col-reverse [@media(max-width:768px)]:items-stretch [@media(max-width:480px)]:mb-8">
          {hasTabs && (
            <div
              ref={tablistRef}
              role="tablist"
              aria-label="Content categories"
              onKeyDown={onTabKeyDown}
              className="flex min-w-0 flex-1 gap-1 [@media(max-width:768px)]:w-full [@media(max-width:768px)]:overflow-x-auto [@media(max-width:768px)]:[scrollbar-width:none] [@media(max-width:768px)]:[&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((cat) => {
                const isActive = isSearching
                  ? cat === "all"
                  : activeCategory === cat;
                const disabled = isSearching && cat !== "all";
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    disabled={disabled}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded px-3 py-3 text-base font-semibold transition-colors [@media(max-width:768px)]:flex-none ${
                      isActive
                        ? "bg-background font-bold text-primary shadow-sm"
                        : "bg-transparent text-neutral-700 hover:bg-background hover:text-primary-dark"
                    } ${disabled ? "pointer-events-none opacity-50" : ""}`}
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                );
              })}
            </div>
          )}

          <div className="relative w-[220px] flex-shrink-0 [@media(max-width:768px)]:mb-2 [@media(max-width:768px)]:w-full">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search content"
              className="min-h-11 w-full rounded border-2 border-neutral-300 bg-background px-10 py-2.5 font-body text-base text-neutral-900 outline-none transition-[border-color,box-shadow] placeholder:text-neutral-500 focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            {isSearching && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-1 top-1/2 flex h-9 w-9 min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-neutral-500 transition-colors hover:bg-section-sage hover:text-neutral-900"
              >
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <line x1="4" y1="4" x2="12" y2="12" />
                  <line x1="12" y1="4" x2="4" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Accordion content */}
        {totalVisible > 0 ? (
          <div
            data-payload-subfield="body"
            role="tabpanel"
          >
            {visible.map((group, gi) => (
              <div key={`${group.category}-${gi}`} className="mb-10 last:mb-0">
                {showHeadings && group.category && (
                  <h3 className="mb-5 border-b-2 border-primary-light pb-3 text-left font-heading text-2xl text-primary-dark [@media(max-width:768px)]:text-xl" data-role="heading-2">
                    {group.category}
                  </h3>
                )}
                <div className="flex flex-col gap-3">
                  {group.items.map((item, i) => (
                    <details
                      key={`${gi}-${i}`}
                      data-array-index={i}
                      className="group overflow-hidden rounded-[var(--radius)] border border-text/10 bg-background transition-[box-shadow,border-color] hover:border-primary/30 hover:shadow-md"
                    >
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-body text-lg font-semibold text-neutral-900 transition-colors hover:text-primary-dark [@media(max-width:768px)]:px-5 [@media(max-width:768px)]:py-4 [@media(max-width:768px)]:text-base">
                        <span>{item.q}</span>
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="h-5 w-5 flex-shrink-0 text-neutral-500 transition-transform duration-300 group-open:rotate-180 group-open:text-primary"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <p className="px-6 pb-6 font-body text-base leading-[1.7] text-neutral-700 [@media(max-width:768px)]:px-5 [@media(max-width:768px)]:pb-5" data-role="subheading-2">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center text-neutral-500">
            <svg
              viewBox="0 0 48 48"
              aria-hidden="true"
              className="mx-auto mb-4 h-12 w-12 text-neutral-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="24" cy="24" r="20" />
              <line x1="16" y1="24" x2="32" y2="24" />
            </svg>
            <p className="mb-2 text-lg text-neutral-700" data-role="subheading-3">
              No matching questions found.
            </p>
            <small className="text-base text-neutral-500" data-role="text">
              Try a different search term or browse by category.
            </small>
          </div>
        )}
      </div>
    </section>
  );
}
