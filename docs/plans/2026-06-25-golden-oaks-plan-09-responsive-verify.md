# Golden Oaks Plan 09 — Responsiveness & 1:1 Verification

> **For Claude:** REQUIRED SUB-SKILL: gli-toolkit:subagent-driven-development. See the roadmap
> `2026-06-25-golden-oaks-1to1-overview.md` (esp. **Cross-cutting requirements**) and the harness it
> depends on, `2026-06-25-golden-oaks-plan-00-design-system.md` **Task 6** (`scripts/go-audit.py`).
> This is the **FINAL** plan: it runs AFTER P1–P8. Per-block responsiveness is already built into those
> plans; this plan is the holistic cross-block + page-level responsive pass and the 1:1 sign-off.

**Goal:** Produce a **GREEN 1:1 audit across pages × breakpoints**. Extend the P0 Playwright harness into a
reusable multi-page / multi-breakpoint diff runner, audit a representative page of every template type at
`{1440, 1024, 768, 480}`, fix the cross-block and page-level responsive gaps the per-block plans could not see
(header → hamburger overlay, grids → stack, hero scaling, split-form/tabs stacking, carousel touch), and sign
off against `docs/design-system.html`. **No new design is introduced here** — only token-driven responsive
correction toward the mockup.

**Cross-cutting (verify, do not violate):**
1. **Token-driven, no magic literals.** Responsiveness is achieved with the existing `--*` tokens + the
   mockup's breakpoints (`{1440,1024,768,480}` audit matrix; mockup-internal `1024/960/950/768/640/550/480`).
   Any fix that adds a raw hex, or a one-off `px` color/spacing, is rejected — derive from a token or add a
   semantic token in `globals.css @theme`. `grep -rnE "#[0-9a-fA-F]{6}" src/components` stays ~empty.
2. **Editor contract holds at every breakpoint.** Responsive CSS must not strip `data-nocms-component`,
   `data-payload-subfield`, or the `RenderBlocks` wrappers — `display:none`/reflow is fine, removing editable
   nodes from the DOM is not. `bun run lint:direct-edit` stays clean after all fixes.
3. **Variants/skin still swap cleanly.** A token flip (`--color-primary`) re-themes every breakpoint; a
   `settings.variant` change re-lays-out at every breakpoint; `skin.config` re-brands. Verified in Task 4.

**Verification:** No unit suite. Gate on `tsc --noEmit`, `bun run build`, `bun run lint:direct-edit`, and the
**`go-audit.py` matrix run** (computed-token parity + per-section geometry within tolerance + screenshot diff
under threshold) for every representative page × breakpoint. The deliverable is the green audit report.

**Serve both ends (one terminal each, kept running for the whole plan):**
- Mockup: `python3 -m http.server 8088 --directory ~/Desktop/design/golden-oaks` → `:8088/pages/<page>.html`
- Template: `bun run build && bun run start` (prod build — dev-mode hydration jank skews screenshots) on its
  default port; the audit reads `TEMPLATE_BASE` (default `http://localhost:3000`).

---

## Breakpoint matrix × representative pages

The **audit matrix** is the roadmap's canonical set — viewport widths **`{1440, 1024, 768, 480}`** (desktop /
tablet / small-tablet / phone), each at height `900`, `deviceScaleFactor: 1`. These four straddle every
mockup-internal breakpoint so a regression on any of `1024/960/950/768/640/550/480` shows up:
- **1440** — full desktop (above all breakpoints; the reference layout).
- **1024** — first reflow (`max-width:1024px` rules + the 960/950 header band just below it).
- **768** — tablet stack (`max-width:768px`; most grids → 1-col, phone-text → icon, tour btn hidden).
- **480** — phone (`max-width:480px`; full-width buttons, stacked specs, single-column everything).

