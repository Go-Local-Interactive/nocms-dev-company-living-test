# Golden Oaks Plan 04 — Interior Content Blocks

> **For Claude:** REQUIRED SUB-SKILL: gli-toolkit:subagent-driven-development. Read the roadmap
> `2026-06-25-golden-oaks-1to1-overview.md` (esp. **Cross-cutting requirements**) and
> `2026-06-25-golden-oaks-plan-00-design-system.md` FIRST — this plan depends on P0's exact tokens,
> semantic section-bg tokens, base patterns (overline, leaf-pattern bg, buttons, radius/shadow),
> default skin, copied media, and the `/tmp/audit` Playwright harness. Do P0 (and ideally P1) before this.
> Runs in parallel with P03/P05/P06/P07 (different component groups).

**Goal:** Build/refine the **interior content blocks** of the Golden Oaks design to **1:1 (incl. responsiveness)**
as token-driven, editable, customizable nocms blocks: `content-intro` (new), `content-blocks` (new — one
wrapper hosting `cb-text`/`cb-photo`/`cb-photo-inline`/`pullquote`/`cb-list`/`cb-badges`/`cb-callout`
sub-blocks), `gallery` (refine to the gallery-shelf), `video-testimonial` (new variant, shared w/ P03),
`icon-card-grid` (new — `dark`/`brown`/`light` via `settings.variant`), `card-carousel` (new — client JS),
`timeline` (refine to the alternating day-schedule layout).

## Cross-cutting (NON-NEGOTIABLE — proven per task)

1. **Tokens only for colors/fonts.** Never a literal hex in a component. Map every mockup color to the P0
   `--color-*` tokens (incl. P0's `--color-section-{cream,sage,light,brown,dark}` + `--color-overline`).
   In particular **icon-card-grid's `dark`/`brown`/`light` are section-bg tokens behind a `variant`, NOT
   literals or three hardcoded blocks.** Fonts via `--font-heading`/`--font-body` (Tailwind `font-heading`/
   `font-body`). After each task: `grep -rnE "#[0-9a-fA-F]{6}" <files>` finds none.
2. **Editor contract.** Every renderer root carries `data-nocms-component="<slug>"`; every editable field
   carries `data-payload-subfield`; repeatable collections carry `data-array-prop` on the `.map()` container
   and `data-array-index={i}` per item (see `GalleryBlock`/`StatsBarBlock`). Plain-string headings use
   `data-role="heading"`/`"subheading"`. New blocks declare their atoms in the Payload schema
   (`nocms/src/payload/blocks/atomic.ts` + `atoms.ts`) and surface them on the template type
   (`src/lib/payload.ts`). `bun run lint:direct-edit` stays clean.
3. **Customizable via `settings.variant`, not N blocks.** icon-card-grid is ONE block (`icon-card-grid`)
   whose `dark`/`brown`/`light` come from `settings.variant`. content-blocks is ONE wrapper (`content-blocks`)
   whose sub-types are repeatable `items`, each with its own type — NOT seven blocks. card-carousel client
   behavior **degrades gracefully** (no JS → a scrollable, readable row; reduced-motion respected).

## Editor-contract decisions for this plan (read before Task 0)

The template's `PayloadAtomicBlock` (`src/lib/payload.ts`) is intentionally minimal today — `title`, `body`
(lexical), `media`, `mediaArray`. Two of these blocks need more than that:

- **icon-card-grid** needs `settings.variant` (the dark/brown/light switch) and a repeatable card set
  (icon + title + description). → use the schema `settings` + `items` atoms.
- **content-blocks** is a heterogeneous, ordered list of typed sub-blocks. → use the schema `items` atom;
  each item's **type** is carried in `item.icon` (a constrained string the renderer switches on:
  `text|photo|photo-inline|pullquote|list|badges|callout`), with `item.label` (heading), `item.text`
  (lexical prose/list), `item.media` (figure/inline photo), `item.link` (callout CTA). This reuses the
  EXISTING `itemsField` shape (`icon`,`label`,`text`,`link`,`media`) — no new sub-fields needed.
- **content-intro**, **gallery (shelf)**, **video-testimonial**, **timeline** stay on the existing atoms
  (`title`/`body`/`mediaArray` + lexical-derived structure), matching the parse-the-lexical-body convention
  already used by `StatsBarBlock`/`TimelineBlock`/`TestimonialBlock`. video-testimonial adds `media`
  (poster) + `rating` (the aggregate score) + `settings.variant: "video"`.

Therefore **Task 0 (schema + types) is a prerequisite for Tasks 4 and 5** and surfaces `items`, `rating`,
and `settings` on the template type so renderers can read them.

**Verification (all tasks):** `tsc --noEmit` clean; `bun run build` clean; `bun run lint:direct-edit` clean;
no `#hex` literals in touched files; and a **Playwright 1:1 diff via the P0 harness** — serve the mockup
(`python3 -m http.server 8088 --directory ~/Desktop/design/golden-oaks`, already running on :8088) and the
rendered template, screenshot the block at **{1440, 1024, 768, 480}**, diff section geometry + computed
tokens + visual against the mockup component page and its in-situ page. No unit suite (per P0).

> **Harness:** `/tmp/audit/` already exists from P0 (`golden-pages.py` screenshots the mockup pages at
> desktop+mobile; `golden-render.py` reads computed tokens off the rendered template). For each task, copy
> the closest one to `/tmp/audit/p04-<block>.py`, point it at the mockup **component** file
> (`http://localhost:8088/components/<dir>/<file>.html` renders the CSS-in-comments only as text, so compare
> against the **in-situ page** instead — see each task for which page/anchor) and the template route that
> renders a seeded instance of the block, and assert per-breakpoint.

