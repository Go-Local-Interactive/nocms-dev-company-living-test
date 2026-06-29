# Golden Oaks Plan 01 — Layout Chrome

> **For Claude:** REQUIRED SUB-SKILL: gli-toolkit:subagent-driven-development. See the roadmap
> `2026-06-25-golden-oaks-1to1-overview.md` (esp. its **Cross-cutting requirements**) and the format
> + token/editor/variant conventions in `2026-06-25-golden-oaks-plan-00-design-system.md`. **Plan 00
> must be done first** — this plan consumes its tokens (`--color-primary` = `#4D654C`, `--color-section-sage`,
> `--color-overline`, etc.), its `.btn`/`.section-*` base utilities, the `skin.config` defaults, the copied
> `public/golden-oaks/media/*`, and the `scripts/go-audit.py` harness. If a token this plan references is
> missing, add it in Plan 00, not inline here.

**Goal:** Refine the existing chrome (`Header`, `Footer`, `HelpBadge`, `ExitIntent`) to **1:1 with the Golden
Oaks mockup, including responsiveness**, and build the missing chrome (Tour Widget, Accreditation Bar, Urgency
Strip, Care-Level Nav) — all **token-driven, editable, and re-skinnable**, never a static one-off. The Header
gains: green top bar (`--color-primary`), leaf-mark logo, dropdown ("mega-menu") nav, phone, search panel, a
cream "Schedule a Tour" CTA, and a mobile hamburger drawer. Minimal header/footer are a **`variant` prop**, not
separate components.

**Cross-cutting (every task proves all three):** (1) colors/fonts/spacing via `--*` tokens ONLY — never a
hardcoded hex; map each mockup `var(--…)` to the P0 token per the table below. (2) Editor contract intact:
CMS-driven chrome (nav links, CTAs, contact, social, legal) reads from `skin.config` / a new `nav.config`;
every editable field carries `data-nocms-component` on the root + `data-payload-subfield` on the field. (3)
Customizable: brand via `skin.config`, layout variants via a `variant` prop. Golden Oaks is the DEFAULT skin,
swappable per project.

**Verification:** per task — `bunx tsc --noEmit`, `bun run build`, then a **Playwright 1:1 diff vs the mockup
using the P0 harness** (`scripts/go-audit.py`) against the served mockup on `:8088`
(`python3 -m http.server 8088 --directory ~/Desktop/design/golden-oaks`; already running this session), at
breakpoints **{1440, 1024, 768, 480}**. No unit suite. `bun run lint:direct-edit` must stay clean.

---

## Token map (mockup literal/var → P0 token) — use these in EVERY task

The mockup's `css/global.css` derives everything from `--brand-*`; Plan 00 mirrors that into the `@theme`
tokens. **Map, never hardcode.** Tailwind utility (from the P0 `@theme`) in the right column.

| Mockup `var(--…)` | Meaning / literal | Use in component (Tailwind / token) |
|---|---|---|
| `--primary` | forest green `#4D654C` | `bg-primary` / `text-primary` |
| `--primary-dark` | green 70% black | `bg-primary-dark` / `text-primary-dark` |
| `--primary-light` | green 21% white (dropdown icon bg) | `bg-primary-light` |
| `--sage-whisper` | green 7% white (care-level-nav / popup-icon bg) | `bg-section-sage` (P0 `--color-section-sage`) |
| `--secondary` | terracotta `#AD6045` | `bg-secondary` / `text-secondary` |
| `--secondary-dark` | terracotta 80% black | `hover:bg-secondary-dark` |
| `--secondary-light` | terracotta 22% white (urgency-strip bg) | `bg-secondary-light` |
| `--accent` / `--accent-dark` / `--accent-light` | gold `#C4882B` ramp | `text-accent` / `bg-accent-dark` / `text-accent-light` |
| `--sand` | warm `#E8DCC8` (header CTA bg) | `bg-sand` |
| `--cream` | warm 27% white (header CTA hover, dropdown hover bg) | `bg-warm`/`bg-cream` token (P0) |
| `--rich-brown` | neutral 75% + secondary (footer bg) | `bg-rich-brown` |
| `--neutral-900/700/500/400/300/200/100` | brown-neutral ramp from `--color-text` | `text-text` / `text-muted` / `border-text/…` / `bg-surface`; add P0 `--color-neutral-*` if a step is missing |
| `--white` | `#FFFFFF` | `text-white` / `bg-white` |
| `--radius` | `6px` | `rounded-md` (confirm `--radius: 6px` in P0) |
| `--radius-pill` | `100px` | `rounded-full` |
| `--focus-ring` | = primary | `focus-visible:outline-primary` |
| `--error` / `--error-light` / `--success` / `--success-light` | form states | P0 `--color-error*` / `--color-success*` (add in P0 if absent — used by Tour Widget + Exit Intent) |
| `--font-heading` / `--font-body` | Libre Baskerville / Open Sans | `font-heading` / `font-body` |

