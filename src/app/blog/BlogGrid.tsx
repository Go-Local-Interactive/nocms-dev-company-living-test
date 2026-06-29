"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { BlogCard } from "@/components/blocks/BlogCard";
import {
  filterSortCardItems,
  normalizeSort,
  type BlogCardItem,
} from "@/lib/blog";

/**
 * BlogGrid — the landing page's filterable post grid (client island).
 *
 * Static export (`output: "export"`) can't read `searchParams` on the server,
 * so this island reads them via `useSearchParams` (wrapped in <Suspense> by the
 * page). That triggers Next's static CSR bailout: the grid CARDS hydrate
 * client-side and are NOT in the initial static HTML. The crawl/edit-critical
 * surface IS server-rendered — the featured-post card on /blog and every
 * /blog/<slug> article page (statically generated) — so crawlers still reach
 * every post via its canonical URL. See the "P9 SEO note" in the schema-batch
 * doc for the accepted trade-off / the server-render-then-filter follow-up.
 * The sidebar's category links / search-sort form are real `?category=&sort=&q=`
 * URLs (no-JS navigable); on a same-page nav this re-reads `useSearchParams` and
 * re-filters with no server round-trip — so the `?category/?sort/?q` contract
 * holds in a static build.
 *
 * Each card spreads its posts doc-id attrs (on the serialized item) so
 * click-to-edit works once hydrated (the nocms inspector reads the live DOM).
 */
export function BlogGrid({
  items,
  featuredId,
}: {
  items: BlogCardItem[];
  featuredId?: string;
}) {
  const params = useSearchParams();
  const category = params.get("category") ?? "all";
  const q = params.get("q") ?? undefined;
  const sort = normalizeSort(params.get("sort") ?? undefined);

  const isDefaultView = category === "all" && !q?.trim() && sort === "recent";
  const filtered = filterSortCardItems(items, { category, sort, q });
  const gridItems = isDefaultView
    ? filtered.filter((it) => it.card.id !== featuredId)
    : filtered;

  if (gridItems.length === 0) {
    return <p className="text-base text-muted">No articles match your filters.</p>;
  }

  return (
    <div className="grid gap-8 min-[769px]:grid-cols-2 [@media(max-width:768px)]:gap-6">
      {gridItems.map((it) => (
        <BlogCard
          key={it.card.id}
          post={it.card}
          variant="default"
          docAttrs={it.docAttrs}
        />
      ))}
    </div>
  );
}
