# Golden Oaks Plan 06 — Forms & Interactive

> **For Claude:** REQUIRED SUB-SKILL: gli-toolkit:subagent-driven-development. Read the roadmap
> `2026-06-25-golden-oaks-1to1-overview.md` (esp. **Cross-cutting requirements**) and
> `2026-06-25-golden-oaks-plan-00-design-system.md` FIRST — this plan depends on P0's tokens,
> base patterns (`.btn`/`.btn-secondary`, section bg utilities, `--radius`), media in `public/`,
> the `settings.variant` atom, and the `scripts/go-audit.py` Playwright harness. Sequence: P0 → P1
> (chrome: header-minimal/footer-minimal, Help Badge live; this plan reuses them) → then this plan
> (parallelizable with P3/P4/P5/P7).

**Goal:** Make the Golden Oaks **forms & interactive** surfaces render 1:1 (incl. responsiveness):
the split-form (Schedule a Tour 2-col wizard), the refined tour-form, the tabbed-accordion + FAQ
(tabs + accordion in one block via variant), the request-pricing form, the care-assessment
multi-step quiz, the search-results page, and the exit-intent client behavior. **Forms are
presentational in the template** — HTML5/required validation + multi-step UX + success swaps are in
scope; backend submission is NOT (each form notes its hook point; default `action="/api/*"` is a
placeholder consumers wire to their backend).

**Cross-cutting (NON-NEGOTIABLE — proven per task):**
1. **Tokens only for colors/fonts.** No hex/literal colors in components — only the Tailwind v4
   `@theme` token utilities P0 established (`text-primary`, `text-secondary`, `text-accent`,
   `bg-surface`, `bg-background`, `text-muted`, `text-text`, `border-text/10`, the
   `bg-section-{cream,sage,light,brown,dark}` utilities, `font-heading`/`font-body`). Re-theming a
   token must re-theme these components. `grep -nE "#[0-9a-fA-F]{3,6}|rgba?\(" src/components/blocks/{TourFormBlock,SplitFormBlock,AccordionBlock,RequestPricingFormBlock,CareAssessmentBlock,SearchResultsBlock}.tsx src/components/layout/ExitIntent.tsx` returns ~none (SVG `currentColor`/`none` and `fill="none"` are fine; no color literals).
2. **Editor contract.** Every block root carries `data-nocms-component="<slug>"`; every editable
   label/heading/intro carries `data-role` (string-literal) + `data-payload-subfield="<field>"`;
   repeatable atoms (FAQ/accordion items, quiz questions, form-field labels) carry
   `data-array-index={i}` and the lexical-bound container carries `data-payload-subfield="body"`.
   Renderers are dispatched through `RenderBlocks` (which adds `data-payload-doc-id/-collection/-field/-block-id`).
   `bun run lint:direct-edit` stays clean (no `data-role` bound to a template expression or a
   non-literal call-site prop). The **accordion/FAQ items are editable repeatable atoms** sourced
   from `lexicalQAPairs(body)`.
3. **Customizable via `settings.variant`.** One block per multi-layout design, switched on
   `block.settings?.variant` (the atom P0 added to the Payload schema), NOT N hardcoded blocks:
   - `accordion` → `variant: "accordion" | "tabbed"` (flat list vs the FAQ tab bar).
   - `tour-form` → `variant: "split" | "stacked"` (2-col split-form vs single-column tour widget).
   - `care-assessment` → single block (the quiz); copy/recommendations are data-driven.
   Read it defensively: `const variant = (block as { settings?: { variant?: string } }).settings?.variant ?? <default>`
   (BlockProps = PayloadAtomicBlock today has no `settings`; P0 adds it — until then the `?.` keeps
   tsc green and falls back). Golden Oaks is the DEFAULT skin — copy defaults live in the renderer
   but every visible string is overridable via the atom (`title`/`body`) so another brand re-skins
   + re-contents without code edits.

**Client JS rule:** interactive state (multi-step wizard, tab switching, exit-intent, accordion
animation, search filter) lives in `"use client"` components and **degrades gracefully**: prefer
native `<details>/<summary>` for disclosure (works with JS disabled — the current `AccordionBlock`
already does this); the tabbed variant renders the same `<details>` items grouped by category and
JS only layers the tab bar / `max-height` animation on top; multi-step forms render all steps
(step 1 visible, rest `hidden`) so no-JS users still see the fields.