**Representative pages** — one live template route per template type, paired with its mockup page. (Routes per
P8; `src/app/**/page.tsx`: `/`, `/[slug]`, `/communities[/slug]`, `/floor-plans[/slug]`, `/blog[/slug]`.)

| # | Template type | Template route | Mockup page | Why representative |
|---|---|---|---|---|
| 1 | **Homepage** | `/` | `index.html` | hero-video, care-level grid, stats, pricing-cards, reviews, accreditation bar, leadership/"why" carousel, final-cta — the densest cross-block page |
| 2 | **Standard content** (`[slug]`) | `/about-us` | `about-us.html` | content-intro, content-blocks (cb-*), feature-sections, page-hero (fullbleed) |
| 3 | **Care / living option** (`[slug]`) | `/assisted-living` | `assisted-living.html` | care-level-nav, split-stats hero, amenity grid, assessment-callout, crisis-band |
| 4 | **Community** (`communities/[slug]`) | `/communities/oakwood` | `oakwood.html` | community hero, gallery-shelf, amenity grid, tour-widget |
| 5 | **Floor-plans index + detail** | `/floor-plans`, `/floor-plans/azalea` | `floor-plans.html`, `azalea.html` | floor-plan grid → 1-col, compare-bar stack, pricing/data-table horizontal-scroll, fp-carousel |
| 6 | **Form (split + minimal chrome)** | `/schedule-tour` | `schedule-tour.html` | split-form → stack, header-minimal, tabbed-accordion |
| 7 | **Blog landing + article** | `/blog`, `/blog/<post>` | `blog-landing.html`, `blog-article.html` | blog-layout grid → 1-col, blog-sidebar reorder, blog-card grid |
| 8 | **Interactive / care-assessment** | `/care-assessment` | `care-assessment.html` | header-minimal, footer-minimal, multi-step assessment, tabbed-accordion |

(If a P8 route slug differs, substitute the actual seeded slug; the pairing logic — template route ↔ mockup
file — is what matters.) This set covers every block group from P1–P7 at least once.

## Responsive behaviors to verify (the cross-block checklist)

Sourced from `css/global.css` `@media` blocks, `components/header/header.html`, and `js/global.js` +
page-inline JS. Each must match the mockup at the breakpoint where it triggers:

- **Header → hamburger overlay** (`header.html` `@media max-width:950px`): `.adaptive-nav` hides, `.hamburger`
  shows, `.mobile-nav` drawer becomes available; at `768px` `.phone-text` → `.phone-icon-btn` and the
  "Schedule a Tour" `.btn-header` hides (it lives in the drawer). Drawer open/close toggles `body` scroll-lock,
  `aria-expanded`, the `.is-active` hamburger animation, and routes through the **drawer coordinator**
  (`window.__drawers` / `closeAllDrawers` — opening nav closes search/more and vice-versa). Mega-menu dropdowns
  collapse into in-drawer accordion sub-lists (`.mobile-nav-sub`, chevron rotation).
- **Header-minimal** (forms / care-assessment): collapses without the full drawer; verify it still renders the
  logo + minimal CTA at all four widths.
- **Grids → stack**: care-level grid, amenity grid, team grid, pricing-cards, icon-card-grid, feature-sections,
  blog-grid, floor-plans-grid, inclusion-grid all reduce columns at `1024`/`960`/`768` and reach **1 column** by
  `768` (a few at `480`). Verify column counts at each step, not just the final stack.
- **Hero scaling**: full-bleed photographic heroes keep aspect + dark overlay; `h1` steps down per the type
  scale (no overflow, headline stays legible); split-stats hero stacks copy above stats; toprow hero reflows.
- **Split-form / tabs stacking**: `.split-form` two-column → single column (form below/above the visual panel);
  `.tabbed-accordion` switches from horizontal tabs to stacked accordion on narrow widths; FAQ accordions stay
  keyboard-operable.