---

### Task 0 — Schema atoms + template type: surface `items` / `rating` / `settings`; add variant enums
**Files:** `nocms/src/payload/blocks/atomic.ts`, `nocms/src/payload/blocks/atoms.ts` (the canonical Payload
schema), `src/lib/payload.ts` (template type), `src/components/blocks/types.ts` (re-export only — no change
expected).
**Steps:**
1. In `nocms/.../atomic.ts` `SPECS`, add/confirm the rows this plan renders:
   - `{ slug: "content-intro", singular: "Content Intro", plural: "Content Intros", atoms: ["title","body","settings"] }`
   - `{ slug: "content-blocks", singular: "Content Blocks", plural: "Content Blocks", atoms: ["title","body","items","settings"] }`
   - `{ slug: "icon-card-grid", singular: "Icon Card Grid", plural: "Icon Card Grids", atoms: ["title","items","settings"] }`
   - `{ slug: "card-carousel", singular: "Card Carousel", plural: "Card Carousels", atoms: ["title","items","settings"] }`
   - `{ slug: "video-testimonial", singular: "Video Testimonial", plural: "Video Testimonials", atoms: ["title","body","media","rating","settings"] }`
   - confirm existing `gallery` (`["title","mediaArray"]`) and `timeline` (`["title","body"]`) rows are present (they are).
2. In `nocms/.../atoms.ts` `settingsField`, **extend the `variant` enum** to include the icon-card-grid
   values: add `"dark"`, `"brown"`, `"light"` to the existing `options`. (The header comment already warns:
   a `variant` value the migration emits MUST be listed here or Payload rejects the doc on load — this is the
   bug that once dropped the imported home page. So this enum edit is mandatory before any seed uses
   `dark/brown/light`.) Leave `align`/`background`/`columns` as-is.
3. In `src/lib/payload.ts`, **extend `PayloadAtomicBlock`** so the renderers can read the enriched atoms
   (today it only declares `title`/`body`/`media`/`mediaArray`). Add:
   ```ts
   export interface PayloadBlockLink { label?: string | null; url?: string | null; appearance?: "primary" | "secondary" | "outline" | "ghost" | "link" | null; }
   export interface PayloadBlockItem {
     icon?: string | null;        // lucide slug / emoji — OR (content-blocks) the sub-block type
     label?: string | null;       // heading / card title
     text?: LexicalRoot | null;   // prose / list (lexical)
     link?: PayloadBlockLink | null;
     media?: PayloadMedia | string | null;
   }
   export interface PayloadBlockSettings {
     variant?: string | null; align?: "left" | "center" | "right" | null;
     background?: "base" | "surface" | "dark" | "accent" | null; columns?: "2" | "3" | "4" | null;
   }
   ```
   and add `items?: PayloadBlockItem[] | null;`, `rating?: number | null;`, `settings?: PayloadBlockSettings | null;`
   to `PayloadAtomicBlock`. Add a `mediaItemsUrls(items)` helper near `mediaArrayUrls` that maps each
   `item.media` through `mediaUrl`/`mediaAlt` (used by icon-card-grid/card-carousel image slots).
4. Regenerate Payload types in nocms: `bun run generate:types` (per nocms CLAUDE.md, after schema changes).
   In the template: `tsc --noEmit` to confirm the new type compiles.
5. **Verify:** `tsc --noEmit` clean in template; nocms `bun test tests/unit/payload/blocks/atomic.test.ts`
   (the existing schema test) still passes. No renderer wired yet, so `bun run build` should be unchanged.
6. Commit (template): `feat(golden-oaks): surface items/rating/settings atoms on block type`.
   Commit (nocms): `feat(blocks): interior-block slugs + dark/brown/light variant enum`.

> Tasks 1–7 below each follow the same rhythm: **build/refine → `tsc --noEmit` → `bun run build` →
> `bun run lint:direct-edit` → hex-literal grep → Playwright 1:1 diff (P0 harness, 4 breakpoints) → commit.**
> They are otherwise independent and may be done in any order after Task 0.

---

### Task 1 — `content-intro` (NEW): large lead paragraph with drop cap
**Mockup:** `components/content-intro/content-intro.html`; **in situ:** `pages/magnolia.html` L13541
(`<section id="intro" class="has-branch-bg">` → `.content-intro > p.has-drop-cap`).
**Files:** `src/components/blocks/ContentIntroBlock.tsx` (new), `src/components/blocks/registry.ts`.
**Selectors / spec (exact):**
- Section wrapper `.has-branch-bg`: white-ish bg + faint centered `branch-pattern.png` via `::after`
  (`opacity 0.08`, `background-size: contain`, no-repeat, centered, `pointer-events:none`, behind a
  `z-index:1` container). Map the bg to the P0 leaf/branch-pattern utility (the P0 `.section`/leaf-pattern
  helper); **tint via `--color-leaf-pattern-tint`, never an inline hex.**
- `.content-intro`: `font-size 20px; line-height 1.8; color var(--neutral-700)` → token `text-text/`muted per
  P0 (the mockup `--neutral-700` maps to the P0 body-text token). Links underlined.
- Drop cap `.has-drop-cap::first-letter`: `float:left; font-family var(--font-heading); font-size 4.5rem;
  line-height .8; font-weight 700; color var(--primary); margin-right 8px; margin-top 6px`. Implement with a
  Tailwind `first-letter:` utility chain (`first-letter:float-left first-letter:font-heading
  first-letter:text-[4.5rem] first-letter:leading-[0.8] first-letter:font-bold first-letter:text-primary
  first-letter:mr-2 first-letter:mt-1.5`) — no raw hex.
