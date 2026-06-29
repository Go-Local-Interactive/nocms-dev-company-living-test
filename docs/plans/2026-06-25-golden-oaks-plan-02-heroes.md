# Golden Oaks Plan 02 — Hero Variants

> **For Claude:** REQUIRED SUB-SKILLS: gli-toolkit:writing-plans (to author), gli-toolkit:subagent-driven-development
> (to execute). See the roadmap `2026-06-25-golden-oaks-1to1-overview.md` (esp. **Cross-cutting requirements**)
> and `2026-06-25-golden-oaks-plan-00-design-system.md` (tokens / editor-contract / variant conventions).
> **Depends on Plan 00** (exact palette, semantic section tokens, hero-overlay token, audit harness, the
> `settings` atom). Do Plan 01 (chrome) first if the breadcrumb base styles are needed for interior heroes;
> the breadcrumb base ships from `globals.css` and is fine to consume here.

**Goal:** Render the **five Golden Oaks hero patterns 1:1 (including responsiveness)** as **ONE `HeroBlock`
driven by `settings.variant`** plus the shared interior-header **`PageHero`** — not five separate blocks:
- **`video` / immersive** — homepage: full-bleed photo (video-ready) + dark diagonal overlay + white serif
  h1 (64px desktop) + subtitle + two buttons (terracotta primary + white outline). (`index.html`)
- **`fullbleed`** — interior page header: full-bleed photo + same overlay + centered breadcrumb + white serif
  h1 (3.5rem) + tagline + animated scroll-cue. (`independent-living.html` `.page-hero`)
- **`split-stats`** — two-column: sage (or dark) text panel with breadcrumb + h1 + tagline + 3 icon stats,
  beside a right-hand image with hover-zoom + caption. (`magnolia.html`)
- **`toprow`** — compact sage band: breadcrumb top-row + h1 + drop-cap intro paragraph, with a decorative
  right-aligned floral image. (`our-team.html`)
- **`stats`** — compact cream (or dark) band: breadcrumb + h1 + drop-cap intro + a horizontal stats bar.
  (gallery / activities pages)

**Cross-cutting (NON-NEGOTIABLE — proven per task):**
1. **Token-only color/overlay/fonts.** Every color, the overlay gradient, and every font come from the
   `--color-*` / `--font-*` tokens established in Plan 00 (consumed as Tailwind v4 utilities, e.g.
   `bg-section-sage`, `text-white`, `font-heading`, or `var(--color-hero-overlay-from)` in an inline gradient).
   **No hex / rgba literals in `HeroBlock.tsx` or `PageHero.tsx`** — `grep -nE "#[0-9a-fA-F]{3,6}|rgba?\("` over
   both files must return nothing.
2. **Editable.** Root `data-nocms-component="hero"`; `data-payload-subfield` on headline / subhead / each button
   / media (and stat values/labels where editable); editable text also carries `data-role` so the direct-edit
   pipeline resolves it. Rendered inside `RenderBlocks` (which adds `data-payload-doc-id/-collection/-field/
   -block-id`). `bun run lint:direct-edit` stays clean.
3. **Customizable.** `settings.variant` selects the layout (ONE block, N variants); the default variant falls
   back to `skin.config.heroVariant`. Golden Oaks is the DEFAULT skin — another brand re-skins via tokens +
   `skin.config` + re-content, with zero code change.

**Verification:** `tsc --noEmit`, `bun run build`, and the **Plan-00 Playwright 1:1 audit harness**
(`scripts/go-audit.py`, mockup on `http://localhost:8088/pages/<page>.html`) at **{1440, 768, 480}** — compare
the rendered hero's computed tokens (overlay, h1 font-family/size/color), section bounding box, and a screenshot
diff. No unit suite. Serve the mockup: `python3 -m http.server 8088 --directory ~/Desktop/design/golden-oaks`
(already running this session).

---

## Reference — exact values to hit (from the mockup sources)

**Overlay / gradient (full-bleed variants — `video`, `fullbleed`):**
- `video` (`hero-video.html` `.hero--immersive::before`): `linear-gradient(135deg, rgba(62,90,61,0.65) 0%,
  rgba(44,34,24,0.70) 100%)`.
