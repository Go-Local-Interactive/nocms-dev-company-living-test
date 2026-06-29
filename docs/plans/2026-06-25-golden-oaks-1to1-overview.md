# Golden Oaks 1:1 Template — Plan Roadmap

> **For Claude:** this is the OVERVIEW. It determines the plan breakdown. Each numbered plan
> below gets its own `docs/plans/2026-06-25-golden-oaks-plan-NN-*.md` (write with
> gli-toolkit:writing-plans, execute with gli-toolkit:subagent-driven-development).

**Goal:** Make `nocms-template` (the default base template) render the **Golden Oaks** senior-living
design as close to **1:1 as possible, including responsiveness**, across all of its pages.

## Cross-cutting requirements (NON-NEGOTIABLE — every plan honors these)

The port must NOT bake the mockup in as a static one-off. `nocms-template` is a reusable, re-brandable,
inline-editable base; preserve all three capabilities:

1. **Configurable colors / theme.** The mockup hardcodes hex in `css/global.css`; the port maps EVERY color
   to the existing `--color-*` CSS custom-property tokens in `globals.css @theme` (which the nocms
   design-brief overrides per project). **Never hardcode a hex in a component** — use the token or a derived
   shade. Same for fonts (`--font-heading`/`--font-body`) and the spacing scale. Changing one token must
   re-theme the entire site. Add new semantic tokens (e.g. section-bg variants, overline color) rather than
   literals.
2. **Editable components.** Every block renderer carries the editor contract so inline editing works (verified
   on the storage template): `data-nocms-component="<slug>"` on the root, `data-payload-subfield` on each
   editable field, rendered inside `RenderBlocks` (which adds `data-payload-doc-id/-collection/-field/-block-id`).
   New blocks declare their atoms in the Payload schema; run `lint:direct-edit` to confirm coverage.
3. **Customizable.** Brand identity via `skin.config.ts` (name/tagline/fonts/logo/contact); visual variants via
   the block `settings.variant` atom (e.g. one HeroBlock with video/fullbleed/split-stats variants, NOT five
   hardcoded blocks); per-project re-skin via the design-brief overlay (`brand-clone-config.json` → design-brief).
   **Golden Oaks is the DEFAULT skin, not a hardcode** — another brand must be able to re-theme + re-content it.

Every numbered plan repeats these in its header and includes a task/verification step that proves them
(token-only colors, `lint:direct-edit` clean, a variant prop where the mockup shows multiple layouts).

**Source of truth (the mockup):** `~/Desktop/design/golden-oaks/` — a complete, documented multi-page
static design system:
- `pages/` — **43 page mockups** (index, about-us, living-options, independent/assisted/memory/respite-care,
  floor-plans + 6 floor-plan pages, amenities, dining-nutrition, activities-events, our-team, careers,
  testimonials-reviews, photo/video-gallery, virtual-tour, blog-landing/archive/article, resources,
  senior-living-guide, financial-assistance, understanding-costs, request-pricing, care-assessment,
  schedule-tour, contact-us, need-help-now, move-in-process, faq, search-results, accessibility,
  privacy/terms/licensing, 404).
