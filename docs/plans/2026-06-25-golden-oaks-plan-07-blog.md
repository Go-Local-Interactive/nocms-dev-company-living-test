# Golden Oaks Plan 07 — Blog

> **For Claude:** REQUIRED SUB-SKILL: gli-toolkit:subagent-driven-development. Read the roadmap
> `2026-06-25-golden-oaks-1to1-overview.md` (esp. **Cross-cutting requirements**) and
> `2026-06-25-golden-oaks-plan-00-design-system.md` FIRST — this plan depends on Plan 00's tokens,
> base patterns (`.section-light`, `.overline`, `.page-hero`, the button/card/shadow scale), media in
> `public/`, and the Playwright 1:1 audit harness (`scripts/go-audit.py`, mockup on `:8088`). **Do Plan 00 first.**
> Sequence-wise this plan is parallelizable with Plans 4/5/6 (all run after 2, before 8).

**Goal:** Make the blog render the Golden Oaks **Blog / Resource Center** design 1:1 (incl. responsiveness):
**blog-landing** (featured hero + sidebar + post grid), **blog-archive** (header + paginated list + sidebar),
**blog-article** (full-bleed article hero + article body + share rail + tags + author bio + related grid).
Build two new components — **BlogCard** (default / featured / compact / archive variants) and **BlogSidebar**
(search / sort / categories) — and **refine** the existing blog routes (`src/app/blog/page.tsx`,
`src/app/blog/[slug]/page.tsx`, + a new `src/app/blog/archive/page.tsx`) to render them from **Payload posts**
(data-driven, exactly like the storage template's blog). This is **refine-to-1:1 + fill gaps**, not greenfield —
the routes, `fetchPosts`/`fetchPostBySlug`, and `BlogCardPost`/`toCardPost` already exist in `src/lib/payload.ts`.

**Cross-cutting (NON-NEGOTIABLE — prove each in this plan's tasks):**
1. **Tokens only, no literals.** Every color/font/space/radius/shadow maps to a `--color-*` / `--font-*` /
   radius / shadow token from Plan 00 (`bg-section-light`, `text-primary`, `bg-primary-light`,
   `border-neutral-300`, `var(--radius)`, etc.). The mockup CSS hardcodes hex — translate to tokens. After this
   plan `grep -rnE "#[0-9a-fA-F]{6}" src/components/blocks/BlogCard.tsx src/components/blocks/BlogSidebar.tsx
   src/app/blog` finds **zero**. Flipping `--color-primary` must re-tint cards, tags, sidebar active state, links.
2. **Editable components (editor contract).** Posts come from the **posts** collection, so the page renderers
   attach the **post doc** identity per card/article — `data-nocms-component` on the root, plus
   `data-payload-collection="posts" data-payload-doc-id=<post.id>` and `data-payload-field` / `data-role` on each
   editable field (title, excerpt, featuredImage, content, publishedAt, category) via `payloadDocAttrs` /
   `payloadFieldAttrs` from `src/lib/payload-attrs.ts`. The **blog index header** (when seeded as a Page) renders
   through `RenderBlocks` and carries the `data-payload-block-*` attrs the dispatcher already adds. `BlogCard` /
   `BlogSidebar` are presentational and take the doc-id attrs from their caller (props spread), so a single card
   is click-to-edit in the inspector. Run `bun run lint:direct-edit` clean (every `data-role` resolves).
3. **Customizable (skin + variant).** Brand name/phone come from `skin.config`, never literals. **One** `BlogCard`
   with a `variant` prop (`"default" | "featured" | "compact" | "archive"`) — NOT four components — mirroring the
   mockup's single `renderBlogCard(article, variant)`. Categories/search are config/data-driven (derived from the
   posts' categories), not a hardcoded list. Golden Oaks is the DEFAULT skin; another brand re-skins via tokens +
   re-contents via Payload posts.

**Responsive (built into every task, verified at 1440/1024/768/480):**
- **landing**: 2-col `blog-layout` (sidebar + main) → at ≤1024 sidebar becomes a horizontal bar above the grid
  (pills), post grid 2-up → 1-up; featured hero horizontal → stacked at ≤1024.
- **archive**: `blog-layout-archive` (main left + sidebar right via order) → ≤1024 sidebar bar on top; archive
  cards horizontal (180px image left) → stacked at ≤768.
- **article**: 3-zone `article-layout` (share rail + body + meta) → share rail collapses to a horizontal row;
  body max-width readable measure; related grid 3-up → 1-up.

**Verification:** `tsc --noEmit`, `bun run build`, `bun run lint:direct-edit`, and the **Plan 00 Playwright 1:1
diff** on `:8088` (`pages/blog-landing.html`, `pages/blog-archive.html`, `pages/blog-article.html`) at each
breakpoint — compare computed tokens, per-section bounding boxes, and screenshots. No unit suite (template has none).

**Source of truth (read before coding):**
- Components: `~/Desktop/design/golden-oaks/components/blog-card/blog-card.html` (4 variants + `renderBlogCard`),
  `~/Desktop/design/golden-oaks/components/blog-sidebar/blog-sidebar.html` (search/sort/categories + JS events).
- Pages: `~/Desktop/design/golden-oaks/pages/{blog-landing,blog-archive,blog-article}.html`. Article-page CSS for
  `.blog-featured-hero`, `.blog-layout(-archive)`, `.blog-main`, `.blog-grid`, `.archive-*`, `.article-*`,
  `.page-hero`/`.hero-fullbleed` lives inline in those files (grep the class names).
- Data shape (mockup `window.blogArticles`): `title, excerpt, category, categorySlug, image, imageAlt, author,
  authorImg, readTime, href, featured, date`. Maps to `PayloadPost` (+ derive read-time, + optional author/category).

---

### Task 1 — Extend the post fetch layer + card model (data plumbing, no UI)
**Files:** `src/lib/payload.ts`
**Build/refine:**
1. Extend `PayloadPost` to carry the fields the design needs (all optional, depth-tolerant): `category?:
   { title?: string; slug?: string } | string | null` (relationship to the **categories** collection — already a
   valid `CmsCollection`), `author?: { name?: string; role?: string; bio?: string; photo?: PayloadMedia | string }
   | string | null`, and `readingTime?: number | null`. Do **not** invent new collections — read what Payload
   returns at `depth=1`; treat every field as optional and fall back gracefully.
2. Add a `readTimeLabel(post)` helper: prefer `post.readingTime` (minutes); else estimate from
   `lexicalWordCount(post.content)` at ~200 wpm; render `"N min read"`. Add a tiny `lexicalWordCount(root)` that
   walks `LexicalRoot` text nodes (reuse the node-walk pattern in `src/lib/lexical-to-html.tsx`).
3. Add `categoryLabel(post)` / `categorySlug(post)` resolvers (handle string vs populated relationship vs absent).
4. Extend `BlogCardPost` + `toCardPost` to populate `category`, `author?: { name; role?; photoSrc?; photoAlt? }`,
   `readTime`, and keep `coverImage`. Add `id` to `BlogCardPost` (the card needs the post doc-id for the editor
   contract). Bump `fetchPosts`/`fetchPostBySlug` depth to `2` so `category`/`author` relationships populate.
5. Add `deriveCategories(posts)` → `{ slug, label, count }[]` with an `{ slug:"all", label:"All Categories" }`
   first entry, used by `BlogSidebar` so the category list is **data-driven** (cross-cutting #3), not hardcoded.
**Steps:** build → `bunx tsc --noEmit` (this file only must compile) → no UI yet → commit
`feat(golden-oaks): blog post model — category/author/read-time + card mapping`.
**Verify:** `tsc --noEmit` clean; `toCardPost` returns the new fields; no behavior change to existing callers
(fields are additive/optional). No literal hex introduced.

### Task 2 — `BlogCard` block (4 variants, token-driven, editor contract)
**Files:** `src/components/blocks/BlogCard.tsx` (new); `src/app/globals.css` (add a `@layer components` `blog-card`
block ONLY if utility classes can't express it — prefer Tailwind utilities first).
**Build:**
1. New presentational component `BlogCard({ post, variant = "default", className })` where `post: BlogCardPost`
   and `variant: "default" | "featured" | "compact" | "archive"`. Port the markup from `blog-card.html`'s
   `renderBlogCard`: `<article>` root → image (`aspect-16/10` default; auto/min-h for featured; 80px square compact;
   180px 4/3 archive) → body (`tag` pill, `title` link, `excerpt` clamp, `meta` = author avatar + name +
   read-time) → corner arrow link (hidden in compact/archive-mobile). **Single component, variant-switched** (#3).
2. **Tokens (no literals):** card bg `bg-surface`/white token, `border-neutral-300`, `var(--radius)`, hover lift +
   `shadow` token + `border-primary-light`; tag pill `bg-primary-light text-primary` (featured →
   `bg-secondary-light text-secondary-dark`); title `font-heading text-text` → `group-hover:text-primary`; excerpt
   `text-muted` with `line-clamp-{3|4|2}`; author name `text-text`, read-time `text-muted`; avatar ring
   `border-primary-light`. Map every mockup hex to the Plan 00 token (`--neutral-*` → the template's neutral/muted
   tokens; if a needed neutral step is missing, add it to Plan 00's `@theme` rather than inlining a hex — note it
   in the commit).
3. **Editor contract:** root `data-nocms-component="blog-card"`. The card accepts caller-spread doc attrs
   (`{...payloadDocAttrs({ collection:"posts", docId: post.id })}` applied by the page), and tags its editable
   fields with `data-role` + `data-payload-field`: image→`featuredImage`, tag→`category`, title→`title`,
   excerpt→`excerpt`, read-time/meta→`publishedAt`. Title link uses Next `<Link href={`/blog/${post.slug}`}>`.
4. **Responsive:** featured horizontal → stacked ≤1024 (image min-h 240); archive horizontal → stacked ≤768
   (full-width 16/10 image, hide arrow); body padding tightens at ≤480. Match the mockup's exact breakpoints.
5. Register in `src/components/blocks/registry.ts` only if a Payload **blog-card block** is wanted for page
   composition; otherwise it's a route-level component (preferred — cards come from posts, not page blocks). If
   registered, add the `blog-card` slug + a `settings.variant` atom mapping (per Plan 00's variant convention).
**Steps:** build → `bunx tsc --noEmit` → `bun run build` → render the 4 variants on a scratch page and run the P0
harness `pages/blog-card/blog-card.html` (or the landing/archive pages) at 1440/768/480, diff geometry +
screenshots → `bun run lint:direct-edit` (BlogCard's `data-role`s resolve) → commit
`feat(golden-oaks): BlogCard block — default/featured/compact/archive variants (token-driven, editable)`.
**Verify:** tsc + build clean; variants visually match mockup; flip `--color-primary` → tag/title-hover/avatar-ring
re-tint; `grep -nE "#[0-9a-fA-F]{6}" src/components/blocks/BlogCard.tsx` empty; lint:direct-edit clean.

### Task 3 — `BlogSidebar` component (search / sort / categories, data-driven)
**Files:** `src/components/blocks/BlogSidebar.tsx` (new); `src/components/blocks/BlogControls.tsx` (new, client) if
search/sort need interactivity beyond progressive enhancement.
**Build:**
1. `BlogSidebar({ categories, activeSlug, basePath = "/blog" })` porting `blog-sidebar.html`: three
   `blog-sidebar-section`s — **Search** (input with leading magnifier svg), **Sort By** (`select`: Most Recent /
   Most Popular / A–Z with leading lines svg + chevron), **Browse by Category** (`<nav aria-label="Article
   categories">` of links). Categories come from the `deriveCategories(posts)` prop (Task 1) — **not** the
   mockup's hardcoded list (#3). Active category = `is-active` styling.
2. **Tokens:** label `text-muted uppercase tracking-wide`; inputs/select `bg-white border-neutral-300
   var(--radius)`, focus `border-primary` + `ring`/`shadow` `--color-primary-light`; category link
   `text-neutral-700`, hover `text-primary bg-section-sage border-l-primary-light`, active `text-primary-dark
   bg-primary-light border-l-primary font-bold`. No hex.
3. **Behavior:** keep it **functional without JS** — category links are real `<a href>`s
   (`/blog?category=<slug>` or filter client-side); search is a GET form to a search route or a client filter.
   The mockup dispatches `blog-category-change` / `blog-search-change` / `blog-sort-change` CustomEvents; in the
   template, prefer URL params (`?category=&sort=&q=`) read by the page (server) for SSR-correct, editor-safe
   output. Any client interactivity lives in a small `"use client"` `BlogControls` island; the sidebar shell stays
   a server component. (This is presentational chrome — no `data-role`/editable fields needed.)
4. **Responsive:** ≤1024 sidebar flips to a horizontal wrap bar (sections flex, categories become rounded pill
   chips with `border-neutral-300`); ≤768 each section full-width. Match mockup breakpoints exactly.
**Steps:** build → `bunx tsc --noEmit` → `bun run build` → P0 harness against the sidebar region on
`pages/blog-landing.html` + `pages/blog-archive.html` at 1440/1024/768 (verify the 1024 horizontal-bar flip) →
`bun run lint:direct-edit` → commit `feat(golden-oaks): BlogSidebar (search/sort/data-driven categories, token-driven)`.
**Verify:** tsc + build clean; sidebar matches at desktop AND the ≤1024 pill-bar layout; categories reflect actual
posts; flip `--color-primary` re-tints active/focus; no hex; lint clean.

### Task 4 — Refine **blog-landing** route (`/blog`): featured hero + sidebar + grid + Previous Posts
**Files:** `src/app/blog/page.tsx` (refine)
**Refine:**
1. Keep the existing data flow: `fetchPageBySlug("blog")` (optional seeded header) + `fetchPosts()`. Replace the
   generic Tailwind grid with the Golden Oaks structure:
   - **Featured hero** (`section` matching `.blog-featured-hero`, with the green-overlay + leaf-pattern bg from
     Plan 00): breadcrumb (Home / Resources / Featured) + an `sr-only` h1 "Resources & Insights" + the **featured**
     `BlogCard` (variant `"featured"`) for the post with `featured` true (or the most-recent). Spread the post's
     `payloadDocAttrs` onto that card.
   - **Blog layout** inside `.section-light`: `BlogSidebar` (categories from `deriveCategories(posts)`,
     `activeSlug` from `?category`) + a **main** grid of remaining posts as `BlogCard` `variant="default"`,
     2-up→1-up. Filter/sort by URL params (`?category`, `?sort`, `?q`) server-side so it's SSR-correct.
   - **Previous Posts** link → `/blog/archive` (the mockup's `.blog-previous-posts` arrow link).
2. If `page` (seeded) has `blocks`, render them via `RenderBlocks` above the featured hero (header band), exactly
   as today — that path already carries the editor contract.
3. Empty state: keep a token-styled "No articles yet" message.
4. Keep `generateMetadata` (title/desc from the seeded page or `skin.config.brandName`).
**Steps:** refine → `bunx tsc --noEmit` → `bun run build` → P0 harness `pages/blog-landing.html` at
1440/1024/768/480 (featured stacks ≤1024, grid 1-up ≤768, sidebar pill-bar ≤1024) → `bun run lint:direct-edit` →
commit `feat(golden-oaks): blog landing 1:1 — featured hero + sidebar + post grid`.
**Verify:** tsc + build clean; landing matches mockup at all 4 breakpoints; each card is click-to-edit (doc-id
attrs present); brand strings come from `skin.config`; no hex; lint clean.

### Task 5 — New **blog-archive** route (`/blog/archive`): header + paginated list + sidebar
**Files:** `src/app/blog/archive/page.tsx` (new); `src/app/blog/archive/BlogArchiveList.tsx` (new, `"use client"`
for Load-More) — or implement pagination via `?page=` server-side (preferred for SSR/static).
**Build:**
1. Port `blog-archive.html`: `.archive-header` (h1 "Article Archive" + subtitle) → `.blog-layout
   .blog-layout-archive` with **main left, sidebar right** (CSS order; on ≤1024 sidebar bar on top). Main =
   `.archive-results` count ("Showing N of M") + the post list as `BlogCard` `variant="archive"` (horizontal) +
   the **Load More** button.
2. **Pagination:** default page size (e.g. 9). Prefer **URL-param paging** (`?page=2`) rendered server-side so it
   stays static-exportable and editor-safe; the "Load More" button is a `<Link>` to the next page (progressive
   enhancement) OR a small client island that appends the next slice. Wire `?category`/`?sort`/`?q` filters shared
   with the sidebar (reuse the landing's filter helpers — factor a `filterSortPosts(posts, params)` util into
   `src/lib/payload.ts` or a `src/lib/blog.ts`).
3. Reuse `BlogSidebar` (same data-driven categories, `activeSlug` from `?category`).
4. `generateMetadata` for the archive (title "Article Archive | {brandName}").
**Steps:** build → `bunx tsc --noEmit` → `bun run build` → P0 harness `pages/blog-archive.html` at
1440/1024/768/480 (archive cards horizontal→stack ≤768, sidebar bar ≤1024, Load More present) →
`bun run lint:direct-edit` → commit `feat(golden-oaks): blog archive 1:1 — list + load-more + sidebar`.
**Verify:** tsc + build clean; archive matches mockup; cards carry post doc-id attrs; pagination works; filters
shared with sidebar; no hex; lint clean.

### Task 6 — Refine **blog-article** route (`/blog/[slug]`): full-bleed hero + body + share + author bio + related
**Files:** `src/app/blog/[slug]/page.tsx` (refine); `src/app/blog/[slug]/ArticleShare.tsx` (new, `"use client"`
for copy-link/print/share buttons); `src/app/globals.css` (extend the `prose`/article-body component layer — only
via tokens).
**Refine:**
1. Keep the existing static path (`generateStaticParams` from `fetchPosts`, `_placeholder` fallback,
   `force-static`). Replace the body with the Golden Oaks article anatomy:
   - **Article hero** = `.hero-fullbleed .article-hero` (Plan 00 full-bleed hero): `featuredImage` bg + dark
     overlay, breadcrumb (Home / Resources / {category}), `article-hero-tag` (category pill), white serif `h1`
     (`title`), and `article-hero-meta` (author avatar + name `·` formatted `publishedAt` `·` `readTimeLabel`).
     Attach `payloadFieldAttrs` to title/featuredImage/publishedAt/category.
   - **Article content** = `.article-layout` (3 zones): left **share rail** (`ArticleShare` client island —
     Facebook/Twitter/LinkedIn/copy-link/print; the share svgs from the mockup), center **article body**
     (`LexicalRichText` of `post.content` styled by the article-body/prose layer — drop-cap first paragraph, h2/h3,
     captioned `<figure>`, pullquote, lists), then **tags** (`.article-tags` from category/derived), **author bio**
     (`.article-author-bio` from `post.author` — photo, name, role, bio) and a **newsletter** sign-up
     (`.article-newsletter`, brand strings from `skin.config`). Wrap content in `payloadFieldAttrs(... field:"content")`.
   - **Related** = `.article-related-section` "You Might Also Like" → 3 `BlogCard` `variant="default"` from
     same-category (fallback most-recent) posts excluding the current; each spreads its post doc-id attrs.
2. **Article-body styling via tokens:** extend a `@layer components` `.article-body`/`prose` block in `globals.css`
   that styles `LexicalRichText` output — drop-cap (`::first-letter` on the lead `p`), h2/h3 `font-heading
   text-text`, body `text-text leading-relaxed`, links underlined `text-primary` (ADA, per mockup), blockquote /
   `.pullquote` accent border `border-secondary`, `figure`/`figcaption` `text-muted`. **All tokens, no hex.**
3. Keep "← Back to all articles" → `/blog`.
**Steps:** refine → `bunx tsc --noEmit` → `bun run build` → P0 harness `pages/blog-article.html` at
1440/1024/768/480 (share rail → horizontal row, body readable measure, related 3→1) → `bun run lint:direct-edit`
(title/excerpt/featuredImage/content/publishedAt resolve) → commit
`feat(golden-oaks): blog article 1:1 — full-bleed hero + body + share + author bio + related`.
**Verify:** tsc + build clean; article matches mockup; article doc + fields are click-to-edit; share island works;
related populated; newsletter strings from `skin.config`; no hex; lint clean.

### Task 7 — Cross-cutting proof + responsive sign-off (blog group)
**Files:** none (verification); fix-ups in Task 2–6 files as needed.
**Steps:**
1. **Token flip-test:** temporarily set `--color-primary` to a vivid test color in `globals.css`, `bun run build`,
   confirm landing/archive/article all re-tint (cards, tags, sidebar active/focus, links, pullquote accent), then
   revert. Confirms cross-cutting #1.
2. **Editor contract:** `bun run lint:direct-edit` clean across the new/edited blog files; manually confirm a card
   and an article expose `data-payload-collection="posts"` + `data-payload-doc-id` + per-field `data-payload-field`
   (cross-cutting #2). Confirm the seeded blog-index header path still renders via `RenderBlocks`.
3. **Variant + data-driven:** confirm one `BlogCard` serves all four layouts and categories derive from posts
   (cross-cutting #3). Re-content sanity: swapping posts in Payload changes the blog with no code edit.
4. **1:1 audit:** run the Plan 00 harness for all three pages at {1440,1024,768,480}; record token + bounding-box
   diffs; fix any geometry/spacing/typography gaps. Verify the responsive transforms (sidebar→bar ≤1024, grids→1-up,
   archive cards→stack ≤768, featured→stack ≤1024, share rail→row).
5. `grep -rnE "#[0-9a-fA-F]{6}" src/components/blocks/BlogCard.tsx src/components/blocks/BlogSidebar.tsx
   src/app/blog` → **zero**. `tsc --noEmit` + `bun run build` clean.
6. Commit `chore(golden-oaks): blog 1:1 + cross-cutting verification (tokens/contract/variants/responsive)`.
**Verify:** all three blog pages diff 1:1 vs the mockup at all four breakpoints; flip-test, lint, and zero-hex all pass.

---
**Final:** `tsc --noEmit` + `bun run build` + `bun run lint:direct-edit` clean; the Plan 00 harness shows
blog-landing / blog-archive / blog-article matching the mockup at 1440/1024/768/480; cards & articles are
inline-editable (posts doc-id contract); one `BlogCard` variant-driven; categories data-driven; zero hardcoded
hex in blog components. Blog content is seeded as **posts** in Plan 08 (this plan ships the renderers + routes,
not the content). Then proceed to P8 (composition & content seed).
