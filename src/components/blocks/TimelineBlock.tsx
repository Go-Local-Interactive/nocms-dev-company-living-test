import * as React from "react";
import { Sun, Utensils, Palette, Users, BookOpen, Wine, ChefHat, Moon } from "lucide-react";
import type { BlockProps } from "./types";
import { lexicalToText, lexicalQAPairs } from "./Lexical";

/** TimelineBlock — the Golden Oaks "A Typical Day at Golden Oaks" schedule
 *  (`timeline` component, in situ on Independent Living inside a
 *  `.section-cream` band). A center-spine vertical timeline with a
 *  sunrise→sunset gradient line, color-cycled icon dots, serif time labels,
 *  and odd/even left/right alternation. At ≤1024 it collapses to a single
 *  left-rail column (spine at 28px, dot in the rail).
 *
 *  Mirrors `components/timeline/timeline.html` 1:1, replacing the old
 *  left-rail numbered "process" layout.
 *
 *  Data-flow convention (lexical `body` overrides the in-code GO defaults):
 *    - Each timeline item = a `heading` shaped "7:00 AM — Morning Yoga" (split
 *      on em/en dash or hyphen → time + title) followed by a `paragraph` =
 *      the description. Pair i → item i (`lexicalQAPairs`).
 *    - With NO heading/paragraph pairs, `body` text is the section subtitle and
 *      the 8 GO default items render.
 *    - The block `title` is the section `<h2>`.
 *    - Icons + the per-item dot palette are driven by item INDEX (so the
 *      schedule reads sunrise→sunset regardless of seeded content).
 *
 *  Token-only: the spine gradient and each dot's bg/border/stroke are built
 *  from `var(--color-*)` / `color-mix(... var(--color-*) …)` strings (the
 *  mockup's `--accent-70`/`--primary-07`/`--cool-13`/`--linen` shades), so the
 *  P0 `--color-primary` flip-test re-themes the spine and dots. */

interface DayItem {
  time: string;
  title: string;
  description: string;
}

const DEFAULT_ITEMS: DayItem[] = [
  {
    time: "7:00 AM",
    title: "Morning Yoga or Garden Walk",
    description:
      "Start your day with gentle movement on the garden trail or in our wellness studio.",
  },
  {
    time: "8:30 AM",
    title: "Breakfast in the Dining Room",
    description:
      "Chef-prepared breakfast with fresh ingredients, or enjoy delivery to your apartment.",
  },
  {
    time: "10:00 AM",
    title: "Watercolor Class",
    description:
      "Express your creativity in our arts studio with other residents and our instructor.",
  },
  {
    time: "12:00 PM",
    title: "Lunch with Friends & Games",
    description:
      "Enjoy a meal with neighbors, followed by cards, dominoes, or conversation in the lounge.",
  },
  {
    time: "2:00 PM",
    title: "Afternoon Lecture or Library Time",
    description:
      "Attend an educational lecture or settle into our quiet library for reading and reflection.",
  },
  {
    time: "4:00 PM",
    title: "Happy Hour on the Terrace",
    description:
      "Relax with refreshments and conversation with friends on our scenic outdoor terrace.",
  },
  {
    time: "6:00 PM",
    title: "Chef's Seasonal Dinner",
    description:
      "Sit down to a fine dining experience with seasonal menus crafted by our culinary team.",
  },
  {
    time: "7:30 PM",
    title: "Movie Night or Evening at Home",
    description:
      "Choose a movie in our theater room or enjoy a quiet evening in your private apartment.",
  },
];

/** Per-item icon (token-stroked via currentColor), looping past index 7. */
const ITEM_ICONS = [Sun, Utensils, Palette, Users, BookOpen, Wine, ChefHat, Moon];

/** Per-item dot palette — sunrise (warm accent) → noon (primary green) →
 *  evening (cool blue). Each entry is the mockup `:nth-child(n)` rule mapped to
 *  token strings (`bg` = `.dot-icon` background, `stroke` = border + svg). */
const DOT_BG = [
  "color-mix(in srgb, var(--color-accent) 10%, white)", // --accent-10
  "color-mix(in srgb, var(--color-accent) 10%, white)", // --accent-10
  "var(--color-linen)", // --linen
  "color-mix(in srgb, var(--color-primary) 7%, white)", // --primary-07
  "color-mix(in srgb, var(--color-primary) 7%, white)", // --primary-07
  "color-mix(in srgb, var(--color-cool) 7%, white)", // --cool-07
  "color-mix(in srgb, var(--color-cool) 7%, white)", // --cool-07
  "color-mix(in srgb, var(--color-cool) 13%, white)", // --cool-13
];
const DOT_STROKE = [
  "color-mix(in srgb, var(--color-accent) 70%, white)", // --accent-70
  "color-mix(in srgb, var(--color-accent) 65%, white)",
  "color-mix(in srgb, var(--color-accent) 55%, var(--color-neutral-500))",
  "var(--color-primary)",
  "var(--color-primary)",
  "color-mix(in srgb, var(--color-primary) 55%, var(--color-cool))",
  "var(--color-cool)",
  "color-mix(in srgb, var(--color-cool) 85%, black)",
];

/** The full sunrise→sunset spine gradient (mockup `.timeline::before`), built
 *  from token strings so the flip-test re-themes it. */
