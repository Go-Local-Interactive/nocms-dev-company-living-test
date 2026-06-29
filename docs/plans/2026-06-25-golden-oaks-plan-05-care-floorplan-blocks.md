# Golden Oaks Plan 05 — Care / Community / Floor-Plan Blocks

> **For Claude:** REQUIRED SUB-SKILL: gli-toolkit:subagent-driven-development. Read the roadmap
> `2026-06-25-golden-oaks-1to1-overview.md` (esp. **Cross-cutting requirements**) and
> `2026-06-25-golden-oaks-plan-00-design-system.md` (the tokens + base patterns + audit harness this
> plan consumes) FIRST. Depends on **Plan 00** (tokens, section utilities, `media/` copied to `public/`,
> the `scripts/go-audit.py` harness). Parallelizable with Plans 4/6/7.

**Goal:** Bring the care-level grid/card, floor-plan grid/card, and amenity-grid blocks to **1:1** with the
Golden Oaks mockup (they already exist — refine, don't rebuild), and add two new blocks — **care-level-nav**
(the sub-nav strip on Living Options) and **assessment-callout** (the "take the care assessment" interstitial).
These power `living-options`, the four care-type pages (`independent-living`, `assisted-living`,
`memory-care`, `respite-care`), `floor-plans`, the six floor-plan detail pages (`azalea`, `cypress`,
`dogwood`, `heritage`, `magnolia`, `oakwood`), and `amenities`.

## Cross-cutting (NON-NEGOTIABLE — every task proves these)

1. **Tokens only — no literals.** Every color/font/space references a `--color-*` / `--font-*` / spacing token
   established in Plan 00 (Tailwind `bg-primary`, `text-text`, `border-text/5`, etc., or a `var(--color-*)`
   in arbitrary values). The mockup hardcodes hex (`rgba(50,68,49,.88)` gradients, `var(--sand)`, `var(--cream)`,
   `var(--primary-light)`); the port maps each to a token (`--color-primary`, `--color-warm`/`sand`,
   `--color-surface`/`cream`, the `--color-primary-light` shade). **No new `#hex` may appear** — `grep -rn
   "#[0-9a-fA-F]\{6\}" src/components/blocks/{CareLevelGridBlock,CareLevelCardBlock,FloorPlanGridBlock,FloorPlanCardBlock,AmenityGridBlock,CareLevelNavBlock,AssessmentCalloutBlock}.tsx`
   returns nothing. Where the mockup uses an alpha-tinted brand color (overlay gradients, glass panels),
   express it as a token at an opacity (`bg-primary-dark/90`, `bg-white/8`) — never a raw rgba literal.
2. **Editor contract.** Each block root carries `data-nocms-component="<slug>"`; every editable field carries
   `data-payload-subfield` (and `data-array-index` on each `.map()`'d card, `data-array-prop` +
   `data-payload-subfield` on the array container). Headings/intros that should be inline-text-editable also
   carry `data-role="heading"`/`"subheading"`. Blocks render **inside `RenderBlocks`** (which adds
   `data-payload-doc-id/-collection/-field/-block-id` on the wrapper — renderers must NOT add those). New
   blocks declare their atoms in `nocms/src/payload/blocks/atomic.ts` and register a renderer in
   `src/components/blocks/registry.ts`. `bun run lint:direct-edit` stays clean (no `data-role` element bound
   to a template-expression or non-literal call site — bind plain string props or hardcode).
3. **Customizable / variants via `settings.variant`.** Where the mockup shows >1 layout for the same content
   shape, that is ONE block with a `settings.variant` switch, NOT N blocks. **Schema gotcha (MEMORY: imported
   home page once dropped on load):** any `variant` value a renderer reads MUST be added to the
   `settings.variant` select enum in `nocms/src/payload/blocks/atoms.ts` — Payload rejects the whole doc on
   load if it sees an option that isn't declared. This plan adds these new enum values:
   `grid`, `featured`, `compact`, `overlay`, `icon`, `image`, `nav`. Golden Oaks values are the renderer
   **defaults** (no `variant` set ⇒ the GO look); another brand re-themes via tokens + re-contents via the atoms.

**Variant atom precedent:** existing blocks read `block.settings?.variant` (see how `atomic.ts` already lists
`hero` / `testimonial` variants and the `settingsField` comment in `atoms.ts`). `HeroBlock` is the exception
(it reads `skinConfig.heroVariant`); for these content blocks read `settings.variant` off `BlockProps`.

## Mockup source map (the exact selectors each block mirrors)

| Block (slug) | Mockup selector / source | In-situ page(s) |
|---|---|---|
| `care-level-grid` | `.care-cards` > `.care-card` (full-bleed image, gradient overlay, top+bottom `.care-card-accent-*` bars grow on hover, `.care-card-tag` overline, `h3`, `p`, `.btn-card`) — `living-options.html` CSS L5992–6160; JS-injected `window.careCardsData` | `living-options` |
| `care-level-card` | the care-type page feature spotlight (large media + name + "what's included" list + prose + tour CTAs) | `independent-living`, `assisted-living`, `memory-care`, `respite-care` |
| `floor-plan-grid` | `.floor-plans-grid` > `.floor-plan-card` (image carousel + `.fp-badge` type + `.fp-content` > `.fp-name` / `.fp-specs` (`.fp-spec` label+value rows) / `.fp-price` / `.fp-tagline` / `.fp-features` checklist / `.fp-actions`) — `floor-plans.html` CSS L4902–5290, JS template L13824–13895 | `floor-plans`, reused in the 6 detail pages' grids |
| `floor-plan-card` | the singular floor-plan spotlight (large media + spec list + prose + Schedule/Request-Pricing CTAs) | floor-plan detail pages |
| `amenity-grid` | the icon-card grid (icon-circle / image, title, description) — Plan 00 `.icon-cards` family; on `amenities.html` the bulk is `feature-sections` (Plan 4) so this is the secondary amenity grid | `amenities` |
| `care-level-nav` (NEW) | `components/care-level-nav/care-level-nav.html` — `.care-level-nav` (sage bg) > `.care-level-nav-inner` (4-col grid) > `.care-level-nav-item` (icon-circle + title + tagline, anchors `#care-*`) | `living-options` |
| `assessment-callout` (NEW) | `components/assessment-callout/assessment-callout.html` + `living-options` `.care-assessment-callout` — flex row: icon-circle + heading/text + primary CTA; `.assessment-callout-featured` = dark-sage band w/ leaf overlay + glass panel | `living-options` (between feature sections), homepage care section |

**Responsive stacking (from the mockup media queries):**
- care-level-grid: `repeat(3,1fr)` → 2-col @960 → 1-col @640 (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- floor-plan-grid: `repeat(2,1fr)` 40px gap → 1-col @768 (`grid-cols-1 lg:grid-cols-2`).
- amenity-grid: `repeat(3,1fr)` → 2-col → 1-col (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- care-level-nav: `repeat(4,1fr)` → 2-col @1024 → 1-col @600 (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- assessment-callout: flex row → column + centered + full-width CTA @768 (`flex-col text-center md:flex-row md:text-left`).

## Verification (per the storage-template lesson — no unit suite)

Each task ends with the same gate: `bunx tsc --noEmit` → `bun run build` → **Playwright 1:1 diff** via the
Plan-00 harness (`python3 scripts/go-audit.py <page> --breakpoints 1440 1024 768 480`, mockup served at
`http://localhost:8088/pages/<page>.html`; a server is already up on :8088) comparing computed tokens
(primary/secondary/accent/text + heading font/size) + per-section bounding boxes + screenshots →
`bun run lint:direct-edit` clean → `grep` finds no new hex → commit. Use a real seeded page (or a throwaway
fixture page that mounts the block via `RenderBlocks`) so the editor-contract attrs render in the DOM for the
diff.

---

### Task 1 — Refine `care-level-grid` to the `.care-card` overlay design (1:1) + variant
**Files:** `src/components/blocks/CareLevelGridBlock.tsx`; `nocms/src/payload/blocks/atoms.ts` (variant enum);
verify `src/app/globals.css` has the gradient/overline tokens from Plan 00.
**Mirror:** `.care-cards` / `.care-card` (living-options L5992–6160).
**Steps:**
1. Replace the current light "photo-on-top card" with the mockup's **full-bleed overlay card**: each card is a
   fixed-height (`h-[480px]`, `lg` only; shorter on mobile) `<a>` with the photo absolutely filling it
   (`absolute inset-0 object-cover`, `group-hover:scale-105`), a bottom-anchored gradient overlay
   (token-based: `bg-gradient-to-t from-primary-dark/90 via-text/55 to-transparent` — map the mockup's
   `rgba(50,68,49,.88)`/`rgba(44,34,24,.55)` stops to `--color-primary-dark`/`--color-text` at opacity), and
   bottom content (`.care-card-content` → `absolute bottom-0 p-8`): an **overline tag** (`.care-card-tag`,
   uppercase, letter-spacing, per-card accent), `h3` (white serif), `p` (white/85), and a `.btn-card`
   ("Learn more →") that fades up on `group-hover`/`group-focus-within`.
2. Port the **top + bottom accent bars** (`.care-card-accent-top/-bottom`): two `absolute left-1/2 -translate-x-1/2
   h-1.5 w-0` spans that animate to `w-full` on `group-hover`/`group-focus-within`
   (`transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`). Cycle the accent color per card
   index — card 0 `bg-primary`, card 1 `bg-secondary`, card 2 `bg-accent` (the mockup's `nth-child` rule);
   same cycle drives the overline tag color (`text-primary-light`/`secondary-light`/`accent-light`). Keep the
   existing center-grow single-bar behavior available only under the legacy default if needed; the GO look is
   the dual-bar.
3. Keep the existing data-flow (DEFAULT_CARE_LEVELS, `lexicalQAPairs` h3+paragraph overrides, `mediaArray[i]`
   → photo, `href` per level) and the editor contract verbatim: root `data-nocms-component="care-level-grid"`,
   array container `data-array-prop="mediaArray"` + `data-payload-subfield="mediaArray"`, each `<a>`
   `data-array-index={i}`, photo `data-payload-subfield={`mediaArray.${i}`}`, section `title`/`intro`
   `data-role` + `data-payload-subfield`. The card title/description come from data, not `data-role` (they're
   not section-level inline fields) — leave them as plain text bound to the resolved card object.
4. **Variant** (`settings.variant`): default (unset) = the overlay card above. Add `variant: "compact"` for the
   homepage placement (smaller height, no fixed `480px`) and reserve `"grid"` for a future light-card layout.
   Read `settings?.variant` off props; add `"compact"`, `"grid"` to the enum in `atoms.ts` (Step also covers
   Tasks 2/4's new values — do the enum edit once, listing all of this plan's additions).
5. Stacking: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, gap `gap-6`, top margin matching the mockup's 48px.
6. Verify (the gate above) on `living-options`. Commit: `feat(golden-oaks): care-level-grid overlay cards 1:1`.

**Verification:** harness shows 3-col→2→1 with matching card height + gradient + accent-bar geometry; tokens
match; hover grows both bars + fades the btn-card in; `lint:direct-edit` clean; no hex.

### Task 2 — Refine `care-level-card` (care-type detail spotlight) to 1:1
**Files:** `src/components/blocks/CareLevelCardBlock.tsx`.
**Mirror:** the care-type page spotlight (large media + name + "what's included" list + prose + tour CTAs on
`assisted-living` / `memory-care` etc.).
**Steps:**
1. Keep the two-column `grid-cols-1 lg:grid-cols-2` layout and the existing data-flow (`title`→h1,
   `media`→photo, lexical `body`: top-level **list** → "what's included" feature box, rest → prose). Refine
   spacing/typography to the mockup: serif h1 at the page-hero scale, the feature box as a token-surfaced card
   (`bg-surface border-text/5 rounded-[--radius]`), check-dot markers in `bg-primary`.
2. Re-skin the CTAs to the mockup buttons: primary = terracotta (`bg-secondary text-white` — the GO `.btn-primary`,
   NOT the current `bg-accent`), secondary = outline (`border-2 border-text/20`). Radius `rounded-[--radius]`
   (6px from Plan 00), not `rounded-xl`. Keep targets ("Schedule a Tour" → `/schedule-tour`, "Explore Living
   Options" → `/living-options`).
3. **Variant** (`settings.variant`): default = media-left/text-right; add `variant: "split"` reading reversed
   (`lg:[&>div:first-child]:order-2`) so alternating care-type sections can flip sides like the mockup's
   feature-sections. `"split"` is already in the enum.
4. Editor contract unchanged (`data-nocms-component="care-level-card"`, `data-payload-subfield` on `title` /
   `media` / `body`, list items `data-array-index`). `data-role="heading"` stays on h1 (it's `{title}`, a
   literal-resolvable prop — lint-safe).
5. Verify on `assisted-living` (and spot-check `memory-care`). Commit: `feat(golden-oaks): care-level-card spotlight 1:1`.

**Verification:** harness on `assisted-living` shows matching two-col geometry, terracotta primary / outline
secondary, feature box; variant split flips at `lg`; tokens match; lint clean; no hex.

### Task 3 — Refine `floor-plan-grid` to the rich `.floor-plan-card` (1:1) + variant
**Files:** `src/components/blocks/FloorPlanGridBlock.tsx`; verify `BlockProps`/`mediaArray` shape in `types.ts`.
**Mirror:** `.floor-plans-grid` / `.floor-plan-card` (floor-plans CSS L4902–5290, JS template L13824–13895).
**Steps:**
1. Rebuild the card to the mockup's richer structure (server-rendered, no client carousel — the carousel/compare
   JS is Plan 06; render the first image statically with the hover-zoom): outer card
   `bg-surface border border-text/5 rounded-[--radius] shadow-sm hover:-translate-y-1.5 hover:shadow-xl
   hover:border-primary-light`; **image well** `.fp-image-placeholder` (fixed `h-[280px]`, gradient fallback
   `from-primary-light to-surface` mapped to tokens, `img object-cover group-hover:scale-105`); **type badge**
   `.fp-badge` (`absolute top-4 right-4 bg-secondary text-white rounded-full px-4 py-2 text-sm`); **content**
   `.fp-content` (`p-8`): `.fp-name` (serif, `text-2xl`), `.fp-specs` (flex row of `.fp-spec` label-over-value
   stacks — Square Feet / Bathrooms / etc.), `.fp-price` (`text-2xl font-bold text-primary` "Starting at …/mo"),
   `.fp-tagline` (italic muted "best for …"), `.fp-features` (✓ checklist, check in `text-primary`), and the
   "View details →" affordance (link to `/floor-plans/${slug}`; the Compare button is Plan 06 — omit here).
2. Extend the data-flow to feed the richer card while staying backward-compatible: keep
   `DEFAULT_FLOOR_PLANS` + `lexicalQAPairs` (h3 → name, paragraph → spec line `splitSpecLine`). Map the spec
   line's segments to `.fp-spec` rows (sqft / beds / baths) and the `From $…` chunk to `.fp-price`. The
   `.fp-tagline` and `.fp-features` are optional — derive from defaults; if a future seed needs structured
   features, they can ride the `items` atom later (note this; don't add the atom now to avoid scope creep).
3. **Variant** (`settings.variant`): default = the grid above (`grid-cols-1 lg:grid-cols-2`, gap-10). Add
   `variant: "featured"` = a single wide card (one column, media-beside-content like `care-level-card`) for
   the "featured plan" placement on detail pages; add `variant: "compact"` (3-col, no feature list) for dense
   listings. Read `settings?.variant`; ensure `"featured"`, `"compact"` are in the enum (Task 1 Step 4).
4. Editor contract verbatim: root `data-nocms-component="floor-plan-grid"`, array container attrs, per-card
   `data-array-index`, photo `data-payload-subfield={`mediaArray.${i}`}`, section `title`/`intro` `data-role`.
5. Stacking `grid-cols-1 lg:grid-cols-2` (gap-10), `featured` → single col, `compact` → `lg:grid-cols-3`.
6. Verify on `floor-plans`. Commit: `feat(golden-oaks): floor-plan-grid rich cards 1:1`.

**Verification:** harness on `floor-plans` shows 2-col→1 with matching `280px` image well, badge, spec rows,
price, checklist; `featured`/`compact` variants reflow; tokens match; lint clean; no hex.

### Task 4 — Refine `floor-plan-card` (single-plan detail spotlight) to 1:1
**Files:** `src/components/blocks/FloorPlanCardBlock.tsx`.
**Mirror:** the floor-plan detail spotlight — singular analog of the grid card (large media + spec list + prose
+ Schedule/Request-Pricing CTAs).
**Steps:**
1. Keep the `grid-cols-1 lg:grid-cols-2` layout + data-flow (`title`→h1, `media`→photo, list→specs box, rest→prose).
   Refine to match the grid card's visual language: token surfaces, the spec box styled like `.fp-specs`/`.fp-spec`
   (label-over-value), check-dot/✓ markers in `text-primary`, serif h1.
2. Re-skin CTAs to GO buttons: primary terracotta (`bg-secondary text-white`), secondary outline; radius
   `rounded-[--radius]`. Targets unchanged ("Schedule a Tour" → `/schedule-tour`, "Request Pricing" →
   `/request-pricing`).
3. **Variant** (`settings.variant`): default media-left; `variant: "split"` reverses sides (matches alternating
   detail sections). `"split"` already in enum.
4. Editor contract unchanged (`data-nocms-component="floor-plan-card"`, subfields on `title`/`media`/`body`,
   specs `data-array-index`). `data-role="heading"` on h1 stays lint-safe.
5. Verify on a floor-plan detail page (`magnolia`). Commit: `feat(golden-oaks): floor-plan-card spotlight 1:1`.

**Verification:** harness on `magnolia` shows matching two-col spotlight geometry + terracotta/outline CTAs +
spec box; split variant flips; tokens match; lint clean; no hex.

### Task 5 — Refine `amenity-grid` to the icon-card grid (1:1) + variants
**Files:** `src/components/blocks/AmenityGridBlock.tsx`; verify Plan-00 `.icon-cards` tokens.
**Mirror:** the icon-card grid (icon-circle / image, title, description) — Plan 00 `.icon-cards`/`feature` family.
**Steps:**
1. Align the card to the mockup icon-card: centered icon-circle (`h-16 w-16 rounded-full`) over serif title +
   muted body, on a token surface card (`bg-background border-text/5 rounded-[--radius] shadow-sm hover:-translate-y-1
   hover:shadow-lg`). Map the cycling accent tints to tokens already (`bg-primary/10 text-primary`, etc.) —
   verify no raw hex slipped in. Keep the icon set + `pickIcon` keyword routing + DEFAULT_AMENITIES fallback +
   the `mediaArray[i]` photo-replaces-icon behavior.
2. **Variant** (`settings.variant`): the mockup has icon-card grids on cream/light AND brown/dark sections.
   Add `variant: "icon"` (default — icon circles, light surface), `variant: "image"` (photo-topped cards, no
   icon), and read `settings?.background` (already in enum: `base/surface/dark/accent`) to switch the section
   bg + text color (dark variant → `bg-section-dark text-white`, white titles, lighter body) so it matches the
   `feature-sections-dark`/`icon-cards-brown` placements. Add `"icon"`, `"image"` to the enum (Task 1 Step 4).
3. Editor contract verbatim (`data-nocms-component="amenity-grid"`, array container attrs, per-card
   `data-array-index`, photo/icon `data-payload-subfield={`mediaArray.${i}`}`, section `title`/`intro` `data-role`).
4. Stacking `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` gap-6.
5. Verify on `amenities`. Commit: `feat(golden-oaks): amenity-grid icon cards 1:1 + dark variant`.

**Verification:** harness on `amenities` shows 3-col→2→1 icon-card grid matching geometry on both light and
dark backgrounds; tokens match; lint clean; no hex.

### Task 6 — NEW block `care-level-nav` (sub-nav strip)
**Files:** `src/components/blocks/CareLevelNavBlock.tsx` (new); `src/components/blocks/registry.ts`;
`nocms/src/payload/blocks/atomic.ts` (add the block spec).
**Mirror:** `components/care-level-nav/care-level-nav.html` — `.care-level-nav` (sage bg, 40px y-pad) >
`.care-level-nav-inner` (4-col grid, gap-4, max-w-[1200px]) > `.care-level-nav-item` (white card, border, radius,
flex row: `.care-level-nav-icon` 40px circle `bg-primary-light` + stroke-primary SVG, then
`.care-level-nav-text` title + tagline). Hover: `border-primary` + subtle shadow + `-translate-y-px`.
**Steps:**
1. Build a `<nav aria-label="Care level overview" data-nocms-component="care-level-nav">` wrapping a
   `bg-section-sage py-10` section and the 4-col inner grid. Render 4 items (Independent / Assisted / Memory /
   Respite + Short-Term) as `<a>` links to anchors (`#care-independent` etc., the mockup convention — these are
   in-page anchors the care pages' feature sections expose; default to those hrefs, overridable). Each item:
   icon-circle (`bg-primary-light`, `stroke-primary` SVG — reuse the four mockup SVG paths: home / heart-hands /
   smiley-face / clock), title (`font-heading font-bold text-base text-text`), tagline (`text-base text-muted`).
   `min-h-11` for the 44px touch target; `focus-visible:outline-2 focus-visible:outline-primary`.
2. **Data-flow** (mirror the grid blocks): default 4 items from a `DEFAULT_CARE_NAV` const; `lexicalQAPairs`
   overrides (h3 → title, paragraph → tagline), first pair → item 0; `mediaArray` unused (icons are fixed by
   keyword like `AmenityGrid.pickIcon`, routed off the title). Anchors map by index to the default `#care-*` set.
3. **Schema atom:** add `{ slug: "care-level-nav", singular: "Care Level Nav", plural: "Care Level Navs",
   atoms: ["title", "body"] }` to `SPECS` in `atomic.ts` (title optional/unused as a heading; body carries the
   overrides). Register `"care-level-nav": CareLevelNavBlock` in `registry.ts`.
4. **Variant** (`settings.variant`): default = the sage 4-col strip; reserve `variant: "nav"` as an explicit
   alias and (future) a `compact` 2-row. Add `"nav"` to the enum (Task 1 Step 4). Smooth-scroll behavior is
   pure CSS (`scroll-behavior: smooth` is set globally in Plan 00) — the JS anchor-injection in the mockup is
   Plan 06's concern; here just emit correct `href="#…"`.
5. Editor contract: root `data-nocms-component`, array container `data-array-prop="body"`/`data-payload-subfield`,
   per-item `data-array-index`, title/tagline as plain resolved text (not `data-role` — they're data, not a
   single section-level inline field). Stacking `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (2-col @1024,
   1-col @600 per mockup).
6. Verify on `living-options`. Commit: `feat(golden-oaks): care-level-nav block 1:1`.

**Verification:** harness on `living-options` shows the sage 4-up strip matching item geometry + icon circles +
hover lift; reflows 4→2→1; anchors resolve; lint clean; no hex; `lint:direct-edit` clean (it's registered + the
atoms exist so coverage passes).

### Task 7 — NEW block `assessment-callout` (interstitial CTA banner) + featured variant
**Files:** `src/components/blocks/AssessmentCalloutBlock.tsx` (new); `src/components/blocks/registry.ts`;
`nocms/src/payload/blocks/atomic.ts` (add the block spec).
**Mirror:** `components/assessment-callout/assessment-callout.html` + `.care-assessment-callout` (living-options
L6161–6220). Base: `.assessment-callout` = `max-w-[920px] mx-auto p-7 bg-section-cream border border-text/15
rounded-[--radius] flex items-center gap-6` — icon-circle (`h-14 w-14 rounded-full bg-white`, stroke-primary
clipboard-check SVG) + text (`h3` serif 20px + `p` 16px muted) + primary CTA ("Take the Care Assessment" →
`/care-assessment`). **Featured variant** `.assessment-callout-featured` = a `bg-primary-dark` band
(`max-w-[1200px] rounded-[20px] py-14`) with a leaf-sprigs overlay (`media/images/leaf-sprigs-white.png` at
`opacity-[0.06]` — copied to `public/` in Plan 00) wrapping a **glass** callout (`bg-white/8 border-white/15
backdrop-blur-sm`, white heading, white/85 text, accent CTA).
**Steps:**
1. Build `<section data-nocms-component="assessment-callout">`. Default (unset variant) = the cream base banner.
   `settings.variant: "featured"` = the dark leaf-overlay band + glass panel (map the mockup's
   `var(--primary-dark)` / `rgba(255,255,255,.08)` / `--accent-light` to tokens at opacity). Add `"featured"` to
   the enum (Task 1 Step 4 — already listed there).
2. **Data-flow:** `title` → h3 (default "Wondering which living option fits best?"), `body` → the supporting
   paragraph (lexical → text, default copy from the mockup), CTA label/href fixed to "Take the Care Assessment"
   → `/care-assessment` (a `links` atom could later make it editable — note it, don't add now).
3. **Schema atom:** add `{ slug: "assessment-callout", singular: "Assessment Callout", plural: "Assessment
   Callouts", atoms: ["title", "body", "settings"] }` to `SPECS`. Register `"assessment-callout":
   AssessmentCalloutBlock` in `registry.ts`.
4. Editor contract: root `data-nocms-component`, `h3` `data-role="heading"` + `data-payload-subfield="title"`,
   `p`/lexical `data-payload-subfield="body"`. Keep `{title}` a literal-resolvable string prop so
   `lint:direct-edit` stays clean (don't wrap it in a template expression).
5. Responsive: base flex row → `flex-col text-center md:flex-row md:text-left` @768, CTA full-width on mobile
   (`w-full md:w-auto`). Featured band keeps the same inner stacking.
6. Verify on `living-options` (base) and the homepage care section (featured). Commit:
   `feat(golden-oaks): assessment-callout block + featured variant 1:1`.

**Verification:** harness shows base cream banner geometry on `living-options` and the dark glass/leaf featured
band where placed; both reflow at 768; tokens match (incl. the leaf overlay path resolving from `public/`);
lint clean; no hex; `lint:direct-edit` clean.

---

**Final:** `bunx tsc --noEmit` + `bun run build` clean; all seven blocks pass the Plan-00 harness 1:1 at
{1440,1024,768,480}; `bun run lint:direct-edit` reports no issues; the hex grep over the five refined + two new
block files is empty; the two new slugs are registered in `registry.ts` and declared in `atomic.ts`, and every
new `settings.variant` value (`grid`, `featured`, `compact`, `icon`, `image`, `nav`) is in the `settingsField`
enum in `nocms/src/payload/blocks/atoms.ts` (so seeded docs that use them load without Payload rejecting them).
Then these blocks are ready for the Plan 08 content seed of the living-options / care-type / floor-plans /
amenities / floor-plan-detail pages.
