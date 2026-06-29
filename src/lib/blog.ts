/**
 * Blog view-logic helpers — shared by the blog-landing (`/blog`) and
 * blog-archive (`/blog/archive`) routes so their filter/sort/paginate behavior
 * stays identical. Pure functions over `PayloadPost[]` (server-side, SSR- and
 * static-export-safe): the routes read the `?category` / `?sort` / `?q` /
 * `?page` URL params and pass them through here.
 *
 * Data layer (fetch + card mapping) lives in `payload.ts`; this module is the
 * presentational filtering on top of it.
 */

import {
  categorySlug,
  lexicalWordCount,
  toCardPost,
  type BlogCardPost,
  type PayloadPost,
} from "./payload";

/** Sort vocabulary mirrored by `<BlogSidebar />`'s Sort-By select. */
export type BlogSort = "recent" | "popular" | "az";

/** The URL-param contract for the blog list routes. All optional; absent =
 *  defaults (all categories, most-recent, no query, page 1). `searchParams`
 *  values arrive as `string | string[] | undefined` from Next, so the routes
 *  normalize to the first string before calling in. */
export interface BlogQuery {
  category?: string;
  sort?: BlogSort;
  q?: string;
}

/** Default number of archive cards per page (mockup Load-More slice). */
export const ARCHIVE_PAGE_SIZE = 9;

/** Normalize a Next `searchParams` entry (`string | string[] | undefined`) to a
 *  single trimmed string (first value), or undefined. */
export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/** Coerce a raw `?sort` value to the known vocabulary (defaults to "recent"). */
export function normalizeSort(value: string | undefined): BlogSort {
  return value === "popular" || value === "az" ? value : "recent";
}

/** Coerce a raw `?page` value to a 1-based positive integer (defaults to 1). */
export function normalizePage(value: string | undefined): number {
  const n = value ? Number.parseInt(value, 10) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * Filter + sort a post list by the URL-param query. Returns a NEW array (never
 * mutates the input) so the caller can still index back into the original for
 * doc-id attrs if it maps in lockstep.
 *
 *   - `category`: keep posts whose `categorySlug` matches (skip when absent or
 *     "all").
 *   - `q`: case-insensitive substring match on title + excerpt.
 *   - `sort`: `recent` (newest first — the fetch default), `az` (title A→Z), or
 *     `popular` (no popularity field exists yet, so it falls back to recent —
 *     keeps the option wired for when a metric lands without a code change).
 */
export function filterSortPosts(
  posts: PayloadPost[],
  query: BlogQuery = {},
): PayloadPost[] {
  const category = query.category && query.category !== "all" ? query.category : null;
  const q = query.q?.toLowerCase().trim() || null;
  const sort = normalizeSort(query.sort);

  let out = posts.filter((post) => {
    if (category && categorySlug(post) !== category) return false;
    if (q) {
      const haystack = `${post.title} ${post.excerpt ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // `fetchPosts` already returns newest-first, so `recent`/`popular` keep order.
  if (sort === "az") {
    out = [...out].sort((a, b) => a.title.localeCompare(b.title));
  } else {
    out = [...out];
  }
  return out;
}

/**
 * A fully-serialized card item — everything the client filter + `<BlogCard />`
 * need, with NO non-serializable Payload internals. Built server-side by
 * `toCardItem` so the client islands (which do the actual `?category/?sort/?q/
 * ?page` filtering, required because `output: "export"` can't read
 * `searchParams` on the server) can re-filter the already-rendered list with no
 * server round-trip while keeping the URL-param contract + editor doc-ids.
 */
export interface BlogCardItem {
  card: BlogCardPost;
  /** Slug used to match `?category=`. */
  categorySlug: string;
  /** Lower-cased "title + excerpt" haystack for `?q=`. */
  search: string;
  /** publishedAt as an epoch ms for the recent/popular sort. */
  publishedTs: number;
  /** Doc-identity attrs for the editor contract (spread on the card). */
  docAttrs: Record<string, string>;
}

/** Build the serializable card item for a post (server-side). */
export function toCardItem(post: PayloadPost): BlogCardItem {
  const card = toCardPost(post);
  return {
    card,
    categorySlug: categorySlug(post),
    search: `${post.title} ${post.excerpt ?? ""}`.toLowerCase(),
    publishedTs: Date.parse(card.publishedAt) || 0,
    docAttrs: {
      "data-payload-collection": "posts",
      "data-payload-doc-id": String(post.id),
    },
  };
}

/** Client-safe filter/sort over the serialized card items — mirrors
 *  `filterSortPosts` exactly but works on the primitives precomputed in
 *  `toCardItem`, so it runs in a `"use client"` island. */
export function filterSortCardItems(
  items: BlogCardItem[],
  query: BlogQuery = {},
): BlogCardItem[] {
  const category = query.category && query.category !== "all" ? query.category : null;
  const q = query.q?.toLowerCase().trim() || null;
  const sort = normalizeSort(query.sort);

  let out = items.filter((it) => {
    if (category && it.categorySlug !== category) return false;
    if (q && !it.search.includes(q)) return false;
    return true;
  });

  if (sort === "az") {
    out = [...out].sort((a, b) => a.card.title.localeCompare(b.card.title));
  } else {
    // recent / popular: newest first (fetch order is newest-first already; sort
    // defensively in case the client list order differs).
    out = [...out].sort((a, b) => b.publishedTs - a.publishedTs);
  }
  return out;
}

/** Estimate a post's reading minutes (for word-count driven UIs). Mirrors the
 *  `readTimeLabel` math without the label so callers can compare numbers. */
export function readingMinutes(post: PayloadPost): number {
  const explicit = typeof post.readingTime === "number" ? post.readingTime : null;
  if (explicit && explicit > 0) return Math.round(explicit);
  return Math.max(1, Math.round(lexicalWordCount(post.content) / 200));
}

/** Pick the featured post for the landing hero: the first post flagged
 *  `featured` if the schema ever adds one, else the most-recent (index 0 of the
 *  newest-first fetch). Returns `null` for an empty list. */
export function pickFeatured(posts: PayloadPost[]): PayloadPost | null {
  return posts[0] ?? null;
}

/** Same-category related posts for an article (fallback: most-recent), excluding
 *  the current post, capped at `limit`. */
export function relatedPosts(
  current: PayloadPost,
  all: PayloadPost[],
  limit = 3,
): PayloadPost[] {
  const others = all.filter((p) => p.id !== current.id);
  const slug = categorySlug(current);
  const sameCategory = slug
    ? others.filter((p) => categorySlug(p) === slug)
    : [];
  const pool = sameCategory.length >= limit ? sameCategory : [...sameCategory, ...others.filter((p) => !sameCategory.includes(p))];
  return pool.slice(0, limit);
}