- **Carousels / touch**: leadership/"why" carousel (`#leadership-carousel`, `carousel-prev/next`, `.carousel-dot`,
  `goTo()`, auto-advance `setInterval`, **touch-device branch** via `'ontouchstart' in window`) — arrows/dots
  shrink at `768`/`480`, swipe works on touch, autoplay respects `prefers-reduced-motion`; `.card-carousel`
  track uses native horizontal scroll with prev/next enabling on `scrollLeft`; data-tables wrap in
  `.data-table-scroll` (`max-width:640px`) with the "Swipe to see more →" affordance.
- **Misc cross-block**: floating "Need Help Now?" help-badge repositions (and shifts when the floor-plans
  compare-bar is visible, `body.compare-bar-visible`); breadcrumb ellipsis-collapse (`js/global.js`, 4+ levels);
  exit-intent modal centers/fits on phone; footer columns stack; sticky header hide-on-scroll behaves.

---

### Task 1 — Extend `go-audit.py` into a reusable matrix runner
**Files:** `scripts/go-audit.py` (extend the P0 harness — do **not** fork it), `scripts/go-audit.pages.json` (new,
the page-pair manifest), `package.json` (add `audit:1to1` script).
**Steps:**
1. **Generalize inputs.** P0's harness takes one page + the breakpoints `{1440,1024,768,480}`. Extend it to also
   accept: a list of page **pairs** `{ id, mockup: "<page>.html", route: "/<path>" }` (read from
   `scripts/go-audit.pages.json`, seeded with the 8 representative pages above), `--page <id>` to run one,
   `--bp <w>` to run one width, and `--update-baseline`. Keep the single-page P0 invocation working
   (back-compat). Resolve mockup against `MOCKUP_BASE` (default `:8088`) and route against `TEMPLATE_BASE`
   (default `:3000`).
2. **Three comparators per (page × breakpoint)** — reuse P0's collectors, add aggregation:
   - **Computed tokens** (already in P0): on each side read `getComputedStyle` for primary/secondary/accent/
     text + `h1` font-family/size + the resolved section-bg of the first `.section-*`. Assert exact equality
     (colors normalized to rgb). This is the configurability proof at every breakpoint.
   - **Per-section geometry**: for an ordered list of section selectors (mockup uses semantic wrappers; template
     uses `RenderBlocks` block roots — map via a `sections` array per page in the manifest, or fall back to
     `main > section, main > [data-nocms-component]`), capture `boundingClientRect` `{x,y,width,height}` and
     compare. Pass if width within **±2%** of viewport and vertical order is identical; flag y/height drift
     beyond **±24px** (stack-order and major-spacing regressions, not sub-pixel noise).
   - **Screenshot diff**: full-page PNG each side at the breakpoint; compute a pixel-diff ratio (Playwright
     `toHaveScreenshot`-style, or Pillow/`pixelmatch` if already vendored by P0). **Threshold: ≤ 6%** changed
     pixels per page×breakpoint (photographic heroes + font hinting make 0% unrealistic). Write
     `mockup.png` / `template.png` / `diff.png` under `scripts/.audit/<page>/<bp>/`.
3. **Report.** Emit `scripts/.audit/report.json` (machine: per page×bp → token/geometry/pixel pass+metrics) and
   a `report.md` summary table (page rows × breakpoint columns, ✅/❌ per cell with the failing comparator named).
   Exit non-zero if any cell fails → CI-gateable. Add `"audit:1to1": "python3 scripts/go-audit.py --all"` to
   `package.json`.
4. **Self-contained & idempotent.** No network beyond the two local servers; `.audit/` git-ignored; re-running
   overwrites cleanly. Document the run recipe (serve both, `bun run build && bun run start`,
   `bun run audit:1to1`) at the top of the script.
**Verification:** `bun run audit:1to1` runs end-to-end against the two servers and produces `report.md` with a
cell for every page × `{1440,1024,768,480}`. The P0 single-page invocation still works unchanged.