If any token in the right column doesn't exist after Plan 00 (e.g. `--color-neutral-300`, `--color-error`,
`--color-cream`, `--radius`), **add it to Plan 00's `@theme` and note it** — do not introduce a literal here.

---

### Task 1 — Nav config + `skin.config` chrome fields (data the chrome reads)

CMS-driven chrome must read from config, not inline arrays. Extract the nav into one source consumed by Header,
Footer, and the mobile drawer.

**Files:** `src/lib/nav.config.ts` (new); `src/skin.config.ts`; `src/lib/skin.ts` (re-export)
**Steps:**
1. Create `src/lib/nav.config.ts` exporting the typed mega-menu model the Header + Footer share. Shape from the
   mockup `#nav-list` (`components/header/header.html`): five dropdown groups — **About Us, Living Options, Life
   Here, Resources, Contact** — each item `{ label, href, blurb, icon }` (icon = a key into a lucide map, since
   the mockup uses inline `.dropdown-icon` SVGs). Mark the Living Options "Not sure where to start? / Care
   Assessment" item `highlight: true` (mockup `.nav-dropdown-highlight`). Add the footer's four columns (Living
   Options / Life & Community / Resources / Get In Touch) + `legalLinks` + `socialLinks` + the header search
   `popularSearches` list (mockup `.header-search-quicklinks`). Keep hrefs as the template's clean routes
   (`/living-options`, `/care-assessment`, …), NOT the mockup `*.html`.
2. Extend `SkinConfig` in `src/skin.config.ts` with the fields the chrome needs and Plan 00 set: `brandSuffix`
   ("Senior Living"), `logo: { src, alt }` (point at the P0-copied `/golden-oaks/media/images/{slug}-logo.png`),
   `hours` (footer "Mon–Fri… Sat–Sun…"), `social: { facebook, instagram, youtube }`. Leave brand/contact values
   as Plan 00 wrote them (Golden Oaks defaults). Confirm the design-brief overlay still overrides these.
3. `bunx tsc --noEmit`. Commit: `feat(golden-oaks): nav.config + skin.config chrome fields`.

**Verify:** `nav.config.ts` + extended `SkinConfig` type-check; nothing renders them yet (next tasks).
`bun run lint:direct-edit` clean.

---

### Task 2 — Header: green bar, leaf logo, dropdown nav, phone, search, CTA (desktop ≥ 1024)

Refine `Header.tsx` to the mockup `#main-header` desktop layout 1:1. Server component for markup; client island
only for the interactive dropdown/search/scroll behavior.

**Files:** `src/components/layout/Header.tsx`; `src/components/layout/HeaderNav.client.tsx` (new client island)
**Mirrors mockup selectors:** `header` (sticky, `background:var(--primary)`), `.container`, `.logo img`
(`height:56px`), `.adaptive-nav > .nav-list > .nav-item > button` + `.nav-arrow`, `.nav-dropdown` /
`.dropdown-icon` (`bg:var(--primary-light)`) / `.dropdown-text span`+`small`, `.nav-dropdown-highlight`,
`.header-search-wrap` / `.header-search-trigger` (44px circle, `rgba(255,255,255,.12)`) / `.header-search-panel`
+ `.header-search-quicklinks`, `.header-right` / `.phone-number` (white, `font-weight:600`) /
`.btn.btn-header` (`bg:var(--sand)`, `color:var(--primary-dark)`, hover `bg:var(--cream)` + `-translate-y-2px`).
**Steps:**
1. **Refine** `Header.tsx`: replace the inline `NAV_LINKS` with `import { mainNav } from "@/lib/nav.config"`;
   replace the light/blurred bar with the green bar — `bg-primary text-white sticky top-0 z-[1000]`. Logo = leaf
   mark via `skinConfig.logo` (`<img>` `h-14 w-auto`), `whitespace-nowrap`. Map every color through the token
   table (white nav text, `bg-sand` CTA → `hover:bg-warm`, phone white). Keep `data-nocms-component="site-header"`
   on `<header>`. CTA `href` = `/schedule-tour` (and carries `class="tour-trigger"`-equivalent so Task 6 can bind
   it — use a stable `data-tour-trigger` attribute). Render the search trigger + phone in `.header-right` order:
   phone → search → CTA → hamburger (hamburger hidden ≥ 1024, Task 4).