**Steps:**
1. Build `ContentIntroBlock({ title, body, settings })`. Render `body` as the lead prose: prefer
   `lexicalToText(body)`/`<Lexical>` for the paragraph; `data-payload-subfield="body"`. Drop cap is applied
   to the FIRST paragraph only (the `has-drop-cap` analogue). Optional `title` renders nothing visually here
   (the mockup has none) — but keep the prop wired for editability if seeded; if present render it as a
   visually-hidden or small overline using the P0 overline utility (decide by checking other intro usages;
   default to omit). Honor `.has-branch-bg` by default; allow `settings.background` to pick a P0 section-bg.
2. **Responsive (480px):** `.content-intro` → `font-size 16px; line-height 1.7`; drop cap →
   `font-size 3.2rem; margin-top 4px`. Use `text-base` at base, `text-xl` (20px) at `sm:`/`md:` to match
   (mockup keeps 20px ≥481px, 16px ≤480px). No other breakpoints in the mockup.
3. Register `"content-intro": ContentIntroBlock` in `registry.ts`.
4. tsc → build → lint:direct-edit → hex grep → P0 harness diff vs magnolia `#intro` at {1440,1024,768,480}.
**Verification:** drop-cap glyph is `--font-heading`/`--primary` and sized 4.5rem→3.2rem across the 480 break;
prose is 20px→16px; branch-pattern tint visible but faint; `data-payload-subfield="body"` present;
lint clean.
**Commit:** `feat(golden-oaks): content-intro block (lead paragraph + drop cap)`.

---

### Task 2 — `timeline` (REFINE): alternating day-schedule with gradient spine
**Mockup:** `components/timeline/timeline.html`; **in situ:** `pages/our-team.html` (timeline pattern) — the
component ships inside `<section class="section-cream">` with `<h2>A Typical Day…</h2>`.
**Files:** `src/components/blocks/TimelineBlock.tsx` (rewrite layout), `registry.ts` (already maps `timeline`).
**Gap vs current:** the existing `TimelineBlock` is a LEFT-rail numbered process (move-in steps). The Golden
Oaks `timeline` is a **center-spine vertical alternating day schedule** with a sunrise→sunset gradient line,
color-coded icon dots, time labels, and odd/even left/right alternation. Refine to the mockup layout while
keeping the lexical-derived data convention.
**Selectors / spec (exact):**
- `.timeline`: `position:relative; margin-top:60px`. Center line `.timeline::before`: `left:50%; width:3px;
  top:0;bottom:0; opacity:.6; border-radius:3px` with a gradient through
  `--accent-70 → mix(accent 55%, neutral-500) → primary → primary → cool → mix(cool 85%, black)`
  (sunrise→sunset). Reproduce with a `bg-gradient-to-b` using P0 token stops (`from-accent via-primary
  to-cool`, plus the mixed mid-stops via arbitrary `color-mix(in srgb, …)` values referencing tokens — NOT
  hex). The mockup's `--accent-70`,`--accent-10`,`--primary-07`,`--cool-07`,`--cool-13`,`--linen` are P0
  tokens/derived shades; confirm P0 added these opacity-shaded tokens, else derive via `/NN` Tailwind alpha
  or `color-mix`.
- `.timeline-item`: `display:grid; grid-template-columns: 1fr 56px 1fr; align-items:center`; consecutive items
  `margin-top:64px`. `.timeline-dot .dot-icon`: `44×44; border-radius:50%; 3px solid; svg 20×20, stroke 1.8`;
  hover `scale(1.12)`. **Per-item dot colors** cycle the sunrise→sunset palette across `:nth-child(1..8)` —
  port each stop as a token reference (see mockup L96–118). Because nth-child styling can't be Tailwind
  utilities cleanly, drive dot color from the **item index** in JS (an 8-entry token array, looping) applied
  as inline `style={{ borderColor, background, color }}` built from CSS `var(--…)` strings — keeps it
  token-only and editable.
- `.timeline-time`: `font-size 20px; weight 700; color var(--primary); font-heading`. Odd items:
  time right-aligned on the left column (`text-align:right; padding-right:20px`); content on the right.
  Even items swap via `order`: time `order:3` left-aligned, dot `order:2`, content `order:1` right-aligned.