### Task 2 — Per-template-type audit pass (capture the gaps)
**Files:** none modified (read-only audit); outputs `scripts/.audit/report.md` + a triaged gap list at
`docs/plans/.go-audit-gaps.md` (working scratch, not shipped).
**Steps:**
1. Run `bun run audit:1to1` for all 8 representative pages × 4 breakpoints. For any failing cell, open
   `:8088/pages/<page>.html` and the template route side-by-side at that width and diagnose the cause against the
   **responsive-behaviors checklist** above.
2. **Walk the cross-block checklist explicitly per page** (these are exactly the gaps the per-block P1–P7 plans
   could not catch because they only saw one block in isolation):
   - Home (`/`): hamburger transition at 950→768; care-grid/pricing/reviews column steps; carousel arrows/dots
     scale + swipe at 768/480; final-cta + stats stack.
   - Standard (`/about-us`): content-blocks (`cb-photo`/`cb-pullquote`) reflow; feature-sections image/text
     order flip; fullbleed hero h1 step-down.
   - Care (`/assisted-living`): care-level-nav → horizontal-scroll/stack; split-stats hero; crisis-band +
     assessment-callout full-width buttons at 480.
   - Community (`/communities/oakwood`): gallery-shelf scroll/touch; amenity grid steps; tour-widget stack.
   - Floor-plans (`/floor-plans`, `/azalea`): grid → 1-col at 768; compare-bar → column + full-width actions;
     pricing/data-table `.data-table-scroll` swipe affordance at 640; help-badge offset when compare-bar visible.
   - Form (`/schedule-tour`): split-form → single column; header-minimal at all widths; tabs → accordion.
   - Blog (`/blog`, article): `.blog-layout` → 1-col at 1024; sidebar `order` reset; blog-grid → 1-col at 768;
     `h1` step-down 1024→768→480.
   - Interactive (`/care-assessment`): header-minimal + footer-minimal; step layout single-column on phone; tab/
     accordion keyboard nav.
3. **Editor-contract spot-check during audit:** at `768` and `480`, in DevTools confirm a sampling of stacked/
   hidden blocks still carry `data-nocms-component` + `data-payload-subfield` (responsiveness must hide via CSS,
   never unmount editable nodes).
4. Record every gap in `.go-audit-gaps.md` as `{page, breakpoint, behavior, comparator that failed, suspected
   block/selector, token-or-layout fix}` — grouped by **owning block/chrome** so Task 3 can fix systematically.
**Verification:** `report.md` reflects the current (pre-fix) state; `.go-audit-gaps.md` enumerates every ❌ with a
concrete, **token-driven** proposed fix and the owning file. No fixes applied yet.

### Task 3 — Fix the cross-block & page-level responsive gaps (token-driven only)
**Files:** the owning block renderers in `src/components/blocks/*`, chrome in `src/components/layout/*`
(`Header.tsx`, mobile-nav, `Footer.tsx`, `HelpBadge`, `ExitIntent`), shared utilities/breakpoints in
`src/app/globals.css`. **No** raw hex / one-off literals — derive from `--*` tokens or add a semantic token.
**Steps:**
1. Work the `.go-audit-gaps.md` list **grouped by owner**; prefer fixing a shared utility (e.g. a
   `.go-grid` column-step utility, a section-padding scale, the drawer/overlay CSS) once over patching N blocks.
   Match the **mockup's actual breakpoints** for each rule (`1024/960/950/768/640/550/480`) — do not invent new
   ones; the four-width audit matrix only *samples* these.
2. **Header/overlay** (highest-risk cross-block): ensure the React Header reproduces the `max-width:950px` swap,
   the `768px` phone-icon/tour-button changes, the drawer scroll-lock + `aria-expanded` + hamburger animation,
   the mega-menu → in-drawer accordion, and the drawer-coordinator mutual-exclusion (nav/search/more). Keep the
   client JS in the existing layout client component; do not regress the editor contract on the header's
   editable atoms (logo/phone/CTA).