2. **Editor contract:** brand/nav/phone come from config. Put `data-payload-subfield="brandName"` on the logo's
   `alt`-bearing link wrapper and `data-payload-subfield="contactPhone"` on the phone link, so those remain
   inline-editable (they map to `skin.config`/brand doc). Nav-link labels are config, not page content — no
   subfield needed, but keep `data-nocms-component="site-header-nav"` on the `<nav>`.
3. **Client island** `HeaderNav.client.tsx` (`"use client"`): port the mockup JS behaviors that need state —
   **mega-menu dropdown open/close** (click toggles `.is-open`, closes siblings, outside-click + Escape close —
   from `header.html` "MEGA-MENU DROPDOWNS"), the **search panel** open/close (double-rAF transition, Escape +
   outside-click, clear button — from "HEADER SEARCH PANEL"), and the **sticky scroll** shadow/hide-on-scroll-down
   (`scrolled` + `header-hidden`, from "STICKY HEADER SCROLL EFFECT"). Reuse a small `useDrawers()` coordinator so
   only one of {dropdown, search, mobile drawer} is open (mirrors `window.closeAllDrawers`). **Skip** the
   priority-plus "More" overflow JS for now — the template's fixed 5-group nav fits ≥ 1024; note it as deferred.
   Dropdown icons: map each mockup inline SVG to a `lucide-react` icon keyed in `nav.config` (Home, Users,
   MessageSquare, BadgeCheck, Compass, Heart, Brain, Calendar, …).
4. `bunx tsc --noEmit` → `bun run build` → run `scripts/go-audit.py` for `index` at **1440 + 1024**, diff the
   header band: computed `background-color` == `--color-primary`, logo height 56px, nav-item font/color, dropdown
   panel `border-radius`/shadow, CTA `bg`==`--color-sand` + `color`==`--color-primary-dark`. Fix to match.
5. Commit: `feat(golden-oaks): header green bar + leaf logo + mega-menu nav + search (desktop)`.

**Verify:** desktop header is visually 1:1 (band color, logo, 5 dropdown groups with icon+label+blurb, highlight
item, phone, search panel with popular searches, cream CTA); dropdowns + search open/close via the client island;
no hardcoded hex in `Header.tsx`/`HeaderNav.client.tsx` (`grep -n "#[0-9a-fA-F]\{3,6\}"` → none).

---

### Task 3 — Header `variant="minimal"` (logo + phone only)

Minimal header is a **prop on the same component**, not a new file (mockup `components/header-minimal/`).

**Files:** `src/components/layout/Header.tsx`
**Mirrors mockup selectors:** `.header-minimal` (`bg:var(--primary)`, `padding:16px 0`), `.header-minimal-logo
img` (`height:44px`), `.header-minimal-phone` (white, `gap:8px`, `opacity:.9`→`1` hover; `span` hidden ≤ 768).
**Steps:**
1. Add `variant?: "full" | "minimal"` (default `"full"`) to `Header`. When `minimal`: render only the green bar
   with logo (`h-11`) linking home + the phone (`tel:` from `skinConfig.contactPhone`, icon + label, label hidden
   below `md`/768). No nav, no search, no CTA, no hamburger, no client island. Reuse the same token classes.
2. Wire selection: the focused form/assessment pages (e.g. `/care-assessment`) need the minimal chrome. Since the
   root `layout.tsx` renders `<Header/>` globally, add a mechanism the page can opt into — the cleanest: a route
   group / per-page flag the layout reads (e.g. a `chromeVariant` exported from the page or a `cookies`/segment
   check). **Implement** as a small `getChromeVariant(pathname)` in `nav.config.ts` listing minimal-chrome routes,
   read in `layout.tsx`; document that Plan 06 (care-assessment) consumes it.
3. `bunx tsc --noEmit` → `bun run build` → `scripts/go-audit.py` vs `pages/care-assessment.html` (or the
   `header-minimal` example) at **1440 + 768**: confirm 44px logo, white phone, label hidden at 768.
4. Commit: `feat(golden-oaks): header minimal variant for form pages`.

**Verify:** `<Header variant="minimal" />` renders the slim green bar 1:1; `/care-assessment` route selects it;
`<Header />` unchanged; type-checks.

---

### Task 4 — Header mobile drawer + hamburger (≤ 1024 / 768 / 480)