- `components/` — **26 documented components** (`components/INDEX.md` maps each → the pages it's used on),
  each with an isolated example HTML.
- `css/global.css` (9.8k lines — the full design system), `js/global.js` (nav, accordions, carousels, exit-intent).
- `brand-clone-config.json` — the brand tokens (maps 1:1 to the nocms design-brief / `skin.config`).
- `docs/` — `design-system.html`, `brand-color-guide.html`, `brand-style-guide.html` (reference while building).
- `media/images/` — real logos, per-page hero backgrounds, floor-plan images, leader photos, leaf patterns.

**Serve it for reference/verification:** `python3 -m http.server 8088 --directory ~/Desktop/design/golden-oaks`
then `http://localhost:8088/pages/<page>.html` (a server is already running on :8088 this session).

---

## Current state of `nocms-template` (what already exists)

It was evidently started AS this template — much is already in place, so most plans are **refine-to-1:1 + fill gaps**, not build-from-scratch:
- **Fonts:** `--font-heading` = Libre Baskerville, `--font-body` = Open Sans (already correct).
- **Tokens** (`globals.css`): primary `#5F7A5E`, secondary `#B5654A`, accent `#C4882B`, bg `#FAF6EF`,
  text `#2C2218`, + dark/light/sand/linen/brown shades. **Close but not exact** vs Golden Oaks.
- **`skin.config.ts`:** senior-living shape (brandName, tagline "Where every day feels like home",
  heroVariant video/search/image/simple, primaryCommunitySlug, phone/email/address) — placeholder values.
- **Chrome (`components/layout/`):** Header, Footer, HelpBadge, ExitIntent, PageHero, SectionWrapper.
- **Blocks (`components/blocks/`, registry):** hero, care-level-grid, care-level-card, floor-plan-grid,
  floor-plan-card, amenity-grid, team-grid, timeline, events-list, crisis-callout, tour-form, stats-bar,
  gallery, testimonial, accordion, callout-band, media-block, row-group.
- **Pages are data-driven:** routes `/`, `/[slug]`, `/communities[/slug]`, `/floor-plans[/slug]`,
  `/blog[/slug]` fetch a Payload page + `RenderBlocks`. So "build a page" = (a) the block renderers exist
  and are 1:1, and (b) the page's block content is seeded.

## Design system (the 1:1 target)

- **Palette (exact, from `brand-clone-config.json`):** primary `#4D654C` (forest green), secondary `#AD6045`
  (terracotta), accent `#C4882B` (gold), cool `#7383A0` (slate), neutral `#2C2218` (brown text),
  warm `#E8DCC8` (cream). Section bg variants seen: cream / sage / light / brown / dark (green).
- **Type:** Libre Baskerville (serif headings — h1 64px/700 desktop), Open Sans (body).
- **Breakpoints:** 1024, 960, 768, 640, 550, 480 (mobile-first stacking; nav → hamburger overlay).
- **Signature patterns:** green top-accent + green header bar; full-bleed photographic heroes with
  dark overlay + white serif headline; "overline" eyebrow labels with rule lines; leaf/botanical section
  backgrounds (`media/images/leaf-pattern*.{jpg,svg,png}`); page-separator dividers; buttons = terracotta
  primary / cream / outlined (radius 6px); floating "Need Help Now?" help badge.

## Component → block map (reuse vs new)

| Golden Oaks component | nocms-template | Action |
|---|---|---|
| Header, Footer | `layout/Header`, `layout/Footer` | refine to 1:1 (green bar, leaf logo, dropdowns, mobile overlay) |
| Header-minimal, Footer-minimal | — | **new** (variant for care-assessment) |
| Help Badge, Exit Intent | `layout/HelpBadge`, `layout/ExitIntent` | refine to 1:1 |
| Tour Widget, Accreditation Bar, Urgency Strip, Care-Level Nav, Assessment Callout | — | **new** |
| Hero (video/immersive, fullbleed, split-stats, toprow, stats) | `HeroBlock` + `PageHero` + skin `heroVariant` | refine + add the 5 variants |
| Crisis Band | `crisis-callout` | refine to 1:1 |
| Stats | `stats-bar` | refine |
| Reviews grid / Video testimonial | `TestimonialBlock` | refine + add variants |
| Final CTA | `callout-band` | refine to the GO final-cta |
| Gallery Shelf | `gallery` | refine |
| Timeline | `timeline` | refine |
| Tabbed Accordion / FAQ | `accordion` | refine |
| Care-Level grid/card, Floor-Plan grid/card, Amenity grid, Team grid, Events list | existing blocks | refine each to 1:1 |
| Split Form / Tour | `tour-form` | refine + split-form layout |
| Pricing Cards | (≈ care-level) | **new** (pricing tiers w/ featured) |
| Feature Sections, Lifestyle Cards, Resource Cards, Icon-Card Grid, Content Intro, Content Blocks (cb-text/photo/pullquote/list/badges/callout), Card Carousel, Blog Card, Blog Sidebar | — | **new** |

≈14 existing blocks to refine, ≈15 new components, plus chrome refinement and the design-system foundation.

---

## Plan breakdown (write these as numbered plans)

- **Plan 0 — Design-system foundation.** Align `globals.css` tokens to the EXACT Golden Oaks palette + derived
  shades; confirm fonts; port the base styles + section-bg variants (cream/sage/light/brown/dark), overline
  eyebrow, page-separator, leaf-pattern backgrounds, button/shadow/radius scale; set `skin.config` to the
  Golden Oaks `brand-clone-config.json` values; copy `media/images` into `public/`. Establish the Playwright
  1:1 audit harness (serve mockup + template, compare per breakpoint). **Foundation for everything else.**
- **Plan 1 — Layout chrome.** Header (+minimal), Footer (+minimal), Help Badge, Tour Widget, Exit Intent,
  Accreditation Bar, Urgency Strip, Care-Level Nav — incl. dropdown nav + mobile hamburger overlay (`js/global.js`).
- **Plan 2 — Hero variants.** hero-video/immersive, fullbleed, split-stats, toprow, stats — 1:1 via HeroBlock/PageHero.
- **Plan 3 — Homepage block set + compose the homepage 1:1.** feature-sections, lifestyle-cards, resource-cards,
  pricing-cards, crisis-band, accreditation, reviews/video-testimonial, final-cta, stats.
- **Plan 4 — Interior content blocks.** content-intro, content-blocks (cb-*), gallery-shelf, video-testimonial,
  icon-card-grid (dark/brown/light), timeline, card-carousel.
- **Plan 5 — Care / community / floor-plan blocks.** care-level grid/card, floor-plan grid/card, amenity-grid,
  care-level-nav, assessment-callout — refine to 1:1 (these mostly exist).
- **Plan 6 — Forms & interactive.** split-form, tour-form, tabbed-accordion/faq, request-pricing, care-assessment,
  search-results, exit-intent (client JS: accordion, carousel, exit-intent, mobile nav).
- **Plan 7 — Blog.** blog-landing, blog-archive, blog-article, blog-card, blog-sidebar (+ blog routes).
- **Plan 8 — Page composition & content seed.** Seed each of the 43 pages' block content from the mockups
  (the "brand clone"); wire `[slug]` / `communities` / `floor-plans` / `blog` routes + page templates; map
  `brand-clone-config.json` → the design-brief.
- **Plan 9 — Responsiveness + verification.** Per-block responsive correctness is built into Plans 1–7; this is
  the holistic pass: Playwright 1:1 audit of every page × {1440, 1024, 768, 480}, diff vs the mockup, fix gaps,
  sign-off against `docs/design-system.html`.

(Plans 3–7 are the bulk; each builds its blocks responsively. Sequence: 0 → 1 → 2 → 3 → 4/5/6/7 (parallelizable
by component group) → 8 → 9.)

## Verification strategy

Per the storage template's lesson, the template has no unit suite — verify via `tsc --noEmit`,
`bun run build`, and **Playwright 1:1 diffs**: serve the mockup (`:8088/pages/<page>.html`) and the rendered
template side-by-side at each breakpoint, compare computed tokens + section geometry + screenshots. The
`docs/design-system.html` is the component-level reference.
