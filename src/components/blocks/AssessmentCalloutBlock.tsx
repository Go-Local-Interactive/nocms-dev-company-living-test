import * as React from "react";
import type { BlockProps } from "./types";
import { lexicalToText } from "./Lexical";

/** AssessmentCalloutBlock — the Golden Oaks "take the care assessment"
 *  interstitial. A horizontal banner (icon-circle + heading/text + primary CTA)
 *  that prompts visitors to start the guided care-assessment quiz. Registered
 *  as `assessment-callout`. Mirrors `components/assessment-callout` +
 *  living-options `.care-assessment-callout`.
 *
 *  ONE block, two token-only skins via `settings.variant`:
 *    - unset (default) — the cream BASE banner: a `--color-section-cream`
 *      card with a neutral border, a white icon-circle holding a primary-stroke
 *      clipboard-check, serif heading + muted body, and a terracotta primary
 *      CTA.
 *    - `featured`       — a `--color-primary-dark` band (rounded-20) with a
 *      faint `leaf-sprigs-white.png` overlay (opacity 0.06) wrapping a GLASS
 *      callout (translucent white panel, white heading, white/85 body, accent
 *      CTA). Maps the mockup's primary-dark band, its 8%-white glass panel, and
 *      its accent-light icon stroke to P0 tokens at opacity — no literals.
 *
 *  Data-flow: `title` → h3 (default GO copy), `body` (lexical → text) → the
 *  supporting paragraph (default GO copy). The CTA label + href are fixed in
 *  code ("Take the Care Assessment" → `/care-assessment`); a `links` atom could
 *  later make them editable (note — not added now). GO defaults render when the
 *  atoms are empty so the block is never blank.
 *
 *  Editor contract: root `data-nocms-component="assessment-callout"`; the h3 is
 *  `data-role="heading"` + `data-payload-subfield="title"` (bound to the
 *  literal-resolvable `heading` string so `lint:direct-edit` stays clean); the
 *  body paragraph is `data-payload-subfield="body"`.
 *
 *  Responsive: the inner callout is a flex row that stacks to a centered column
 *  at ≤768 (inclusive `min-[769px]:` complement), with a full-width CTA on
 *  mobile. */

const DEFAULTS = {
  title: "Wondering which living option fits best?",
  body: "Answer a few quick questions and we'll suggest the right starting point — whether you're exploring for yourself or a loved one. It takes about 5 minutes.",
  cta: "Take the Care Assessment",
  href: "/care-assessment",
} as const;

/** The mockup's clipboard-check glyph (assessment-callout.html). */
function ClipboardCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true" data-nocms-component="assessment-callout-block"
    >
      <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <polyline points="9 14 11 16 15 12" />
    </svg>
  );
}

export function AssessmentCalloutBlock({ title, body, settings }: BlockProps) {
  const featured = settings?.variant === "featured";
  const heading = title || DEFAULTS.title;
  const copy = lexicalToText(body) || DEFAULTS.body;

  // The shared inner callout (icon-circle + text + CTA). Stacks to a centered
  // column at ≤768 via the inclusive `min-[769px]:` complement.
  const callout = (
    <div
      className={`mx-auto flex max-w-[920px] flex-col items-center gap-4 rounded-[--radius] p-7 text-center min-[769px]:flex-row min-[769px]:gap-6 min-[769px]:text-left ${
        featured
          ? "border border-white/15 bg-white/8 backdrop-blur-sm"
          : "border border-text/15 bg-section-cream"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${
          featured ? "bg-white/15 text-accent-light" : "bg-white text-primary"
        }`}
      >
        <ClipboardCheckIcon className="h-7 w-7" />
      </span>
      <div className="min-w-0 flex-1">
        <h3
          data-role="heading"
          data-payload-subfield="title"
          className={`mb-1 font-heading text-xl font-bold leading-snug ${
            featured ? "text-white" : "text-text"
          }`}
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          {heading}
        </h3>
        <p
          data-payload-subfield="body"
          className={`font-body text-base leading-relaxed ${
            featured ? "text-white/85" : "text-muted"
          }`}
        >
          {copy}
        </p>
      </div>
      <a
        href={DEFAULTS.href}
        className={`btn w-full flex-shrink-0 min-[769px]:w-auto ${
          featured
            ? "border-accent bg-accent text-white hover:border-secondary hover:bg-secondary"
            : "btn-primary"
        }`}
      >
        {DEFAULTS.cta}
      </a>
    </div>
  );

  if (featured) {
    return (
      <section
        data-nocms-component="assessment-callout"
        data-variant="featured"
        className="px-6 pb-16 sm:px-10 lg:px-16"
      >
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[20px] bg-primary-dark px-6 py-14">
          {/* Faint leaf-sprigs overlay (mockup ::after, opacity 0.06). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.06]"
            style={{ backgroundImage: "url('/golden-oaks/leaf-sprigs-white.png')" }}
          />
          <div className="relative z-[1]">{callout}</div>
        </div>
      </section>
    );
  }

  // ----- base (default): the cream interstitial banner -----
  return (
    <section
      data-nocms-component="assessment-callout"
      data-variant="base"
      className="px-6 pb-16 sm:px-10 lg:px-16"
    >
      {callout}
    </section>
  );
}