Port the mockup's off-canvas mobile nav. The mockup flips to hamburger at **950px**; the template standardizes on
the roadmap breakpoints — **hamburger + drawer ≤ 1024** (`lg` hidden), phone text → icon button ≤ 768, CTA hidden
≤ 768 (it lives in the drawer).

**Files:** `src/components/layout/Header.tsx`; `src/components/layout/HeaderNav.client.tsx`
**Mirrors mockup selectors:** `.hamburger` (44px circle, animated `span`→X via `.is-active`), `.mobile-nav` /
`.mobile-nav-panel` (slide-in from right, `transform:translateX(100%)`→`0`, `cubic-bezier(.22,1,.36,1)`),
`.mobile-nav-header` (sticky, "Menu" + close), `.mobile-nav-search`, `.mobile-nav-links` →
`.mobile-nav-item`/`.mobile-nav-sub` (accordion expanders built from the same nav groups, with
`.mobile-nav-sub-icon`/`-text strong`/`small` + `.is-highlight`), `.mobile-nav-cta` (`bg:var(--secondary)` full
width), `.mobile-nav-phone` (`color:var(--primary)`).
**Steps:**
1. In `HeaderNav.client.tsx` add the **drawer**: hamburger button (`lg:hidden`), a fixed full-width overlay panel
   that slides in, body-scroll-lock when open, close button + Escape + link-click-close, and the drawer
   coordinator (`closeAllDrawers` analog). Build the drawer items from the **same `mainNav` config** (don't
   duplicate markup) — each dropdown group → an accordion `<button>` with chevron that expands its
   `.mobile-nav-sub` list; honor `highlight`. Append the CTA (`bg-secondary` full width → `/schedule-tour`,
   `data-tour-trigger`) + phone at the bottom.
2. **Responsive:** at `≤ 768` swap `.phone-number` text for the `.phone-icon-btn` (44px circle) and hide the
   header CTA (`hidden md:` pattern, inverse). At `≤ 480` the drawer is full-bleed (already `w-full`); confirm
   touch targets ≥ 44px. Use Tailwind `max-lg:` / `max-md:` (or `lg:` / `md:` inverses) — match the 1024/768/480
   stops, not the mockup's 950.
3. **Editor contract / config:** drawer reads `mainNav` + `skinConfig`; no new editable fields. Keep ARIA from
   the mockup (`aria-expanded`, `aria-label`, focus-restore to hamburger on close).
4. `bunx tsc --noEmit` → `bun run build` → `scripts/go-audit.py` at **768 + 480**: open drawer, screenshot, diff
   vs mockup `.mobile-nav.is-open` — slide-in panel, accordion groups w/ icons, highlight item, full-width
   terracotta CTA, primary phone. Confirm hamburger hidden ≥ 1024 and visible ≤ 1024.
5. Commit: `feat(golden-oaks): header mobile drawer + hamburger (1024/768/480)`.

**Verify:** below 1024 the desktop nav is gone and the hamburger opens a right-slide drawer with the same nav
content as accordions + CTA + phone; ARIA/focus correct; 1:1 at 768 and 480.

---

### Task 5 — Footer 1:1 + `variant="minimal"`

Refine `Footer.tsx` to the mockup `footer` (rich-brown, 4 link columns + newsletter + social + legal) and add the
single-line minimal variant.

**Files:** `src/components/layout/Footer.tsx`
**Mirrors mockup selectors:** `footer` (`bg:var(--rich-brown)`, `color:var(--neutral-100)`, `padding:60px 0 20px`),
`.footer-top` (logo + tagline `max-inline-size:45ch` left, address/phone/hours right; stacks ≤ 768),
`.footer-content` (`grid 4` → `repeat(2)` ≤ 1024/768 → `1fr` ≤ 480), `.footer-column h3`, `.footer-links a`
(`text-decoration:underline`, hover `--primary-light` — WCAG: links underlined on dark), `.newsletter-form`
(input + Subscribe `bg:var(--primary)`), `.footer-bottom` (copyright / `.footer-legal` / `.social-icons` —
44px circles, hover `bg:var(--primary)`; stacks+centers ≤ 768), and **footer-minimal**: `.footer-minimal`
(`bg:var(--primary-dark)`, centered, copyright · phone · "Back to Homepage").
**Steps:**
1. **Refine** `Footer.tsx`: switch to the 4-column model from `footerColumns` in `nav.config` (Living Options /
   Life & Community / Resources / Get In Touch), the `.footer-top` logo+tagline+contact row, a newsletter form,
   `legalLinks` + `socialLinks` from config. Map `bg-rich-brown`, link `text-muted`/`underline` →
   `hover:text-primary-light`, social circles `bg-white/10 hover:bg-primary`. Logo = `skinConfig.logo` (`h-12`).
   Replace the lucide social icons with config-driven anchors (keep lucide `Facebook/Instagram/Youtube`). Keep
   `data-nocms-component="site-footer"`. Tagline + address are brand/skin data; put
   `data-payload-subfield="tagline"` on the tagline `<p>` and reuse the address from `skinConfig.primaryAddress`.
