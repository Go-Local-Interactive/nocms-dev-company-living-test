import * as React from "react";
import {
  Heart,
  BookOpen,
  Clock,
  DollarSign,
  Users,
  Sun,
  Award,
  Shield,
  Star,
  Sparkles,
  Leaf,
  Home,
  Phone,
  MapPin,
  Calendar,
  Utensils,
  Activity,
  HeartHandshake,
  GraduationCap,
  TrendingUp,
  Coffee,
  Smile,
  HandHeart,
  Stethoscope,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { BlockProps } from "./types";
import { lexicalToText } from "./Lexical";

/** IconCardGridBlock — the Golden Oaks `icon-card-grid`: a centered grid of
 *  icon + title + description cards with a per-card accent color that cycles a
 *  4-color sequence, a top accent bar that grows 0→100% on hover, and a 72px
 *  circular icon. ONE block, THREE skins via `settings.variant`:
 *
 *    - `dark`  — `--color-section-dark` (green) band, white text, translucent-
 *                white cards (mockup `.icon-cards-dark`, used on Careers).
 *    - `brown` — `--color-section-brown` (rich-brown) band, otherwise identical
 *                card treatment (mockup `.icon-cards-brown`, in situ on Magnolia
 *                L13561 "Why Work With Us" inside `.has-branch-bg`).
 *    - `light` — `--color-section-light` (cream) band, neutral-900 headings,
 *                white cards with a neutral border (mockup `.icon-cards-light`,
 *                used on Floor-Plan-Detail). DEFAULT when `variant` is absent.
 *
 *  Mirrors `components/icon-card-grid/icon-card-grid.html`.
 *
 *  Token-only: the dark/brown/light backgrounds are the P0 `--color-section-*`
 *  tokens behind the `variant` switch — NOT literals and NOT three blocks. The
 *  per-card top bar / icon-circle bg / icon stroke cycle a per-variant array of
 *  CSS `var(--…)` / `color-mix(… var(--…) …)` strings keyed by `i % 4`, applied
 *  as inline `style`, so the P0 `--color-primary` flip re-themes every accent
 *  and flipping `settings.variant` swaps the section bg between the three
 *  section tokens.
 *
 *  Data-flow convention:
 *    - `items[]` — each `item.label` = card title, `item.text` (lexical) =
 *      description, `item.icon` = a lucide key (below). Empty ⇒ the 7 GO
 *      "Why Work With Us" defaults so the block is never blank.
 *    - `title` is the section `<h2>`. */

const ICONS: Record<string, LucideIcon> = {
  heart: Heart,
  "book-open": BookOpen,
  book: BookOpen,
  clock: Clock,
  "dollar-sign": DollarSign,
  dollar: DollarSign,
  wallet: Wallet,
  users: Users,
  sun: Sun,
  award: Award,
  shield: Shield,
  star: Star,
  sparkles: Sparkles,
  leaf: Leaf,
  home: Home,
  phone: Phone,
  "map-pin": MapPin,
  calendar: Calendar,
  utensils: Utensils,
  activity: Activity,
  "heart-handshake": HeartHandshake,
  "graduation-cap": GraduationCap,
  "trending-up": TrendingUp,
  coffee: Coffee,
  smile: Smile,
  "hand-heart": HandHeart,
  stethoscope: Stethoscope,
};

type Variant = "dark" | "brown" | "light";

interface Card {
  icon: string;
  title: string;
  description: string;
}

/** The mockup's 7 "Why Work With Us" cards (Careers / Magnolia brown). */
const DEFAULT_CARDS: Card[] = [
  {
    icon: "heart",
    title: "Health & Wellness",
    description:
      "Comprehensive medical, dental, and vision coverage for you and your family, plus an on-site wellness program.",
  },
  {
    icon: "book-open",
    title: "Tuition Assistance",
    description:
      "We invest in your growth with tuition reimbursement, certification support, and ongoing professional development.",
  },
  {
    icon: "clock",
    title: "Flexible Scheduling",
    description:
      "A variety of shift options and scheduling flexibility to help you maintain a healthy work-life balance.",
  },
  {
    icon: "dollar-sign",
    title: "Competitive Pay",
    description:
      "Market-leading compensation with annual reviews, shift differentials, and a generous retirement plan with employer match.",
  },
  {
    icon: "users",
    title: "Team Culture",
    description:
      "A supportive, collaborative environment where every team member is valued and celebrated for the work they do.",
  },
  {
    icon: "sun",
    title: "Paid Time Off",
    description:
      "Generous PTO starting from day one, paid holidays, and a paid volunteer day to give back to your community.",
  },
  {
    icon: "award",
    title: "Career Growth",
    description:
      "Clear advancement pathways, mentorship programs, and leadership training to help you build a long-term career in senior care.",
  },
];

/** Section bg + text token classes per variant. The bg is ALWAYS a P0
 *  `--color-section-*` token utility — flipping the variant swaps the band
 *  between the three section tokens with no block swap. */
const VARIANT_SECTION: Record<Variant, string> = {
  dark: "bg-section-dark text-white",
  brown: "bg-section-brown text-white",
  light: "bg-section-light text-neutral-900",
};

/** Card surface + heading/body token classes per variant. */
const VARIANT_CARD: Record<
  Variant,
  { card: string; heading: string; body: string }
> = {
  dark: {
    card: "bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.12] hover:-translate-y-1 hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-text)_28%,transparent)]",
    heading: "text-white",
    body: "text-white/85",
  },
  brown: {
    card: "bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.12] hover:-translate-y-1 hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-text)_28%,transparent)]",
    heading: "text-white",
    body: "text-white/85",
  },
  light: {
    card: "bg-white border border-neutral-100 hover:-translate-y-1 hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-text)_10%,transparent)]",
    heading: "text-neutral-900",
    body: "text-neutral-500",
  },
};

/** Per-variant 4-color accent cycle (mockup `:nth-child` rules). Each entry is
 *  a CSS string referencing P0 tokens — never a literal — so the cycle is
 *  token-driven and the primary flip re-themes it. `bar`/`stroke` are solid
 *  token colors; `iconBg` is the translucent circle behind the icon. */
const ACCENT_CYCLE: Record<
  Variant,
  { bar: string; iconBg: string; stroke: string }[]
> = {
  dark: [
    {
      bar: "var(--color-sand)",
      iconBg: "color-mix(in srgb, var(--color-sand) 12%, transparent)",
      stroke: "var(--color-sand)",
    },
    {
      bar: "var(--color-secondary)",
      iconBg: "color-mix(in srgb, var(--color-secondary) 15%, transparent)",
      stroke: "var(--color-secondary)",
    },
    {
      bar: "var(--color-accent)",
      iconBg: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
      stroke: "var(--color-accent)",
    },
    {
      bar: "var(--color-section-cream)",
      iconBg: "color-mix(in srgb, var(--color-white) 10%, transparent)",
      stroke: "var(--color-section-cream)",
    },
  ],
  brown: [
    {
      bar: "var(--color-primary-light)",
      iconBg: "color-mix(in srgb, var(--color-primary) 20%, transparent)",
      stroke: "var(--color-primary-light)",
    },
    {
      bar: "var(--color-sand)",
      iconBg: "color-mix(in srgb, var(--color-sand) 15%, transparent)",
      stroke: "var(--color-sand)",
    },
    {
      bar: "var(--color-accent)",
      iconBg: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
      stroke: "var(--color-accent)",
    },
    {
      bar: "var(--color-secondary-light)",
      iconBg: "color-mix(in srgb, var(--color-secondary) 15%, transparent)",
      stroke: "var(--color-secondary-light)",
    },
  ],
  light: [
    {
      bar: "var(--color-primary)",
      iconBg: "var(--color-primary-light)",
      stroke: "var(--color-primary)",
    },
    {
      bar: "var(--color-secondary)",
      iconBg: "var(--color-secondary-light)",
      stroke: "var(--color-secondary)",
    },
    {
      bar: "var(--color-accent)",
      iconBg: "var(--color-accent-light)",
      stroke: "var(--color-accent)",
    },
    {
      bar: "var(--color-warm-brown)",
      iconBg: "var(--color-sand)",
      stroke: "var(--color-warm-brown)",
    },
  ],
};

function resolveVariant(v: string | null | undefined): Variant {
  return v === "dark" || v === "brown" ? v : "light";
}

export function IconCardGridBlock({ title, items, settings }: BlockProps) {
  const variant = resolveVariant(settings?.variant);
  const sectionCls = VARIANT_SECTION[variant];
  const cardTheme = VARIANT_CARD[variant];
  const cycle = ACCENT_CYCLE[variant];

  const cards: Card[] =
    items && items.length > 0
      ? items.map((it, i) => ({
          icon: it.icon || DEFAULT_CARDS[i % DEFAULT_CARDS.length].icon,
          title: it.label || DEFAULT_CARDS[i % DEFAULT_CARDS.length].title,
          description:
            lexicalToText(it.text) ||
            DEFAULT_CARDS[i % DEFAULT_CARDS.length].description,
        }))
      : DEFAULT_CARDS;

  return (
    <section
      data-nocms-component="icon-card-grid"
      data-variant={variant}
      className={`px-10 py-20 [@media(max-width:768px)]:px-6 [@media(max-width:768px)]:py-12 ${sectionCls}`}
    >
      <div className="mx-auto max-w-[1100px]">
        {title && (
          <h2
            data-role="heading"
            data-payload-subfield="title"
            className="mb-12 text-center font-heading text-[2rem] font-bold [@media(max-width:480px)]:text-2xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h2>
        )}
        {/* auto-fit minmax(250px,1fr) at desktop → 2-col ≤1024 → 1-col ≤768. */}
        <div
          data-array-prop="items"
          data-payload-subfield="items"
          className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-7 [@media(max-width:1024px)]:grid-cols-2 [@media(max-width:768px)]:grid-cols-1 [@media(max-width:768px)]:gap-5"
        >
          {cards.map((card, i) => {
            const accent = cycle[i % 4];
            const Icon = ICONS[card.icon] ?? Heart;
            return (
              <div
                key={i}
                data-array-index={i}
                className={`group relative overflow-hidden rounded-[var(--radius)] px-7 py-9 text-center transition-[transform,background-color,box-shadow] duration-[350ms] ${cardTheme.card}`}
              >
                {/* Top accent bar — grows from center 0→100% on hover. */}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-0 h-1 w-0 -translate-x-1/2 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  style={{ background: accent.bar }}
                />
                {/* 72px circular icon — bg + stroke from the per-card accent. */}
                <span
                  aria-hidden="true"
                  className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full"
                  style={{ background: accent.iconBg, color: accent.stroke }}
                >
                  <Icon
                    className="h-9 w-9"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
                <h3
                  data-payload-subfield={`items.${i}.label`}
                  className={`mb-2.5 font-heading text-[1.15rem] font-semibold ${cardTheme.heading}`} data-role="heading-2"
                >
                  {card.title}
                </h3>
                <p
                  data-payload-subfield={`items.${i}.text`}
                  className={`text-[16px] leading-[1.6] ${cardTheme.body}`}
                >
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