- `.timeline-content`: `padding:0 20px`; `h4` `1.25rem`, `p` `--neutral-700`.
**Data convention (keep lexical-derived, like today):** parse `lexicalQAPairs(body)` — but each timeline item
is **time + title + description**. Convention: heading text = `"7:00 AM — Morning Yoga"` (split on em/en dash:
left = time, right = title), following paragraph = description. Fall back to an 8-entry default day schedule
(port the mockup's 8 items + their icon names). Keep `title` as the section `<h2>`; intro paragraph if no
pairs. Icons: map a small lucide set keyed by item index (sun, utensils, palette, users, book, wine, chef,
moon) — store icon name per default; allow `item`/lexical to omit (index drives the default icon).
**Steps:**
1. Rewrite the render to the 3-column alternating grid + center gradient spine; drive dot palette + icon by
   index from token-built inline styles. `data-payload-subfield="body"` on the `<ol>`/list container,
   `data-array-index={i}` per item, `data-role="heading"` on the `<h2>` title.
2. **Responsive (1024px):** spine `left:28px`; item grid → `56px 1fr` (single column, dot in left rail
   spanning both rows); time + content left-aligned with `padding-left:12px`; dot 40×40, svg 18×18; item gap
   `margin-top:40px`. **(480px):** item gap `margin-top:28px`. No 768/640 changes in the mockup. Use
   `lg:`(≤1024 → switch at the `1024`/`lg` boundary; note Tailwind `lg`=1024 min-width so implement the
   "≤1024 stacks" as base layout + `xl:`/`min-[1025px]:` for the alternating desktop layout, OR a
   `max-[1024px]:` arbitrary variant — pick the one that yields the exact 1024 break) and `max-[480px]:`.
3. tsc → build → lint → hex grep → P0 harness vs the timeline section at {1440,1024,768,480}; verify the
   alternating left/right at ≥1025 collapses to a single left-rail column at ≤1024.
**Verification:** center spine present at desktop, left rail at ≤1024; per-item dot colors progress
sunrise→sunset and come from tokens (inspect computed `border-color`); odd/even alternation correct;
time labels are `--primary` serif 20px→18px.
**Commit:** `refactor(golden-oaks): timeline → alternating day-schedule (1:1)`.

---

### Task 3 — `gallery` (REFINE): infinite-scroll gallery shelf
**Mockup:** `components/gallery-shelf/gallery-shelf.html`; **in situ:** `pages/magnolia.html` L13601 &
`pages/amenities.html` L13582 (`<section class="gallery-shelf-section has-leaf-bg" id="gallery">`).
**Files:** `src/components/blocks/GalleryBlock.tsx` (rewrite layout), `registry.ts` (already maps `gallery`).
**Gap vs current:** the existing `GalleryBlock` is a static masonry grid (featured tile + cells). The Golden
Oaks `gallery` is the **gallery-shelf**: an auto-scrolling horizontal strip of labeled photo cards with a CTA
link below. Refine to the shelf; keep `title` + `mediaArray` atoms (labels come from each media's `alt`).
**Selectors / spec (exact):**
- `.gallery-shelf-section`: `position:relative; overflow:hidden`; optional `.has-leaf-bg::after` leaf texture
  (`leaf-pattern.jpg`, `background-size:500px 500px; repeat; opacity .07`) → P0 leaf-pattern utility +
  `--color-leaf-pattern-tint`. `<h2>` in a `.container`, then a full-bleed `.gallery-shelf` track, then a
  `.container` holding the centered CTA.
- `.gallery-track`: `display:flex; gap:28px; width:max-content; padding:20px 0; animation: gallery-scroll 35s
  linear infinite`; `:hover` pauses. `@keyframes gallery-scroll { 0%→translateX(0); 100%→translateX(-50%) }`.
  **Seamless loop:** the mockup duplicates the track in JS; here render the card list **twice** server-side
  (second copy `aria-hidden`) so the `-50%` loop is seamless with zero client JS.
- `@media (prefers-reduced-motion: reduce)`: `animation:none; flex-wrap:wrap; width:auto;
  justify-content:center` — implement via a `motion-reduce:` utility chain (Tailwind supports
  `motion-reduce:`), and only render ONE copy of the list to the eye when reduced (the duplicate is
  `aria-hidden` + `motion-reduce:hidden`). **This is the graceful-degradation requirement** (no JS at all).
- `.gallery-card`: `min/max-width 340px; flex-shrink:0; border-radius var(--radius); overflow:hidden;
  shadow 0 4px 12px rgba(0,0,0,.1)`; hover `translateY(-6px)` + bigger shadow. `img`: `object-fit:cover;
  aspect-ratio 4/3`; hover `scale(1.05)`. Label `.gallery-card::after` from `data-label`: bottom gradient
  scrim (`rgba(44,34,24,…)` → map to `--color-text` alpha via `color-mix`/`/NN`), white 16px/600 text.
  Render the label as a real child `<figcaption>`/`<span>` (not a CSS `::after`) so it's editable & accessible,
  styled identically; bind `data-payload-subfield={"mediaArray." + i}` on the image (the alt = the label).
- `.gallery-cta` + `.gallery-cta-link`: centered, 44px min touch target, `--primary` 18px/600 with an arrow
  svg that nudges on hover (`gap` 8→12px). Link target: a gallery page (default `/photo-video-gallery`); allow
  `settings`/skin to override later — hardcode the default href for now.
**Responsive:** **768px:** card `min/max 280px`; shelf `margin-top 32px`; CTA `margin-top 32px`, link 16px.
**480px:** card `min/max 260px`; track `gap 16px`.
**Steps:**
1. Rewrite to the shelf: `<section data-nocms-component="gallery">`, `<h2 data-role="heading"
   data-payload-subfield="title">`, the duplicated track (`data-payload-subfield="mediaArray"`
   `data-array-prop="mediaArray"` on the REAL copy; `data-array-index={i}` per real card; duplicate copy
   `aria-hidden` + no payload attrs), CTA link. Add the `gallery-scroll` keyframes to `globals.css`
   `@layer utilities` (token-free; pure transform) — or inline via a named animation utility.
2. Implement pause-on-hover (`hover:[animation-play-state:paused]`) and `motion-reduce:` fallback (no JS).
3. tsc → build → lint → hex grep → P0 harness vs magnolia/amenities `#gallery` at {1440,1024,768,480};
   confirm the loop is seamless (screenshot mid-animation is acceptable to be lenient on exact offset) and the
   reduced-motion fallback wraps to a centered grid.
**Verification:** card widths 340/280/260 across breaks; labels legible over the scrim and editable
(`data-payload-subfield` resolves to a `mediaArray.<i>`); CTA is `--primary` with hover nudge; reduced-motion
shows a static wrapped grid; lint clean.
**Commit:** `refactor(golden-oaks): gallery → infinite gallery-shelf (1:1)`.

---

### Task 4 — `icon-card-grid` (NEW): dark/brown/light via `settings.variant`
**Mockup:** `components/icon-card-grid/icon-card-grid.html`; **in situ:** `pages/magnolia.html` L13561
(`<section class="icon-cards-brown has-branch-bg">` — the **brown** variant is the in-situ instance);
Careers uses `dark`, Floor-Plan-Detail uses `light` (per the mockup header). **Depends on Task 0** (`items` +
`settings` + the `dark/brown/light` enum).
**Files:** `src/components/blocks/IconCardGridBlock.tsx` (new), `registry.ts`.
**Variant = `settings.variant`** ∈ `{dark, brown, light}` (default `light`). **One block, three section-bg
tokens** — the dark/brown/light backgrounds are the P0 section tokens, never literals:
- `dark`: bg `--color-section-dark` (the mockup's `--primary-dark` green); white text; translucent-white
  cards (`rgba(255,255,255,.08)` border `.12`) → use `bg-white/8 border-white/12` (Tailwind alpha, token-free
  white is allowed as it's not a brand color; if P0 prefers, expose `--color-section-dark` + a card-tint
  token). Hover `bg-white/12` + `translateY(-4px)`.
- `brown`: bg `--color-section-brown` (mockup `--rich-brown`); else identical card treatment to `dark`.
- `light`: bg `--color-section-light` (mockup `--cream`); `--neutral-900` heading; white cards with
  `--neutral-100` border; hover shadow `rgba(44,34,24,.1)` → `--color-text` alpha.
**Per-card accent cycling (token-only):** each card has a top `::before` bar (4px, grows 0→100% on hover) and
a circular `.icon-card-icon` (72×72) whose bg+stroke cycle a 4-color sequence per variant (mockup L154–295):
- dark: sand, secondary, accent, cream (repeat)
- brown: primary-light, sand, accent, secondary-light (repeat)
- light: primary, secondary, accent, warm-brown (repeat)
Implement the cycle by **card index in JS** (a per-variant token-string array, looping with `i % 4`) applied
as inline `style` using `var(--…)`/`color-mix(in srgb, var(--…) NN%, transparent)` — mirrors the mockup's
`color-mix` icon-bg. The top bar grows on hover via a `group-hover:w-full` width transition.
**Structure / spec:** `.icon-cards-{variant}` section `padding:80px 40px`; `.icon-cards-inner` `max-width
1100px; mx-auto`; `<h2>` `font-heading 2rem center mb-48`. `.icon-cards-grid`:
`grid-template-columns: repeat(auto-fit, minmax(250px,1fr)); gap:28px`. `.icon-card`: `radius var(--radius);
padding 36px 28px; text-align:center`. `h3` `1.15rem/600`, `p` `16px/1.6`. Icon svg 36×36, `stroke-width 1.5`.
**Data:** `items[]` — each `item.label` = card title, `item.text` (lexical) = description, `item.icon` =
lucide name. Section `<h2>` = `title`. Default to a 4–7 card set (port the mockup's 7 "Why Work With Us"
cards + icon names) when `items` is empty. Bind `data-payload-subfield="items"` + `data-array-prop="items"` on
the grid, `data-array-index={i}` per card, `data-payload-subfield={"items." + i + ".label"}` etc. on fields.
**Responsive:** **1024px:** grid → `repeat(2,1fr)`. **768px:** section `padding:48px 24px`; grid → `1fr`,
`gap:20px`. **480px:** `<h2>` → `1.5rem`. (Implement with `grid-cols-1 md:grid-cols-2 [min-1100px]:auto-fit`
or the closest exact mapping — note the mockup uses `auto-fit minmax(250px,1fr)` at desktop, 2-col at ≤1024,
1-col at ≤768.)
**Steps:**
1. Build the block reading `settings.variant`; section-bg + text colors from a small `variantStyles` map of
   **token class strings** (e.g. `dark: { section: "bg-section-dark text-white", … }`). Cards token-driven by
   index. Default content fallback.
2. Register `"icon-card-grid": IconCardGridBlock`.
3. tsc → build → lint → hex grep → P0 harness: render all THREE variants (seed three instances or pass
   `settings.variant`) and diff vs Careers(dark)/magnolia(brown, L13561)/floor-plan-detail(light) at
   {1440,1024,768,480}.
**Verification:** flipping `settings.variant` swaps the section bg between the three P0 section tokens (NOT a
hardcoded block); per-card accent colors cycle from tokens; top-bar hover grows 0→100%; grid is
auto-fit→2col→1col across breaks; `lint:direct-edit` clean; zero hex.
**Commit:** `feat(golden-oaks): icon-card-grid block (dark/brown/light via settings.variant)`.

---

### Task 5 — `content-blocks` (NEW): one wrapper, typed repeatable sub-blocks
**Mockup:** `components/content-blocks/content-blocks.html` (the full sub-type catalog). **Depends on Task 0**
(`items`). One block (`content-blocks`); each `items[]` entry is a typed sub-block keyed by
`item.icon` ∈ `{text, photo, photo-inline, pullquote, list, badges, callout}`.
**Files:** `src/components/blocks/ContentBlocksBlock.tsx` (new) + small sub-renderers in the same file;
`registry.ts`.
**Wrapper spec:** `.content-blocks` `padding:80px 0`; `> .container` `max-width:800px` (narrow reading
column); each child block `margin-bottom:48px` (last `0`). Section bg from `settings.background`
(`--color-section-{cream,sage,light}` or plain). Root `data-nocms-component="content-blocks"`; the items
container `data-payload-subfield="items"` + `data-array-prop="items"`; each sub-block `data-array-index={i}`
and a `data-cb-type={item.icon}` for debugging.
**Sub-block → field mapping + exact selectors:**
- **`cb-text`** → `item.label` = `h2`/`h3`, `item.text` (lexical) = prose. `.cb-text` `18px/1.8 --neutral-700`;
  `h2` `font-heading 1.5rem/700`, `h3` `1.2rem/700 margin-top:32px`; `p` `margin-bottom:20px`; links `--primary`
  underline. Subheading vs heading: if `item.label` present render `h2`; lexical h3s inside `text` render via
  `<Lexical>`. `data-payload-subfield={"items."+i+".label"}` / `…".text"`.
- **`cb-photo`** → `item.media` + `item.label` (caption). Full-width `figure.captioned-figure` (shared P0
  utility): image `border-radius var(--radius)`, `figcaption` muted caption. `margin:0`.
- **`cb-photo-inline`** → `item.media` + `item.label` (h3) + `item.text`. `display:grid;
  grid-template-columns:1fr 1fr; gap:40px; align-items:start`; img `radius var(--radius)`; text `18px/1.8`.
  **Alternation:** even-indexed inline blocks flip image to the right (mockup uses
  `:nth-of-type(even){direction:rtl}`); replicate by `i % 2` → `md:[direction:rtl]` on the grid with
  `[&>*]:[direction:ltr]`, OR simply swap order with `md:grid-flow-col-dense` + order utilities. Match the
  mockup's even-flip exactly.
- **`pullquote`** → `item.text` (quote) + `item.label` (cite). Uses the shared global `.pullquote`
  (port from P0/global.css if not yet present): styled blockquote; `content-blocks .pullquote` override
  `margin:0 0 56px`. blockquote large serif; `cite` small.
- **`cb-list`** → `item.label` (h3) + `item.text` (a lexical `ul`/`ol`). `.cb-list` `18px/1.8`; `ul/ol`
  `margin-left:24px`; `li` `margin-bottom:10px`; markers `--primary` (ol markers `font-weight:600`). Render
  the lexical list via `<Lexical>`; apply marker color with `marker:text-primary`.
- **`cb-badges`** → a nested set. Simplest faithful mapping: `item.text` is a lexical list where each item is
  `"Name — Detail"`; render a 2-col grid of `.cb-badge-card`s. `.cb-badges` `grid repeat(2,1fr) gap:20px`;
  `.cb-badge-card` row flex, `padding 28px 24px`, bg `--sage-whisper` (→ `--color-section-sage` or a P0 sage
  tint), `radius var(--radius)`, hover border `--primary-light`. `.cb-badge-icon` 64×64 circle bg
  `--primary-dark`, svg 36×36 white (icon name from a parallel convention or default shield); `has-image`
  variant 80×64 white rounded for logos (`item.media`). `.cb-badge-name` `16px/700`, `.cb-badge-detail`
  `16px --neutral-500`. (If a richer per-badge editor is wanted later, badges can become their own nested
  block; for 1:1 now, the list-encoded approach keeps it one item + editable text.)
- **`cb-callout`** → `item.label` (h3) + `item.text` (p) + `item.link` (CTA). `.cb-callout` bg `--primary-dark`,
  `radius var(--radius); padding:40px; text-align:center; overflow:hidden`; faint leaf `::after` (`opacity .06`)
  → P0 leaf utility/`--color-leaf-pattern-tint`. `h3` white `1.25rem`, `p` `--sand` max-width 480 centered,
  `.btn` = secondary (`--secondary`/hover `--secondary-dark`) white text. CTA via the P0 button utility;
  `data-payload-subfield={"items."+i+".link.label"}`.
**Steps:**
1. Build `ContentBlocksBlock({ title, body, items, settings })`. Map each `items[i]` by `item.icon` to its
   sub-renderer (a `switch`); unknown type → render `cb-text` as a safe default + dev warn. Optional `title`
   renders as a leading section heading (`data-role="heading"`). Wrapper bg from `settings.background`.
2. Register `"content-blocks": ContentBlocksBlock`.
3. tsc → build → lint → hex grep → P0 harness: seed ONE `content-blocks` instance exercising all seven
   sub-types (mirror the mockup's example order: text, photo, text, list, pullquote, photo-inline, badges,
   callout) and diff vs `components/content-blocks/content-blocks.html`'s HTML example at {1440,1024,768,480}.
**Responsive:** **768px:** wrapper `padding:48px 0`; block gaps `36px`; text/list/inline-text → 16px;
`cb-photo-inline` → 1 col `gap:24px` and even-flip OFF (`direction:ltr`); `cb-badges` → 1 col `gap:16px`;
`cb-callout` `padding 28px 24px`. **480px:** `cb-text h2` → `1.35rem`; pullquote `padding 24px 20px`,
blockquote `1.25rem`. No 1024/640 changes.
**Verification:** all seven sub-types render 1:1; reading column is 800px; each sub-block is an editable array
item (`data-array-index` + `data-payload-subfield` resolve); photo-inline alternates on desktop and stacks at
≤768; callout is `--primary-dark` with `--secondary` CTA; zero hex; lint clean.
**Commit:** `feat(golden-oaks): content-blocks wrapper + cb-* sub-blocks (1:1)`.

---

### Task 6 — `video-testimonial` (NEW; shared w/ P03): rating bar + two-column inline player
**Mockup:** `components/video-testimonial/video-testimonial.html`; **in situ:** `pages/magnolia.html` L13620
(`<section class="section-sage-deep">` → `.video-testimonial`). **Coordinate with P03** (which also lists
reviews/video-testimonial for the homepage): this plan owns the block renderer; P03 consumes it. If P03 has
already created it, **refine in place** rather than duplicate.
**Files:** `src/components/blocks/VideoTestimonialBlock.tsx` (new) — a `"use client"` component (it swaps the
thumbnail for a `<video>` on click); `registry.ts`. Depends on Task 0 (`rating`, `media`, `settings`).
**Decision:** keep the existing text-only `TestimonialBlock` (`testimonial` slug, reviews grid) AS-IS;
`video-testimonial` is a **separate slug** for this distinct layout (rating bar + featured video). This honors
"one block + variant, not N blocks" at the *layout-family* level: the grid-of-quotes and the
video-feature are genuinely different components in the mockup (different slugs in `atomic.ts`), not variants
of one. (Alternatively, fold into `testimonial` behind `settings.variant:"video"` — only do this if P03 has
already standardized on it; default to the separate slug for a clean 1:1.)
**Selectors / spec (exact):**
- `<h2>` (`title`) centered, then `.rating-bar`: centered flex, `gap:12px; margin-bottom:48px`; 5 star svgs
  (`--accent` fill, 20×20) + `.rating-bar-score` (`18px/700`) + `.rating-bar-detail` (muted "from 120+
  reviews") + a `.rating-bar-link` ("Read Reviews", `--primary` underline). Star count/score from `rating`
  (0–5; render filled vs outline stars accordingly); detail + link text default + optionally from `body`/skin.
- `.video-testimonial`: `display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:start`.
  Left `.video-testimonial-media`: `.video-thumbnail` button (`aspect-ratio 16/9; radius var(--radius)`),
  `img` cover, dark overlay `::before` (`rgba(0,0,0,.25)`→`.15` hover), centered `.play-btn` (P0/global
  `.play-btn`), a `.video-cc-chip` "CC" pill bottom-right, and a `<details class="video-testimonial-transcript">`
  with a `summary` ("Read full transcript", `--primary` underline) + `.transcript-body` (left-border
  `--primary`, muted prose). Right `.video-testimonial-content`: `.video-testimonial-label` (uppercase
  `--primary` overline with camera svg), `.video-testimonial-quote` (`22px italic; padding-left:24px;
  border-left:3px solid --primary-light`), `.video-testimonial-author` (56×56 round avatar bordered
  `--primary-light`, name `18px/600`, relation muted).
- **Inline player JS (port + graceful):** on thumbnail click, replace the button with a `<video controls
  playsinline preload=metadata controlslist=nodownload>` + `<source>` + `<track kind=captions default>`,
  `poster` from `media`, then `.play()` (catch rejection — controls stay visible). `data-video`/`data-captions`/
  `data-poster` carried on the button (from `body`/skin/media). **Graceful degradation:** if JS is disabled
  the thumbnail is still a real link/button to the captioned video file (wrap an `<a href={videoSrc}>` around
  the poster as the no-JS fallback, progressively enhanced into the inline swap) so it never dead-ends.
**Data:** `title` = `<h2>`; `rating` = aggregate score (stars); `media` = poster/avatar; `body` (lexical) =
the quote + author name/relation + transcript paragraphs (parse: first paragraph = quote, a heading =
author name, following paragraph = relation, remaining = transcript) OR — cleaner — store the video src and
captions path as the FIRST link in a `links`/skin field; keep it pragmatic and document the parse. Provide the
mockup's Johnson-family defaults. Editable: `data-payload-subfield="title"` (h2 `data-role="heading"`),
`"body"` (quote/transcript), `"media"` (poster), `"rating"` (stars container).
**Responsive:** **1024px:** `.video-testimonial` → 1 col; `.rating-bar` wraps (`gap:8px`). **768px:** quote
`18px; padding-left:16px`; rating-bar centered, hide the first `.rating-bar-detail`. **480px:** quote `17px`;
avatar 44×44; star svgs 16×16; score 16px.
**Steps:**
1. Build the `"use client"` block: rating bar (token stars from `rating`), two-column grid, thumbnail→video
   swap with the ported JS as an `onClick` handler + `<a>` no-JS fallback, transcript `<details>`.
2. Register `"video-testimonial": VideoTestimonialBlock`.
3. tsc → build → lint → hex grep → P0 harness vs magnolia `.section-sage-deep` video-testimonial at
   {1440,1024,768,480}; verify the click-to-play swap works (Playwright `.click()` then assert a `<video>`
   exists) and that with JS off the poster links to the video file.
**Verification:** two columns at ≥1025 → one at ≤1024; stars are `--accent` and reflect `rating`; quote has
the `--primary-light` left border; CC chip + transcript present; inline player swaps in and keeps captions;
no-JS fallback links out; zero hex; lint clean.
**Commit:** `feat(golden-oaks): video-testimonial block (rating bar + inline player)`.

---

### Task 7 — `card-carousel` (NEW): scroll-snap carousel with prev/next, degrades gracefully
**Mockup:** `components/card-carousel/card-carousel.html`; **in situ:** `pages/magnolia.html` L13751
(`<section class="card-carousel section-sage has-branch-bg">` → "You Might Also Like", 5 floor-plan cards).
**Files:** `src/components/blocks/CardCarouselBlock.tsx` (new) — a `"use client"` component (prev/next buttons
+ scroll tracking); `registry.ts`. Depends on Task 0 (`items`, `settings`).
**Selectors / spec (exact):**
- `.card-carousel` section `padding:80px 0`; bg from `settings.background` (mockup uses `section-sage` +
  `has-branch-bg` → P0 `--color-section-sage` + leaf utility). `.card-carousel-header`: flex space-between,
  `<h2>` (`margin-bottom:0`) + `.card-carousel-nav` (two 44×44 round buttons, `2px solid --neutral-300`,
  hover border `--primary` bg `--primary-light`, `:disabled` opacity .3; svg chevrons stroke `--neutral-700`).
- `.card-carousel-track`: `display:flex; gap:24px; overflow-x:auto; scroll-snap-type:x mandatory;
  scroll-behavior:smooth; scrollbar-width:none` (+ webkit hidden). `.card-carousel-card`: `min/max-width 320px;
  flex-shrink:0; scroll-snap-align:start; bg --white; radius var(--radius); border 1px --neutral-100`; hover
  `translateY(-3px)` + shadow. Card is an `<a>` link. `.card-carousel-image` `aspect-ratio 16/10` cover,
  hover `scale(1.05)`. `.card-carousel-body` `padding:24px`: `h3` `20px`, optional `.card-carousel-meta`
  (spec spans, `--neutral-500`), optional `.card-carousel-price` (`17px/600 --primary-dark` pushed to bottom
  with `margin-top:auto`), or a description `p`.
**Data:** `items[]` — `item.media` (card image), `item.label` (`h3` title), `item.link` (card href), and
`item.text` (lexical) for either the meta row OR a description (the mockup shows BOTH layouts: floor-plan meta
+ price, and a plain description). Pragmatic mapping: render `item.text` lexical; if it's a short list treat as
the meta row, if a paragraph treat as description. `title` = `<h2>`. Bind `data-payload-subfield="items"` +
`data-array-prop="items"` on the track, `data-array-index={i}` per card.
**Client behavior + graceful degradation (bake-in #3):**
- Prev/next buttons `scrollBy(±(320+24), smooth)`; a `scroll` listener toggles `disabled` at the ends
  (`scrollLeft<=0` / `scrollLeft+offsetWidth>=scrollWidth-2`). Port from the mockup JS into a small
  `useEffect`/ref handler.
- **No-JS / pre-hydration:** the track is a native `overflow-x:auto` scroll-snap row — it is fully usable by
  touch/trackpad/keyboard WITHOUT the buttons. Render the nav buttons but they enhance, not gate. If the block
  ever renders server-only, the row still scrolls. Respect `prefers-reduced-motion` by dropping
  `scroll-behavior:smooth` under `motion-reduce:`.
**Responsive:** **768px:** section `padding:48px 0`; card `min/max-width 280px`. No 1024/480 changes in the
mockup (the carousel is intrinsically responsive via horizontal scroll).
**Steps:**
1. Build the `"use client"` block: header (h2 `data-role="heading"` + nav), the scroll track with cards,
   button handlers + disabled-state effect. Keyframes/scroll via CSS (token-free transforms).
2. Register `"card-carousel": CardCarouselBlock`.
3. tsc → build → lint → hex grep → P0 harness vs magnolia card-carousel at {1440,1024,768,480}; Playwright
   click next/prev and assert `scrollLeft` changes and end-buttons disable; confirm the row scrolls with the
   buttons removed from the DOM (graceful-degradation check).
**Verification:** cards 320/280 across the 768 break; nav buttons disable at the ends and use `--primary`
hover tokens; cards are real links; track scrolls without JS; reduced-motion drops smooth scroll; zero hex;
lint clean.
**Commit:** `feat(golden-oaks): card-carousel block (scroll-snap + prev/next, graceful)`.

---

## Final verification (whole plan)

1. `tsc --noEmit` clean; `bun run build` clean (all 6 new + 2 refined renderers registered).
2. `bun run lint:direct-edit` → "ok no direct-edit coverage issues found" (every `data-role` element binds a
   plain string prop; no template-literal/non-literal call sites).
3. `grep -rnE "#[0-9a-fA-F]{6}" src/components/blocks/{ContentIntroBlock,ContentBlocksBlock,IconCardGridBlock,CardCarouselBlock,VideoTestimonialBlock,GalleryBlock,TimelineBlock}.tsx` → no matches (colors are tokens; the only literal colors permitted are token-free neutral `white/black` alpha on overlays/scrims, expressed via Tailwind `/NN` or `color-mix(in srgb, var(--…) …)`).
4. **Customizability proof:** flip `--color-primary` (P0 flip-test) → drop caps, timeline spine, list markers,
   icon-card accents, CTA links, rating-bar links all re-color. Set `icon-card-grid` `settings.variant`
   to each of `dark`/`brown`/`light` → section bg swaps between the three P0 section tokens (no block swap).
5. **Editability proof:** in the nocms preview, clicking each field (intro paragraph, a cb-* sub-block, an
   icon card, a carousel card, the video quote/rating) resolves to the right `data-payload-doc-id` +
   `data-payload-block-id` + `data-payload-subfield` (+ `data-array-index` for repeatables).
6. **1:1 proof:** P0 harness screenshots for all seven blocks at {1440, 1024, 768, 480} match the mockup
   component/in-situ pages (geometry + computed brand tokens + visual). Defer the holistic per-page sign-off to
   Plan 9.
