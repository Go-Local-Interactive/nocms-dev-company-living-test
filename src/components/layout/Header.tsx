import { Phone } from "lucide-react";
import { skinConfig } from "@/lib/skin";
import { HeaderNav } from "@/components/layout/HeaderNav.client";

interface HeaderProps {
  /**
   * Layout variant. `"full"` (default) is the marketing header — green bar,
   * leaf logo, mega-menu nav, search, phone, and a cream Schedule-a-Tour CTA.
   * `"minimal"` is the slim bar for focused form / assessment pages: logo +
   * phone only (mockup `components/header-minimal/`). Selected per route by
   * `getChromeVariant()` in `app/layout.tsx`.
   */
  variant?: "full" | "minimal";
}

function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`;
}

export function Header({ variant = "full" }: HeaderProps) {
  const { brandName, contactPhone, logo, logoPath } = skinConfig;
  const logoSrc = logo?.src ?? logoPath;
  const logoAlt = logo?.alt ?? `${brandName} logo`;

  // ----- Minimal variant: slim green bar, logo + phone only (Task 3) -----
  if (variant === "minimal") {
    return (
      <header
        data-nocms-component="site-header"
        className="bg-primary py-4"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="flex shrink-0 items-center"
            data-payload-subfield="brandName"
            aria-label={`${brandName} — home`}
          >
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoSrc} alt={logoAlt} className="h-11 w-auto object-contain" data-role="media" />
            ) : (
              <span className="font-heading text-lg font-bold text-white">
                {brandName}
              </span>
            )}
          </a>
          {contactPhone && (
            <a
              href={telHref(contactPhone)}
              className="flex items-center gap-2 font-semibold text-white opacity-90 transition-opacity hover:opacity-100"
              data-payload-subfield="contactPhone"
              aria-label={`Call ${contactPhone}`}
            >
              <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="hidden md:inline">{contactPhone}</span>
            </a>
          )}
        </div>
      </header>
    );
  }

  // ----- Full variant: green bar + leaf logo + mega-menu + search + CTA -----
  return (
    <header
      id="site-header"
      data-nocms-component="site-header"
      className="sticky top-0 z-[1000] bg-primary text-white transition-[transform,box-shadow] duration-300 [&.is-hidden]:-translate-y-full [&.is-scrolled]:shadow-[0_2px_12px_color-mix(in_srgb,var(--color-text)_25%,transparent)]"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a
          href="/"
          className="flex shrink-0 items-center whitespace-nowrap"
          data-payload-subfield="brandName"
          aria-label={`${brandName} — home`}
        >
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt={logoAlt} className="h-14 w-auto object-contain" data-role="media-2" />
          ) : (
            <span className="font-heading text-xl font-bold text-white">
              {brandName}
            </span>
          )}
        </a>

        {/* Interactive nav island (dropdowns + search + sticky-scroll) */}
        <HeaderNav />

        {/* Right cluster: phone -> CTA -> hamburger. Search + hamburger + the
            mobile drawer live in the nav island (the hamburger uses `order-last`
            so it sits after this cluster, mirroring the mockup `.header-right`).
            At >= md (768) the phone shows as a text link; below md it collapses
            to a 44px phone-icon button (mockup `.phone-icon-btn`). The CTA is
            hidden below md — it lives in the drawer. `ml-auto` keeps this cluster
          (and the `order-last` hamburger that follows it) grouped at the right
          edge once the `flex-1` desktop nav is hidden below lg. */}
        <div className="ml-auto flex shrink-0 items-center gap-4">
          {contactPhone && (
            <>
              <a
                href={telHref(contactPhone)}
                className="hidden items-center whitespace-nowrap font-semibold text-white transition-colors hover:underline hover:underline-offset-[3px] md:flex"
                data-payload-subfield="contactPhone"
                aria-label="Call us"
              >
                {contactPhone}
              </a>
              <a
                href={telHref(contactPhone)}
                aria-label={`Call ${contactPhone}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
              </a>
            </>
          )}
          <a
            href="/schedule-tour"
            data-tour-trigger
            className="btn hidden bg-sand text-primary-dark hover:-translate-y-0.5 hover:bg-section-cream hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--color-text)_15%,transparent)] md:inline-flex" data-role="text"
          >
            Schedule a Tour
          </a>
        </div>
      </div>
    </header>
  );
}