- `fullbleed` (`independent-living.html` `.page-hero::before`, `hero-fullbleed.html`): same angle, slightly
  lighter top stop — `linear-gradient(135deg, rgba(62,90,61,0.60) 0%, rgba(44,34,24,0.70) 100%)`.
- `rgb(62,90,61)` = a darkened forest-green, `rgb(44,34,24)` = the neutral brown text color. **Plan 00 exposes
  these as tokens** — `--color-hero-overlay-from` (green) and `--color-hero-overlay-to` (brown); if Plan 00 has
  not added them yet, add them there (do NOT inline new hex here). Apply the gradient via inline
  `style={{ background: "linear-gradient(135deg, var(--color-hero-overlay-from) 0%, var(--color-hero-overlay-to) 100%)" }}`
  with the alpha baked into the token value, OR `bg-[linear-gradient(...)]` referencing the token. **The current
  `HeroBlock` hardcodes a WRONG brown-only gradient (`rgba(84,44,27,…)`) — replace it.**

**Headline (`<h1>`, `font-heading` = Libre Baskerville 700, `line-height` per variant) — responsive scale:**

| variant | desktop (≥1024) | 1024 | 768 | 480 | line-height |
|---|---|---|---|---|---|
| `video` | 4rem (64px) | 2.75rem | 2.25rem | 1.85rem | 1.1 |
| `fullbleed` / PageHero | 3.5rem | 3.5rem | 2.5rem | 2rem | 1.1 |
| `split-stats` | 3rem | 2.4rem | 2rem | 1.75rem | 1.1 |
| `toprow` / `stats` | 2.75rem | 2.25rem | 2rem | 1.5rem | 1.15 |

Tailwind mapping (mobile-first; the table is max-width, Tailwind is min-width — invert): e.g. `video` =
`text-[1.85rem] min-[480px]:text-[2.25rem] md:text-[2.75rem] lg:text-[4rem]`. (Confirm `md`=768, `lg`=1024 in
the template's Tailwind theme; if Plan 00 set custom breakpoints, use those. The mockup breakpoints are
1024/960/768/640/550/480 — only 1024/768/480 are audited.)

**Subtitle / tagline:** `font-body`, weight 300, `text-white/95` on dark variants; `1.25rem` desktop → `1rem`
@768. `video` subtitle margin-bottom 48px; `fullbleed` tagline `max-inline-size: 70ch`, centered.

**Buttons (homepage `video`):** primary = `.btn-secondary` (terracotta `--color-secondary` bg, white text,
radius 6px, min-width 240px, 14px/32px padding); secondary = `.btn-outline` (transparent, 2px white border,
white text; hover → white bg + `--color-primary` text). Both stack to full-width column @768/@480. Mockup CTA
labels: **"Schedule a Tour"** → `/schedule-tour`, **"Explore Living Options"** → `/living-options`.

**Heights:** `video` = `85vh` / min 600px (→ 70vh/500 @1024 → 65vh/450 @768 → 60vh/400 @480);
`fullbleed`/PageHero = 600px (→ 450 @768 → 380 @480); `split-stats` = `min-height:500px` grid `1fr 1fr`
(→ single-column @768, image `order:-1` height 320px → 240 @480); `toprow`/`stats` = `padding:40px 0 48px`
(→ 32px @768 → 28px @480).

**Backgrounds (interior, token-driven):** `split-stats` text panel = `--color-section-sage` (mockup
`--sage-whisper`); `toprow` band = `--color-section-sage`; `stats` band = `--color-section-cream`; dark
modifiers (`split-stats--dark`, `stats--dark`, used on `magnolia.html`) = `--color-section-dark` (primary-dark
green) with white text. Stat icon chip = `--color-primary-light` bg / `--color-primary` stroke (light) or
`white/12` + `--color-accent-light` (dark). Drop-cap (`.has-drop-cap::first-letter`) = `font-heading` 4.5rem
`--color-primary` (light) / `--color-accent-light` (dark).

**`split-stats` image caption:** bottom gradient `linear-gradient(to top, brown/0.75, brown/0.35 60%, transparent)`
revealed on hover (use `--color-hero-overlay-to` for the brown). Image hover-zoom `scale(1.05)` 0.5s.

