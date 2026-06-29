"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BlogCard } from "@/components/blocks/BlogCard";
import {
  filterSortCardItems,
  normalizeSort,
  normalizePage,
  ARCHIVE_PAGE_SIZE,
  type BlogCardItem,
} from "@/lib/blog";

/**
 * BlogArchiveList — the archive's filtered, paginated post list (client island).
 *
 * Static export (`output: "export"`) can't read `searchParams` on the server,
 * so this island reads them via `useSearchParams` (wrapped in <Suspense>),
 * triggering Next's static CSR bailout — the archive list CARDS hydrate
 * client-side and are NOT in the initial static HTML. Per-post /blog/<slug>
 * article pages ARE statically generated, so crawlers reach every post via its
 * canonical URL (see the "P9 SEO note" in the schema-batch doc for the accepted
 * trade-off / follow-up). Pagination rides `?page=`: the list shows
 * `page * ARCHIVE_PAGE_SIZE` items and Load More is a real `<Link>` to `?page=N+1`
 * (a shareable, no-JS URL); with JS the same-page nav re-reads `useSearchParams`
 * and reveals the next slice. Filters (`?category/?sort/?q`) shared with the
 * sidebar via `filterSortCardItems`.
 *
 * Each card spreads its posts doc-id attrs (on the serialized item) so
 * click-to-edit works once hydrated (the nocms inspector reads the live DOM).
 */
export function BlogArchiveList({ items }: { items: BlogCardItem[] }) {
  const params = useSearchParams();
  const category = params.get("category") ?? "all";
  const q = params.get("q") ?? undefined;
  const sort = normalizeSort(params.get("sort") ?? undefined);
  const page = normalizePage(params.get("page") ?? undefined);

  const filtered = filterSortCardItems(items, { category, sort, q });
  const total = filtered.length;
  const shownCount = Math.min(page * ARCHIVE_PAGE_SIZE, total);
  const visible = filtered.slice(0, shownCount);
  const hasMore = shownCount < total;

  // Build the next-page href preserving the active filters.
  const nextParams = new URLSearchParams(params.toString());
  nextParams.set("page", String(page + 1));
  const nextHref = `/blog/archive?${nextParams.toString()}`;

  return (
    <div className="flex flex-col">
      <span className="mb-2 border-b-2 border-neutral-200 pb-4 text-base text-muted">
        Showing {shownCount} of {total}{" "}
        {total === 1 ? "article" : "articles"}
      </span>

      {total === 0 ? (
        <p className="py-8 text-base text-muted">
          No articles match your filters.
        </p>
      ) : (
        <div className="flex flex-col">
          {visible.map((it) => (
            <BlogCard
              key={it.card.id}
              post={it.card}
              variant="archive"
              docAttrs={it.docAttrs}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="pt-8 text-center">
          <Link
            href={nextHref}
            scroll={false}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-primary bg-transparent px-10 py-3.5 font-body text-lg font-semibold text-primary no-underline transition-[background,color,gap] hover:bg-primary hover:text-white [@media(max-width:480px)]:w-full"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
