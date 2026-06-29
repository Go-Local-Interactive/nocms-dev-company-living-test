/**
 * Footer — the site-wide footer chrome, 1:1 with the Golden Oaks mockup
 * (`components/footer/`). Rich-brown band with a logo + tagline + contact top
 * row, four link columns (the last carrying a newsletter form), and a bottom
 * row of copyright / legal links / social circles.
 *
 * Editor contract: the root carries `data-nocms-component="site-footer"`; the
 * tagline is brand/skin copy and carries `data-payload-subfield="tagline"`.
 * Link columns + legal links come from `nav.config`; brand/contact/social/hours
 * come from `skinConfig` — re-skinned per project, never inline.
 *
 * `variant="minimal"` renders the single-line `bg-primary-dark` footer for the
 * focused form / assessment flows (mockup `components/footer-minimal/`),
 * selected per route by `getChromeVariant()` in `app/layout.tsx`.
 *
 * Token-only colors — no hex. Server component (the mockup needs no JS).
 */
import { Facebook, Instagram, Youtube, type LucideIcon } from "lucide-react";
import { skinConfig } from "@/lib/skin";
import {
  footerColumns,
  legalLinks,
  type SocialPlatform,
} from "@/lib/nav.config";

interface FooterProps {
  /**
   * Layout variant. `"full"` (default) is the marketing footer. `"minimal"` is
   * the single-line slim footer for focused form / assessment pages.
   */
  variant?: "full" | "minimal";
}

function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`;
}

/** Social platform → lucide icon (rendered for each configured profile URL). */
const SOCIAL_ICONS: Record<SocialPlatform, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
};

const SOCIAL_ORDER: SocialPlatform[] = ["facebook", "instagram", "youtube"];

export function Footer({ variant = "full" }: FooterProps) {
  const {
    brandName,
    brandSuffix,
    tagline,
    contactPhone,
    primaryAddress,
    hours,
    logo,
    logoPath,
    social,
  } = skinConfig;
  const year = new Date().getFullYear();
  const brandFull = brandSuffix ? `${brandName} ${brandSuffix}` : brandName;

  // ----- Minimal variant: one centered primary-dark line (Task 5) -----
  if (variant === "minimal") {
    return (
      <footer
        data-nocms-component="site-footer"
        className="bg-primary-dark py-6 text-center text-base text-white/85"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          &copy; {year} {brandFull} &middot;{" "}
          {contactPhone && (
            <>
              <a
                href={telHref(contactPhone)}
                className="text-white underline underline-offset-[3px] transition-colors hover:text-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light"
                data-payload-subfield="contactPhone"
              >
                {contactPhone}
              </a>{" "}
              &middot;{" "}
            </>
          )}
          <a
            href="/"
            className="text-white underline underline-offset-[3px] transition-colors hover:text-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light" data-role="text"
          >
            Back to Homepage
          </a>
        </div>
      </footer>
    );
  }

  const logoSrc = logo?.src ?? logoPath;
  const logoAlt = logo?.alt ?? `${brandName} logo`;

  // ----- Full variant: rich-brown band, top row + 4 columns + bottom row -----
  return (
    <footer
      data-nocms-component="site-footer"
      className="relative bg-rich-brown pb-5 pt-[60px] text-white/90"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Footer top — logo + tagline (left) · address/phone/hours (right) */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:gap-10">
          <div>
            <a
              href="/"
              className="mb-4 flex items-center"
              aria-label={`${brandName} — home`}
              data-payload-subfield="brandName"
            >
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="h-12 w-auto object-contain" data-role="media"
                />
              ) : (
                <span className="font-heading text-2xl font-bold text-white">
                  {brandName}
                </span>
              )}
            </a>
            <p
              className="max-w-[45ch] text-base leading-relaxed text-white/75"
              data-payload-subfield="tagline" data-role="subheading"
            >
              {tagline}. We&apos;re here to support you and your family through
              every step of the senior living journey.
            </p>
          </div>

          <div className="whitespace-nowrap text-base leading-[1.8] text-white/75 md:text-right">
            {primaryAddress && (
              <address className="not-italic">
                {primaryAddress.line1}, {primaryAddress.city},{" "}
                {primaryAddress.state} {primaryAddress.zip}
              </address>
            )}
            {contactPhone && (
              <div className="mt-1.5">
                <a
                  href={telHref(contactPhone)}
                  className="text-white/75 underline underline-offset-2 transition-colors hover:text-primary-light"
                  data-payload-subfield="contactPhone"
                >
                  {contactPhone}
                </a>
              </div>
            )}
            {hours && (
              <div className="mt-1.5">
                {hours.weekdays} &middot; {hours.weekends}
              </div>
            )}
          </div>
        </div>

        {/* Footer link columns — 4 (>1024) → 2 (≤1024 & >480) → 1 (≤480),
            mirroring the mockup's max-width: 1024px / 480px breakpoints. */}
        <div className="mb-10 grid grid-cols-1 gap-8 min-[481px]:grid-cols-2 min-[1025px]:grid-cols-4 min-[1025px]:gap-10">
          {footerColumns.map((column, index) => {
            const isLast = index === footerColumns.length - 1;
            return (
              <div key={column.heading}>
                <h3 className="mb-5 font-heading text-base font-bold text-white" data-role="heading">
                  {column.heading}
                </h3>
                <ul className="list-none">
                  {column.links.map((link) => (
                    <li key={link.href} className="mb-3">
                      <a
                        href={link.href}
                        className="text-base text-white/75 underline underline-offset-2 transition-colors hover:text-primary-light focus-visible:rounded-sm focus-visible:text-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Newsletter signup lives in the final column (mockup) */}
                {isLast && (
                  <>
                    <h3 className="mb-5 mt-6 font-heading text-base font-bold text-white" data-role="heading-2">
                      Stay Connected
                    </h3>
                    <form
                      className="flex flex-col gap-3"
                      aria-label="Newsletter signup"
                    >
                      <label htmlFor="newsletter-email" className="sr-only" data-role="text-2">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="newsletter-email"
                        required
                        placeholder="Your email"
                        aria-label="Email address for newsletter"
                        className="rounded-md border border-white/40 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/70 focus:border-primary-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light"
                      />
                      <button
                        type="submit"
                        className="cursor-pointer rounded-md bg-primary px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light" data-role="cta"
                      >
                        Subscribe
                      </button>
                    </form>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer bottom — copyright · legal · social */}
        <div className="flex flex-col flex-wrap items-center gap-3 border-t border-white/10 pt-[30px] text-center md:flex-row md:justify-between md:gap-5 md:text-left">
          <div className="text-base text-white/75">
            &copy; {year} {brandFull}. All rights reserved.
          </div>

          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-base text-white/75 underline underline-offset-2 transition-colors hover:text-primary-light focus-visible:rounded-sm focus-visible:text-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {social && (
            <div className="flex gap-4">
              {SOCIAL_ORDER.filter((platform) => social[platform]).map(
                (platform) => {
                  const Icon = SOCIAL_ICONS[platform];
                  return (
                    <a
                      key={platform}
                      href={social[platform]}
                      aria-label={SOCIAL_LABELS[platform]}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light"
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </a>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
