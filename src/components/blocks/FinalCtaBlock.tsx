import * as React from "react";
import { Phone } from "lucide-react";
import type { BlockProps } from "./types";
import { lexicalToText } from "./Lexical";
import skinConfig from "@/skin.config";

/** FinalCtaBlock — the Golden Oaks "Ready to Find Your New Home?" final CTA
 *  (`components/final-cta`, homepage `.final-cta`). Registered as `callout-band`
 *  (the overview's name for the Final CTA — distinct from the dark crisis-band,
 *  which stays `crisis-callout`).
 *
 *  A full-width GREEN GRADIENT band above the footer, white + centered:
 *  `font-heading` h2 (`title`) + subtitle (`body`), a two-button row
 *  ("Schedule a Tour" → opens the global Tour Widget via `data-tour-trigger`,
 *  "Request Pricing" → /request-pricing), a centered "or…" divider with
 *  token-derived translucent-white rules, and a `tel:` phone link from
 *  `skin.config`.
 *
 *  All translucent whites are derived from the `--color-white` token via
 *  `color-mix` (never a raw rgba). h2 scales down at ≤480; the buttons stack
 *  full-width at ≤768. `settings` is declared on the slug for forward-compat
 *  but no variant is read (single layout). */

const DEFAULTS = {
  title: "Ready to Find Your New Home?",
  body: "Whether you have questions or you're ready to schedule your tour, we're here and ready to help.",
  divider: "or need immediate assistance?",
  tourCta: "Schedule a Tour",
  tourHref: "/schedule-tour",
  pricingCta: "Request Pricing",
  pricingHref: "/request-pricing",
};

/** `(555) 867-5309` → `tel:5558675309` (digits + leading + only). */
function telHref(display: string | undefined): string {
  const digits = (display ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "tel:";
}

export function FinalCtaBlock({ title, body }: BlockProps) {
  const heading = title || DEFAULTS.title;
  const copy = lexicalToText(body) || DEFAULTS.body;
  const phoneDisplay = skinConfig.contactPhone ?? "";

  return (
    <section
      data-nocms-component="callout-band"
      className="bg-[linear-gradient(135deg,var(--color-primary-dark),var(--color-primary))] py-20 px-10 text-center text-[var(--color-white)] max-md:px-6"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          data-role="heading"
          data-payload-subfield="title"
          className="mb-3 font-heading text-[2rem] font-bold text-[var(--color-white)] [@media(max-width:480px)]:text-2xl"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          {heading}
        </h2>
        <p
          data-role="subheading"
          data-payload-subfield="body"
          className="mx-auto mb-8 max-w-[600px] font-body text-lg leading-relaxed text-[var(--color-white)] [@media(max-width:480px)]:mb-6 [@media(max-width:480px)]:text-base"
        >
          {copy}
        </p>

        {/* Buttons: stack full-width ≤768. "Schedule a Tour" opens the global
            Tour Widget (auto-bound to [data-tour-trigger]); the href is the
            no-JS fallback. */}
        <div className="mb-6 flex flex-wrap justify-center gap-5 max-md:flex-col max-md:items-stretch">
          <a
            href={DEFAULTS.tourHref}
            data-tour-trigger
            className="btn btn-secondary px-10 py-4 max-md:w-full" data-role="cta"
          >
            {DEFAULTS.tourCta}
          </a>
          <a
            href={DEFAULTS.pricingHref}
            className="btn btn-outline px-10 py-4 max-md:w-full" data-role="cta-2"
          >
            {DEFAULTS.pricingCta}
          </a>
        </div>

        {/* "or…" divider — translucent-white rules via color-mix on --color-white. */}
        <div className="mx-auto mb-6 flex max-w-[400px] items-center gap-4 max-md:max-w-[300px] [@media(max-width:480px)]:max-w-[260px]">
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-[color-mix(in_srgb,var(--color-white)_25%,transparent)]"
          />
          <span className="whitespace-nowrap font-body text-base text-[color-mix(in_srgb,var(--color-white)_85%,transparent)]">
            {DEFAULTS.divider}
          </span>
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-[color-mix(in_srgb,var(--color-white)_25%,transparent)]"
          />
        </div>

        <a
          href={telHref(phoneDisplay)}
          className="inline-flex items-center gap-2 font-body text-base font-semibold text-[color-mix(in_srgb,var(--color-white)_90%,transparent)] transition-colors duration-200 hover:text-[var(--color-white)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-light)]" data-role="text"
        >
          <Phone className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
          Call us now: <span data-payload-subfield="contactPhone">{phoneDisplay}</span>
        </a>
      </div>
    </section>
  );
}
