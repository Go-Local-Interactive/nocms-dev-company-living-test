# Golden Oaks — Design-System Conventions

The rules every Golden Oaks block/component must follow so the template stays
**configurable** (re-brandable via tokens), **editable** (the NoCMS inspector
can target every field), and **customizable** (re-skinnable per project). These
were established in Plan 00 and are consumed by every later plan (P1–P9).

---

## 1. Colors / fonts / spacing = tokens (never literals)

Every brand color is a `--color-*` CSS custom property in
`src/app/globals.css` → `@theme`. Components reference them via Tailwind
utilities (`bg-primary`, `text-secondary`, `border-accent`, …) or
`var(--color-*)` — **never a hardcoded hex**.

- Flipping a single base token (e.g. `--color-primary`) re-themes the whole
  site. Verified via the Plan 00 flip-test.
- Baseline: `grep -rn "#[0-9a-fA-F]\{6\}" src/components` = **0** hits. Keep it
  there — any new literal is a bug.

### Token inventory (Plan 00)

**Brand primitives** (the design-brief overlay rewrites these per project):
`--color-primary`, `--color-secondary`, `--color-accent`, `--color-cool`,
`--color-text`, `--color-warm`, `--color-background`, `--color-surface`,
`--color-muted`.

**Derived shades** (re-derived from the primitives, mockup `color-mix` ratios):
`--color-primary-dark`, `--color-primary-light`, `--color-secondary-dark`,
`--color-secondary-light`, `--color-accent-light`, `--color-sand`,
`--color-linen`, `--color-warm-brown`, `--color-rich-brown`.

**Semantic section + accent tokens** (recurring surfaces — use these, not a
literal): `--color-section-cream`, `--color-section-sage`,
`--color-section-light`, `--color-section-brown`, `--color-section-dark`,
`--color-overline`, `--color-leaf-pattern-tint`.

**Fonts:** `--font-heading` ("Libre Baskerville"), `--font-body` ("Open Sans"),
`--font-mono`. Loaded via the `<link>` in `src/app/layout.tsx`.

