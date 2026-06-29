# Golden Oaks Plan 03 — Homepage Block Set + Compose the Homepage 1:1

> **For Claude:** REQUIRED SUB-SKILL: gli-toolkit:subagent-driven-development. Read the roadmap
> `2026-06-25-golden-oaks-1to1-overview.md` (esp. **Cross-cutting requirements**) and
> `2026-06-25-golden-oaks-plan-00-design-system.md` FIRST. This plan **depends on P0** (exact tokens,
> `--color-section-*` / `--color-overline` semantic tokens, base button/card/radius utilities, media copied
> into `public/`, the `settings.variant` atom, and the `scripts/go-audit.py` 1:1 harness) and references
> chrome from **P1** (Header/Footer, Help Badge, Accreditation Bar) and the hero from **P2**. Do P0 → P1 → P2
> before this. The carousel ("Why People Choose Golden Oaks") is **P4** (card-carousel); the
> care-level grid + assessment-callout are **P5** — this plan only **composes** them in, it does not build them.

**Goal:** Build the new homepage block renderers (feature-sections, lifestyle-cards, resource-cards,
pricing-cards) and refine the existing ones (crisis-band, reviews/video testimonial, final-cta, stats) so each
matches its Golden Oaks mockup component **1:1, responsively**, then **compose the homepage** (`slug: "home"`)
from these blocks so `/` renders pixel-for-pixel against `~/Desktop/design/golden-oaks/pages/index.html`.

## Source of truth

- **Homepage in situ (block sequence):** `~/Desktop/design/golden-oaks/pages/index.html`
  (hero-video → living-options → safety/stats → why-carousel → pricing `.section-cream` →
  testimonials-section [rating bar + video testimonial + testimonial shelf + accreditation-bar] →
  life `.section-sage` "A Day in the Life" → resources → final-cta).
- **Isolated component mockups:** `~/Desktop/design/golden-oaks/components/{feature-sections, lifestyle-cards,
  resource-cards, pricing-cards, crisis-band, reviews-grid, video-testimonial, final-cta}/*.html` (each carries
  its CSS, HTML, and JS, all written against `--*` tokens from `css/global.css`).
- **Existing renderers to refine:** `src/components/blocks/{CalloutBandBlock, StatsBarBlock,
  TestimonialBlock}.tsx`; the registry `src/components/blocks/registry.ts`.

## Cross-cutting requirements (NON-NEGOTIABLE — bake into EVERY task)

1. **Configurable colors / fonts / spacing — tokens only.** Never write a hex, named color, or raw font in a
   renderer. Map every color to the P0 `--color-*` tokens; **section backgrounds use the P0 semantic tokens**
   (`--color-section-cream`, `--color-section-sage`, `--color-section-light`, `--color-section-brown`,
   `--color-section-dark`), eyebrows use `--color-overline`, fonts use `--font-heading` / `--font-body`,
   radii/shadows use the P0 scale. After each task, `grep -nE "#[0-9a-fA-F]{6}|rgba?\(" src/components/blocks/<File>.tsx`
   must be empty (SVG-data-URI fills that must be literal — e.g. a checkmark `stroke` — are the only exception;
   prefer `currentColor` and only hardcode when a CSS pseudo/`url()` genuinely cannot read a var). Flipping one
   token must re-theme the block.
2. **Editor contract — every block stays inline-editable.** Each renderer's root carries
   `data-nocms-component="<slug>"` where `<slug>` **exactly equals** its registry key **and** the Payload block
   slug in `nocms/src/payload/blocks/atomic.ts`. Editable fields carry `data-role` + `data-payload-subfield`
   (`title`, `body`, `media`, `mediaArray`); repeated items carry `data-array-index={i}` and their container
   `data-payload-subfield="<field>"` (follow `CareLevelGridBlock` / `StatsBarBlock` exactly — body-derived
   content wraps in a `data-payload-subfield="body"` container; `mediaArray[i]` images get
   `data-payload-subfield={`mediaArray.${i}`}`). **Declare each NEW block's atoms in the Payload schema**
   (`nocms/src/payload/blocks/atomic.ts` — the block slug + which of `title`/`body`/`media`/`mediaArray`/`settings`
   it uses) so the inspector and seeder agree, then register the slug in `registry.ts`. `bun run lint:direct-edit`
   must stay clean (no new findings) after every task.