3. **Grids/heroes/forms/tabs/carousels**: apply the minimal token-driven CSS so each matches the mockup's column
   counts and stack order at each step; carousels keep arrows/dots/auto-advance/touch + `prefers-reduced-motion`;
   data-tables get the `.data-table-scroll` wrapper + swipe hint; help-badge offset honors
   `body.compare-bar-visible`.
4. After each owner-group fix, re-run the affected page(s): `bun run audit:1to1 --page <id>`. Iterate until the
   cells go green. Keep changes surgical — this plan corrects responsiveness, it does not restyle.
5. Re-run the **token flip-test** (Task 4) is separate; here just confirm no literal crept in:
   `grep -rnE "#[0-9a-fA-F]{6}|[0-9]+px\s*;?\s*/\*\s*color" src/components` ≈ empty, and any new value in
   `globals.css` is a token def, not an inline literal in a component.
**Verification:** `bun run audit:1to1` → **every** page × breakpoint cell green (tokens exact, geometry within
tolerance, pixel-diff ≤ threshold). `tsc --noEmit` and `bun run build` clean.

### Task 4 — Configurability / editor / variant regression at all breakpoints, then 1:1 sign-off
**Files:** `docs/plans/.go-audit-gaps.md` (close out), `scripts/.audit/report.md` (final, committed as the
sign-off artifact), `docs/CONVENTIONS-golden-oaks.md` (append the audit run-recipe + acceptance checklist).
**Steps:**
1. **Re-skin proof (cross-cutting #1 & #3):** temporarily flip `--color-primary` (e.g. to red) and a
   `--font-heading`, `bun run build`, and run `audit:1to1` token-collector at 1440 + 480 on the homepage —
   confirm header/buttons/links/section-bgs all change at **both** breakpoints (proves token-driven
   responsiveness, no breakpoint hardcodes a color). Flip one `HeroBlock` `settings.variant` and confirm the
   layout swaps at every breakpoint. **Revert.**
2. **Editor contract (cross-cutting #2):** `bun run lint:direct-edit` → clean. Re-confirm the Task 2.3 DOM
   spot-check passes post-fix (stacked/hidden blocks retain `data-nocms-component` + `data-payload-subfield`).
3. **Acceptance checklist vs `docs/design-system.html`** — walk the design-system reference component-by-
   component (Section 02 Header/Header-minimal … through Footer/Help-badge/Exit-intent and every block section)
   and tick each against the rendered template at the breakpoint the design-system notes for it. Confirm the
   roadmap's **signature patterns** survive responsively: green top-accent + header bar, full-bleed hero +
   overlay + white serif h1, overline eyebrows, leaf-pattern section bg, page-separator dividers, terracotta/
   cream/outline buttons (radius 6px), help-badge. Record the ticked checklist in `report.md`.
4. **Final gate:** `tsc --noEmit` ✓, `bun run build` ✓, `bun run lint:direct-edit` ✓, `bun run audit:1to1`
   all-green ✓. Commit: `test(golden-oaks): green 1:1 responsive audit + design-system sign-off`.
**Verification:** All four gates pass; `report.md` shows every representative page × `{1440,1024,768,480}` green
with the design-system acceptance checklist fully ticked; flip-test + `lint:direct-edit` confirm
configurability/editor/variant intact at all breakpoints.

---
**Final (definition of done):** `tsc --noEmit` + `bun run build` + `bun run lint:direct-edit` clean; the extended
`go-audit.py` matrix is **GREEN for every representative page across {1440, 1024, 768, 480}** (token parity +
geometry within tolerance + screenshot diff under threshold); the `docs/design-system.html` acceptance checklist
is fully ticked; and the configurability / editor / variant guarantees are re-proven at multiple breakpoints.
This is the Golden Oaks 1:1 sign-off — no further plan follows.