2. **Responsive:** `grid-cols-4` → `lg:grid-cols-2` (1024) → `md:grid-cols-2` → `max-[480px]:grid-cols-1`;
   `.footer-top` `md:flex-col`; `.footer-bottom` `md:flex-col md:text-center`. Match 1024/768/480.
3. **Minimal variant:** add `variant?: "full" | "minimal"`. `minimal` → one centered `bg-primary-dark` line:
   `© {year} {brandFull} · {phone} · Back to Homepage` (underlined links). Selected by the same
   `getChromeVariant()` from Task 3 in `layout.tsx`.
4. `bunx tsc --noEmit` → `bun run build` → `scripts/go-audit.py` vs `pages/index.html` footer at
   **1440/1024/768/480** (+ `footer-minimal` at 1440): diff bg == `--color-rich-brown`, 4→2→1 column collapse,
   underlined links, 44px social circles, minimal single-line.
5. Commit: `feat(golden-oaks): footer 1:1 + minimal variant`.

**Verify:** footer matches mockup at all four breakpoints (columns, newsletter, social, legal, underlines);
`<Footer variant="minimal" />` renders the single line; config-driven; no hex literals.

---

### Task 6 — Tour Widget (slide-in panel, new) + bind CTAs

Build the slide-in tour panel (mockup `components/tour-widget/`) and bind it to every "Schedule a Tour" trigger,
replacing the current `href="/schedule-tour"` navigation with the panel (full page remains the fallback link).

**Files:** `src/components/layout/TourWidget.client.tsx` (new); `src/app/layout.tsx` (mount once)
**Mirrors mockup selectors:** `.tour-overlay` (`color-mix(neutral-900 40%, transparent)`, `z-index:2000`),
`.tour-panel` (right slide-in `440px`, `cubic-bezier(.22,1,.36,1)`, shadow; `width:100%` ≤ 768),
`.tour-panel-header` (`linear-gradient(145deg, --primary-dark, --primary)`, white h3 + p), `.tour-close` (44px),
`.tour-field` label/input/select (focus `border:--primary` + `0 0 0 3px --primary-light`), `.tour-submit`
(`bg:var(--secondary)`), `.tour-note`, `.tour-full-page-link`, validation `.has-error`/`.tour-error`/`.has-success`.
**Steps:**
1. Build `TourWidget.client.tsx` (`"use client"`): overlay + right-slide panel with the 3-field form (Name, Phone,
   Preferred Date) + submit + note + full-page link. Port the mockup's **WCAG validation** (required / phone regex
   / future-date; blur+input listeners; success state swap) and the **drawer-coordinator** open/close (Escape,
   overlay click, body-scroll-lock, hide the HelpBadge while open). Map all colors via the token table — panel
   header gradient = `from-primary-dark to-primary`, submit `bg-secondary hover:bg-secondary-dark`, error/success
   = `--color-error*`/`--color-success*`. Min date = today.
2. **Bind triggers:** add a tiny effect that binds click → open on any element with `data-tour-trigger` (the
   header CTA from Task 2 + the drawer CTA from Task 4 carry it). `preventDefault` so it opens the panel instead of
   navigating; the panel's "full tour page" link still routes to `/schedule-tour`. This mirrors the mockup's
   `.btn-header`/`.tour-trigger` auto-binding.
3. **Editor contract / config:** panel heading + intro copy and the form's destination come from
   `skin.config`/defaults; mark the heading `data-payload-subfield` and root `data-nocms-component="tour-widget"`.
   Phone fallback (if shown) from `skinConfig`.
4. Mount `<TourWidget/>` once in `layout.tsx` (after `<HelpBadge/>`). `bunx tsc --noEmit` → `bun run build` →
   `scripts/go-audit.py`: trigger the panel on `index`, diff at **1440 + 768** (440px → full-width), confirm
   gradient header, focus ring, terracotta submit, success swap. Confirm HelpBadge hides while open.
5. Commit: `feat(golden-oaks): slide-in tour widget + CTA binding`.

**Verify:** clicking any Schedule-a-Tour CTA opens the slide-in panel (not a navigation); validation + success
state work; 1:1 at 1440/768; HelpBadge hides while open; ESC/overlay close.

