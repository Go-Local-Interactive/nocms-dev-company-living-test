#!/usr/bin/env python3
"""
Golden Oaks 1:1 audit harness.

Loads the Golden Oaks MOCKUP page and (when available) the rendered TEMPLATE
route side-by-side across breakpoints, and reports computed brand tokens, per-
section bounding boxes, and screenshots for visual diff. Used by every later
plan (P1-P9) to verify the port stays 1:1 with the mockup.

Run with the audit venv (Playwright is installed there):

    /tmp/audit/venv/bin/python scripts/go-audit.py --page index
    /tmp/audit/venv/bin/python scripts/go-audit.py --page about-us \
        --template-base http://localhost:3000 --template-route /about-us
    /tmp/audit/venv/bin/python scripts/go-audit.py --page index --section .section-cream

The mockup must be served (already running in this environment):
    python3 -m http.server 8088 --directory ~/Desktop/design/golden-oaks

NOTE: until the Golden Oaks content is seeded (Plan 08), the template side may
be empty or unreachable — that's expected. The harness still runs and reports
the mockup side; pass --template-base/--template-route once content exists.
"""
import argparse
import json
import os
import sys

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit(
        "playwright not importable. Run with the audit venv:\n"
        "  /tmp/audit/venv/bin/python scripts/go-audit.py ...\n"
    )

DEFAULT_BREAKPOINTS = [1440, 1024, 768, 480]
# Assumes the mockup server roots at the project dir (~/Desktop/design/golden-oaks),
# so pages live under /pages. If you serve the pages/ dir directly, drop the suffix.
DEFAULT_MOCKUP_BASE = "http://localhost:8088/pages"
DEFAULT_OUT = "/tmp/audit"

# CSS custom-property names that hold the brand colors, in priority order.
# The mockup uses --brand-*/--primary; the template uses --color-*.
TOKEN_PROBES = {
    "primary": ["--color-primary", "--primary", "--brand-primary"],
    "secondary": ["--color-secondary", "--secondary", "--brand-secondary"],
    "accent": ["--color-accent", "--accent", "--brand-accent"],
    "text": ["--color-text", "--neutral-900", "--brand-neutral"],
}

# JS run in-page: resolve brand tokens (first non-empty wins), the computed
# .btn-primary background, and the h1 font-family/size. Returns null fields when
# an element/token is absent so an empty template side doesn't crash the run.
_TOKENS_JS = r"""
(probes) => {
  const root = getComputedStyle(document.documentElement);
  const pick = (names) => {
    for (const n of names) {
      const v = root.getPropertyValue(n).trim();
      if (v) return v;
    }
    return null;
  };
  const tokens = {};
  for (const [k, names] of Object.entries(probes)) tokens[k] = pick(names);

  // Prefer a solid primary button: scan candidates, skip transparent fills
  // (outline variants) so the reported brand color is the filled one.
  const btnCandidates = Array.from(document.querySelectorAll(
    '.btn-primary, .btn, [data-nocms-component] a.btn, button.btn, a.btn'));
  const transparent = (c) => !c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)';
  let btn = btnCandidates.find((el) => !transparent(getComputedStyle(el).backgroundColor))
            || btnCandidates[0] || null;
  const btnStyle = btn ? (() => { const c = getComputedStyle(btn);
    return { backgroundColor: c.backgroundColor, color: c.color, borderRadius: c.borderRadius }; })() : null;

  const h1 = document.querySelector('h1');
  const h1Style = h1 ? (() => { const c = getComputedStyle(h1);
    return { fontFamily: c.fontFamily, fontSize: c.fontSize, fontWeight: c.fontWeight, color: c.color }; })() : null;

  return { tokens, btnPrimary: btnStyle, h1: h1Style };
}
"""

# Per-section bounding boxes — section/header/footer in document order.
_SECTIONS_JS = r"""
(sel) => Array.from(document.querySelectorAll(sel || 'section, header, footer')).map((el, i) => {
  const r = el.getBoundingClientRect();
  return {
    i,
    tag: el.tagName.toLowerCase(),
    cls: (el.className || '').toString().slice(0, 80),
    x: Math.round(r.x), y: Math.round(r.y),
    w: Math.round(r.width), h: Math.round(r.height),
  };
}).slice(0, 60)
"""


