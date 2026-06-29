import { Phone } from "lucide-react";

/**
 * HelpBadge — the floating "Need Help Now?" pill (mockup
 * `components/help-badge/`), mounted once globally in `app/layout.tsx`.
 *
 * Links to the immediate-support page (`/need-help-now`) — NOT a `tel:` (the
 * mockup's help-badge links to the page; the tap-to-call `tel:` lives in the
 * urgency strip). Terracotta pill with a pulsing ring on the icon; the label
 * collapses to icon-only below 480.
 *
 * Hide-behind-overlay: the mockup hides the badge while the mobile nav drawer
 * or tour panel is open (`.mobile-nav.is-open ~ .help-badge` / tour JS). Our
 * chrome is mounted as siblings in `layout.tsx`, so the badge reacts to the
 * `body[data-drawer-open]` (set by the HeaderNav drawer) and `body[data-tour-open]`
 * (set by the TourWidget) signals via arbitrary variants — pure CSS, SSR-safe.
 *
 * Token-only colors — no hex. Server component (mockup needs no JS).
 */
export function HelpBadge() {
  return (
    <a
      href="/need-help-now"
      data-nocms-component="help-badge"
      aria-label="Need help now? Get immediate support"
      className="group fixed bottom-5 right-5 z-[9999] inline-flex items-center gap-2.5 rounded-full bg-secondary p-4 text-base font-bold text-white shadow-[0_8px_28px_color-mix(in_srgb,var(--color-secondary)_40%,transparent)] transition-[transform,box-shadow,background-color,opacity] duration-300 hover:-translate-y-[3px] hover:bg-secondary-dark hover:shadow-[0_12px_36px_color-mix(in_srgb,var(--color-secondary)_50%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-[481px]:bottom-8 min-[481px]:right-8 min-[481px]:px-6 [body[data-drawer-open]_&]:pointer-events-none [body[data-drawer-open]_&]:opacity-0 [body[data-tour-open]_&]:pointer-events-none [body[data-tour-open]_&]:opacity-0"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span
          className="absolute inset-[-4px] rounded-full border-2 border-white/40 animate-badge-pulse"
          aria-hidden="true"
        />
        <Phone className="relative h-[22px] w-[22px]" aria-hidden="true" />
      </span>
      <span className="hidden min-[481px]:inline" data-role="text">Need Help Now?</span>
    </a>
  );
}