---

### Task 7 — Help Badge refine to 1:1

Refine `HelpBadge.tsx` to the mockup `.help-badge` (pill, pulsing ring, hides behind drawer/tour).

**Files:** `src/components/layout/HelpBadge.tsx`
**Mirrors mockup selectors:** `.help-badge` (`bottom/right:32px`, `bg:var(--secondary)`, `border-radius:60px`,
`box-shadow:0 8px 28px rgba(secondary 40%)`, hover `-translate-y-3px` + `--secondary-dark`), `.help-badge-icon`
+ `::after` (`badge-pulse` ring), `.help-badge-text` (hidden ≤ 600 → the template uses **480** with icon-only).
**Steps:**
1. **Refine** `HelpBadge.tsx`: keep `data-nocms-component="help-badge"`. Change the destination to the mockup's
   `need-help-now` route (`/need-help-now`) — it is a real "immediate support" link, not a `tel:` (the mockup's
   help-badge links to the page; the `tel:` lives in the urgency strip). Pill `bg-secondary`, `rounded-full`,
   shadow via `shadow-secondary/40` (or arbitrary `shadow-[0_8px_28px]` with the token), pulsing ring on the icon
   (`animate-ping` border, matching `badge-pulse` timing 2.5s). Text "Need Help Now?" hidden `max-[480px]:hidden`
   (icon-only), bottom/right `32px` → `20px` below 480 (mockup uses 600; standardize to 480).
2. **Hide-behind-overlay:** the mockup hides the badge while the mobile drawer or tour panel is open
   (`.mobile-nav.is-open ~ .help-badge` / Tour JS). Since the badge is a sibling mounted in `layout.tsx`, hide it
   from the drawer/tour open-state (the Task 6 TourWidget already toggles it; ensure the Task 4 drawer does too,
   e.g. via a shared `body[data-drawer-open]` attribute the badge reacts to with `[body[data-drawer-open]_&]:opacity-0`).
3. `bunx tsc --noEmit` → `bun run build` → `scripts/go-audit.py` vs `help-badge` example at **1440 + 480**: diff
   pill color/shape/shadow, pulse ring, icon-only at 480, hidden while drawer open.
4. Commit: `feat(golden-oaks): help badge 1:1 (need-help-now pill + pulse)`.

**Verify:** floating terracotta pill bottom-right with pulsing ring; text hides at 480; hides when drawer/tour
open; links to `/need-help-now`; token-only.

---

### Task 8 — Exit Intent refine to 1:1 (free-checklist lead capture)

Refine `ExitIntent.tsx` to the mockup `.urgency-popup` — the design is a **"Free Senior Living Checklist" email
capture** (icon, checklist, single email field, success state), not the current "schedule a tour" form.

**Files:** `src/components/layout/ExitIntent.tsx`
**Mirrors mockup selectors:** `.urgency-overlay` (`color-mix(neutral-900 55%, transparent)`, `z-index:9998`),
`.urgency-popup` (`max-width:480px`, scale-in `0.95`→`1`, double shadow; `padding`/`max-width` shrink ≤ 480 + form
stacks), `.urgency-popup-close` (32px), `.urgency-popup-icon` (`bg:var(--sage-whisper)`, `stroke:--primary`),
`h4` + `> p`, `.urgency-popup-checklist` (`bg:var(--sage-whisper)`, check rows), `.urgency-popup-form` (email +
"Send It" `bg:var(--secondary)`; stacks ≤ 480), `.urgency-popup-error`, `.urgency-popup-privacy`,
`.urgency-popup-phone` (`color:var(--primary)`, tel: link), `.urgency-popup-success`.
**Steps:**
1. **Refine** `ExitIntent.tsx` (keep the existing arm-after-15s + mouseout-top + 40s mobile-fallback logic and
   `data-nocms-component="exit-intent"`): replace the body with the checklist lead-capture — sage icon circle,
   "Get Your Free Senior Living Checklist" h4, intro p, 3-item checklist (`bg-section-sage`), single email input +
   "Send It" terracotta button with the mockup's WCAG email validation, privacy line, `tel:` phone row, and the
   "Check Your Inbox!" success state (swap on submit, auto-close after 3s). Map all colors via tokens — overlay via
   arbitrary `bg-text/55` (or a `--color-text` overlay), popup `bg-background`/`bg-white`, icon `bg-section-sage`.
2. **Editor contract:** heading + checklist items + privacy copy are editable content → root
   `data-nocms-component="exit-intent"`, `data-payload-subfield` on the heading and (ideally) the checklist field;
   phone from `skinConfig`.
