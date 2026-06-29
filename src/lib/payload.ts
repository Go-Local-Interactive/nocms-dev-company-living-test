/**
 * Payload CMS fetch helpers. Reads `PAYLOAD_BASE_URL` and `PAYLOAD_API_KEY`
 * from the environment (injected by the nocms preview manager and the
 * Cloudflare Pages build env).
 *
 * Calls return `[]` / `null` when env is missing or the request fails, so the
 * site builds even without Payload reachable. `generateStaticParams` callers
 * should treat an empty list as "no params yet" and fall through to the
 * placeholder branch.
 */

const BASE_URL = process.env.PAYLOAD_BASE_URL;
const API_KEY = process.env.PAYLOAD_API_KEY;

interface PayloadMedia {
  id: string;
  url?: string;
  filename?: string;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: Record<string, { url?: string; width?: number; height?: number }>;
}

/** A populated `categories`-collection relationship (depth ≥ 1) — or the raw
 *  id string when unpopulated. The collection's `useAsTitle` field is `name`
 *  (`title` kept as a tolerant alias for other sources). */
export interface PayloadCategory {
  name?: string;
  title?: string;
  slug?: string;
}

/** A populated post `author` — a small inline group / relationship. Treated as
 *  fully optional + depth-tolerant (string id when unpopulated). */
export interface PayloadAuthor {
  name?: string;
  role?: string;
  bio?: string;
  photo?: PayloadMedia | string | null;
}

export interface PayloadPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: PayloadMedia | string | null;
  content?: LexicalRoot;
  publishedAt?: string;
  /** Relationship to the `categories` collection (hasMany — the field is
   *  `categories`). Populated at depth ≥ 1; bare id strings otherwise. The
   *  first entry drives the post's displayed category. */
  categories?: (PayloadCategory | string)[] | null;
  /** Post author — name/role/bio/photo. Optional + depth-tolerant. */
  author?: PayloadAuthor | string | null;
  /** Explicit reading time in minutes (preferred over the estimate). */
  readingTime?: number | null;
  meta?: { title?: string; description?: string; indexable?: boolean };
  updatedAt: string;
}

/** A single CTA/link atom inside a block item (label + url + button style). */
export interface PayloadBlockLink {
  label?: string | null;
  url?: string | null;
  appearance?: "primary" | "secondary" | "outline" | "ghost" | "link" | null;
}

/** A repeated item inside a block's `items[]` array — the shape shared by the
 *  card/row/badge-style blocks (accreditation bar, care-level nav, etc.). */
export interface PayloadBlockItem {
  /** lucide slug / emoji — OR (content-blocks) the sub-block type. */
  icon?: string | null;
  /** heading / card title. */
  label?: string | null;
  /** prose / list (lexical). */
  text?: LexicalRoot | null;
  link?: PayloadBlockLink | null;
  media?: PayloadMedia | string | null;
}

/** Presentational settings carried on a block (variant, alignment, surface).
 *  `variant` selects the layout (e.g. the hero's `video|fullbleed|split-stats|
 *  toprow|stats`); `tone` is a light/dark modifier some variants honour
 *  (e.g. `split-stats` + `tone:"dark"`). The index signature keeps the read
 *  side tolerant of additional settings atoms added schema-side later. */
export interface PayloadBlockSettings {
  variant?: string | null;
  tone?: "light" | "dark" | null;
  align?: "left" | "center" | "right" | null;
  background?: "base" | "surface" | "dark" | "accent" | null;
  columns?: "2" | "3" | "4" | null;
  /** Per-page single-image override (string path/URL). Lets the seed set a
   *  page-specific image for single-image blocks (e.g. the hero bg, which
   *  differs per page in the GO design) without an uploaded media ref. A real
   *  uploaded `media` ref still wins; this is the next fallback before the
   *  in-code default. */
  image?: string | null;
  [k: string]: unknown;
}

/** Atomic block shape — every block on a Page is one of these. Fields are
 *  optional; each renderer reads only the subset it needs. Visual variants
 *  are distinguished by `blockType` (the slug) and resolved to a component
 *  via `src/components/blocks/registry.ts`. */
export interface PayloadAtomicBlock {
  id: string;
  blockType: string;
  blockName?: string | null;
  title?: string | null;
  body?: LexicalRoot | null;
  media?: PayloadMedia | string | null;
  mediaArray?: (PayloadMedia | string)[] | null;
  /** Repeated item array (badges, nav cards, …). */
  items?: PayloadBlockItem[] | null;
  /** Optional numeric rating (star-row blocks). */
  rating?: number | null;
  /** Presentational settings — `settings.variant` selects a layout/palette. */
  settings?: PayloadBlockSettings | null;
}

