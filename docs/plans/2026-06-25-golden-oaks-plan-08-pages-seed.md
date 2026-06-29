# Golden Oaks Plan 08 — Page Composition & Content Seed

> **For Claude:** REQUIRED SUB-SKILL: gli-toolkit:subagent-driven-development. See the roadmap
> `2026-06-25-golden-oaks-1to1-overview.md` (esp. **Cross-cutting requirements**) and `…-plan-00-design-system.md`.
> This is the **last content plan** before the holistic responsive pass (P9). It does NOT build block
> renderers — Plans 1–7 do that. It (a) wires the routes/templates so every page renders its block list from
> Payload, and (b) **specifies the content SEED** (the "brand clone") that produces all 43 pages. The seed
> lives in the **nocms app** (`src/lib/cms/seed-content.ts`), not in the template — the template only ships
> renderers + routes. This plan is the contract between the two.

**Goal:** Define the exact per-page block composition (which blocks, in what order, with what content/variant)
for **all 43 Golden Oaks pages**, grouped by template type; wire the `nocms-template` routes/templates to render
each page's block list from Payload; and author the Golden Oaks content seed in nocms as a new
`"senior-living"` `SeedVertical`, mapping `brand-clone-config.json → design-brief / skin.config`.

---

## Cross-cutting requirements (NON-NEGOTIABLE — this plan honors all three)

1. **Configurable colors / theme.** Pages reference **token-driven blocks only** (Plans 0–7 made the
   renderers token-only). The seed carries **no per-page color/hex literals** — section background is chosen by
   the block's `settings.variant` / `settings.section` atom (`cream | sage | light | brown | dark`), which maps
   to the `--color-section-*` tokens from P0. Re-theming = change one token; the seed is untouched.
2. **Editable components.** Every seeded page is a Payload `pages` (or `posts`/`locations`) doc whose `blocks[]`
   render through `RenderBlocks` — which stamps `data-payload-doc-id/-collection/-field/-block-id` — and each
   renderer carries `data-nocms-component` + `data-payload-subfield`. **No hardcoded markup in any route**: a
   route fetches a doc and hands `blocks` to `RenderBlocks`; it never inlines page copy. (The current
   `communities/[slug]`, `blog/[slug]`, `communities`, `blog` routes have hand-written sections — Task 9 moves
   them behind blocks where the mockup needs a 1:1 layout.)
3. **Customizable / re-skinnable.** **Golden Oaks is the DEFAULT seed, not a hardcode.** The 43-page composition
   is authored as `buildSeniorLivingPages(args)` keyed off `brandName`/`tagline`/`address`/`phone` (never the
   literal "Golden Oaks" except as the default arg), so another brand re-seeds with its own identity + design-brief
   and gets the same structure with its own content. Brand identity flows `brand-clone-config.json` → design-brief
   overlay + `src/skin.config.ts` (P0 Task 2); per-page copy flows through the seed builder.

This plan includes verification that proves all three (token-only sections, `lint:direct-edit` clean on the
rendered pages, a `brandName`/design-brief swap that re-skins + re-brands without touching the composition).

**Verification:** `tsc --noEmit` + `bun run build` (template) and `bun run build` + `bun test` (nocms); the P0
Playwright 1:1 harness (`scripts/go-audit.py`) on `:8088` for a representative page per template-type group, at
breakpoints {1440, 1024, 768, 480}. No unit suite in the template — diffs are the gate.

---

## Cross-cutting note — the TEMPLATE ↔ nocms boundary (read before any task)

This is the single most important framing for this plan. Two repos, two responsibilities:

| | **`nocms-template`** (this repo) | **`nocms`** (the app) |
|---|---|---|
| Provides | Block **renderers** (`src/components/blocks/*` + `registry.ts`), **routes/templates** (`src/app/**`), chrome, tokens, `skin.config` defaults | The **content seed** (`src/lib/cms/seed-content.ts`), which writes Payload `pages`/`posts`/`locations` docs at scaffold time |
| Owns the 43-page composition? | **No** — it renders whatever `blocks[]` a page doc carries | **Yes** — `buildSeniorLivingPages()` is the canonical block-by-block spec |
| Owns brand identity? | `skin.config.ts` defaults (P0) + design-brief consumption | design-brief overlay written from `brand-clone-config.json` at scaffold |

**Why the seed is in nocms:** `seed-content.ts` already builds `storage` + `generic` verticals via
`buildDefaultPages({ vertical, brandName, tagline })`, called from `seedDefaultPages()` (aliased
`seedDefaultHomePage`) in `nocms/src/lib/cms/actions.ts`. Per `nocms/CLAUDE.md`, **the template never generates
content** — nocms clones the template repo and overlays the design-brief + seeds Payload. So Plan 08 adds a
**third vertical** (`"senior-living"`) to that existing machinery. The template side of this plan is purely
**route/template wiring + a slug contract** (Task 9); the bulk is the nocms seed (Tasks 1–8 author the specs,
Task 10 lands them in `seed-content.ts`).

**The contract that keeps them in sync (from `seed-content.ts` header comment, enforce it here):**
> Every `blockType` emitted by the seed MUST exist in `nocms/src/payload/blocks/atomic.ts` AND have a renderer
> in the template's `registry.ts` — an unregistered slug renders nothing.

So each seed task below lists the exact slugs it emits, and Task 10 includes a **slug-coverage assertion**
(seed slugs ⊆ template `REGISTRY` keys ⊆ Payload `atomic.ts` blocks). Slugs are the canonical ones from the
sibling plans:

- **P0/existing renderers:** `hero`, `care-level-grid`, `care-level-card`, `floor-plan-grid`, `floor-plan-card`,
  `testimonial`, `tour-form`, `crisis-callout`, `timeline`, `accordion`, `stats-bar`, `team-grid`,
  `amenity-grid`, `events-list`, `content`, `media-block`, `gallery`, `divider`, `spacer`, `banner`.
