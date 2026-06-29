import * as React from "react";
import {
  Home,
  HeartHandshake,
  Brain,
  Clock,
  Compass,
  type LucideIcon,
} from "lucide-react";
import type { BlockProps } from "./types";

/** CareLevelNavBlock — slim 4-up anchor strip used atop the Living Options
 *  page. Mirrors the Golden Oaks `care-level-nav`: a sage-whisper band of
 *  white cards (icon circle + title + tagline) that link to the matching
 *  `#care-*` feature sections below and double as a quick table of contents.
 *
 *  Items are CMS data — an `items[]` of `{ icon, label(→title), text(→tagline),
 *  link.url(→href) }`. When empty, the four Golden Oaks care levels render
 *  (anchoring #care-independent / -assisted / -memory / -respite).
 *
 *  Smooth scroll relies on global CSS (`scroll-behavior: smooth` on <html> +
 *  `scroll-margin-top` on the `#care-*` targets — both added in globals.css,
 *  offsetting the ~80px sticky header), so the block stays a server component. */

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  "heart-handshake": HeartHandshake,
  brain: Brain,
  clock: Clock,
  compass: Compass,
};

interface NavItem {
  icon: string;
  title: string;
  tagline: string;
  href: string;
}

const DEFAULTS: NavItem[] = [
  { icon: "home", title: "Independent Living", tagline: "Freedom without the chores", href: "#care-independent" },
  { icon: "heart-handshake", title: "Assisted Living", tagline: "Compassionate daily support", href: "#care-assisted" },
  { icon: "brain", title: "Memory Care", tagline: "Safety, calm, and connection", href: "#care-memory" },
  { icon: "clock", title: "Respite & Short-Term", tagline: "Flexible stays, full comfort", href: "#care-respite" },
];

export function CareLevelNavBlock({ items }: BlockProps) {
  const navItems: NavItem[] =
    items && items.length > 0
      ? items.map((it, i) => ({
          icon: it.icon || DEFAULTS[i]?.icon || "compass",
          title: it.label || DEFAULTS[i]?.title || "Care Level",
          tagline: it.link?.label || DEFAULTS[i]?.tagline || "",
          href: it.link?.url || DEFAULTS[i]?.href || "#",
        }))
      : DEFAULTS;

  return (
    <nav
      data-nocms-component="care-level-nav"
      aria-label="Care level overview"
      className="section-sage py-10 [@media(max-width:480px)]:py-7"
    >
      <div
        data-array-prop="items"
        data-payload-subfield="items"
        className="max-w-[1200px] mx-auto px-6 grid grid-cols-4 gap-4 lg:grid-cols-2 [@media(max-width:480px)]:grid-cols-1 [@media(max-width:480px)]:gap-3"
      >
        {navItems.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Compass;
          return (
            <a
              key={i}
              href={item.href}
              data-array-index={i}
              className="group flex items-center gap-3.5 min-h-[44px] rounded-md border border-text/10 bg-white p-4 px-[18px] no-underline transition-[border-color,box-shadow,transform] duration-200 hover:border-primary hover:shadow-md hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 [@media(max-width:480px)]:p-3.5 [@media(max-width:480px)]:px-4"
            >
              <span
                aria-hidden="true"
                className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-light flex items-center justify-center"
              >
                <Icon className="h-5 w-5 text-primary" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-0.5 min-w-0">
                <span
                  data-payload-subfield={`items.${i}.label`}
                  className="font-heading text-base font-bold text-text leading-snug"
                >
                  {item.title}
                </span>
                <span
                  data-payload-subfield={`items.${i}.text`}
                  className="font-body text-base text-muted leading-snug"
                >
                  {item.tagline}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