**Responsive (mockup breakpoints 1024/768/480):** split-form stacks to 1 column and hides the
slideshow at ≤768; tabbed-accordion tab bar becomes horizontally scrollable and the sticky page-menu
hides at ≤1024, tabs effectively read as a plain accordion stack on mobile; pricing/assessment forms
go single-column at ≤768; search results card goes column at ≤768.

**Verification:** No unit suite. Per task: `tsc --noEmit` → `bun run build` → **Playwright 1:1 diff
via the P0 harness** (`python3 -m http.server 8088 --directory ~/Desktop/design/golden-oaks` already
running; `bun run scripts/go-audit.py <page> --bp 1440,1024,768,480`) comparing the rendered route
to the mockup page, **plus an interaction check** (accordion open/close, tab switch, step next/back,
exit-intent trigger) driven through the harness — then commit.

**Sources (the 1:1 target):**
- Components: `~/Desktop/design/golden-oaks/components/split-form/split-form.html`,
  `~/Desktop/design/golden-oaks/components/tabbed-accordion/tabbed-accordion.html`.
- Pages: `pages/{schedule-tour,faq,request-pricing,care-assessment,search-results,contact-us,need-help-now}.html`.
- Interaction JS is **inline per component/page** (not in `js/global.js`): split-form wizard +
  slideshow at the bottom of `split-form.html`; tabbed-accordion engine at the bottom of
  `tabbed-accordion.html`; the quiz engine + the pricing form's WCAG validation are inline `<script>`
  at the bottom of `care-assessment.html` / `request-pricing.html`.
- Existing to refine: `src/components/blocks/{TourFormBlock,AccordionBlock}.tsx`,
  `src/components/layout/ExitIntent.tsx`.

**New registry slugs this plan adds** (register in `src/components/blocks/registry.ts`, keyed to the
Payload block slugs in the nocms schema repo): `split-form` (or fold into `tour-form` via variant —
see Task 1), `request-pricing-form`, `care-assessment`, `search-results`. `accordion` and `tour-form`
are refined in place.

---

### Task 1 — Refine `TourFormBlock` + add the split-form variant (Schedule a Tour)
**Files:** `src/components/blocks/TourFormBlock.tsx`; (new) `src/components/blocks/SplitFormBlock.tsx`;
`src/components/blocks/registry.ts`
**Build/refine:**
1. **Decide structure (one block, `settings.variant`):** keep slug `tour-form`. Add
   `variant: "split" | "stacked"` read from `block.settings?.variant ?? "stacked"`. The `stacked`
   path is the existing 2-col heading+intro+selling-points / form-card layout — refine its colors to
   tokens and its inputs to the mockup `.form-group` look (label 16px `font-semibold text-text`,
   input `border-2 border-text/15 rounded-[--radius] focus:border-primary focus:ring-primary/15`,
   submit = `bg-secondary` terracotta per `.btn-secondary`). The `split` path is a NEW client
   sub-component for the **Schedule a Tour** page (`split-form.html`).
2. **Split layout (`SplitFormBlock`, `"use client"`):** two columns (`grid lg:grid-cols-2
   min-h-[calc(100vh-72px)]`). LEFT = scrollable form panel (`max-w-[560px] mx-auto px-12 py-15`):
   breadcrumb (Home / Schedule a Tour), centered `h1` (`data-role="heading"
   data-payload-subfield="title"`, default `See {brandName} for Yourself` from `skinConfig`),
   centered subtitle (`data-payload-subfield="body"`), then the **3-step progress stepper** (dots
   1·2·3 with `is-active`/`is-complete` states + connector lines + step labels "About You / Tour
   Details / Confirm" — labels hidden ≤768) and the **3-step form** (Step 1: first/last/email/phone;
   Step 2: preferred-date [min=today] + care-level select + optional message; Step 3: confirmation
   summary with an "Edit my information" link). RIGHT = `sticky top-0 h-screen` crossfading image
   slideshow (6 images from `public/golden-oaks/media/images/life-*.jpg` etc., or `mediaArray` if
   authored) with a green-gradient overlay; **hidden ≤768** (`hidden md:block`). Port the success
   state: on submit, hide the form/stepper, swap h1→"Thank You!" + subtitle, reveal the
   "What Happens Next" 3-step list + testimonial + alternative-contact block.
