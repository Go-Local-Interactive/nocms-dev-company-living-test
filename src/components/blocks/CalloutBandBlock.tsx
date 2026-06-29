import * as React from "react";
import { Phone } from "lucide-react";
import type { BlockProps } from "./types";
import { lexicalToText } from "./Lexical";
import skinConfig from "@/skin.config";

/** CalloutBandBlock — full-width attention band for crisis / urgency CTAs.
 *  Registered as `crisis-callout`. One block, two token-only skins:
 *
 *   - **crisis** (default): the Golden Oaks `crisis-band` — a dark
 *     `--color-primary-dark` section with a low-opacity (0.08) full-bleed
 *     background-image, CENTERED content, an 80px round `--color-secondary`
 *     icon circle holding a white heart with the `crisis-pulse` ring, a white
 *     `font-heading` h3, a muted lead (≤55ch), a large `--color-sand` `tel:`
 *     phone link (number from `skin.config`), and a cream/secondary CTA
 *     "Get Help Now" → /need-help-now.
 *   - **urgency**: the warm "limited availability" strip — an `--color-accent`
 *     field with a clock icon, heading + body, and a secondary CTA →
 *     /schedule-tour. Also fully token-driven.
 *
 *  Variant selection (one block, NOT two):
 *    - canonical: `settings.variant` ∈ {`crisis` (default), `urgency`}.
 *    - fallback (only when `settings.variant` is absent): a keyword sniff on
 *      the title — "now/urgent/crisis/help/immediate/emergency" ⇒ crisis,
 *      otherwise urgency. Kept for back-compat with un-migrated content.
 *
 *  Editable fields: `title` (h3) + `body` (lead paragraph). The phone is brand
 *  config, not an atom; CTAs are in-code. Golden Oaks copy renders when empty. */

const CRISIS_KEYWORDS = ["now", "urgent", "crisis", "help", "immediate", "emergency"];

const DEFAULTS = {
  crisis: {
    title: "Need Care for Your Loved One Quickly?",
    body: "You don't have to figure this out alone. Our admissions team understands the urgency and will walk through your options with care and clarity.",
    cta: "Get Help Now",
    href: "/need-help-now",
  },
  urgency: {
    title: "Limited Availability",
    body: "A few residences are opening this season. Schedule a tour to see what's available and reserve your spot before they're gone.",
    cta: "Schedule a Tour",
    href: "/schedule-tour",
  },
} as const;

type Variant = "crisis" | "urgency";

/** Resolve the variant: explicit `settings.variant` wins; otherwise fall back
 *  to the legacy title-keyword sniff (un-migrated content). */
function resolveVariant(
  settingsVariant: string | null | undefined,
  title: string | null | undefined,
): Variant {
  if (settingsVariant === "urgency") return "urgency";
  if (settingsVariant === "crisis") return "crisis";
  // Fallback sniff only when no explicit variant is set.
  if (title) {
    const lower = title.toLowerCase();
    if (CRISIS_KEYWORDS.some((kw) => lower.includes(kw))) return "crisis";
    return "urgency";
  }
  return "crisis";
}

/** `(555) 867-5309` → `tel:5558675309` (digits + leading + only). */
function telHref(display: string | undefined): string {
  const digits = (display ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "tel:";
}

export function CalloutBandBlock({ title, body, settings }: BlockProps) {
  const variant = resolveVariant(settings?.variant, title);
  const defaults = DEFAULTS[variant];
  const heading = title || defaults.title;
  const copy = lexicalToText(body) || defaults.body;

  if (variant === "urgency") {
    return (
      <section
        data-nocms-component="crisis-callout"
        className="relative overflow-hidden bg-[var(--color-accent)] py-16 px-10"
      >
        <div className="relative z-[1] mx-auto flex max-w-[900px] flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-white)_18%,transparent)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9"
              fill="none"
              stroke="var(--color-white)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
          </span>
          <h3
            data-role="heading"
            data-payload-subfield="title"
            className="mb-3 font-heading text-[26px] font-bold text-[var(--color-white)]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {heading}
          </h3>
          <p
            data-role="subheading"
            data-payload-subfield="body"
            className="mb-7 max-w-[55ch] font-body text-lg leading-relaxed text-[color-mix(in_srgb,var(--color-white)_90%,transparent)]"
          >
            {copy}
          </p>
          <a href={defaults.href} className="btn btn-cream" data-role="cta">
            {defaults.cta}
          </a>
        </div>
      </section>
    );
  }

  // ----- crisis (default): the Golden Oaks dark crisis-band -----
  const phoneDisplay = skinConfig.contactPhone ?? "";

  return (
    <section
      data-nocms-component="crisis-callout"
      className="relative overflow-hidden bg-[var(--color-primary-dark)]"
    >
      {/* Low-opacity full-bleed background texture (mockup .crisis-section::before). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.08]"
        style={{ backgroundImage: "url('/golden-oaks/crisis-band-bg.jpg')" }}
      />
      <div className="relative z-[1] mx-auto max-w-[1200px] px-10 py-20 max-md:px-6">
        <div className="flex flex-col items-center text-center">
          {/* 80px secondary icon circle with white heart + pulsing ring. */}
          <span
            aria-hidden="true"
            className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-secondary)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9"
              fill="none"
              stroke="var(--color-white)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span
              aria-hidden="true"
              className="absolute -inset-1.5 rounded-full border-2 border-[var(--color-secondary)] opacity-0 motion-safe:animate-crisis-pulse"
            />
          </span>

          <h3
            data-role="heading"
            data-payload-subfield="title"
            className="mb-3 font-heading text-[26px] font-bold text-[var(--color-white)] [@media(max-width:480px)]:text-[22px]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {heading}
          </h3>
          <p
            data-role="subheading"
            data-payload-subfield="body"
            className="mb-7 max-w-[55ch] font-body text-lg leading-[1.7] text-[var(--color-neutral-300)] [@media(max-width:480px)]:text-base"
          >
            {copy}
          </p>

          <a
            href={telHref(phoneDisplay)}
            className="mb-5 inline-flex items-center gap-2.5 font-body text-[32px] font-bold text-[var(--color-sand)] transition-colors duration-300 hover:text-[var(--color-white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sand)] max-md:text-[28px] [@media(max-width:480px)]:text-2xl"
          >
            <Phone className="h-[26px] w-[26px]" strokeWidth={2} aria-hidden="true" />
            <span data-payload-subfield="contactPhone">{phoneDisplay}</span>
          </a>
          <div>
            <a href={defaults.href} className="btn btn-secondary" data-role="cta-2">
              {defaults.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