3. **Customizable — variants via `settings.variant`, NOT new blocks.** Where the mockup shows one layout family
   with multiple skins (pricing has a `featured` tier; testimonials render as a **reviews grid** on
   testimonials-reviews.html vs. a **video testimonial** on the homepage; feature-sections has a `dark`
   variant), express the variant through the block's `settings.variant` atom (P0 added `settings` to the schema
   + the `PayloadAtomicBlock` interface) — do **not** create one block per skin. Brand identity stays in
   `skin.config.ts` / the design-brief; Golden Oaks is the DEFAULT skin, not a hardcode (defaults live as
   in-code fallbacks so an empty/re-themed CMS still renders).

> **`settings` plumbing note (do this in Task 0 of the first sub-task that needs it, if P0 left it pending):**
> `PayloadAtomicBlock` (`src/lib/payload.ts`) and `BlockProps` (`src/components/blocks/types.ts`) currently
> expose only `title/body/media/mediaArray`. Confirm P0 added an optional
> `settings?: { variant?: string } | null` to `PayloadAtomicBlock`; if absent, add it (and mirror the atom in
> `nocms` `atomic.ts`) before the first variant task. Renderers read `settings?.variant` with a safe default.
> Until the schema field lands, a renderer may **temporarily** fall back to a title/body keyword sniff (as
> `CalloutBandBlock` does today), but `settings.variant` is the canonical path and must be wired here.

**Verification (all tasks):** the template has no unit suite. Each task verifies via `bun run build` (Next.js
typechecks + compiles — there is no separate `tsc`/`typecheck` script; `npx tsc --noEmit -p tsconfig.json` may be
run for a faster type-only loop), `bun run lint:direct-edit` (clean), the token grep above, and a **Playwright
1:1 diff** through the P0 harness:

```
python3 -m http.server 8088 --directory ~/Desktop/design/golden-oaks   # serve mockup (already running this session)
bun run dev                                                            # serve the template (note its port)
python3 scripts/go-audit.py --page index --section <css-selector> --breakpoints 1440,1024,768,480
```

The harness loads the mockup section (`:8088/pages/index.html` or the isolated component HTML) and the rendered
block side-by-side at each breakpoint and reports computed tokens (primary/secondary/accent/text + h2/h3
font-family/size), per-section bounding boxes, and screenshots for visual diff. A task is done when the diff is
within tolerance at all four breakpoints. Commit each task separately (conventional commits, scope
`golden-oaks`).

---

### Task 1 — PricingCardsBlock (NEW): pricing tiers with a `featured` variant, on `.section-cream`

Mockup: `components/pricing-cards/pricing-cards.html` + homepage `.section-cream` "Honest Pricing…" block
(`index.html` ~13070–13128 — note the homepage adds a `.pricing-intro` paragraph, a `.pricing-disclaimer`, and a
centered `.pricing-cta` secondary button).

**Files:** `src/components/blocks/PricingCardsBlock.tsx` (new); `src/components/blocks/registry.ts`;
`nocms/src/payload/blocks/atomic.ts` (declare `pricing-cards` atoms).

**Steps:**
1. New renderer keyed `pricing-cards`. Section wrapper uses `bg-[var(--color-section-cream)]` (the cream band is
   **required** per the mockup), centered `font-heading` h2 (`title`, `data-role="heading"`,
   `data-payload-subfield="title"`), optional intro paragraph from the first body paragraph
   (`data-payload-subfield="body"`).