- **P3 (homepage set):** `feature-sections`, `lifestyle-cards`, `resource-cards`, `pricing-cards`,
  `callout-band` (the GO `final-cta`). `hero` carries the variant (`hero-video`/`fullbleed`/`split-stats`/
  `toprow`/`stats`) via `settings.variant`.
- **P4 (interior content):** `content-intro`, `content-blocks` (holds the `cb-*` items), `gallery-shelf`,
  `video-testimonial`, `icon-card-grid`, `card-carousel`.
- **P5 (care/community):** `care-level-nav`, `assessment-callout` (+ refined `care-level-grid`,
  `floor-plan-grid`, `amenity-grid`).
- **P6 (forms):** `split-form`, `request-pricing-form`, `care-assessment`, `search-results`. `accordion` carries
  the `tabbed` variant for tabbed-accordion/FAQ.
- **P1/P5 chrome-as-block (rendered inline within page flow, not global chrome):** `accreditation-bar`,
  `urgency-strip`. (Header / Footer / HelpBadge / TourWidget / ExitIntent / MobileNav are **global chrome** in
  `layout.tsx` — NOT seeded per page; they appear on every page automatically. The seed only emits the
  in-flow content blocks.)

> If a slug a seed task needs is still unbuilt when P8 runs (P4/P5 may lag), the seed still emits it — the
> renderer's missing-slug fallback no-ops safely (`RenderBlocks` logs a dev warning, renders nothing), and the
> page fills in once that plan lands. Track any such gaps in Task 10's coverage assertion output.

**Source of truth for every composition below:** the mockup section sequence, extracted from
`~/Desktop/design/golden-oaks/pages/<page>.html` by isolating the region between `</header>` and `<footer>`
(hero + `<main>` sections) and reading each top-level `<section>`'s class/id + first heading. The block table
in Task 0 is that extraction. Re-serve for verification:
`python3 -m http.server 8088 --directory ~/Desktop/design/golden-oaks` (running this session).

---

## The 43 pages (route + template-type + count)

