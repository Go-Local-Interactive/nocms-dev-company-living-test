"use client";

/**
 * SiteChrome — selects the Header/Footer layout variant per route.
 *
 * The root `app/layout.tsx` is a server component and has no direct access to
 * the current pathname, so this thin client slot reads it via `usePathname()`
 * and maps it through `getChromeVariant()` (the minimal-route list lives in
 * `nav.config.ts`). Focused form / assessment routes (e.g. `/care-assessment`)
 * get the slim `variant="minimal"` chrome; everything else gets `"full"`.
 *
 * `Header`/`Footer` carry no server-only dependencies (they read the static
 * `skinConfig` import and the Header mounts its own client nav island), so they
 * render safely inside this client boundary. Plan 06 (care-assessment) and Plan
 * 05 (footer minimal) consume this selection.
 */

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HelpBadge } from "@/components/layout/HelpBadge";
import { ExitIntent } from "@/components/layout/ExitIntent";
import { TourWidget } from "@/components/layout/TourWidget.client";
import { getChromeVariant } from "@/lib/nav.config";

export function SiteHeaderSlot() {
  const variant = getChromeVariant(usePathname());
  return <Header variant={variant} data-nocms-component="site-chrome.client" />;
}

export function SiteFooterSlot() {
  const variant = getChromeVariant(usePathname());
  return <Footer variant={variant} />;
}

/**
 * Global floating chrome (Help Badge, Tour Widget, Exit Intent) — mounted once
 * site-wide, but SUPPRESSED on the minimal-chrome focused-flow routes
 * (`/schedule-tour`, `/care-assessment`), matching the mockup's minimal pages
 * which drop these distractions. Same `usePathname()` → `getChromeVariant()`
 * selection as the Header/Footer slots, so all chrome stays in lock-step.
 */
export function GlobalWidgetsSlot() {
  const variant = getChromeVariant(usePathname());
  if (variant === "minimal") return null;
  return (
    <>
      <HelpBadge />
      <TourWidget />
      <ExitIntent />
    </>
  );
}