3. **Client behavior (graceful):** render all 3 step panels (step 1 shown, 2–3 `hidden`) so no-JS
   users see every field. `useState` for `step` (1–3) + the `formData`; Continue validates the
   current step's fields (required + email/phone regex from the mockup), shows inline `.form-error`
   spans + an `aria-live` error summary, advances on success; Back/Edit move between steps; Step 3
   populates the confirmation summary (format the date via `toLocaleDateString`). Submit
   `e.preventDefault()` → success state. **Submission hook:** keep `<form>` semantics; note in a
   comment that the submit handler is where a consumer POSTs to their endpoint (default no-op success;
   the stacked variant keeps `action="/api/tour-inquiry"`). Stepper dots/labels are presentational.
4. **Editor contract:** root `data-nocms-component="tour-form"`; `data-role`+`data-payload-subfield`
   on h1/subtitle; selling-points / next-steps items get `data-array-index={i}`; form field labels
   are static UI (not Payload subfields) — that's fine, they carry no `data-role`.
5. **Tokens:** stepper active dot = `bg-primary text-background ring-4 ring-primary/20`; connector
   complete = `bg-primary`; summary card = `bg-section-sage`; submit = `bg-secondary
   hover:bg-secondary-dark`. No literals.
6. Register: `registry.ts` keeps `"tour-form": TourFormBlock`; `TourFormBlock` internally renders
   `<SplitFormBlock>` when `variant === "split"`. (If P0's schema instead exposes a separate
   `split-form` slug, add `"split-form": SplitFormBlock` and skip the internal branch — match
   whatever slug P0 registered.)
**Verify:** `tsc --noEmit`; `bun run build`; harness diff of `/schedule-tour` (the route P8 seeds —
test with a seeded/fixture page or the component in isolation) vs `:8088/pages/schedule-tour.html` at
{1440,1024,768,480} — confirm split→stacked at 768 and slideshow hidden; **interaction:** drive
Continue→Continue→Confirm→submit, assert step panels toggle + success state appears; `bun run
lint:direct-edit` clean; commit `feat(golden-oaks): tour-form split variant + 1:1 refine`.

### Task 2 — Refine `AccordionBlock`: add the `tabbed` variant (Tabbed Accordion + FAQ)
**Files:** `src/components/blocks/AccordionBlock.tsx`; (new) `src/components/blocks/TabbedAccordion.tsx`
(the `"use client"` tabbed sub-component); `src/components/blocks/registry.ts` (no new slug —
`accordion` stays)
**Build/refine:**
1. **`variant: "accordion" | "tabbed"`** from `block.settings?.variant ?? "accordion"`. Keep the
   current `<details>`-based flat list as the `accordion` path (it already degrades + rotates the
   chevron via `group-open:`). Refine its card to the mockup `.ta-item` look (token bg-background,
   `border border-text/10`, hover `border-primary/30`, `rounded-[--radius]`, question 18px
   `font-semibold`, chevron `text-muted` → `group-open:text-primary group-open:rotate-180`).
2. **Items = editable repeatable atoms:** source items from `lexicalQAPairs(body)` (heading→question,
   paragraph→answer), falling back to `DEFAULT_FAQS`. The lexical container keeps
   `data-payload-subfield="body"`; each item keeps `data-array-index={i}`. This is the editable
   repeatable-atom contract — do not change it.