2. Tiers grid: `repeat(auto-fit, minmax(300px,1fr))`, gap-10, `align-items:start`; collapse to a single column
   (max-width ~480px, centered) at ≤768px — match the mockup CSS. Each tier card: linen surface
   (`var(--color-surface)`/linen token), 6px radius (P0 `--radius`), 40px padding, soft shadow, a center-growing
   top accent bar on hover whose color **cycles per card** primary → secondary → accent (use the P0 tokens, not
   hex). Card contents: `.pricing-tag` pill (only on the featured tier), tier name h3, `.pricing-amount`
   (`font-heading`, with a muted `/month` `.pricing-period` span; per-card price color cycles
   primary-dark/secondary-dark/warm-brown via tokens), a checkmark feature `<ul>` (check disc = `--color-primary-light`
   bg + a forest-green check SVG — this `url()` data-URI stroke is the documented literal-hex exception; keep it
   in one constant), and a full-width CTA button using the P0 `.btn` primary style.
3. **`featured` variant** (the "Most Popular" / Assisted Living tier): render via the per-tier
   `settings.variant === "featured"` (or a `featured` flag parsed from the tier's body marker) — white surface,
   primary border, `scale(1.03)`. Do NOT make a second block. Below the grid: italic centered
   `.pricing-disclaimer` (second body paragraph) and a centered `.pricing-cta` secondary button.
4. **Data-flow** (follow `CareLevelGridBlock`): default to the 3 Golden Oaks tiers (Independent $3,200 / Assisted
   $4,500 *featured* / Memory $5,800 with their feature bullets) as in-code fallbacks; the lexical `body` overrides
   them — define a documented convention (e.g. each tier = an h3 [name] + a paragraph [`$amount /period` + a
   `featured` keyword sniff or `★` marker] + a check `list`; the disclaimer/intro are the non-tier paragraphs).
   Declare in `atomic.ts`: `pricing-cards` uses `title`, `body`, `settings`.
5. Register `"pricing-cards": PricingCardsBlock` in `registry.ts`.
6. **Verify:** `bun run build`; token grep empty (except the documented check data-URI); `lint:direct-edit`
   clean; `go-audit.py --page index --section ".section-cream"` (and the isolated `pricing-cards.html`) 1:1 at
   1440/1024/768/480 — confirm the featured card scale, accent-bar cycling, single-column stack, and the
   disclaimer/CTA. Commit: `feat(golden-oaks): pricing-cards block with featured variant on section-cream`.

### Task 2 — FeatureSectionsBlock (NEW): alternating image/text rows, with a `dark` variant

Mockup: `components/feature-sections/feature-sections.html` (used on Amenities; included here per the overview
reuse table — it is the canonical alternating-row primitive the homepage's amenity/feature storytelling reuses).

**Files:** `src/components/blocks/FeatureSectionsBlock.tsx` (new); `registry.ts`; `nocms` `atomic.ts`.

**Steps:**
1. New renderer keyed `feature-sections`. Each row: `grid-cols-1 md:grid-cols-2`, gap-16, `items-center`, 80px
   vertical padding; **even rows flip** the image to the right (CSS `direction:rtl` trick on `md+`, reset to one
   stacked column image-on-top at ≤768px). Rows after the first get a 1px top divider (`--color-neutral-100`
   token / `--color-text` at low opacity).
2. Image side: `--radius`, `overflow-hidden`, soft shadow, `aspect-[4/3]` `object-cover`, subtle scale-on-hover.
   Bind `mediaArray[i]` per row (`data-payload-subfield={`mediaArray.${i}`}`, `data-array-index={i}`), container
   `data-payload-subfield="mediaArray"`.
3. Content side: an icon badge (56px, `--color-primary-light` bg, primary-stroke SVG), an `.fs-label` overline
   (uppercase, `--color-secondary-dark`/`--color-overline`), an h3 (`font-heading`), a lead paragraph, a check
   `.fs-highlights` list (round primary check discs), and an arrow `.fs-link` (primary, gap grows on hover).
4. **`dark` variant** via `settings.variant === "dark"`: `bg-[var(--color-section-brown)]`, accent-colored
   labels/checks/icons, white headings, translucent-white body — all via tokens (see the mockup's
   `.feature-sections-dark` block). One block, not two.
5. **Data-flow:** each top-level h3+paragraph(+list) group in `body` = one row's label/title/description/highlights
   (extend the `lexicalQAPairs` pattern; the `.fs-label` overline can be the h3's leading "Label — Title" split,
   or a dedicated convention you document); `mediaArray[i]` is row i's photo; optional per-row link. Sensible
   in-code defaults (Dining / Wellness / Social …) so an empty CMS still renders. Declare `feature-sections`
   atoms (`title?`, `body`, `mediaArray`, `settings`) in `atomic.ts`; register the slug.
6. **Verify:** `bun run build`; token grep empty; `lint:direct-edit` clean; `go-audit.py` against
   `feature-sections.html` (both default + `dark`) at all breakpoints — confirm the alternation, the 768px
   image-on-top stack, divider, and dark-variant tokens. Commit:
   `feat(golden-oaks): feature-sections block with dark variant`.

### Task 3 — LifestyleCardsBlock (NEW): sage section, 4-up portrait photo cards with caption overlay

Mockup: `components/lifestyle-cards/lifestyle-cards.html` (the homepage's "A Day in the Life" `.section-sage`
block — `index.html` ~13351–13383 — is the same family: sage bg, centered h2 + lead paragraph, a photo grid with
gradient caption labels, and a CTA/links row; reconcile the two via a variant so this block renders both).

**Files:** `src/components/blocks/LifestyleCardsBlock.tsx` (new); `registry.ts`; `nocms` `atomic.ts`.

**Steps:**
1. New renderer keyed `lifestyle-cards`. Section `bg-[var(--color-section-sage)]`, 80px padding; centered
   `font-heading` h2 (`title`), centered lead paragraph from `body` (`data-payload-subfield="body"`, max ~65ch).
2. Card grid: 4 columns → 2 at ≤900px → 1 at ≤480px; `gap-5`. Each card: 12px radius, `overflow-hidden`,
   `aspect-[4/5]` portrait (`16/10` at ≤480px), `object-cover`, lift-on-hover shadow. **Caption overlay**:
   bottom gradient (dark-green → transparent — derive from `--color-section-dark`/primary-dark, not a raw rgba),
   white 600-weight label text. Bind `mediaArray[i]` per card with the standard array attrs; the caption text
   comes from each media's alt or a documented body-list convention.
3. Buttons row: centered primary + secondary CTA (P0 `.btn` styles), stacking full-width at ≤480px.
4. **Homepage "Day in the Life" reconciliation:** the homepage variant shows a 6-up photo grid with hover labels
   and a `.life-links` arrow-link row instead of buttons. Express this as `settings.variant` (e.g. `"photo-grid"`
   vs the default `"cards"`) on **one** block — same renderer, two layouts — so the compose task (Task 9) can use
   it directly.
5. **Data-flow + defaults:** in-code default captions/photos (Dining, Gardens, Arts, Celebrations…) so an empty
   CMS renders; `body` lead paragraph + `mediaArray` captions override. Declare `lifestyle-cards` atoms
   (`title`, `body`, `mediaArray`, `settings`) in `atomic.ts`; register the slug.
6. **Verify:** `bun run build`; token grep empty; `lint:direct-edit` clean; `go-audit.py` against
   `lifestyle-cards.html` **and** the homepage `#life.section-sage` section at all breakpoints — confirm the
   sage token, 4→2→1 (and homepage 6-up) responsive grid, caption gradient, and the buttons-vs-links variant.
   Commit: `feat(golden-oaks): lifestyle-cards block (sage) with photo-grid variant`.

### Task 4 — ResourceCardsBlock (NEW): alternating image/content resource rows

Mockup: `components/resource-cards/resource-cards.html` + the homepage `#resources` section
(`index.html` ~13387–13436 — homepage adds a centered lead paragraph above the list and uses a `.btn-resource`
link instead of `.btn-primary`).

**Files:** `src/components/blocks/ResourceCardsBlock.tsx` (new); `registry.ts`; `nocms` `atomic.ts`.

**Steps:**
1. New renderer keyed `resource-cards`. Default (white/`bg-background`) section; centered `font-heading` h2
   (`title`) + optional centered lead paragraph (first `body` paragraph, `data-payload-subfield="body"`,
   max ~680px). `.resources-list` with ~48px top margin.
2. Each `.resource-row`: `grid-cols-1 md:grid-cols-2`, gap-12, `items-center`, 48px vertical padding, 1px bottom
   divider (`--color-neutral-300` token); first row no top padding, last row no bottom border. **Even rows flip**
   image right (rtl trick at `md+`, reset to one column at ≤768px). Image: `--radius`, `aspect-[4/3]`,
   `object-cover`, scale-on-hover; bind `mediaArray[i]` with the standard array attrs.
3. Content side: `.resource-tag` overline (uppercase, `--color-primary`/`--color-overline`), h3
   (`font-heading`, left-aligned), paragraph, and a left-aligned CTA button (P0 `.btn` — the homepage's
   `.btn-resource` is a button-style link; render it with the P0 button token classes).
4. **Data-flow + defaults:** each h3+paragraph group in `body` = one row's tag/title/description (extend the
   QA-pair convention; tag may be the h3's "Tag — Title" split or a documented marker); `mediaArray[i]` is the
   row image; in-code defaults (Free Guide / Article / Article) so an empty CMS renders. Declare `resource-cards`
   atoms (`title`, `body`, `mediaArray`, `settings`) in `atomic.ts`; register the slug.
5. **Verify:** `bun run build`; token grep empty; `lint:direct-edit` clean; `go-audit.py` against
   `resource-cards.html` **and** homepage `#resources` at all breakpoints — confirm row alternation, dividers,
   768px single-column stack, overline color. Commit:
   `feat(golden-oaks): resource-cards block (alternating rows)`.

### Task 5 — Refine CalloutBandBlock → Golden Oaks crisis-band (1:1)

Mockup: `components/crisis-band/crisis-band.html`. The current `CalloutBandBlock` (`data-nocms-component="crisis-callout"`)
is a generic amber-hollow band with Tailwind `red-*`/`accent` literals and an icon-left flex layout — re-skin it
to the GO crisis-band exactly while keeping its keyword/variant behavior.

**Files:** `src/components/blocks/CalloutBandBlock.tsx`; (no registry change — slug stays `crisis-callout`).

**Steps:**
1. Re-skin the **crisis** layout to the mockup: `bg-[var(--color-primary-dark)]` section with a low-opacity
   (~0.08) full-bleed background-image overlay (`/golden-oaks/crisis-band-bg.jpg` per the P0 media path),
   **centered** content; an 80px round **secondary**-bg icon circle holding a white heart SVG with the
   `crisis-pulse` keyframe ring; white `font-heading` h3 (`title`, `data-payload-subfield="title"`); a
   `--color-neutral-300`/muted lead paragraph (`body`, max ~55ch, centered); a large sand-colored
   `tel:` phone link (pull the number from `skin.config` phone — do not hardcode); a sand/cream secondary
   `.btn` "Get Help Now" → `/need-help-now`.
2. Replace **all** Tailwind color literals (`bg-red-*`, `text-red-*`, `bg-accent`, `ring-*`, etc.) with P0
   tokens. Replace the `animate-ping` dot with the mockup's `crisis-pulse` ring (define the keyframe in
   `globals.css` `@layer` if P0 didn't, referencing `--color-secondary`).
3. Keep the existing **variant** mechanism but migrate it to `settings.variant`: `variant === "urgency"` keeps
   the warm/accent urgency-strip skin (also token-only); default/`crisis` renders the dark GO crisis-band.
   Preserve the title-keyword sniff only as a fallback when `settings.variant` is absent. One block, two skins.
4. Phone display/`tel:` must come from `skin.config` (configurable per brand), not a literal.
5. **Verify:** `bun run build`; token grep on `CalloutBandBlock.tsx` empty; `lint:direct-edit` clean;
   `go-audit.py` against `crisis-band.html` at all breakpoints — confirm dark primary bg, pulsing icon, centered
   stack, phone sizing, and the 768/480 type scale-downs. Commit:
   `refactor(golden-oaks): crisis-band 1:1 (tokenized, settings.variant)`.

### Task 6 — Refine StatsBarBlock → Golden Oaks safety/stats section (1:1)

Mockup: homepage `.safety-section` (`index.html` ~12951–13010) — "Your Safety & Peace of Mind", a 4-up
`.stats-grid` of icon + big `.stat-number` + `.stat-label` + `.stat-description`, plus a `.team-callout` row
("Meet Our Team →"). The current `StatsBarBlock` renders on a flat `bg-primary` band with value-over-label only
and no icons/descriptions/team callout.

**Files:** `src/components/blocks/StatsBarBlock.tsx`; (slug stays `stats-bar`).

**Steps:**
1. Refine to the safety-section layout: section on a light/`--color-section-light` (or background) surface with a
   centered `font-heading` h2 (`title`). A 4-up `.stats-grid` (→ 2-up ≤768 → 1-up ≤480) where each stat is a
   **card** with a primary-tinted round **icon** badge, the big tabular `font-heading` `.stat-number`, an
   uppercase `.stat-label`, and a muted `.stat-description` paragraph.
2. Extend the data-flow to carry the icon + description per stat without breaking the existing
   `"20+ Years Caring"` paragraph convention: keep value-prefix parsing for the number/label, and allow an
   optional following paragraph as the description (QA-pair-style), with an icon chosen per slot from a small
   token-stroked SVG set. In-code defaults = the homepage's four stats (24/7, 1:6, 100%, 15+). Keep
   `data-payload-subfield="body"` on the grid container and `data-array-index` per item.
3. Add the optional `.team-callout` row (lead sentence + "Meet Our Team →" link) from a trailing body paragraph
   / `settings`, all token-styled.
4. Colors via tokens only (no `bg-primary text-background` literals if they don't match — the mockup section is
   light, not solid green; verify against the harness and use the matching `--color-section-*`).
5. **Verify:** `bun run build`; token grep empty; `lint:direct-edit` clean; `go-audit.py` against the homepage
   `.safety-section` at all breakpoints — confirm icon badges, the 4→2→1 grid, descriptions, and the team
   callout. Commit: `refactor(golden-oaks): stats-bar → safety/stats section 1:1`.

### Task 7 — Refine TestimonialBlock → reviews-grid + video-testimonial variants (1:1)

Mockups: `components/reviews-grid/reviews-grid.html` (3-up review cards with star rows, author photo, 4-way color
cycling, "More Reviews" reveal) **and** `components/video-testimonial/video-testimonial.html` (aggregate rating
bar + 2-column inline-player video testimonial with quote/author/transcript). The homepage `.testimonials-section`
(`index.html` ~13132–13347) combines the **rating bar + video testimonial** with a marquee **testimonial shelf**;
the testimonials-reviews page uses the **reviews grid**. The current `TestimonialBlock` is a single 3-up pull-quote
grid.

**Files:** `src/components/blocks/TestimonialBlock.tsx`; (slug stays `testimonial`); `nocms` `atomic.ts`
(add `media` + `settings` to the `testimonial` atoms if not present — the video variant needs a poster image).

**Steps:**
1. Introduce `settings.variant` on `testimonial`: `"reviews"` (default grid), `"video"` (homepage), and
   `"shelf"` (the marquee row) — one block, selected by variant. Migrate the existing grid to the **reviews**
   variant.
2. **reviews variant:** `bg-[var(--color-section-cream)]` section with a faint repeating leaf-pattern overlay
   (P0 `--color-leaf-pattern-tint` / `/golden-oaks/leaf-sprigs.png`), centered h2 (`title`) + optional subtitle
   (`body`), a 3-up grid (→2 ≤1024 →1 ≤640) of review cards. Cards **cycle 4 color skins** via tokens
   (sage+green-left, cream+copper-top, linen+gold-left, white+sage-bottom — see the mockup CSS), each with a
   gold star row (accent), italic quote (`body`-derived), and an author row (round photo from `mediaArray[i]` +
   name/relation). Keep `data-array-index` + `data-payload-subfield` per card.
3. **video variant:** centered h2 + an aggregate **rating bar** (5 accent stars, score, "from N reviews",
   "Read Reviews" link) and a 2-column (→1 ≤1024) **video testimonial** — a 16/9 poster button
   (`media`/`mediaArray[0]`) with a `.play-btn`, a "CC" chip, a `<details>` transcript, and a content side with a
   `Video Testimonial` overline, a quote with a primary-light left rule, and an author row. The inline-player
   swap and rating bar are client behavior — port the small mockup JS as a `"use client"` island (or hand it to
   **P6**'s client-JS bundle) and reference that dependency here; the renderer itself stays a server component
   emitting the editable markup. Quote/author/poster are editable fields.
4. **shelf variant:** the homepage marquee — a horizontally scrolling `.shelf-track` of review cards
   (star row + quote + author). The auto-scroll/duplication is client JS (P6); render the static track + cards
   1:1 with token styling and the standard array attrs.
5. All colors via tokens (replace the current `bg-surface`/`bg-primary/5`/`bg-accent/5` literals with the P0
   section/card tokens). Declare the updated `testimonial` atoms (`title`, `body`, `media`, `mediaArray`,
   `settings`) in `atomic.ts`.
6. **Verify:** `bun run build`; token grep empty; `lint:direct-edit` clean; `go-audit.py` against
   `reviews-grid.html`, `video-testimonial.html`, **and** the homepage `.testimonials-section` at all
   breakpoints — confirm the 4-way card cycling, the rating bar, the 2-col→1-col video layout, and the shelf.
   Commit: `feat(golden-oaks): testimonial block reviews/video/shelf variants 1:1`.

### Task 8 — Refine CalloutBandBlock usage / add FinalCtaBlock → Golden Oaks final-cta (1:1)

Mockup: `components/final-cta/final-cta.html` + homepage `.final-cta` (`index.html` ~13439+). This is a distinct
component from the crisis-band: a **green gradient** band above the footer with h2 + subtitle, two CTA buttons,
a centered "or…" divider, and a phone link. The overview maps "Final CTA → `callout-band`"; the template has no
`callout-band` renderer yet (only `crisis-callout`).

**Files:** `src/components/blocks/FinalCtaBlock.tsx` (new, keyed `callout-band`); `registry.ts`;
`nocms` `atomic.ts` (declare `callout-band`).

**Steps:**
1. New renderer keyed `callout-band` (the overview's name for Final CTA — keep crisis-band separate as
   `crisis-callout`). Section: `bg-[linear-gradient(135deg,var(--color-primary-dark),var(--color-primary))]`,
   white text, centered. h2 (`title`, `font-heading`, white) + subtitle paragraph (`body`).
2. Buttons row: a `.btn-secondary` "Schedule a Tour" (opens the P1 tour widget — wire to its trigger/href) and a
   `.btn-outline` "Request Pricing" → `/request-pricing`; stack full-width at ≤768px. Centered
   `.final-cta-divider` ("or need immediate assistance?") with token-derived translucent-white rule lines. A
   `.final-cta-phone` `tel:` link from `skin.config` phone.
3. All translucent whites derived from tokens (use `color-mix`/opacity utilities on `--color-background`/white,
   not raw `rgba(255,255,255,…)`). h2 scales down at 480px per the mockup.
4. Declare `callout-band` atoms (`title`, `body`, `settings`) in `atomic.ts`; register the slug. (Leave the
   existing `crisis-callout` → `CalloutBandBlock` mapping intact; this adds the sibling final-CTA block the
   overview calls for.)
5. **Verify:** `bun run build`; token grep empty; `lint:direct-edit` clean; `go-audit.py` against
   `final-cta.html` **and** the homepage `.final-cta` at all breakpoints — confirm the green gradient, divider
   rules, button stacking, and phone link. Commit: `feat(golden-oaks): final-cta (callout-band) block 1:1`.

### Task 9 — Compose the homepage 1:1 (`slug: "home"`)

Assemble the full homepage from the P3 blocks plus the cross-referenced P2/P4/P5 blocks so `/`
(`src/app/page.tsx`, which renders `RenderBlocks` for the Payload page `slug: "home"`) matches
`index.html` end-to-end. The route already exists and is data-driven — this task seeds/orders the **block
content**, it does not change the route.

**Files:** the `home` page block content — seed via the nocms seeder / a fixture the dev preview reads
(coordinate with **P8**'s page-seed mechanism; this task may add a `home`-page seed fixture and the
`brand-clone-config.json → design-brief` content for the homepage). Touch `src/app/page.tsx` only if the
`HOME_SLUG`/empty-state wiring needs adjustment. No new renderers.

**Steps:**
1. Build the `home` page `blocks[]` in the mockup's exact order, each block's `settings.variant` + `title`/`body`/
   `mediaArray` set to the homepage copy/photos (media via the P0 `/golden-oaks/...` paths):
   1. **hero** — `hero-video`/immersive variant (**P2**): "Where Every Day Feels Like Home" + subtitle + the two
      hero buttons.
   2. **care-level-grid** (**P5**) — "Discover Your Next Chapter" (Independent/Assisted/Memory cards) **+** the
      assessment-callout (**P5**) "Wondering which living option fits best?".
   3. **stats-bar** (Task 6) — "Your Safety & Peace of Mind" four stats + team callout.
   4. **card-carousel** (**P4**) — "Why People Choose Golden Oaks" 4-slide carousel.
   5. **pricing-cards** (Task 1) — "Honest Pricing, Because Trust Starts Here" (intro + 3 tiers w/ Assisted
      featured + disclaimer + secondary CTA) on `.section-cream`.
   6. **testimonial** `video` variant (Task 7) — "What Residents & Families Are Saying" (rating bar + Martinez
      video testimonial) **+** the **shelf** variant (testimonial marquee) **+** the **accreditation-bar**
      (**P1**, cross-ref) row.
   7. **lifestyle-cards** `photo-grid` variant (Task 3) — "A Day in the Life at Golden Oaks" on `.section-sage`
      with the 6-up photo grid + `.life-links`.
   8. **resource-cards** (Task 4) — "Helpful Resources for Your Next Chapter" (lead + 3 alternating rows).
   9. **callout-band** (Task 8) — "Ready to Find Your New Home?" final CTA.
   (Confirm whether the homepage uses crisis-band; per `index.html` it does **not** appear in the homepage flow —
   `crisis-callout` is used on other pages. Do not insert it here.)
2. Confirm `RenderBlocks` renders every block with its `data-payload-*` identity wrapper (it does — see
   `RenderBlocks.tsx`); confirm the header/footer/help-badge chrome (**P1**) wraps the page in `layout.tsx`.
3. **Full-page verify:** `bun run build`; `lint:direct-edit` clean; `go-audit.py --page index` with **no
   `--section`** (whole page) at 1440/1024/768/480 — walk top-to-bottom and diff each section's geometry +
   computed tokens + screenshot against `index.html`. Fix any block whose section diff exceeds tolerance
   (return to its task). Also spot-check the **configurability** guarantee: temporarily flip `--color-primary`
   and confirm the whole homepage re-themes, then revert.
4. Commit: `feat(golden-oaks): compose homepage 1:1 from block set`.

---

**Final (whole plan):** `bun run build` clean; `bun run lint:direct-edit` clean; `grep -nE "#[0-9a-fA-F]{6}"
src/components/blocks/{PricingCardsBlock,FeatureSectionsBlock,LifestyleCardsBlock,ResourceCardsBlock,FinalCtaBlock,CalloutBandBlock,StatsBarBlock,TestimonialBlock}.tsx`
finds only the documented check/SVG data-URI exceptions; `go-audit.py --page index` is within tolerance at all
four breakpoints; the `--color-primary` flip re-themes the homepage. Then proceed to P4/P5/P6/P7 (parallelizable),
then P8 (seed) and P9 (holistic responsive audit).
