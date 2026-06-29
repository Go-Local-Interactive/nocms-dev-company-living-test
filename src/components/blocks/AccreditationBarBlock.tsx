import * as React from "react";
import {
  BadgeCheck,
  Shield,
  Award,
  Star,
  HeartHandshake,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import type { BlockProps } from "./types";

/** AccreditationBarBlock — horizontal row of trust badges / accreditation items
 *  (icon circle + label + sublabel). Mirrors the Golden Oaks
 *  `accreditation-bar` component: a 2×2 grid that collapses to a single
 *  centered column at 768.
 *
 *  Two palettes via `settings.variant`:
 *    - "dark" (default) — primary-dark band, large gold-accent icons in a
 *      translucent white circle, white labels.
 *    - "light"          — transparent/inline, smaller neutral icons, muted
 *      items that brighten on hover (for embedding within a light section).
 *
 *  Content is CMS data: an `items[]` of `{ icon, label, text(→sublabel) }`.
 *  `icon` is a key into the lucide map below. When `items` is empty the four
 *  Golden Oaks defaults render so the block is never blank. */

const ICONS: Record<string, LucideIcon> = {
  "badge-check": BadgeCheck,
  shield: Shield,
  award: Award,
  star: Star,
  "heart-handshake": HeartHandshake,
  "clipboard-check": ClipboardCheck,
};

interface Badge {
  icon: string;
  label: string;
  sublabel: string;
}

const DEFAULTS: Badge[] = [
  { icon: "badge-check", label: "State Licensed", sublabel: "Dept. of Health" },
  { icon: "shield", label: "CARF Accredited", sublabel: "Quality Certified" },
  { icon: "award", label: "Award-Winning Care", sublabel: "2024 Best of Senior Living" },
  { icon: "star", label: "4.9 Family Rating", sublabel: "Verified Reviews" },
];

export function AccreditationBarBlock({ title, items, settings }: BlockProps) {
  const variant = settings?.variant === "light" ? "light" : "dark";
  const light = variant === "light";

  const badges: Badge[] =
    items && items.length > 0
      ? items.map((it, i) => ({
          icon: it.icon || DEFAULTS[i]?.icon || "badge-check",
          label: it.label || DEFAULTS[i]?.label || "",
          // `sublabel` rides in on the item's optional `link.label`; falls back
          // to the matching default so editors get a starting value.
          sublabel: it.link?.label ?? DEFAULTS[i]?.sublabel ?? "",
        }))
      : DEFAULTS;

  const theme = light
    ? {
        section: "bg-transparent py-0",
        heading: "text-text",
        bar: "py-12",
        item: "opacity-60 hover:opacity-100",
        iconWrap: "h-11 w-11 bg-surface",
        icon: "h-[22px] w-[22px] text-primary-dark",
        label: "text-base text-text",
        sublabel: "text-base text-muted",
      }
    : {
        section: "bg-primary-dark py-14 max-md:py-10",
        heading: "text-white",
        bar: "py-4",
        item: "opacity-100",
        iconWrap: "h-14 w-14 max-md:h-12 max-md:w-12 bg-white/12 border border-white/15",
        icon: "h-[26px] w-[26px] max-md:h-[22px] max-md:w-[22px] text-accent-light",
        label: "text-[17px] text-white",
        sublabel: "text-base text-white/85",
      };

  return (
    <section
      data-nocms-component="accreditation-bar"
      data-variant={variant}
      className={`px-6 sm:px-10 lg:px-16 ${theme.section}`}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2
            data-role="heading"
            data-payload-subfield="title"
            className={`text-center font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-8 ${theme.heading}`}
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h2>
        )}
        <div
          data-array-prop="items"
          data-payload-subfield="items"
          className={`grid grid-cols-1 md:grid-cols-2 justify-center justify-items-center gap-8 md:gap-x-16 md:gap-y-10 ${theme.bar}`}
        >
          {badges.map((badge, i) => {
            const Icon = ICONS[badge.icon] ?? BadgeCheck;
            return (
              <div
                key={i}
                data-array-index={i}
                className={`flex items-center gap-3.5 max-md:flex-col max-md:text-center max-md:gap-3 transition-opacity duration-300 ${theme.item}`}
              >
                <span
                  aria-hidden="true"
                  className={`flex-shrink-0 rounded-full flex items-center justify-center ${theme.iconWrap}`}
                >
                  <Icon className={theme.icon} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="leading-tight">
                  <span
                    data-payload-subfield={`items.${i}.label`}
                    className={`block font-semibold ${theme.label}`}
                  >
                    {badge.label}
                  </span>
                  {badge.sublabel && (
                    <span
                      data-payload-subfield={`items.${i}.link.label`}
                      className={`block font-normal ${theme.sublabel}`}
                    >
                      {badge.sublabel}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