**Shape / elevation** (plain `:root` custom props, not color tokens):
`--radius` (6px), `--radius-pill`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`.

### Base pattern utilities (Plan 00, `@layer components`)

`.section-{cream,sage,light,brown,dark}` · `.overline` (eyebrow) ·
`.page-separator` (label flanked by rule lines) · `.leaf-pattern`
(cream wash over `/golden-oaks/leaf-pattern.jpg`) · `.card` ·
`.btn` + `.btn-{primary,secondary,cream,outline,outline-dark}`.

---

## 2. Editor contract (keep components editable)

The NoCMS inspector matches a clicked element to a CMS field via `data-*`
attributes. The contract:

**Block wrapper — added automatically by `RenderBlocks`**
(`src/components/blocks/RenderBlocks.tsx`, via
`payloadBlockAttrs` in `src/lib/payload-attrs.ts`). Every block is wrapped in a
`<div>` carrying:
- `data-payload-collection` (e.g. `pages`)
- `data-payload-doc-id`
- `data-payload-field` (the blocks array field, default `blocks`)
- `data-payload-block-id` (Payload's stable per-instance id)
- `data-payload-block-name` (optional, human label)

Block renderers **do not** add these — the wrapper owns block identity.

**Inside a block — every editable field carries:**
- `data-nocms-component="<name>"` on the block root (e.g. `hero`, `stats-bar`).
  *(37 components already do this.)*
- `data-payload-subfield="<field>"` on each editable element, naming the block
  subfield it maps to (e.g. `title`, `body`, `media`).
- `data-role="<role>"` on text elements the direct-edit pipeline rewrites
  inline (`heading`, `subheading`, …). The bound value **must resolve to a
  string literal** — see the lint below.

**Lint:** `bun run lint:direct-edit` flags `data-role` elements whose text is a
template expression or a non-literal prop. It is informational (always exits 0).
Plan 00 baseline: **1 pre-existing warning** —
`CTABanner.tsx:38` (`heading` bound to a non-literal at
`communities/[slug]/page.tsx:138`). New blocks must not add warnings.

---

## 3. Variants = `settings.variant` (keep components customizable)

**Rule: a multi-layout design is ONE block + a variant atom, not N blocks.**
Pick the layout from a single `settings.variant` field rather than registering
a separate blockType per visual treatment. Skins re-skin by changing the
default variant, not by swapping components.
`resolveSkinComponent()` (`src/lib/skin.ts`) maps a variant string → component.

**Current state / requirement:** the template wires variants two ways today:
- The hero reads `skinConfig.heroVariant` (`src/skin.config.ts`) — a skin-level
  variant union. *Keep it; Plan 02 extends it.*
- 15 components branch on a local `variant` prop.

As of **Plan 01/02**, `PayloadAtomicBlock` (`src/lib/payload.ts`) carries a
`settings?: PayloadBlockSettings` group with `variant` + `tone` (+ an index
signature for forward-compat). The hero is the first block that reads it.

### Hero — one block, five variants (Plan 02)

The five Golden Oaks hero patterns are **ONE `HeroBlock`** (`src/components/
blocks/HeroBlock.tsx`, slug `hero`) selected by `settings.variant`, plus a
shared interior-header `PageHero` (chrome). They are NOT five blocks.

- **Variant precedence:** `block.settings?.variant ?? skinConfig.heroVariant`.
  Default `skinConfig.heroVariant = "video"` (the homepage immersive hero).
- **Variants:** `video` (full-bleed photo/video + dark diagonal overlay + 2 CTAs),
  `fullbleed` (interior header: photo + overlay + centered breadcrumb + tagline +
  scroll-cue), `split-stats` (2-col text-panel + hover-zoom image + 3 icon stats),
  `toprow` (compact sage band + drop-cap intro + floral), `stats` (compact
  cream/dark band + drop-cap intro + horizontal stats bar).
- **Dark modifier:** `split-stats` and `stats` honour a dark treatment via either
  `settings.tone = "dark"` or a `-dark` suffix on the variant string
  (`split-stats-dark`, `stats-dark`). Dark = `--color-section-dark` (primary-dark
  green) + white text + `--color-accent-light` drop-cap/icons.
- **Back-compat aliases** (mapped internally, so legacy data + `PageHero` callers
  keep working): `image`→`fullbleed`, `simple`→fullbleed-no-media (on `bg-primary`),
  `search`→`fullbleed` + community-search form.
- **Shared markup:** `HeroBlock`'s `fullbleed` variant and `PageHero` both delegate
  to `src/components/layout/FullbleedHero.tsx` (+ `ScrollCue.client.tsx`) so they
  render pixel-identical DOM. Only `PageHero` keeps `data-nocms-component=
  "layout/page-hero"`; the block keeps `data-nocms-component="hero"`.
- **Editable subfields:** `title`, `body`, `media`, `primaryCta`/`secondaryCta`
  (video, from `items[0]`/`items[1]`'s `link`), `mediaCaption` (split-stats),
  and repeatable `statValue`/`statLabel` (split-stats + stats, from `items[]`:
  `item.icon` = lucide slug, `item.link.label` = value, `item.label` = caption).
- **New tokens (Plan 02, `globals.css @theme`):** `--color-hero-overlay-from`
  (0.65), `--color-hero-overlay-from-soft` (0.60), `--color-hero-overlay-to`
  (0.70) — alpha-baked, derived from the brand tokens so the overlay re-themes
  on a token flip; plus `--color-neutral-{900,700,500,300}` (interior text/borders).
- **New keyframes:** `scrollBounce` + `wheelPulse` (utilities `animate-scroll-bounce`
  / `animate-wheel-pulse`) + the `.scroll-cue` / `.has-drop-cap` / `.content-intro`
  base classes.
- **Responsive note:** the mockup uses **max-width** breakpoints (1024/768/480);
  the template inverts them to min-width custom breakpoints `min-[481px]` /
  `min-[769px]` / `min-[1025px]` (NOT Tailwind's `md`/`lg`, which fire at the wrong
  boundary at exactly 768/1024). Match the mockup's max-width rules by inverting.

---

## 4. Brand = skin.config + design-brief (Golden Oaks is the DEFAULT, not a hardcode)

`src/skin.config.ts` holds the per-project brand defaults. Golden Oaks is the
default skin; the NoCMS scaffold's **design-brief overlay rewrites these fields
per project at scaffold time**. Mapping from the upstream
`brand-clone-config.json`:

| brand-clone-config.json | →   | target |
| ----------------------- | --- | ------ |
| `brand_name`            |     | `skin.config.brandName` |
| `brand_suffix`          |     | `skin.config.brandSuffix` |
| `brand_tagline`         |     | `skin.config.tagline` |
| `phone_display`         |     | `skin.config.contactPhone` |
| `brand_email`           |     | `skin.config.contactEmail` |
| `address_line1`         |     | `skin.config.primaryAddress.line1` |
| `address_line2`         |     | `skin.config.primaryAddress.{city,state,zip}` |
| `logo_path`             |     | `skin.config.logoPath` |
| `colors.*`              |     | `globals.css @theme` `--color-*` tokens |
| `font_heading` / `font_body` |  | `globals.css @theme` `--font-heading` / `--font-body` |

Colors and fonts are **tokens in `globals.css`, not fields in `skin.config`** —
the overlay rewrites both surfaces.

---

## 5. Media path convention

Brand images live in `public/golden-oaks/` and are served at
`/golden-oaks/<filename>`. The Plan 08 seed and `skin.config.logoPath`
reference this prefix. Examples: `/golden-oaks/golden-oaks-logo.png`,
`/golden-oaks/leaf-pattern.jpg`, `/golden-oaks/hero-garden.jpg`,
`/golden-oaks/fp-magnolia.jpg`, `/golden-oaks/leader-james-whitfield.jpg`.