def audit_url(browser, url, width, out_path, section=None):
    """Load url at the given width; return {tokens, sections, height} or {error}.

    If `section` (a CSS selector) is given, bounding boxes are scoped to elements
    matching it and the screenshot is clipped to the first match (falls back to
    full-page when the selector isn't found)."""
    ctx = browser.new_context(viewport={"width": width, "height": 1000})
    page = ctx.new_page()
    try:
        # "load", not "networkidle": Next dev holds an HMR socket open so the
        # network never goes idle; networkidle would spuriously time out.
        page.goto(url, wait_until="load", timeout=60000)
        page.wait_for_timeout(1500)
    except Exception as e:  # noqa: BLE001 — report, don't crash the whole run
        ctx.close()
        return {"error": str(e)[:160]}
    data = {
        "url": url,
        "width": width,
        **page.evaluate(_TOKENS_JS, TOKEN_PROBES),
        "sections": page.evaluate(_SECTIONS_JS, section),
        "scrollHeight": page.evaluate("document.body.scrollHeight"),
    }
    el = page.query_selector(section) if section else None
    if el:
        el.screenshot(path=out_path)
    else:
        page.screenshot(path=out_path, full_page=True)
    data["screenshot"] = out_path
    ctx.close()
    return data


def main():
    ap = argparse.ArgumentParser(description="Golden Oaks 1:1 audit harness")
    ap.add_argument("--page", required=True, help="Mockup page name, e.g. index, about-us")
    ap.add_argument("--breakpoints", default=",".join(map(str, DEFAULT_BREAKPOINTS)),
                    help="Comma-separated widths (default: 1440,1024,768,480)")
    ap.add_argument("--mockup-base", default=DEFAULT_MOCKUP_BASE,
                    help="Base URL for the mockup pages dir")
    ap.add_argument("--template-base", default=None,
                    help="Base URL of the running template (e.g. http://localhost:3000). "
                         "Omit until Plan 08 seeds content.")
    ap.add_argument("--template-route", default=None,
                    help="Template route to audit (default: / + page, or / for index)")
    ap.add_argument("--section", default=None,
                    help="CSS selector to scope the audit to one section/element "
                         "(e.g. '.section-cream'): boxes + screenshot clip to it")
    ap.add_argument("--out", default=DEFAULT_OUT, help="Output dir for screenshots + report")
    args = ap.parse_args()

    breakpoints = [int(b) for b in args.breakpoints.split(",") if b.strip()]
    os.makedirs(args.out, exist_ok=True)

    mockup_url = f"{args.mockup_base.rstrip('/')}/{args.page}.html"

    template_url = None
    if args.template_base:
        route = args.template_route
        if route is None:
            route = "/" if args.page == "index" else f"/{args.page}"
        template_url = f"{args.template_base.rstrip('/')}{route}"

    report = {"page": args.page, "breakpoints": breakpoints,
              "mockup": {}, "template": {} if template_url else None}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for w in breakpoints:
            m_out = os.path.join(args.out, f"audit-{args.page}-mockup-{w}.png")
            report["mockup"][str(w)] = audit_url(browser, mockup_url, w, m_out, args.section)
            if template_url:
                t_out = os.path.join(args.out, f"audit-{args.page}-template-{w}.png")
                report["template"][str(w)] = audit_url(browser, template_url, w, t_out, args.section)
        browser.close()

    report_path = os.path.join(args.out, f"audit-{args.page}.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    # Compact human summary.
    print(f"\n=== AUDIT: {args.page} ===")
    print(f"mockup:   {mockup_url}")
    print(f"template: {template_url or '(none — pass --template-base once seeded)'}")
    for side in ("mockup", "template"):
        block = report.get(side)
        if not block:
            continue
        ref = block.get(str(breakpoints[0]), {})
        if "error" in ref:
            print(f"\n[{side}] @{breakpoints[0]}: ERROR {ref['error']}")
            continue
        print(f"\n[{side}] @{breakpoints[0]} tokens: {json.dumps(ref.get('tokens'))}")
        print(f"[{side}] btn-primary: {json.dumps(ref.get('btnPrimary'))}")
        print(f"[{side}] h1: {json.dumps(ref.get('h1'))}")
        print(f"[{side}] sections: {len(ref.get('sections', []))}, "
              f"scrollHeight @{breakpoints[0]}: {ref.get('scrollHeight')}")
    print(f"\nreport: {report_path}")
    print("screenshots: " + os.path.join(args.out, f"audit-{args.page}-*.png"))


if __name__ == "__main__":
    main()
