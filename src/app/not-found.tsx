import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  Heart,
  LayoutGrid,
  DollarSign,
  Calendar,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { FinalCtaBlock } from "@/components/blocks/FinalCtaBlock";
import skinConfig from "@/skin.config";

/**
 * 404 — the ONE page with template markup, not seed data: Next renders this for
 * any unmatched route, so there is no Payload doc to bind (editable-exempt by
 * design — see Plan 08 Task 9 / G8). It is a 1:1 port of the mockup
 * `pages/404.html` (`hero-fullbleed error-hero` → destination cards → phone
 * callout → the shared `callout-band` final CTA).
 *
 * Token-only: every color is a `--color-*` token / `@theme` utility (no hex).
 * The hero reuses the same DOM/overlay as `FullbleedHero` (the fullbleed-hero
 * source of truth) and the final CTA reuses the `callout-band` renderer
 * (`FinalCtaBlock`), so a re-skin re-themes this page with the rest of the site.
 * Brand/contact strings come from `skin.config` (re-branded at scaffold time).
 *
 * The global Header/Footer + Help Badge / Tour Widget / Exit Intent render via
 * `layout.tsx` — this route only owns the in-flow content.
 */

export const metadata: Metadata = {
  title: `Page not found | ${skinConfig.brandName}`,
  description:
    "The page you're looking for may have moved or no longer exists — but we'll help you find what you need.",
  robots: { index: false, follow: false },
};

/** Destination cards (mockup `.error-links`). The icon accent rotation
 *  (primary → secondary → accent → rich-brown → secondary → accent) mirrors the
 *  mockup's `.error-link:nth-child(n)` treatment; all values are tokens. */
const DESTINATIONS: {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Token utility pair for the icon circle (bg tint + stroke). */
  tint: string;
  iconColor: string;
}[] = [
  { label: "Our Community", href: "/about-us", icon: Home, tint: "bg-primary-light", iconColor: "text-primary-dark" },
  { label: "Care Options", href: "/living-options", icon: Heart, tint: "bg-secondary/15", iconColor: "text-secondary" },
  { label: "Floor Plans", href: "/floor-plans", icon: LayoutGrid, tint: "bg-accent/15", iconColor: "text-accent" },
  { label: "Pricing", href: "/request-pricing", icon: DollarSign, tint: "bg-rich-brown/10", iconColor: "text-rich-brown" },
  { label: "Schedule a Tour", href: "/schedule-tour", icon: Calendar, tint: "bg-secondary/15", iconColor: "text-secondary" },
  { label: "Contact Us", href: "/contact-us", icon: Phone, tint: "bg-accent/15", iconColor: "text-accent" },
];

/** `(555) 867-5309` → `tel:5558675309`. */
function telHref(display: string | undefined): string {
  const digits = (display ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "tel:";
}

export default function NotFound() {
  const phoneDisplay = skinConfig.contactPhone ?? "";

  return (
    <div data-nocms-component="not-found">
      {/* ===== HERO — 404 (hero-fullbleed error-hero) ===== */}
      <section
        className="relative flex h-[320px] w-full items-center justify-center overflow-hidden text-center text-white min-[481px]:h-[380px] min-[769px]:h-[480px]"
        aria-labelledby="not-found-heading"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/golden-oaks/hero-404.jpg"
          alt=""
          role="presentation"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          loading="eager"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[2]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-hero-overlay-from-soft) 0%, var(--color-hero-overlay-to) 100%)",
          }}
        />
        <div className="relative z-[3] mx-auto w-full max-w-[800px] px-10 min-[481px]:px-10 [@media(max-width:480px)]:px-5">
          <span className="mb-5 inline-block rounded-[20px] border border-white/30 bg-white/[0.18] px-4 py-1 font-heading text-base font-bold tracking-[0.05em] text-white">
            Error 404
          </span>
          <h1
            id="not-found-heading"
            data-role="heading"
            className="mb-4 font-heading font-bold leading-[1.1] text-white text-[2rem] min-[481px]:text-[2.5rem] min-[769px]:text-[3.5rem]"
          >
            We can&apos;t find that page
          </h1>
          <p
            data-role="subheading"
            className="mx-auto max-w-[70ch] font-body font-light leading-relaxed text-white/95 text-base min-[769px]:text-xl"
          >
            The page you&apos;re looking for may have moved or no longer exists.
            But don&apos;t worry — we&apos;ll help you find what you need.
          </p>
        </div>
      </section>

      {/* ===== BROWSE + PHONE (error-body) ===== */}
      <section className="bg-section-sage px-10 pb-20 pt-16 [@media(max-width:480px)]:px-6 [@media(max-width:480px)]:pb-[60px] [@media(max-width:480px)]:pt-12">
        <div className="mx-auto max-w-[800px] text-center">
          {/* "or browse" divider (mockup .error-divider). */}
          <div className="mx-auto mb-10 flex max-w-[520px] items-center gap-4">
            <span className="whitespace-nowrap font-body text-base font-semibold uppercase tracking-[0.08em] text-neutral-400">
              Browse
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-neutral-300" />
          </div>

          {/* Destination cards (mockup .error-links). */}
          <ul className="mb-12 grid list-none grid-cols-3 gap-5 p-0 [@media(max-width:768px)]:grid-cols-2 [@media(max-width:768px)]:gap-4 [@media(max-width:480px)]:grid-cols-1">
            {DESTINATIONS.map(({ label, href, icon: Icon, tint, iconColor }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full flex-col items-center gap-3.5 rounded-[var(--radius)] border border-neutral-200 bg-white px-5 pb-7 pt-8 font-body text-base font-semibold text-neutral-800 no-underline transition-[border-color,box-shadow,transform] duration-[250ms] hover:-translate-y-0.5 hover:border-primary-light hover:shadow-[0_6px_20px_color-mix(in_srgb,var(--color-text)_8%,transparent)] [@media(max-width:480px)]:px-4 [@media(max-width:480px)]:pb-[22px] [@media(max-width:480px)]:pt-6"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 [@media(max-width:480px)]:h-12 [@media(max-width:480px)]:w-12 ${tint}`}
                  >
                    <Icon
                      className={`h-6 w-6 ${iconColor}`}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Phone callout (mockup .error-phone-callout). */}
          <div className="flex items-center justify-center gap-5 rounded-[var(--radius)] bg-sand px-10 py-8 text-left [@media(max-width:480px)]:flex-col [@media(max-width:480px)]:px-6 [@media(max-width:480px)]:py-7 [@media(max-width:480px)]:text-center">
            <span className="flex h-[52px] w-[52px] min-w-[52px] items-center justify-center rounded-full bg-white">
              <Phone className="h-6 w-6 text-secondary" strokeWidth={2} aria-hidden="true" />
            </span>
            <p className="font-body text-[1.05rem] leading-relaxed text-neutral-700">
              <strong className="mb-0.5 block font-heading text-[1.1rem] text-neutral-900">
                Prefer to talk with someone?
              </strong>
              We&apos;re happy to help — call us at{" "}
              <a
                href={telHref(phoneDisplay)}
                className="font-body text-[1.25rem] font-bold text-secondary-dark no-underline transition-colors duration-200 hover:text-neutral-900 hover:underline"
              >
                {phoneDisplay}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA — the shared callout-band ("Ready to Find Your New Home?").
          No Payload doc backs the 404, so we render the renderer with a stub
          block (it only reads title/body, both defaulted) — same DOM/tokens as
          every seeded page's final CTA, so a re-skin re-themes this too. */}
      <FinalCtaBlock id="not-found-final-cta" blockType="callout-band" />
    </div>
  );
}
