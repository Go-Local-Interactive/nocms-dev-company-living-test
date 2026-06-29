# Golden Oaks Plan 00 — Design-System Foundation

> **For Claude:** REQUIRED SUB-SKILL: gli-toolkit:subagent-driven-development. See the roadmap
> `2026-06-25-golden-oaks-1to1-overview.md` — esp. its **Cross-cutting requirements**. This plan
> establishes the mechanisms that keep the template configurable / editable / customizable; every later
> plan depends on it. Do this FIRST.

**Goal:** Establish the Golden Oaks design system in `nocms-template` as **configurable tokens + token-driven
base patterns**, set the default skin, copy media, and stand up the 1:1 verification harness — without
hardcoding the design.

**Cross-cutting (this plan IS the mechanism):** colors/fonts/spacing = `--*` tokens (never literals);
editor contract intact; brand = `skin.config` + design-brief; variants = `settings.variant`. Golden Oaks is
the DEFAULT skin, swappable per project.

**Verification:** `tsc --noEmit`, `bun run build`, and the Playwright token-diff from Task 6. No unit suite.

---

### Task 1 — Align `globals.css @theme` to the exact Golden Oaks palette + add semantic tokens
**Files:** `src/app/globals.css`
**Steps:**
1. Set the brand tokens to the EXACT values (`brand-clone-config.json`): `--color-primary:#4D654C`,
   `--color-secondary:#AD6045`, `--color-accent:#C4882B`, `--color-cool:#7383A0`, `--color-text:#2C2218`,
   `--color-warm:#E8DCC8`, plus `--color-background`/`--color-surface` (cream `#FAF6EF`/`#F7F2EB`) — keep the
   existing derived `*-dark`/`*-light` shades, re-derived from the new bases.
2. Add **semantic tokens** for the recurring section backgrounds + accents so components never reach for a
   literal: `--color-section-cream`, `--color-section-sage`, `--color-section-light`, `--color-section-brown`,
   `--color-section-dark` (green), `--color-overline`, `--color-leaf-pattern-tint`. Source the exact values
   from `css/global.css` (the `.section-cream/.section-sage/...` rules).
3. Confirm `--font-heading: "Libre Baskerville"`, `--font-body: "Open Sans"` and the Google Fonts load.
4. **Verify configurability:** temporarily flip `--color-primary` to red, `bun run build` a page, confirm the
   header/buttons/links all change (proves token-driven), then revert. `grep -rn "#[0-9a-fA-F]\{6\}" src/components`
   should find ~none after the later plans (track the baseline here).
5. Commit: `feat(golden-oaks): exact brand tokens + semantic section/accent tokens`.

### Task 2 — Default skin = Golden Oaks; map the brand-clone config
**Files:** `src/skin.config.ts`; `src/lib/` (wherever the design-brief default lives)
**Steps:**
1. Set `skin.config` defaults from `brand-clone-config.json`: brandName "Golden Oaks", brand_suffix
   "Senior Living", tagline "Where Every Day Feels Like Home", phone/email/address, logo path. Keep the
   `heroVariant` union (Task in P2 extends it).
2. Ensure the design-brief overlay can still override these per project (the nocms scaffold path) — Golden Oaks
   is the DEFAULT, not a hardcode. Document the `brand-clone-config.json → design-brief` field mapping.
3. Commit: `feat(golden-oaks): default skin.config + brand-clone-config mapping`.

### Task 3 — Port the signature base patterns as token-driven utilities
**Files:** `src/app/globals.css` (`@layer components`/`base`)
**Steps:** Port from the mockup `css/global.css`, each referencing tokens (no literals): the **overline**
eyebrow (label + rule lines), **page-separator** divider, **leaf-pattern** section background
(`media/images/leaf-pattern*`), the **button** styles (primary terracotta / cream / outline, radius 6px),
the **card / shadow / radius** scale, and `.section-{cream,sage,light,brown,dark}` background utilities. Verify
visually against the mockup (Task 6 harness). Commit: `feat(golden-oaks): token-driven base patterns`.

### Task 4 — Copy mockup media into `public/`
**Files:** `public/golden-oaks/` (or `public/media/`)
**Steps:** Copy `~/Desktop/design/golden-oaks/media/images/*` (logos, leaf patterns, hero/floor-plan/leader
photos) into the template's `public/`; record the path convention the seed (P8) will reference. Commit.

### Task 5 — Editor-contract + variant conventions (keep components editable + customizable)
**Files:** `docs/CONVENTIONS-golden-oaks.md` (new); verify `src/components/blocks/RenderBlocks.tsx`,
`src/lib/payload-attrs.ts`, the `settings` atom in the Payload schema.
**Steps:**
1. Confirm `RenderBlocks` wraps each block with `data-payload-doc-id/-collection/-field/-block-id`, and that a
   `settings.variant` atom exists (add to the schema if missing). Document the rule: **every new/refined block
   carries `data-nocms-component` + `data-payload-subfield` on editable fields; multi-layout designs use one
   block + `settings.variant`, not N blocks.**
2. Confirm `bun run lint:direct-edit` runs clean (baseline). Commit: `docs(golden-oaks): editor-contract + variant conventions`.

### Task 6 — Playwright 1:1 audit harness (used by every later plan)
**Files:** `scripts/go-audit.py` (or `/tmp/audit/`)
**Steps:** A reusable script that, given a page + breakpoints {1440,1024,768,480}, loads the mockup
(`http://localhost:8088/pages/<page>.html`) and the rendered template side-by-side, and reports: computed
brand tokens (primary/secondary/accent/text + h1 font/size), per-section bounding boxes, and screenshots for
visual diff. (Server: `python3 -m http.server 8088 --directory ~/Desktop/design/golden-oaks`.) Commit:
`chore(golden-oaks): playwright 1:1 audit harness`.

---
**Final:** `tsc --noEmit` + `bun run build` clean; the harness runs; tokens flip-test passes. Then proceed to P1.