The mockup ships **42 distinct HTML files** in `pages/`; `index.html` is the home route, and the **43rd page is
the `home` Payload page** (route `/`, distinct from `index.html`-as-a-file — they're the same content). Counting
the home route + the 6 floor-plan detail pages + the 4 care pages individually gives the roadmap's "43 pages".

| Template-type group (task) | Route(s) | Mockup file(s) | Count |
|---|---|---|---|
| **G1 Home** | `/` | `index` | 1 |
| **G2 Care / living-option** | `/living-options`, `/independent-living`, `/assisted-living`, `/memory-care`, `/respite-care` | same | 5 |
| **G3 Community / floor-plan** | `/floor-plans` (index) + `/floor-plans/{azalea,magnolia,oakwood,cypress,dogwood,heritage}` | `floor-plans`, `azalea`, `magnolia`, `oakwood`, `cypress`, `dogwood`, `heritage` | 7 |
| **G4 Content / amenity / about** | `/about-us`, `/amenities`, `/dining-nutrition`, `/activities-events`, `/our-team`, `/virtual-tour`, `/photo-video-gallery`, `/resources`, `/senior-living-guide`, `/move-in-process` | same | 10 |
| **G5 Text / legal** | `/understanding-costs`, `/financial-assistance`, `/licensing`, `/accessibility`, `/privacy-policy`, `/terms-of-use` | same | 6 |
| **G6 Blog** | `/blog` (landing), `/blog` archive view, `/blog/{slug}` (article) | `blog-landing`, `blog-archive`, `blog-article` | 3 |
| **G7 Form / interactive** | `/contact-us`, `/request-pricing`, `/schedule-tour`, `/care-assessment`, `/need-help-now`, `/search-results`, `/faq`, `/careers`, `/testimonials-reviews` | same | 9 |
| **G8 404** | `not-found` route | `404` | 1 |
| | | | **= 42 files + home route = 43** |

> **Minimal-chrome pages:** `schedule-tour` and `care-assessment` use **Header-Minimal + Footer-Minimal**
> (P1). The seed sets `meta.chrome = "minimal"` on those page docs; `layout.tsx` (P1) reads it to swap chrome.
> All other pages get the full Header/Footer + global Help Badge + Tour Widget + Exit Intent.

---

## TABLE — all 43 pages → block sequence

Block sequence = the seeded `blocks[]` (in order) for that page doc. **Global chrome** (Header, Footer, Help
Badge, Tour Widget, Exit Intent, Mobile Nav) is omitted — it's in `layout.tsx`, not seeded. `variant` is the
block's `settings.variant` (hero layout / icon-card theme / section bg). Heading shown is the mockup's H1/H2.

### G1 — Home (`/`, slug `home`)
| # | block slug | variant / settings | content (heading) |
|---|---|---|---|
| 1 | `hero` | `video` | "Where Every Day Feels Like Home" + 2 CTAs |
| 2 | `care-level-grid` | — | "Discover Your Next Chapter" (IL / AL / Memory cards) |
| 3 | `stats-bar` | `safety` | "Your Safety & Peace of Mind" (24/7, staff ratio, …) + team callout |
| 4 | `feature-sections` | — | "Why People Choose Golden Oaks" (carousel of reasons) |
| 5 | `pricing-cards` | `section:cream` | "Honest Pricing, Because Trust Starts Here" (IL $3,200 / AL $4,500 featured / Memory $5,800) |
| 6 | `testimonial` | `shelf+video+accreditation` | "What Residents & Families Are Saying" (video + scrolling shelf + accreditation bar) |
| 7 | `lifestyle-cards` | `section:sage` | "A Day in the Life at Golden Oaks" |
| 8 | `resource-cards` | — | "Helpful Resources for Your Next Chapter" |
| 9 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

### G2 — Care / living-option (5 pages)
**`/living-options`** (overview)
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `fullbleed` | "Living Options" |
| 2 | `content-intro` | — | intro |
| 3 | `feature-sections` | — | amenities/features overview |
| 4 | `assessment-callout` | `featured` | "Wondering which living option fits best?" |
| 5 | `pricing-cards` | `section:cream` | "Transparent Pricing, Because Trust Starts Here" |
| 6 | `lifestyle-cards` | `section:sage` | "Our Move-In Story" |
| 7 | `accreditation-bar` | — | accreditation logos |
| 8 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/independent-living`, `/assisted-living`, `/memory-care`, `/respite-care`** (identical structure; copy differs per care level)
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` (page-hero) | care-level name |
| 2 | `content-intro` | `section:light` | "Intro / Overview" |
| 3 | `gallery-shelf` (showcase) | `tabbed` | "What to Expect" / "Life at Golden Oaks" (tabbed showcase) |
| 4 | `timeline` | `section:cream` | "A Typical Day at Golden Oaks" |
| 5 | `gallery-shelf` | — | "What a Day Looks Like" (photo shelf) |
| 6 | `pricing-cards` | `section:sage` | "Transparent Pricing — No Surprises" |
| 7 | `testimonial` | — | "What Residents & Families Are Saying" |
| 8 | `accreditation-bar` | — | accreditation logos |
| 9 | `assessment-callout` | — | "Not Sure Which Level of Care Is Right?" |
| 10 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

### G3 — Community / floor-plan (7 pages)
**`/floor-plans`** (index)
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `split-stats` | "Floor Plans & Pricing" |
| 2 | `content-intro` | — | intro |
| 3 | `floor-plan-grid` | — | "Explore Our Floor Plans" (links to the 6 detail pages) |
| 4 | `amenity-grid` | `whats-included` | "What's Included in Every Home" |
| 5 | `pricing-cards` | `table` | "Complete Pricing Guide" |
| 6 | `callout-band` | `financial` | "Understanding Your Options" |
| 7 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/floor-plans/{azalea,magnolia,oakwood,cypress,dogwood,heritage}`** (6 detail pages; identical structure, copy/price/image per plan — seeded with slug prefix `floor-plans/<name>`)
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `split-stats` (dark) | plan name (e.g. "The Azalea") + breadcrumb + sq-ft/bed/bath stats |
| 2 | `content-intro` | — | intro |
| 3 | `icon-card-grid` | `brown` | "What's Included in The {Plan}" |
| 4 | `gallery-shelf` | — | "Life at Golden Oaks" |
| 5 | `video-testimonial` | `section:sage-deep` | "Take a Virtual Tour" |
| 6 | `pricing-cards` | `section:cream` | "Pricing for The {Plan}" |
| 7 | `callout-band` | `strip` | callout strip |
| 8 | `card-carousel` | `section:sage` | "You Might Also Like" (other plans) |
| 9 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

### G4 — Content / amenity / about (10 pages)
**`/about-us`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `fullbleed` | "Our Story" |
| 2 | `content-intro` | — | intro |
| 3 | `feature-sections` | `section:sage` | "What Drives Us" |
| 4 | `content-blocks` | `pullquote` | pullquote |
| 5 | `icon-card-grid` | `light` | "The Values That Guide Us" |
| 6 | `timeline` | `dark` | "Our History" |
| 7 | `content-blocks` | — | "Our Campus" |
| 8 | `testimonial` | `section:dark` | "What Families Are Saying" |
| 9 | `content-blocks` | `section:cream` | "Meet the People Behind the Care" |
| 10 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/amenities`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `fullbleed` | "Amenities & Services" |
| 2 | `content-intro` | — | intro |
| 3 | `feature-sections` | `dark` | amenities features |
| 4 | `gallery-shelf` | — | "Life at Golden Oaks" |
| 5 | `testimonial` | `section:sage` | "What Residents Are Saying" |
| 6 | `accreditation-bar` | — | accreditation |
| 7 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/dining-nutrition`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `stats` | "Dining & Nutrition" |
| 2 | `content-intro` | — | intro |
| 3 | `feature-sections` | — | dining features |
| 4 | `assessment-callout` | — | "Wondering which living option fits best?" |
| 5 | `gallery-shelf` | — | "Life at Golden Oaks" |
| 6 | `testimonial` | — | "What Residents & Families Are Saying" |
| 7 | `accreditation-bar` | — | accreditation |
| 8 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/activities-events`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `stats` | "Activities & Events" |
| 2 | `feature-sections` | `programs` | "Signature Programs" |
| 3 | `events-list` | `section:cream` | "Upcoming Events" |
| 4 | `gallery-shelf` | — | "Life at Golden Oaks" |
| 5 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/our-team`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | "The People Behind the Care" |
| 2 | `team-grid` | `leadership` | "Our Leadership" |
| 3 | `team-grid` | — | "The Team Behind the Everyday" |
| 4 | `callout-band` | `careers` | "We're Always Looking for Compassionate People" |
| 5 | `callout-band` | `bottom-cta` | "Have Questions About Our Team?" |

**`/virtual-tour`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `fullbleed` | "Virtual Tour" |
| 2 | `video-testimonial` | `tour` | "Take the Full Tour" |
| 3 | `gallery-shelf` | `rooms / section:cream` | "Explore by Space" |
| 4 | `assessment-callout` | `featured` | "Want to see more? We'll show you around." |
| 5 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/photo-video-gallery`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `stats` | "Photo & Video Gallery" |
| 2 | `gallery` | `grid / section:cream` | filterable gallery grid |
| 3 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/resources`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | "Resources & Planning Tools" |
| 2 | `resource-cards` | `planning` | planning tools |
| 3 | `resource-cards` | `section:sage / fit` | finding-the-fit resources |
| 4 | `resource-cards` | `section:light / started` | getting-started resources |
| 5 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/senior-living-guide`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `fullbleed` | "The Family Guide to Senior Living" |
| 2 | `icon-card-grid` | `light` | "What's Inside the Guide" |
| 3 | `split-form` | `download` | "Download Your Free Guide" (gated PDF form) |
| 4 | `testimonial` | — | "Families Who've Been Where You Are" |
| 5 | `callout-band` | `final-cta` | "Ready to Take the Next Step?" |

**`/move-in-process`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | "How the Move-In Process Works" |
| 2 | `timeline` | — | "Initial Contact & Conversation" (multi-step process) |
| 3 | `testimonial` | `section:sage` | "What Families Are Saying" |
| 4 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

### G5 — Text / legal (6 pages)
**`/understanding-costs`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | "Understanding Senior Living Costs" |
| 2 | `content-blocks` | — | "How Senior Living Pricing Works" |
| 3 | `content-blocks` | `section:cream` | "Monthly Pricing by Care Level" |
| 4 | `content-blocks` | `section:sage` | "Comparing the True Cost of Senior Living" |
| 5 | `content-blocks` | — | "Financial Assistance & Payment Options" |
| 6 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/financial-assistance`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | "Financial Assistance Options" |
| 2 | `content-blocks` | — | "Navigating the Cost of Care" |
| 3 | `accordion` | `tabbed` | tabbed accordion (funding options) |
| 4 | `urgency-strip` | — | urgency strip |
| 5 | `card-carousel` | `section:sage` | "More Ways to Fund Senior Living" |
| 6 | `video-testimonial` | — | "A Family's Financial Journey" |
| 7 | `resource-cards` | `section:sage` | "Financial Planning Resources" |
| 8 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/licensing`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | "Licensing & Accreditations" |
| 2 | `content-intro` | — | intro |
| 3 | `content-blocks` | — | "Accreditations & Certifications" |
| 4 | `content-blocks` | `section:cream` | "Staff Credentials" |
| 5 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/accessibility`, `/privacy-policy`, `/terms-of-use`** (identical structure; copy differs)
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | page title |
| 2 | `content-intro` | — | intro |
| 3 | `content-blocks` | `section:sage` | section 1 (e.g. "Information We Collect") |
| 4 | `content-blocks` | `section:cream` | section 2 (e.g. "When We Share Your Information") |
| 5 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

### G6 — Blog (3 views)
**`/blog`** (landing — page doc `blog` holds the header/CTA blocks; the grid renders `posts` from Payload)
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `blog-featured` | "Resources & Insights" (featured article hero) |
| 2 | *(route-rendered)* | — | post grid + sidebar (from `posts`, NOT seeded as blocks) |
| 3 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/blog` archive view** (`blog-archive`) — same `blog` doc; the "Article Archive" list is the route-rendered
post grid with the sidebar filter. Header H1 "Article Archive". No separate page doc; it's the paginated state
of the landing grid.

**`/blog/{slug}`** (article — each `posts` doc; body is Lexical `content`, sidebar + related are route chrome)
| # | element | source | heading |
|---|---|---|---|
| 1 | `hero` `fullbleed article-hero` | post `featuredImage` + `title` | article title |
| 2 | article body | post `content` (Lexical) + `blog-sidebar` route component | "The Physical Signs" … |
| 3 | related grid | `posts` (route-rendered) | "You Might Also Like" |
| 4 | `callout-band` `final-cta` | seeded on `blog` doc / shared | "Ready to Find Your New Home?" |

> Blog is special: posts are the `posts` collection, not `pages.blocks`. The seed creates 3 example `posts` +
> the `blog` page doc (header `hero` + final-cta). P7 owns the blog renderers/route; P8 seeds the content.

### G7 — Form / interactive (9 pages)
**`/contact-us`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | "Contact Us" |
| 2 | `split-form` | `contact` | "Send Us a Message" (+ success state) |

**`/request-pricing`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | "Request Pricing Information" |
| 2 | `request-pricing-form` | — | "Get Your Personalized Quote" (+ success state) |

**`/schedule-tour`** *(minimal chrome)*
| # | block | variant | heading |
|---|---|---|---|
| 1 | `split-form` | `tour` | "See Golden Oaks for Yourself" (split: form + value-prop aside) |

**`/care-assessment`** *(minimal chrome)*
| # | block | variant | heading |
|---|---|---|---|
| 1 | `care-assessment` | — | "Care Assessment" (multi-step quiz → recommended care level) |

**`/need-help-now`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | "If You Need Care Quickly, We're Here" |
| 2 | `crisis-callout` | `form` | "Request a Callback or Video Consultation" (+ success state) |

**`/search-results`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `search-results` | — | "Search Golden Oaks" (query + results list) |
| 2 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/faq`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `toprow` | "Frequently Asked Questions" |
| 2 | `accordion` | `tabbed` | tabbed FAQ |
| 3 | `callout-band` | `final-cta` | "Still Have Questions?" |

**`/careers`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `split-stats` | "Join the Golden Oaks Family" |
| 2 | `icon-card-grid` | `dark` | "Why Work With Us" |
| 3 | `events-list` | `jobs` | "Open Positions" |
| 4 | `testimonial` | — | "Hear From Our Team" |
| 5 | `callout-band` | `apply` | "Don't See the Right Fit?" |
| 6 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

**`/testimonials-reviews`**
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `split-stats` (dark) | "Testimonials & Reviews" |
| 2 | `testimonial` | `reviews-grid` | reviews grid |
| 3 | `content-blocks` | — | "Our Commitment to Your Family" |
| 4 | `accreditation-bar` | — | accreditation |
| 5 | `content-blocks` | `pullquote` | pullquote |
| 6 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

### G8 — 404 (`not-found` route — NOT a Payload page)
| # | block | variant | heading |
|---|---|---|---|
| 1 | `hero` | `fullbleed error-hero` | "We can't find that page" |
| 2 | error body + links | route markup | helpful links |
| 3 | `callout-band` | `final-cta` | "Ready to Find Your New Home?" |

> 404 has **no Payload doc** (Next renders `not-found.tsx` for unmatched routes). It's the one page whose
> content is template markup, not seed data — Task 9 styles `not-found.tsx` to the mockup using token-driven
> chrome + a static `callout-band`-styled CTA. It stays editable-exempt by nature (no doc to bind).

---

## Tasks

> **Sequencing:** Task 0 (audit/lock the table) → Tasks 1–8 author the per-group seed specs (parallelizable;
> each is a pure `SeedPageSpec[]` fragment) → Task 9 wires the template routes (separate repo) → Task 10
> assembles the specs into `seed-content.ts` + the design-brief mapping + runs the seed end-to-end. Tasks 1–8
> can be done by sub-agents in parallel; Task 9 (template repo) is independent; Task 10 depends on 1–9.

### Task 0 — Lock the page inventory + block table against the mockups
**Files:** this plan (the table above); reference `~/Desktop/design/golden-oaks/pages/*.html`,
`~/Desktop/design/golden-oaks/components/INDEX.md`.
**Steps:**
1. Re-run the section extraction to confirm the table is current (the region between `</header>` and `<footer>`
   per page; capture each top-level `<section>` class/id + first heading). A reusable extractor:
   ```
   python3 - <<'PY'  # for each page: print top-level <section> sequence (hero + main)
   import re,os
   D="~/Desktop/design/golden-oaks/pages"; D=os.path.expanduser(D)
   for p in sorted(f[:-5] for f in os.listdir(D) if f.endswith(".html")):
       h=open(os.path.join(D,p+".html"),encoding="utf-8",errors="ignore").read()
       m=re.search(r"</header>(.*?)<footer",h,re.S|re.I); reg=m.group(1) if m else ""
       secs=re.findall(r'<section\b([^>]*)>',reg)
       print(p, [re.search(r'class="([^"]*)"',s).group(1) if re.search(r'class="',s) else "" for s in secs][:12])
   PY
   ```
2. For any `(no-class)` section, resolve its component via the first inner `.{care-cards|content-intro|
   feature-sections|resources-list|careers-listings|showcase|carousel}` class and the INDEX.md "Used On" column.
   Confirmed resolutions already baked into the table: home `#living-options`→`care-level-grid`,
   `#about`→`feature-sections` (carousel), `#resources`→`resource-cards`; living-options `#amenities-features`→
   `feature-sections`; care-page `#what-to-expect`→`gallery-shelf`(tabbed showcase); careers "Open Positions"→
   `events-list`; move-in "Initial Contact"→`timeline`.
3. Confirm the 8 template-type groups + counts (G1…G8 = 43). Confirm the 2 minimal-chrome pages
   (`schedule-tour`, `care-assessment`) and the 6 identical floor-plan detail pages and the 4 identical
   care-level pages and the 3 identical legal pages — these de-dupe into parametrized builders.
4. Record which slugs (from the boundary note) are already built (P0–P3, P6) vs pending (P4 `content-intro`/
   `content-blocks`/`gallery-shelf`/`video-testimonial`/`icon-card-grid`/`card-carousel`, P5 `care-level-nav`/
   `assessment-callout`/`accreditation-bar`, P1 `urgency-strip`) so Task 10's coverage assertion expects them.
**Verification:** the printed extraction matches the table for all 42 files; every block slug in the table is in
the boundary-note slug list; group counts sum to 43.
**Playwright 1:1 (P0 harness):** none (audit-only task).

### Task 1 — Seed spec: Home (G1)
**Files (nocms):** `src/lib/cms/seed-content.ts` — add `buildSeniorLivingHome(ctx): SeedPageSpec` (ctx =
`{ brandName, tagline, phone, email, address, communitySlug }`).
**Steps:**
1. Emit the 9 home blocks (table G1) as `{ blockType, blockName, title?, body?, settings? }` objects, in order.
   Use `lexicalParagraph`/`lexicalList` (already in `seed-content.ts`) for `body`; pricing/stat numbers go in
   the block's structured atoms (NOT hardcoded in a renderer). Section bg via `settings: { section: "cream" }`
   etc. — **never a hex**. Hero variant via `settings: { variant: "video" }`.
2. Copy from `index.html`: hero headline = `tagline`, the 3 care cards (IL/AL/Memory) link to G2 routes, pricing
   tiers $3,200 / $4,500 (featured) / $5,800, the safety stats, the day-in-the-life lifestyle cards, the
   resource cards, the final-cta CTAs → `/schedule-tour` + `tel:${phone}`.
3. Slug `home`, title `brandName`. (This replaces the storage home for the senior-living vertical.)
**Verification:** `bun test` (nocms) — add a unit asserting the home spec emits exactly these 9 slugs in order;
`tsc` clean.
**Playwright 1:1 (P0 harness):** after Task 10 seeds it, `scripts/go-audit.py index /` at {1440,1024,768,480} —
compare hero/pricing/testimonial section bounding boxes + computed tokens (primary/accent/h1 font-size) to the
mockup; screenshots diff < the harness threshold.

### Task 2 — Seed specs: Care / living-option (G2, 5 pages)
**Files (nocms):** `src/lib/cms/seed-content.ts` — `buildSeniorLivingCarePages(ctx): SeedPageSpec[]`.
**Steps:**
1. `living-options` → the 8-block overview (table). The 4 care-level pages share one parametrized builder
   `careLevelPage({ slug, name, intro, dayTimeline, pricing, ... })` emitting the identical 10-block sequence;
   call it for `independent-living`, `assisted-living`, `memory-care`, `respite-care` with per-level copy from
   each mockup. **One builder, four calls** — proves the "structure is reusable, content is data" rule.
2. Hero variant: `living-options` = `fullbleed`; care pages = `toprow` (page-hero). Section bgs via `settings`.
   Care cards / assessment-callout CTAs deep-link via `ctx.communitySlug` where the mockup does.
**Verification:** unit test asserting all 5 specs + that the 4 care pages emit an identical slug sequence
(differing only in `title`/`body` content).
**Playwright 1:1 (P0 harness):** `scripts/go-audit.py independent-living /independent-living` (representative)
+ spot-check `living-options` at all 4 breakpoints.

### Task 3 — Seed specs: Community / floor-plan (G3, 7 pages)
**Files (nocms):** `src/lib/cms/seed-content.ts` — `buildSeniorLivingFloorPlans(ctx): SeedPageSpec[]`.
**Steps:**
1. `floor-plans` index → the 7-block sequence (hero `split-stats`, content-intro, `floor-plan-grid` linking the
   6 detail slugs, `amenity-grid` whats-included, `pricing-cards` table, financial callout, final-cta).
2. The 6 detail pages share `floorPlanDetail({ slug, name, sqft, beds, baths, price, ... })` emitting the
   identical 9-block sequence; **slug prefix `floor-plans/<name>`** so the template's `/floor-plans/[slug]`
   route resolves them (it strips the `floor-plans/` prefix — see `floor-plans/[slug]/page.tsx`). Seed
   azalea/magnolia/oakwood/cypress/dogwood/heritage. `card-carousel` "You Might Also Like" references the other
   plans.
3. **Decision — floor plans are `pages` (slug-prefixed), not `locations`.** The mockup's 6 "floor plans" are
   apartment layouts, not geographic communities; the template's `/floor-plans/[slug]` route fetches
   `pages` by `floor-plans/<slug>`. Communities (the `locations` collection + `/communities` route) get a single
   seeded `main-community` via the existing `seedSeniorLivingCommunity()` (already in `actions.ts`) so
   `/communities` isn't empty — but the Golden Oaks mockup has no per-community pages, so no extra locations.
**Verification:** unit test: index emits 7 slugs; each detail page emits the 9-block sequence with slug
`floor-plans/<name>`; `floor-plan-grid` link targets ⊆ the seeded detail slugs.
**Playwright 1:1 (P0 harness):** `scripts/go-audit.py azalea /floor-plans/azalea` + `floor-plans /floor-plans`.

### Task 4 — Seed specs: Content / amenity / about (G4, 10 pages)
**Files (nocms):** `src/lib/cms/seed-content.ts` — `buildSeniorLivingContentPages(ctx): SeedPageSpec[]`.
**Steps:** Emit the 10 pages per the table (`about-us`, `amenities`, `dining-nutrition`, `activities-events`,
`our-team`, `virtual-tour`, `photo-video-gallery`, `resources`, `senior-living-guide`, `move-in-process`). These
lean on P4 blocks (`content-intro`, `content-blocks`, `gallery-shelf`, `video-testimonial`, `icon-card-grid`)
+ P3 (`feature-sections`, `resource-cards`, `lifestyle-cards`) + existing (`team-grid`, `events-list`,
`timeline`, `gallery`). `content-blocks` carries its `cb-*` items as a repeatable atom array (text / photo /
pullquote / list / badges / callout) — author them from each mockup's `.cb-*` blocks. Section bgs + icon-card
themes via `settings`.
**Verification:** unit test: 10 specs, each slug matches a route; every emitted slug ∈ boundary-note list.
**Playwright 1:1 (P0 harness):** `scripts/go-audit.py about-us /about-us` (richest content page) +
`our-team /our-team` at all breakpoints.

### Task 5 — Seed specs: Text / legal (G5, 6 pages)
**Files (nocms):** `src/lib/cms/seed-content.ts` — `buildSeniorLivingTextPages(ctx): SeedPageSpec[]`.
**Steps:** `understanding-costs`, `financial-assistance`, `licensing` per table; the 3 legal pages
(`accessibility`, `privacy-policy`, `terms-of-use`) share `legalPage({ slug, title, intro, section1, section2 })`
emitting the identical 5-block sequence. Body copy = `content-blocks` with `cb-text`/`cb-list` items; long-form
legal text via `lexicalParagraph`/`lexicalList`. `financial-assistance` adds `accordion` (tabbed),
`urgency-strip`, `card-carousel`, `video-testimonial`, `resource-cards`.
**Verification:** unit test: 6 specs; 3 legal pages emit an identical slug sequence.
**Playwright 1:1 (P0 harness):** `scripts/go-audit.py understanding-costs /understanding-costs` +
`financial-assistance /financial-assistance`.

### Task 6 — Seed specs: Blog (G6) + example posts
**Files (nocms):** `src/lib/cms/seed-content.ts` — `buildSeniorLivingBlog(ctx)` returns
`{ page: SeedPageSpec; posts: SeedPostSpec[] }` (add a `SeedPostSpec` type + thread `posts` through
`seedDefaultPages` → `payload.create({ collection: "posts" })`, mirroring the pages loop).
**Steps:**
1. Seed the `blog` page doc: hero (`blog-featured` variant) + final-cta (the landing/archive header + CTA; the
   grid is route-rendered from `posts`).
2. Seed **3 example posts** (from `blog-article`/`blog-landing` cards): each with `title`, `slug`, `excerpt`,
   `featuredImage` (media path from P0 copy), `category`, `publishedAt`, and `content` (Lexical body authored
   from the `blog-article` body sections). One = the full "10 Signs It Might Be Time for Senior Living" article.
3. The article page (`/blog/[slug]`), archive view, sidebar + related grid are **P7 route chrome** — P8 only
   supplies the post data + the `blog` page header/CTA blocks.
**Verification:** unit test: `blog` page emits hero+final-cta; exactly 3 posts with required fields; post slugs
unique. nocms `bun test` green.
**Playwright 1:1 (P0 harness):** `scripts/go-audit.py blog-landing /blog` + `blog-article /blog/<seeded-slug>`.

### Task 7 — Seed specs: Form / interactive (G7, 9 pages)
**Files (nocms):** `src/lib/cms/seed-content.ts` — `buildSeniorLivingFormPages(ctx): SeedPageSpec[]`.
**Steps:** Emit `contact-us`, `request-pricing`, `schedule-tour`, `care-assessment`, `need-help-now`,
`search-results`, `faq`, `careers`, `testimonials-reviews` per the table. Forms use P6 blocks (`split-form`,
`request-pricing-form`, `care-assessment`, `search-results`) + `crisis-callout` (need-help-now). Set
`meta.chrome = "minimal"` on `schedule-tour` + `care-assessment` (the only minimal-chrome pages — Task 9's
`layout.tsx` reads it). `faq` uses `accordion` `tabbed`; `careers` uses `events-list` `jobs` + `icon-card-grid`
`dark`; `testimonials-reviews` uses `testimonial` `reviews-grid`.
**Verification:** unit test: 9 specs; `schedule-tour`+`care-assessment` carry `meta.chrome="minimal"`, all others
don't.
**Playwright 1:1 (P0 harness):** `scripts/go-audit.py schedule-tour /schedule-tour` (minimal chrome — verify
Header-Minimal/Footer-Minimal swap) + `faq /faq` + `contact-us /contact-us`.

### Task 8 — Seed spec: 404 content + design-brief field mapping
**Files (nocms):** `src/lib/cms/seed-content.ts` (export the `brand-clone-config.json → design-brief` mapping
as a documented const used at scaffold); reference `nocms` scaffold/design-brief overlay path.
**Steps:**
1. **404 is not seeded** (no Payload doc) — record that Task 9 styles `not-found.tsx` in the template. Note it
   in the builder comment so no one adds a stray `404` page doc.
2. Author the **`brand-clone-config.json → design-brief` mapping** (the "brand clone" → tokens), so re-seeding a
   new brand re-skins the whole site:
   | `brand-clone-config.json` | design-brief / `skin.config` target |
   |---|---|
   | `brand_name` | `skin.config.brandName` |
   | `brand_suffix` | `skin.config.brandSuffix` ("Senior Living") |
   | `brand_tagline` | `skin.config.tagline` (= home hero headline) |
   | `phone_display` / `phone_tel` | `skin.config.contactPhone` / tel CTAs |
   | `brand_email` | `skin.config.contactEmail` |
   | `address_line1` / `address_line2` / `address_full` | `skin.config.primaryAddress.*` |
   | `font_heading` / `font_body` | design-brief `--font-heading` / `--font-body` |
   | `colors.brand-primary` | design-brief `--color-primary` (`#4D654C`) |
   | `colors.brand-secondary` | `--color-secondary` (`#AD6045`) |
   | `colors.brand-accent` | `--color-accent` (`#C4882B`) |
   | `colors.brand-cool` | `--color-cool` (`#7383A0`) |
   | `colors.brand-neutral` | `--color-text` (`#2C2218`) |
   | `colors.brand-warm` | `--color-warm` (`#E8DCC8`) |
   | `logo_path` | `skin.config.logo` / Header logo (P0 media copy) |
   The seed builder consumes `brandName`/`tagline`/`phone`/`email`/`address` from this overlay — **Golden Oaks
   values are the defaults; another brand overrides them and gets the same 43-page structure with its identity.**
3. Confirm the design-brief overlay (color/font tokens) is the P0 mechanism — P8 only documents/uses it.
**Verification:** the mapping covers every `brand-clone-config.json` key; a doc-comment in `seed-content.ts`
points future verticals at it.
**Playwright 1:1 (P0 harness):** `scripts/go-audit.py 404 /a-bogus-url` (404 route) at all breakpoints.

### Task 9 — Wire the TEMPLATE routes/templates (the `nocms-template` side)
**Files (template):** `src/app/[slug]/page.tsx`, `src/app/floor-plans/[slug]/page.tsx`,
`src/app/floor-plans/page.tsx`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`,
`src/app/communities/page.tsx`, `src/app/communities/[slug]/page.tsx`, `src/app/not-found.tsx`,
`src/app/layout.tsx`; `src/components/blocks/registry.ts`.
**Steps:**
1. **Catch-all `/[slug]`** already fetches `pages` by slug and renders `RenderBlocks` — confirm it resolves
   every G2/G4/G5/G7 slug (they're all top-level `pages` slugs). It excludes `RESERVED_SLUGS`
   (`home`/`blog`/`communities`/`floor-plans`) so the static routes win. **No literal page copy** — keep it
   data-only. Verify `generateStaticParams` lists all seeded non-reserved slugs (so `output: export` reaches
   them).
2. **`/floor-plans` + `/floor-plans/[slug]`** already render `pages` (`floor-plans` + `floor-plans/<name>`) via
   `RenderBlocks` — confirm against Task 3's seed. Good as-is.
3. **`/blog` + `/blog/[slug]`** (P7 refines): the landing renders the `blog` page's header/CTA blocks via
   `RenderBlocks` + the post grid; the article renders the post hero + Lexical `content` + sidebar/related.
   Confirm they consume Task 6's seed.
4. **`/communities` + `/communities/[slug]`**: the Golden Oaks mockup has **no community-list or
   per-community page** (floor plans live under `/floor-plans`). Keep the existing data-driven communities
   routes (they render the single seeded `main-community`) so the nav link isn't dead, but they're **not** a
   1:1 mockup target. Note this explicitly so P9 doesn't flag them.
5. **`not-found.tsx`**: restyle to the `404.html` mockup — `hero-fullbleed error-hero` headline "We can't find
   that page", helpful links, and a `callout-band`-styled final-CTA. **Token-driven, no hex**; it's the one
   page with template markup (no doc to bind), so it's editable-exempt by design.
6. **`layout.tsx` minimal-chrome switch**: read the current page's `meta.chrome` (P1 adds Header-Minimal/
   Footer-Minimal); when `"minimal"`, render the minimal chrome + suppress Help Badge / Tour Widget / Exit
   Intent. (Pages set this via Task 7's seed.) If P1 already implemented this, just confirm the seed key matches.
7. **`registry.ts`**: confirm every slug the seed emits is registered (or will be by its owning plan). Add any
   P8-introduced alias if needed; otherwise no change (renderers belong to P1–P7).
**Verification:** `tsc --noEmit` + `bun run build` (template) clean with the seed live; every route resolves a
seeded doc (no `notFound()` for a seeded slug); `bun run lint:direct-edit` clean (editor contract intact on all
rendered pages).
**Playwright 1:1 (P0 harness):** smoke every route group via the harness — at minimum the representatives from
Tasks 1–8 render through these routes without layout shift vs the mockup.

### Task 10 — Assemble the seed in nocms + wire the new vertical end-to-end
**Files (nocms):** `src/lib/cms/seed-content.ts` (combine Tasks 1–8 into `buildSeniorLivingPages` +
`buildSeniorLivingEmails` already exists at `actions.ts:601`), `src/lib/cms/actions.ts` (extend `SeedVertical`
+ `buildDefaultPages` dispatch + thread `posts`), the scaffold/template-selection path that picks the vertical.
**Steps:**
1. Extend `SeedVertical` (`seed-content.ts:13`) to `"storage" | "generic" | "senior-living"`. Add
   `buildSeniorLivingPages(args)` that concatenates Tasks 1–8 fragments into the 43-page `SeedPageSpec[]`
   (home, 5 care, 7 floor-plan, 10 content, 6 legal, blog page, 9 forms). Update `buildDefaultPages` dispatch:
   `vertical === "senior-living" ? buildSeniorLivingPages(args) : …`.
2. Thread example **posts** through the seeder: add `SeedPostSpec` + a posts loop in `seedDefaultPages`
   (`actions.ts:518`) mirroring the pages loop (idempotent: skip if a post with that slug+tenant exists). The
   senior-living email set (`buildSeniorLivingEmails`) already exists — confirm `buildDefaultEmails` dispatches
   to it for the new vertical.
3. Ensure the nocms scaffold selects `"senior-living"` when cloning the default `nocms-template` for a
   senior-living project, and writes the design-brief overlay from `brand-clone-config.json` (Task 8 mapping) +
   the `skin.config` rebrand. Golden Oaks values are the defaults.
4. **Slug-coverage assertion (the contract gate):** add a `bun test` that asserts
   `seedSlugs ⊆ templateRegistryKeys` and `seedSlugs ⊆ payloadAtomicBlockSlugs`. Import the template's
   `REGISTRY` keys (or a checked-in snapshot) + `atomic.ts` block slugs; fail loudly listing any seed slug with
   no renderer or no schema. Pending-renderer slugs (P4/P5) are allowed only if explicitly in a documented
   `KNOWN_PENDING` set — so the test stays a true gate, not a rubber stamp.
5. **Re-skin / re-brand proof:** a `bun test` (or scripted) that calls `buildSeniorLivingPages({ brandName:
   "Cedar Grove", tagline: "A different tagline", phone: "(555) 111-2222", … })` and asserts the **same 43-slug
   structure** with the new brand's strings substituted (no literal "Golden Oaks" in the output) — proving
   Golden Oaks is the default seed, not a hardcode.
6. Run the full seed against a scratch tenant (the legacy-import test tenant pattern): `seedDefaultPages({
   tenantId, brandName: "Golden Oaks", vertical: "senior-living" })`, confirm 43 page docs + 3 posts + emails
   created, then load the rendered template against `:8088` mockups via the P0 harness.
**Verification:** nocms `bun run build` + `bun test` green (incl. the coverage + re-skin assertions); template
`bun run build` green with the seeded Payload; the seed run reports 43 pages + 3 posts created (idempotent on
re-run — second run creates 0).
**Playwright 1:1 (P0 harness):** the full representative sweep — `index, independent-living, azalea, about-us,
understanding-costs, blog-landing, schedule-tour, 404` — each at {1440, 1024, 768, 480}, diffed vs the mockup.
This is the P8 sign-off; P9 then does the exhaustive every-page sweep.

---

## Verification (plan-level sign-off)

1. **Build + types:** template `tsc --noEmit` + `bun run build` clean with seeded Payload; nocms `bun run build`
   + `bun test` clean (incl. per-group spec tests, slug-coverage gate, re-skin proof).
2. **Editor contract (cross-cut #2):** `bun run lint:direct-edit` clean; spot-click a block in the nocms preview
   on 3 representative pages → the inspector resolves `data-payload-doc-id/-block-id` (inline edit works).
3. **Token-only (cross-cut #1):** `grep -rn "#[0-9a-fA-F]\{6\}"` over the **seed** output / specs finds **zero**
   hexes; section backgrounds are all `settings.{section|variant}` keys mapping to `--color-section-*`. Flip
   `--color-primary` in the design-brief → every seeded page re-themes (no per-page literal survives).
4. **Re-skin / re-brand (cross-cut #3):** the Task 10 re-skin test passes — `buildSeniorLivingPages` with a
   non-Golden-Oaks `brandName`/design-brief yields the same 43-page structure with the new brand's content +
   colors; no literal "Golden Oaks" leaks into the composition.
5. **1:1 fidelity:** the P0 harness representative sweep (Task 10) matches the mockup per breakpoint within the
   harness threshold (computed tokens + section geometry + screenshot diff).
6. **Boundary intact:** no page copy lives in template routes (`grep` the `src/app/**` routes for seeded
   headings → none); all 43 compositions live in `nocms/src/lib/cms/seed-content.ts`; every emitted slug has a
   template renderer (or a documented pending entry). Hand off to **Plan 9** for the exhaustive responsive pass.