3. `bunx tsc --noEmit` → `bun run build` → `scripts/go-audit.py` vs `exit-intent` example at **1440 + 480**:
   force-show the popup, diff icon/checklist/form, confirm scale-in, terracotta button, success swap, stacked form
   ≤ 480.
4. Commit: `feat(golden-oaks): exit-intent free-checklist lead capture 1:1`.

**Verify:** popup matches mockup (sage icon, checklist, email capture, success); arming/trigger logic unchanged;
1:1 at 1440/480; token-only.

---

### Task 9 — Accreditation Bar (new block, dark + light variants)

Build a renderer block for the trust-badge row (mockup `components/accreditation-bar/`). This is **CMS content
(items array) + a `settings.variant`** (dark band / light inline) — register it as a block so pages can place it.

**Files:** `src/components/blocks/AccreditationBarBlock.tsx` (new); `src/components/blocks/registry.ts`
(register slug `accreditation-bar`); Payload block schema (declare atoms — coordinate with the schema location
used by existing blocks)
**Mirrors mockup selectors:** `.accreditation-bar-section` (`bg:var(--primary-dark)`, `padding:56px 0`),
`.accreditation-bar` (`grid repeat(2,auto)` centered, `gap:40px 64px` → `1fr` ≤ 768 + items stack/center),
`.accreditation-item` / `.accreditation-icon` (56px circle, `stroke:var(--accent-light)`) /
`.accreditation-label` + `.accreditation-sublabel`; **light variant** `.accreditation-bar--light` (transparent,
muted 0.6→1 hover, 44px `bg:var(--neutral-100)` icon, `stroke:var(--primary-dark)`, neutral text).
**Steps:**
1. Build `AccreditationBarBlock.tsx` per the block convention (look at `CalloutBandBlock.tsx` for the
   `data-nocms-component` + `data-payload-subfield` pattern and the `BlockProps` shape). Root
   `data-nocms-component="accreditation-bar"`. Render an `items[]` array (`{ icon, label, sublabel }`) — icons via
   a lucide map keyed by the schema (mockup uses BadgeCheck/Shield/Award/Star-style SVGs). `settings.variant` ∈
   `{ dark, light }`: dark = `bg-primary-dark` band, white labels, `text-accent-light` icons; light = transparent
   inline, `bg-neutral-100` icons, neutral text. Optional heading (`data-payload-subfield="title"`).
2. **Editor contract:** declare the block's atoms in the Payload schema (title, items array with icon/label/
   sublabel, `settings.variant`) so inline editing + `lint:direct-edit` pass; each editable field gets
   `data-payload-subfield`. Register in `registry.ts`.
3. **Responsive:** 2-col → 1-col at **768** with items centered/stacked (mockup). Confirm the dark variant keeps
   white labels at 768.
4. `bunx tsc --noEmit` → `bun run build` → `bun run lint:direct-edit` → `scripts/go-audit.py` vs `accreditation-bar`
   example at **1440 + 768** for BOTH variants: diff bg, icon circle size/stroke, label/sublabel, 2→1 collapse.
5. Commit: `feat(golden-oaks): accreditation-bar block (dark/light variants)`.

**Verify:** block renders a 2×2 trust-badge grid (dark band default, light inline variant) 1:1; items are CMS
data; variant via `settings.variant`; `lint:direct-edit` clean; collapses to 1 col at 768.

---

### Task 10 — Urgency Strip (new block)

Build the inline phone-CTA strip (mockup `components/urgency-strip/`) as a block pages can drop between sections.

**Files:** `src/components/blocks/UrgencyStripBlock.tsx` (new); `src/components/blocks/registry.ts` (slug
`urgency-strip`); Payload block schema (atoms)
**Mirrors mockup selectors:** `.urgency-strip` (`bg:var(--secondary-light)`, `border-left:5px solid
var(--secondary)`, `border-radius:var(--radius)`, `margin:48px 0`; stacks ≤ 768, tighter ≤ 480),
`.urgency-strip-icon` (44px `bg:var(--secondary)` circle, white phone icon), `.urgency-strip-text h4`+`p`,
`.urgency-phone` (`bg:var(--accent-dark)`, white, `font-weight:700`, hover `--secondary-dark` + `-translate-y-2px`,
`min-height:44px`), `.urgency-callback` (`color:var(--secondary-dark)`).
**Steps:**
1. Build `UrgencyStripBlock.tsx` per the block convention. Root `data-nocms-component="urgency-strip"`. Fields:
   `heading` ("Need Help Sooner?"), `body`, `callbackPromise` ("We'll call back within 2 hours") — each with
   `data-payload-subfield`. Phone = `tel:` from `skinConfig.contactPhone`. Map colors: `bg-secondary-light`,
   `border-l-[5px] border-secondary`, icon `bg-secondary`, phone button `bg-accent-dark hover:bg-secondary-dark`,
   callback `text-secondary-dark`, `rounded-md`.