3. **Tabbed variant (`TabbedAccordion`, `"use client"`):** the FAQ layout. Group items by **category**
   — derive categories from lexical `h2`/section headings if authored, else render a single "All"
   group (defensive: most Payload bodies are one flat list; treat each top-level `h2` as a category
   boundary, the `h3` under it as questions). Render: a **tab bar** in a sage pill bar
   (`bg-section-sage rounded-[--radius] p-1.5`) with an "All" tab + one tab per category
   (`role="tablist"`, `role="tab"`, `aria-selected`), active tab = `bg-background text-primary
   shadow-sm`; an **inline search input** (right side, full-width above tabs ≤768); the **accordion
   content** = the same `<details>`/`ta-item` cards grouped under `.ta-category-heading`s. Layer the
   mockup behavior: clicking a tab filters visible categories (`activeCategory` state); search filters
   items by question/answer substring and disables the category tabs while searching; a "no results"
   empty state. Keyboard arrow-nav across tabs. **Omit** the fixed left-edge "What's On This Page"
   sticky sidebar for v1 (it's `display:none` ≤1024 anyway and is page-chrome, not block content) —
   note it as a follow-up; the tab bar + search + accordion is the 1:1 core. Graceful degradation:
   without JS, all `<details>` render open-able and the tab bar is inert (every item still reachable).
4. **Editor contract:** root `data-nocms-component="accordion"`; optional section `title`/`intro`
   carry `data-role`+`data-payload-subfield`; items `data-array-index={i}`; category headings render
   from body lexical (no extra subfield). `bun run lint:direct-edit` clean.
5. **Tokens:** tab bar `bg-section-sage`; active tab `bg-background text-primary`; search focus
   `border-primary ring-primary/15`; category heading `text-primary border-b-2 border-primary/25`.
   The animated open uses a `max-height` transition in the client component (measure `scrollHeight`)
   — for the plain `accordion` variant keep native `<details>` (no measuring).
**Verify:** `tsc --noEmit`; `bun run build`; harness diff: `accordion` variant vs a flat-FAQ section,
and `tabbed` variant vs `:8088/pages/faq.html` at {1440,1024,768,480} — confirm tab bar →
scrollable + page-menu absent ≤1024 and the accordion reads as a stack on mobile; **interaction:**
toggle a `<details>` (assert open/close), switch a tab (assert filtered categories), type in search
(assert filter + no-results); commit `feat(golden-oaks): accordion tabbed variant + FAQ 1:1`.

### Task 3 — `RequestPricingFormBlock` (request-pricing)
**Files:** (new) `src/components/blocks/RequestPricingFormBlock.tsx`; `src/components/blocks/registry.ts`
**Build:**
1. Single-page lead form (`request-pricing.html` body): slug `request-pricing-form`, `"use client"`
   for the WCAG validation + success swap. Layout = centered `.container max-w` form-page section on
   `bg-surface`: `h2` (`data-role="heading" data-payload-subfield="title"`, default "Get Your
   Personalized Quote"), subtitle (`data-payload-subfield="body"`), a `pricing-note` callout
   (`bg-section-sage`, "Transparent pricing, always." — `data-array-index`/static), then the form:
   first/last name row, email, phone, a **"Preferred Contact Method" radio-pill fieldset**
   (email/phone/either — styled pills, selected = `border-primary bg-primary/10 text-primary`),
   care-level + move-in-timeline selects (2-col row), relationship select, optional message, submit
   `bg-secondary` "Request My Quote", privacy line with lock icon.
2. **Validation (presentational):** port the inline WCAG validator — per-field `.form-error` spans,
   an `aria-live="assertive"` error summary with anchor links that focus the field, blur/input
   re-validation, required + email/phone regex. On submit `e.preventDefault()` → hide the form
   section, reveal the **success section** (checkmark + "Thank You!" + "What Happens Next" 3-step +
   testimonial + alternative-contact). **Submission hook:** comment marks the submit handler as the
   consumer's POST point (default success-only).
3. The page hero (`hero-toprow` + content-intro) and header-minimal/footer-minimal come from P1/P2 —
   this block is the form section only; P8 composes the page. Note that dependency in a comment.
4. **Editor contract / tokens:** root `data-nocms-component="request-pricing-form"`; tokens only
   (pill selected `bg-primary/10`, note `bg-section-sage`, submit `bg-secondary`). Register
   `"request-pricing-form": RequestPricingFormBlock`.
**Verify:** `tsc --noEmit`; `bun run build`; harness diff of the form section vs
`:8088/pages/request-pricing.html` at {1440,768,480} — confirm 2-col rows → 1-col ≤768 and pill
wrap; **interaction:** submit empty (assert error summary + focus), fill valid + submit (assert
success swap); `lint:direct-edit` clean; commit `feat(golden-oaks): request-pricing form 1:1`.

### Task 4 — `CareAssessmentBlock` (multi-step quiz)
**Files:** (new) `src/components/blocks/CareAssessmentBlock.tsx`; `src/components/blocks/registry.ts`
**Build:**
1. Slug `care-assessment`, `"use client"`. Port `care-assessment.html`: a **6-question single-select
   quiz** with a 6-dot progress bar, then a **scored recommendation** screen + lead form, then a
   success state. Question/answer data lives in a typed `QUESTIONS` constant in the renderer (default
   Golden Oaks copy: who-for / daily-help / health-memory / quality-of-life / timeline / budget, each
   with 4 options carrying `{value, score, label, desc, icon}`); each answer option is a
   radio-styled card (`role="radio"`, `tabindex=0`, Enter/Space selects) with an icon circle, label,
   and description; selected = `border-primary bg-primary/5`.
2. **Engine (presentational):** `useState` for `current` step + `answers`. Selecting an option enables
   Next; Next advances + marks the progress dot complete (Back reverses); the final Next computes
   `totalScore` and maps to a recommendation via `getRecommendation(score)` (≤2 Independent, ≤5
   Assisted, else Memory Care — port the three result objects: heading/description/title/body +
   feature bullets). The results screen renders the recommendation + a **lead form**
   (name/phone/email/best-time) with the same WCAG validation as Task 3; submit → success card
   ("You're All Set!"). All questions render in the DOM (`hidden` except active) for graceful
   degradation. **Submission hook:** comment marks the lead-form submit as the consumer POST point.
3. **Editor contract:** root `data-nocms-component="care-assessment"`. The quiz copy is rich/default;
   expose the **intro/section `title`** as `data-role`+`data-payload-subfield="title"` and treat each
   question as a repeatable atom (`data-array-index={i}` on the question wrapper) so the inspector can
   target them; question/answer text comes from the typed constant (note: deep per-option editing is a
   schema follow-up — v1 keeps copy in the renderer, overridable wholesale). Keep `data-role` values
   string-literal for `lint:direct-edit`.
4. Uses header-minimal/footer-minimal (P1) — block is the quiz body; P8 composes. Tokens only
   (progress active `bg-primary`, option selected `bg-primary/5 border-primary`, results badge
   `bg-section-sage text-primary`, submit `bg-secondary`). Register
   `"care-assessment": CareAssessmentBlock`.
**Verify:** `tsc --noEmit`; `bun run build`; harness diff vs `:8088/pages/care-assessment.html` at
{1440,768,480}; **interaction:** select an answer (assert Next enabled), walk all 6 → results (assert
recommendation text matches a score bucket), submit lead form (assert success); `lint:direct-edit`
clean; commit `feat(golden-oaks): care-assessment multi-step quiz 1:1`.

### Task 5 — `SearchResultsBlock` (search-results)
**Files:** (new) `src/components/blocks/SearchResultsBlock.tsx`; `src/components/blocks/registry.ts`
**Build:**
1. Slug `search-results`, `"use client"` (persistent input + content-type filter chips). Port
   `search-results.html`: a **search header** band (`bg-section-sage`, centered) with `h1` + subtitle
   + a search input bar (rounded, primary submit button with a magnifier icon, optional auto-suggest
   dropdown — stub the suggestions), then a **results area** (`max-w` container): an optional
   "did-you-mean" banner, a **meta row** (results count + content-type filter chips:
   page/blog/faq/floorplan, active chip = `bg-primary/10 text-primary border-primary`), a
   **results list** (each card: 120×80 thumb + a color-coded type pill + serif title link + 2-line
   excerpt + url), and a "Load More" button. Include the **no-results** state (icon circle + message +
   a popular-links grid + a phone CTA from `skinConfig.contactPhone`).
2. **Data (presentational):** render from a `results` array prop/default fixture; the filter chips
   filter the in-memory list by `type` (client `useState`); the input is controlled but **search
   execution is out of scope** — note that wiring the query to a backend/`?q=` search index is the
   consumer's hook (default renders the fixture/empty state). Type-pill color coding uses tokens:
   page=`text-primary bg-primary/10`, blog=`text-secondary bg-secondary/15`,
   faq=`text-accent bg-accent/10`, floorplan=`text-text bg-sand` (sand from P0 tokens).
3. **Editor contract / tokens:** root `data-nocms-component="search-results"`; `h1`/subtitle carry
   `data-role`+`data-payload-subfield`; result cards `data-array-index={i}`. Tokens only. Register
   `"search-results": SearchResultsBlock`.
**Verify:** `tsc --noEmit`; `bun run build`; harness diff vs `:8088/pages/search-results.html` at
{1440,768,480} — confirm result card → column ≤768 and meta row stacks; **interaction:** click a
filter chip (assert list filters), render the no-results state (assert popular-links + phone CTA);
`lint:direct-edit` clean; commit `feat(golden-oaks): search-results 1:1`.

### Task 6 — Refine `ExitIntent` to 1:1
**Files:** `src/components/layout/ExitIntent.tsx`
**Build/refine:**
1. Keep the existing arm-after-15s + `mouseout clientY<=0` + mobile-timeout `"use client"` logic and
   the focus-trap dialog. Refine the modal **visuals** to the Golden Oaks treatment: the card on
   `bg-background rounded-[--radius] shadow-2xl`, a sage/leaf accent header, serif `text-text`
   heading ("Wait! Before you go" / mockup copy), token-driven inputs matching the form-group style,
   the CTA as `bg-secondary` terracotta (currently `bg-secondary` — confirm hover `secondary-dark`),
   and the phone link from `skinConfig.contactPhone` with the phone icon. Replace any non-token color
   (the inputs currently use `bg-white` literal — switch to `bg-background`/`bg-surface` token).
2. Confirm the exit-intent CTA routes to `/schedule-tour` (the Task 1 page). Keep `data-nocms-component="exit-intent"`.
   It is chrome (rendered once in `layout.tsx`), not a Payload block — no `data-payload-subfield` needed,
   but keep copy as static string literals (no template-expression `data-role`).
3. Graceful: it already returns `null` until armed/open; no SSR flash. Note: this is the same
   exit-intent the mockup wires globally; the trigger thresholds stay as-is.
**Verify:** `tsc --noEmit`; `bun run build`; harness diff of the open modal vs the mockup's exit-intent
(force-open via a test hook / set the timers low) at {1440,480}; **interaction:** simulate
`mouseout clientY=0` after arm (assert modal appears once), press Escape (assert closes); confirm
`grep` finds no color literals; commit `refactor(golden-oaks): exit-intent 1:1 + token colors`.

### Task 7 — Forms-and-interactive sweep + plan close-out
**Files:** all of the above; `src/components/blocks/registry.ts`
**Steps:**
1. Confirm every new slug is registered and dispatches through `RenderBlocks` (so the
   `data-payload-*` identity wrapper is present for the inspector). Confirm each new `"use client"`
   block is import-safe from a Server Component page (no server-only imports leaking in).
2. Re-run the **full cross-cutting proof** in one pass: `grep -nE "#[0-9a-fA-F]{3,6}|rgba?\(|bg-white|text-black"`
   across the seven files → only SVG `fill/stroke="none"|"currentColor"` allowed; `bun run
   lint:direct-edit` → "ok"; flip `--color-primary` in `globals.css` to red, `bun run build` a page
   using each block, confirm stepper/tabs/option-selected/submit/chips all re-theme, then revert.
3. Run the harness across all five pages (`schedule-tour, faq, request-pricing, care-assessment,
   search-results`) at {1440,1024,768,480}; fix any geometry/spacing/section-bg drift vs the mockup.
4. `tsc --noEmit` + `bun run build` clean. Commit `chore(golden-oaks): forms+interactive close-out`.

---
**Final:** `tsc --noEmit` + `bun run build` clean; `lint:direct-edit` "ok"; the token flip-test
re-themes all forms/interactive surfaces; the harness shows 1:1 across the five pages × 4 breakpoints
with passing interaction checks (accordion open/close, tab switch, step next/back, exit-intent
trigger). Submission wiring remains a documented hook in each form. Proceed per the roadmap sequence.