export interface PayloadPage {
  id: string;
  title: string;
  slug: string;
  blocks?: PayloadAtomicBlock[];
  content?: LexicalRoot;
  meta?: { title?: string; description?: string; indexable?: boolean };
  updatedAt: string;
}

export interface PayloadLocation {
  id: string;
  title: string;
  slug: string;
  locationType: "single" | "city" | "state";
  city?: string;
  state?: string;
  address?: {
    street?: string;
    unit?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
  coordinates?: [number, number];
  description?: LexicalRoot;
  parent?: PayloadLocation | string | null;
  meta?: { title?: string; description?: string; indexable?: boolean };
  updatedAt: string;
}

// Minimal Lexical shape — enough for the simple renderer in this template.
export interface LexicalNode {
  type: string;
  tag?: string;
  text?: string;
  format?: number | string;
  url?: string;
  listType?: "number" | "bullet" | "check";
  value?: number;
  fields?: { url?: string; newTab?: boolean };
  children?: LexicalNode[];
}
export interface LexicalRoot {
  root: { type: "root"; children: LexicalNode[] };
}

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  hasNextPage: boolean;
}

async function payloadFetch<T>(path: string): Promise<T | null> {
  if (!BASE_URL) return null;
  const url = `${BASE_URL.replace(/\/$/, "")}${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) headers.Authorization = `users API-Key ${API_KEY}`;
  try {
    // No caching. The live preview iframe re-loads after every CMS write —
    // that re-load is the only "trigger" we need. No tags, no /api/revalidate
    // route, no webhook from nocms. Static builds (`next build`) snapshot at
    // build time; a fresh deploy is the equivalent trigger there.
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Draft mode: in dev (the nocms preview), surface the latest drafts so edits
// made via the CMS panel show up on the next iframe reload — published-only
// fetches would lag a publish action. In production, fetch published docs.
const DRAFT_QS = process.env.NODE_ENV === "production" ? "" : "&draft=true";

export async function fetchPages(limit = 100): Promise<PayloadPage[]> {
  const res = await payloadFetch<PayloadListResponse<PayloadPage>>(
    `/cms/api/pages?limit=${limit}&depth=2${DRAFT_QS}`,
  );
  return res?.docs ?? [];
}

export async function fetchPageBySlug(slug: string): Promise<PayloadPage | null> {
  const res = await payloadFetch<PayloadListResponse<PayloadPage>>(
    `/cms/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=2${DRAFT_QS}`,
  );
  return res?.docs?.[0] ?? null;
}

export async function fetchPosts(limit = 50): Promise<PayloadPost[]> {
  // depth=2 so the `categories` / `author` relationships (and the author's photo)
  // populate for the blog card + article renderers.
  const res = await payloadFetch<PayloadListResponse<PayloadPost>>(
    `/cms/api/posts?limit=${limit}&depth=2&sort=-publishedAt${DRAFT_QS}`,
  );
  return res?.docs ?? [];
}

export async function fetchPostBySlug(slug: string): Promise<PayloadPost | null> {
  const res = await payloadFetch<PayloadListResponse<PayloadPost>>(
    `/cms/api/posts?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=2${DRAFT_QS}`,
  );
  return res?.docs?.[0] ?? null;
}

export async function fetchLocations(limit = 100): Promise<PayloadLocation[]> {
  const res = await payloadFetch<PayloadListResponse<PayloadLocation>>(
    `/cms/api/locations?limit=${limit}&depth=1&sort=title${DRAFT_QS}`,
  );
  return res?.docs ?? [];
}

export async function fetchLocationBySlug(slug: string): Promise<PayloadLocation | null> {
  const res = await payloadFetch<PayloadListResponse<PayloadLocation>>(
    `/cms/api/locations?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1${DRAFT_QS}`,
  );
  return res?.docs?.[0] ?? null;
}

export function mediaUrl(media: PayloadMedia | string | null | undefined): string | null {
  if (!media) return null;
  if (typeof media === "string") return media;
  return media.sizes?.feature?.url ?? media.sizes?.card?.url ?? media.url ?? null;
}

export function mediaAlt(media: PayloadMedia | string | null | undefined): string {
  if (!media || typeof media === "string") return "";
  return media.alt ?? media.filename ?? "";
}

/** Pull a list of media URLs from an atomic block's `mediaArray`. */
export function mediaArrayUrls(refs: (PayloadMedia | string)[] | null | undefined): { url: string; alt: string }[] {
  if (!refs) return [];
  return refs
    .map((m) => ({ url: mediaUrl(m), alt: mediaAlt(m) }))
    .filter((m): m is { url: string; alt: string } => Boolean(m.url));
}

/** Per-item image URLs from a block's `items[]` (one `{ url, alt }` per item,
 *  preserving index — items without media yield `null` so the i-th entry still
 *  lines up with the i-th item). */
export function mediaItemsUrls(
  items: PayloadBlockItem[] | null | undefined,
): ({ url: string; alt: string } | null)[] {
  if (!items) return [];
  return items.map((it) => {
    const url = mediaUrl(it.media);
    return url ? { url, alt: mediaAlt(it.media) } : null;
  });
}

/** Count the text-node words in a Lexical document. Walks the node tree the
 *  same way the renderer in `lexical-to-html.tsx` does, summing whitespace-
 *  split word counts of every `text` node. Used to estimate reading time when a
 *  post has no explicit `readingTime`. */
export function lexicalWordCount(root: LexicalRoot | null | undefined): number {
  if (!root?.root?.children?.length) return 0;
  let words = 0;
  const walk = (node: LexicalNode) => {
    if (node.type === "text" && typeof node.text === "string") {
      const t = node.text.trim();
      if (t) words += t.split(/\s+/).length;
    }
    node.children?.forEach(walk);
  };
  root.root.children.forEach(walk);
  return words;
}

/** Words-per-minute used for the reading-time estimate (industry-standard avg). */
const WORDS_PER_MINUTE = 200;

/** "N min read" label for a post. Prefers the explicit `readingTime` field;
 *  otherwise estimates from the body word count at ~200 wpm (min 1). */
export function readTimeLabel(post: PayloadPost): string {
  const explicit = typeof post.readingTime === "number" ? post.readingTime : null;
  const minutes =
    explicit && explicit > 0
      ? Math.round(explicit)
      : Math.max(1, Math.round(lexicalWordCount(post.content) / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

/** The post's primary category — the first entry of the hasMany `categories`
 *  relationship — or null when the post has none. */
function firstCategory(post: PayloadPost): PayloadCategory | string | null {
  const cats = post.categories;
  return Array.isArray(cats) && cats.length ? cats[0] ?? null : null;
}

/** Display label for a post's category — handles a populated relationship, a
 *  bare id/slug string, or an absent value (returns ""). */
export function categoryLabel(post: PayloadPost): string {
  const cat = firstCategory(post);
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  return cat.name ?? cat.title ?? cat.slug ?? "";
}

/** URL slug for a post's category. Handles populated relationship vs string vs
 *  absent. Falls back to a kebab-cased label when no explicit slug exists. */
export function categorySlug(post: PayloadPost): string {
  const cat = firstCategory(post);
  if (!cat) return "";
  if (typeof cat === "string") return slugify(cat);
  if (cat.slug) return cat.slug;
  const label = cat.name ?? cat.title;
  return label ? slugify(label) : "";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Shape consumed by `<BlogCard />` and the blog routes. All display-ready. */
export interface BlogCardPost {
  /** Post doc-id — the card needs it for the posts editor contract. */
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  coverImage?: { src: string; alt: string };
  /** Resolved category label (empty when absent). */
  category?: string;
  /** Resolved author summary (omitted when the post has no author). */
  author?: { name: string; role?: string; photoSrc?: string; photoAlt?: string };
  /** "N min read" label. */
  readTime: string;
}

export function toCardPost(post: PayloadPost): BlogCardPost {
  const cover = mediaUrl(post.featuredImage);
  const label = categoryLabel(post);

  let author: BlogCardPost["author"];
  const rawAuthor = post.author;
  if (rawAuthor && typeof rawAuthor !== "string" && rawAuthor.name) {
    const photoSrc = mediaUrl(rawAuthor.photo);
    author = {
      name: rawAuthor.name,
      role: rawAuthor.role || undefined,
      photoSrc: photoSrc || undefined,
      photoAlt: photoSrc ? mediaAlt(rawAuthor.photo) || rawAuthor.name : undefined,
    };
  }

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    publishedAt: post.publishedAt ?? post.updatedAt,
    coverImage: cover ? { src: cover, alt: mediaAlt(post.featuredImage) || post.title } : undefined,
    category: label || undefined,
    author,
    readTime: readTimeLabel(post),
  };
}

/** A category entry for the data-driven `<BlogSidebar />`. */
export interface BlogCategory {
  slug: string;
  label: string;
  count: number;
}

/** Derive the sidebar category list from the posts themselves (data-driven —
 *  no hardcoded list). Returns an "All Categories" entry first (count = all
 *  posts), then one entry per distinct category in first-seen order, each with
 *  its post count. Posts without a category are ignored for the per-category
 *  entries but still counted in "All". */
export function deriveCategories(posts: PayloadPost[]): BlogCategory[] {
  const map = new Map<string, BlogCategory>();
  for (const post of posts) {
    const slug = categorySlug(post);
    const label = categoryLabel(post);
    if (!slug || !label) continue;
    const existing = map.get(slug);
    if (existing) existing.count += 1;
    else map.set(slug, { slug, label, count: 1 });
  }
  return [{ slug: "all", label: "All Categories", count: posts.length }, ...map.values()];
}