2. **Editor contract:** declare atoms (heading, body, callbackPromise) in the schema; register in `registry.ts`.
3. **Responsive:** row → `md:flex-col` (768, actions full-width, phone button `w-full justify-center`) → tighter
   padding/margin at **480**.
4. `bunx tsc --noEmit` → `bun run build` → `bun run lint:direct-edit` → `scripts/go-audit.py` vs `urgency-strip`
   example at **1440 + 768 + 480**: diff bg/left-border, icon circle, phone button color, stacked layout at 768.
5. Commit: `feat(golden-oaks): urgency-strip block`.

**Verify:** warm terracotta strip with left accent, phone button + callback promise, 1:1 at 1440/768/480;
CMS-driven copy; `lint:direct-edit` clean.

---

### Task 11 — Care-Level Nav (new block, anchor TOC)

Build the slim 4-up anchor strip (mockup `components/care-level-nav/`) used atop the Living Options page.

**Files:** `src/components/blocks/CareLevelNavBlock.tsx` (new); `src/components/blocks/registry.ts` (slug
`care-level-nav`); Payload block schema (atoms)
**Mirrors mockup selectors:** `.care-level-nav` (`bg:var(--sage-whisper)`, `padding:40px 0`),
`.care-level-nav-inner` (`grid repeat(4,1fr)` → `repeat(2)` ≤ 1024 → `1fr` ≤ 600/**480**),
`.care-level-nav-item` (`bg:var(--white)`, `border:1px var(--neutral-200)`, hover `border:--primary` +
`shadow` + `-translate-y-1px`, `min-height:44px`), `.care-level-nav-icon` (40px `bg:var(--primary-light)`
circle, `stroke:--primary`), `.care-level-nav-title` (`font-heading`, 700) + `.care-level-nav-tagline`
(`--neutral-500`).
**Steps:**
1. Build `CareLevelNavBlock.tsx` per the block convention. Root `data-nocms-component="care-level-nav"`. Render
   an `items[]` (`{ title, tagline, icon, href }`, default the 4 care levels: Independent / Assisted / Memory /
   Respite, anchoring to `#care-*` IDs). Section `bg-section-sage`, cards `bg-white border-neutral-200`
   `hover:border-primary` + shadow + lift, icon circle `bg-primary-light text-primary`, title `font-heading
   font-bold`, tagline `text-muted`. Smooth-scroll the anchor links (small client behavior or rely on CSS
   `scroll-behavior:smooth` + `scroll-margin-top` on targets — note the ~80px header offset). Each item's
   editable text carries `data-payload-subfield`.
2. **Editor contract:** declare atoms (items array: title/tagline/icon/href) in the schema; register in
   `registry.ts`.
3. **Responsive:** 4 → `lg:grid-cols-2` (1024) → `max-[480px]:grid-cols-1` (mockup uses 600; standardize 480).
4. `bunx tsc --noEmit` → `bun run build` → `bun run lint:direct-edit` → `scripts/go-audit.py` vs `care-level-nav`
   example at **1440 + 1024 + 480**: diff sage bg, card border/hover, icon circle, title/tagline, 4→2→1 collapse.
5. Commit: `feat(golden-oaks): care-level-nav anchor block`.

**Verify:** 4-up sage anchor strip with icon+title+tagline cards, hover lift, smooth-scroll, 1:1 at
1440/1024/480; CMS-driven items; `lint:direct-edit` clean.

---

**Final (Plan 01 sign-off):** `bunx tsc --noEmit` + `bun run build` clean; `bun run lint:direct-edit` clean; the
P0 harness shows Header (full + minimal), Footer (full + minimal), Help Badge, Tour Widget, Exit Intent,
Accreditation Bar (both variants), Urgency Strip, and Care-Level Nav matching the mockup at {1440, 1024, 768, 480};
`grep -rn "#[0-9a-fA-F]\{3,6\}" src/components/layout src/components/blocks/{AccreditationBar,UrgencyStrip,CareLevelNav}Block.tsx` finds no hardcoded hex
(token-only); the flip-test (Plan 00) re-themes all of this chrome. Then proceed to P2 (Hero variants).