**Scroll-cue (`fullbleed`):** 56×56 rounded-12 button, `--color-primary-dark` bg, `white/25` border, animated
`scrollBounce` (translateY 0→5px) + inner wheel `wheelPulse`; click smooth-scrolls to the next section. Decorative,
`aria-label`. **CSS keyframes live in `globals.css`** (add in this plan's Task that touches PageHero, or confirm
Plan 00/01 added them) — referenced via class, no JS library.

**Decorative floral (`toprow`/`stats`):** `::before` right-aligned `width:55%` (→ 50% @768 → 45% @480),
`background: url(<media>/hero-flowers.png) center/cover`. Image path from Plan 00's `public/` media convention
(e.g. `/golden-oaks/images/hero-flowers.png`). On `stats--dark`, the floral is `opacity:0.08`.

---

### Task 1 — Extend the variant contract: skin union, `settings` atom, hero-overlay tokens
**Files:** `src/skin.config.ts`; `src/lib/payload.ts`; `src/app/globals.css` (overlay tokens + scroll-cue/floral
keyframes if not already from Plan 00); cross-check `nocms`'s atomic block schema doc for the `settings.variant`
field added in Plan 00 Task 5.
**Steps:**
1. Extend the `heroVariant` union in `SkinConfig` to the five GO variants:
   `"video" | "fullbleed" | "split-stats" | "toprow" | "stats"` (keep `"image" | "search" | "simple"` as
   back-compat aliases mapped internally — `image`→`fullbleed`, `simple`→a text-only fullbleed-no-media,
   `search`→`fullbleed`+search form — so existing data and `PageHero` callers don't break). Set the default
   `skin.config.heroVariant` to `"video"` (Golden Oaks homepage). Document the alias map in a comment.
2. Add a per-block variant override to `PayloadAtomicBlock` in `payload.ts`:
   `settings?: { variant?: string; [k: string]: unknown } | null`. (Plan 00 Task 5 adds the matching
   `settings` group atom in the Payload schema; this is the read-side type.) Renderer precedence:
   `block.settings?.variant ?? skin.config.heroVariant`.
3. Confirm Plan 00 exposed `--color-hero-overlay-from` / `--color-hero-overlay-to` (alpha-baked: green 0.65/0.60,
   brown 0.70). If absent, add them to the `@theme` block referencing the green/brown bases (document that the
   alpha differs slightly between `video` 0.65 and `fullbleed` 0.60 — expose both `--color-hero-overlay-from`
   at 0.65 and a `--color-hero-overlay-from-soft` at 0.60, or parameterize per variant). Add the `scrollBounce`
   and `wheelPulse` `@keyframes` + `.scroll-cue` token-driven styles to `globals.css` if not present.
4. **Verify:** `tsc --noEmit`; `bun run build`. Confirm no hardcoded overlay hex remains in components
   (grep is in later tasks). Commit: `feat(golden-oaks): hero variant contract — skin union, settings.variant, overlay tokens`.
**Verification:** `tsc --noEmit` clean; build clean; `heroVariant` union + `settings.variant` type compile;
overlay tokens resolve in a built page (inspect computed style on a temporary test render).

### Task 2 — `HeroBlock` `video`/immersive variant (homepage, full-bleed photo + overlay) — 1:1
**Files:** `src/components/blocks/HeroBlock.tsx`
**Steps:**
1. Rewrite `HeroBlock` to switch on the resolved variant (Task 1 precedence). Implement the **`video`** branch:
   full-bleed `<img>` fallback (`object-cover`, `loading="eager"`, `data-payload-subfield="media"`,
   `data-role="media"`) + an optional `<video>` layer when `media` is a video URL or `skin.config` supplies a
   playlist (autoplay/muted/loop/playsInline, `hidden md:block motion-reduce:hidden`, `aria-hidden`); height
   `85vh min-h-[600px]` with the responsive height steps from the Reference table.
2. Overlay: a `z-[1]` absolute layer using the **token gradient** (135deg, `--color-hero-overlay-from` 0.65 →
   `--color-hero-overlay-to` 0.70) — replace the existing wrong brown literal.
3. Content (`z-[2]`, centered, `max-w-3xl`, `px-6 sm:px-10 lg:px-16`):
   - `<h1>` `font-heading font-bold leading-[1.1] text-white`, responsive scale `text-[1.85rem]
     min-[480px]:text-[2.25rem] md:text-[2.75rem] lg:text-[4rem]`, `data-payload-subfield="title"`
     `data-role="heading"`, `textWrap:balance`. Mockup copy: "Where Every Day Feels Like Home".
   - subtitle `<p>` `font-body font-light text-white/95 leading-relaxed mb-12`, `1.25rem`→`1rem`@768,
     `data-payload-subfield="body" data-role="subheading"`.
   - two buttons in a `flex-col sm:flex-row gap-5` row, each `min-w-[240px]` and full-width on mobile, with
     `data-payload-subfield="primaryCta"` / `"secondaryCta"`: primary terracotta (`bg-secondary text-white`,
     `rounded-md`, 14/32 padding, hover `-translate-y-0.5` + shadow), secondary outline
     (`border-2 border-white text-white hover:bg-white hover:text-primary`). Labels/hrefs from the block CTA
     fields, defaulting to "Schedule a Tour"→`/schedule-tour` and "Explore Living Options"→`/living-options`.
   - keep the existing `search`-form sub-render available when variant resolves to search (back-compat).
4. Root `<section data-nocms-component="hero" class="relative w-full overflow-hidden">`.
5. **Verify token-only + editor contract:** `grep -nE "#[0-9a-fA-F]{3,6}|rgba?\(" src/components/blocks/HeroBlock.tsx`
   → empty; confirm `data-nocms-component` + all `data-payload-subfield`s present; `bun run lint:direct-edit` clean.
6. **Verify 1:1:** `tsc --noEmit` → `bun run build` → run the Plan-00 harness on the homepage (`index.html` vs the
   rendered `/`) at {1440,768,480}: assert overlay computed gradient matches (green→brown alphas), h1
   `font-family`=Libre Baskerville and `font-size`≈{64,36,29.6}px, hero box height ≈85vh/65vh/60vh, two CTAs
   present and stacked @480. Screenshot-diff. Commit: `feat(golden-oaks): HeroBlock video/immersive variant 1:1`.
**Verification:** harness diff within tolerance at all three widths; grep token-clean; lint clean; build clean.

### Task 3 — `HeroBlock` `fullbleed` variant + share it as `PageHero` (interior page header) — 1:1
**Files:** `src/components/blocks/HeroBlock.tsx`; `src/components/layout/PageHero.tsx`
**Steps:**
1. Add the **`fullbleed`** branch to `HeroBlock`: identical full-bleed image + token overlay (135deg
   `--color-hero-overlay-from-soft` 0.60 → `--color-hero-overlay-to` 0.70), fixed `h-[600px]` (→ 450 @768 → 380
   @480), centered content `max-w-[800px]`. Contents: an optional centered breadcrumb (white,
   `data-role="breadcrumb"`), `<h1>` `text-white font-heading leading-[1.1]` scaled `text-[2rem]
   md:text-[2.5rem] lg:text-[3.5rem]` (`data-payload-subfield="title"`), tagline `<p>` `text-white/95 font-light`
   `max-w-[70ch] mx-auto` (`data-payload-subfield="body"`), and the **scroll-cue** button (class-driven, smooth-
   scroll to next section, `aria-label`). mb: h1 16px, tagline 48px.
2. **Refactor `PageHero`** to render the SAME fullbleed markup (extract a shared presentational
   `FullbleedHero` sub-component used by both, or have `PageHero` import and delegate to `HeroBlock`'s fullbleed
   path with route-supplied props). Keep `PageHero`'s existing prop API (`title/subtitle/ctas/backgroundImage/
   breadcrumb`) so route templates (Plan 08) keep working; map its old `image`/`simple`/`search`/`video`
   variants onto the new branches (`image`→fullbleed; `simple`→fullbleed-no-media on `bg-primary`;
   `video`→video; `search`→fullbleed+search). Replace `PageHero`'s hardcoded `from-text/60…` overlay with the
   token gradient. Keep `data-nocms-component="layout/page-hero"` on the `PageHero` root (it is chrome, not a
   block) but reuse the identical inner DOM/classes so both render pixel-identical.
3. **Verify token-only:** grep both files for hex/rgba → empty (the `text-white/95`, `border-white` opacity
   utilities are token-derived via `--color-white`/Tailwind alpha, allowed). Editor contract intact on
   `HeroBlock`'s fullbleed (`data-nocms-component="hero"` + subfields).
4. **Verify 1:1:** `tsc --noEmit` → build → harness on `independent-living.html` (`.page-hero`) at {1440,768,480}:
   overlay 0.60→0.70 gradient, h1 ≈{56,40,32}px white serif, box height {600,450,380}px, breadcrumb centered,
   scroll-cue present + bouncing. Commit: `feat(golden-oaks): HeroBlock fullbleed + PageHero share 1:1`.
**Verification:** harness diff within tolerance; PageHero and HeroBlock fullbleed render identical DOM;
grep token-clean; tsc/build clean.

### Task 4 — `HeroBlock` `split-stats` variant (image + heading + icon stats, light & dark) — 1:1
**Files:** `src/components/blocks/HeroBlock.tsx`
**Steps:**
1. Add the **`split-stats`** branch: a `grid grid-cols-2 min-h-[500px] overflow-hidden` (→ `grid-cols-1` @768).
   Left text panel `bg-section-sage` (dark modifier `bg-section-dark` when `settings.variant === "split-stats-dark"`
   or `settings.tone === "dark"`), `flex items-center`, padding `60px 60px 60px 0` (→ `40px 24px` @768), inner
   `max-w-[560px] ml-auto pl-10`. Right image panel `relative overflow-hidden` with `<img>` `object-cover` +
   hover `scale-105` (group-hover) and a hover-revealed caption overlay (bottom brown gradient via
   `--color-hero-overlay-to`, `data-label`/`data-payload-subfield="mediaCaption"`); on mobile the image gets
   `order-first h-[320px]` (→ 240 @480).
2. Left content: centered-left breadcrumb (`data-role="breadcrumb"`, sage→neutral colors, dark→white/85),
   `<h1>` `text-neutral-900` (dark→`text-white`) `font-heading leading-[1.1]` scaled `text-[1.75rem]
   min-[480px]:text-[2rem] md:text-[2.4rem] lg:text-[3rem]` (`data-payload-subfield="title"`), tagline
   `text-neutral-700` (dark→`white/85`) `1.15rem` (`data-payload-subfield="body"`), then a **stats row**
   (`flex gap-6 pt-7 border-t border-neutral-300`, dark→`border-white/20`; wrap to thirds @768) of up to 3
   `hero-stat`s, each = icon chip (`44×44 rounded-[10px] bg-primary-light`, dark→`bg-white/12`; svg
   `stroke-primary-dark`, dark→`stroke-sand`; hover lifts + fills `bg-primary`) + value
   (`font-heading 1.35rem text-primary-dark`, dark→white) + label (`text-neutral-500 16px`). Stats come from
   `mediaArray`/a `stats` settings array or a `RowGroup`-style child; mark each value/label editable
   (`data-payload-subfield="statValue"/"statLabel"` on a repeatable). Mockup data: 6 Floor Plans / 3 Care Levels
   / 450+ Square Feet; magnolia uses the **dark** modifier.
3. **Verify token-only** (grep) + editor contract (root + subfields on h1/tagline/caption/stats); lint clean.
4. **Verify 1:1:** `tsc --noEmit` → build → harness on `magnolia.html` (split-stats--dark) at {1440,768,480}:
   two-column→stacked@768 with image first, dark green panel, h1 ≈{48,32,28}px, 3 stats with icon chips, border
   rule present. Commit: `feat(golden-oaks): HeroBlock split-stats variant (light+dark) 1:1`.
**Verification:** harness diff within tolerance incl. the @768 stack + image `order` flip; dark modifier matches
primary-dark; grep token-clean; tsc/build clean.

### Task 5 — `HeroBlock` `toprow` + `stats` variants (compact band heroes, light & dark) — 1:1
**Files:** `src/components/blocks/HeroBlock.tsx`
**Steps:**
1. Add the **`toprow`** branch: `<section>` `bg-section-sage relative overflow-hidden`, padding `40px 0 48px`
   (→ 32px @768 → 28px @480), with a decorative `::before`-equivalent layer (an absolutely-positioned
   `aria-hidden` div, right-aligned `w-[55%]` → 50%/45%, `bg-[url(...)] bg-cover bg-center` pointing at the
   Plan-00 floral media path) under a `relative z-[1] max-w-[1200px] mx-auto px-10` content wrapper. Content:
   breadcrumb top-row (`data-role="breadcrumb"`), `<h1>` `text-neutral-900 font-heading leading-[1.15]` scaled
   `text-[1.5rem] min-[480px]:text-[2rem] md:text-[2.25rem] lg:text-[2.75rem]` (`data-payload-subfield="title"`),
   and a drop-cap intro `<p class="has-drop-cap">` (`data-payload-subfield="body"`, drop-cap from `globals.css`).
   Mockup copy: "The People Behind the Care" + the team intro paragraph.
2. Add the **`stats`** branch: same band shell as `toprow` but `bg-section-cream` default + `bg-section-dark`
   dark modifier (floral `opacity-[0.08]` when dark), same breadcrumb + h1 scale + drop-cap intro, then a
   **stats bar** (`flex justify-between pt-7 mt-7 border-t border-neutral-300`; → 2-col grid @1024 → column
   @480) of `hero-stat`s with `hero-stat-number` (`font-heading 28px text-primary`, dark→white). Stats source/
   editability identical to Task 4. Drop-cap color `--color-primary` (dark→`--color-accent-light`).
3. **Verify token-only** (grep) + editor contract; `bun run lint:direct-edit` clean.
4. **Verify 1:1:** `tsc --noEmit` → build → harness on `our-team.html` (toprow) and a stats page (e.g.
   `activities-events.html` or `photo-video-gallery.html`) at {1440,768,480}: sage/cream band height, h1
   ≈{44,32,24}px, drop-cap first-letter present + colored, floral on the right, stats bar layout flips per
   breakpoint. Commit: `feat(golden-oaks): HeroBlock toprow + stats variants 1:1`.
**Verification:** harness diff within tolerance at all widths incl. drop-cap + floral + stats-bar reflow;
grep token-clean; lint clean; tsc/build clean.

### Task 6 — Cross-variant audit, defaults, and editor-contract sign-off
**Files:** `src/components/blocks/HeroBlock.tsx`; `src/components/layout/PageHero.tsx`; `src/skin.config.ts`;
`docs/CONVENTIONS-golden-oaks.md` (append a Hero note)
**Steps:**
1. **Re-skin proof (customizable):** temporarily flip `--color-primary` and `--color-secondary` in `globals.css`,
   `bun run build` the homepage + an interior page, confirm the overlay, buttons, sage panels, stat chips, and
   drop-caps all re-theme (proves token-driven, no literals leaked). Revert. Swap `skin.config.heroVariant`
   between all five values against the SAME block data and confirm each renders the right layout (proves one
   block / N variants).
2. **Editor-contract sweep:** every hero variant root carries `data-nocms-component="hero"`; every editable
   field (`title`, `body`, each CTA, `media`, `mediaCaption`, stat values/labels) carries
   `data-payload-subfield` (+ `data-role` on text); `bun run lint:direct-edit` reports zero hero findings.
   Confirm the variants render through `RenderBlocks` (so `data-payload-doc-id/-collection/-field/-block-id` wrap
   them) by checking a built page's DOM.
3. **Full harness pass:** run `scripts/go-audit.py` across all four hero pages (`index`, `independent-living`,
   `magnolia`, `our-team`) + one stats page at {1440,768,480}; record any residual deltas and fix. Update
   `docs/CONVENTIONS-golden-oaks.md` with the hero variant list + the `settings.variant` precedence rule.
4. `tsc --noEmit` + `bun run build` clean. Commit: `chore(golden-oaks): hero variant audit + editor-contract sign-off`.
**Verification:** flip-test re-themes all hero chrome; all five variants selectable from one block; lint clean;
harness within tolerance on every hero page; tsc/build clean.

---
**Final:** `tsc --noEmit` + `bun run build` clean; `bun run lint:direct-edit` reports no hero findings;
`grep -nE "#[0-9a-fA-F]{3,6}|rgba?\("` over `HeroBlock.tsx` + `PageHero.tsx` is empty; the Plan-00 harness diffs
within tolerance for `video`/`fullbleed`/`split-stats`/`toprow`/`stats` at {1440,768,480}; the token flip-test
re-themes every hero; all five variants render from one `HeroBlock` via `settings.variant`. Then proceed to
P3 (homepage composition), which consumes the `video` hero.