const SPINE_GRADIENT =
  "linear-gradient(to bottom," +
  "color-mix(in srgb, var(--color-accent) 70%, white)," +
  "color-mix(in srgb, var(--color-accent) 55%, var(--color-neutral-500))," +
  "var(--color-primary)," +
  "var(--color-primary)," +
  "var(--color-cool)," +
  "color-mix(in srgb, var(--color-cool) 85%, black))";

/** Split "7:00 AM — Morning Yoga" → { time, title }; no dash ⇒ all title. */
function splitTimeTitle(heading: string): { time: string; title: string } {
  const m = heading.match(/^(.*?)\s*[—–-]\s*(.+)$/);
  if (m) return { time: m[1].trim(), title: m[2].trim() };
  return { time: "", title: heading.trim() };
}

export function TimelineBlock({ title, body }: BlockProps) {
  const pairs = lexicalQAPairs(body);
  const hasPairs = pairs.length > 0;
  const intro = hasPairs ? undefined : lexicalToText(body) || undefined;

  const items: DayItem[] = hasPairs
    ? pairs.map((p, i) => {
        const { time, title: t } = splitTimeTitle(p.q);
        const d = DEFAULT_ITEMS[i];
        return {
          time: time || d?.time || "",
          title: t || d?.title || "",
          description: p.a || d?.description || "",
        };
      })
    : DEFAULT_ITEMS;

  return (
    <section data-nocms-component="timeline" className="section-cream py-20 [@media(max-width:768px)]:py-12">
      <div className="container mx-auto max-w-[1200px] px-10 [@media(max-width:480px)]:px-5">
        {(title || intro) && (
          <div className="mx-auto mb-4 max-w-3xl text-center">
            {title && (
              <h2
                data-role="heading"
                data-payload-subfield="title"
                className="font-heading text-[2.5rem] font-bold text-text [@media(max-width:480px)]:text-2xl"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                {title}
              </h2>
            )}
            {intro && (
              <p
                data-role="subheading"
                data-payload-subfield="body"
                className="mt-4 font-body text-lg leading-relaxed text-muted"
              >
                {intro}
              </p>
            )}
          </div>
        )}

        {/* `.timeline` — relative wrapper; the center spine is an absolutely
            positioned gradient bar (left:50% desktop, left:28px ≤1024). */}
        <div className="relative mt-[60px]">
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[28px] w-[3px] -translate-x-1/2 rounded-[3px] opacity-60 min-[1025px]:left-1/2"
            style={{ background: SPINE_GRADIENT }}
          />
          <ol data-payload-subfield="body" className="list-none">
            {items.map((item, i) => {
              const Icon = ITEM_ICONS[i % ITEM_ICONS.length];
              const dotBg = DOT_BG[i % DOT_BG.length];
              const dotStroke = DOT_STROKE[i % DOT_STROKE.length];
              const even = i % 2 === 1; // mockup nth-child(even)
              return (
                <li
                  key={i}
                  data-array-index={i}
                  className={
                    // Mobile-first: single left rail (56px dot col + content),
                    // dot spans both rows. ≥1025: alternating 3-col grid.
                    "group relative grid grid-cols-[56px_1fr] items-center [&+li]:mt-10 [@media(max-width:480px)]:[&+li]:mt-7 " +
                    "min-[1025px]:grid-cols-[1fr_56px_1fr] min-[1025px]:[&+li]:mt-16"
                  }
                >
                  {/* Time — rail layout: col 2, left-aligned, sits above content.
                      ≥1025 odd: left column right-aligned; even: order-3 left col left-aligned. */}
                  <div
                    className={
                      "col-start-2 self-end pb-1 pl-3 text-left font-heading text-[18px] font-bold text-primary " +
                      "min-[1025px]:col-start-auto min-[1025px]:self-auto min-[1025px]:pb-0 min-[1025px]:text-[20px] " +
                      (even
                        ? "min-[1025px]:order-3 min-[1025px]:pl-5 min-[1025px]:pr-0 min-[1025px]:text-left"
                        : "min-[1025px]:order-1 min-[1025px]:pr-5 min-[1025px]:pl-0 min-[1025px]:text-right")
                    }
                  >
                    {item.time}
                  </div>

                  {/* Dot — rail layout: col 1, spans both rows. ≥1025: center column. */}
                  <div
                    aria-hidden="true"
                    className={
                      "relative z-[1] col-start-1 row-span-2 row-start-1 flex items-start justify-center self-start " +
                      "min-[1025px]:col-start-auto min-[1025px]:row-span-1 min-[1025px]:row-start-auto min-[1025px]:order-2 min-[1025px]:items-center min-[1025px]:self-auto"
                    }
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] transition-transform duration-300 group-hover:scale-[1.12] min-[1025px]:h-11 min-[1025px]:w-11"
                      style={{ background: dotBg, borderColor: dotStroke, color: dotStroke }}
                    >
                      <Icon
                        className="h-[18px] w-[18px] min-[1025px]:h-5 min-[1025px]:w-5"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  {/* Content — rail layout: col 2, left-aligned. ≥1025 odd: right
                      column left-aligned; even: order-1 left column right-aligned. */}
                  <div
                    className={
                      "col-start-2 pl-3 text-left " +
                      "min-[1025px]:col-start-auto min-[1025px]:px-5 " +
                      (even
                        ? "min-[1025px]:order-1 min-[1025px]:text-right"
                        : "min-[1025px]:order-3 min-[1025px]:text-left")
                    }
                  >
                    <h3 className="mb-1.5 font-heading text-[1.25rem] text-neutral-900" data-role="heading-2">
                      {item.title}
                    </h3>
                    <p className="m-0 font-body text-neutral-700">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
