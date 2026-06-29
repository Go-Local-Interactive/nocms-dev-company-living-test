import * as React from "react";
import { Users, ClipboardList, ShieldCheck, Clock } from "lucide-react";
import type { BlockProps, LexicalNode } from "./types";

/** StatsBarBlock — the Golden Oaks "Your Safety & Peace of Mind" section
 *  (homepage `.safety-section`). A dark `--color-primary-dark` band with a
 *  centered `font-heading` h2 and a 4-up `.stats-grid` (→ 2-up ≤768 → 1-up
 *  ≤480) of translucent-white stat CARDS. Each card has a round, per-slot
 *  tinted icon badge, a big tabular `font-heading` `.stat-number`, an uppercase
 *  `.stat-label`, a muted `.stat-description`, and a center-growing top accent
 *  bar on hover. Below the grid, an optional `.team-callout` row (lead + "Meet
 *  Our Team →").
 *
 *  Per-slot color cycle (icon stroke + number + accent bar), all via tokens:
 *    sand → secondary/secondary-light → accent/accent-light → white/cream.
 *
 *  Data-flow convention (lexical `body` overrides the in-code GO defaults):
 *    - Each STAT = a value-prefixed paragraph shaped "24/7 Trained Staff
 *      On-Site" or "100% State Licensed" (a leading number/percent/ratio token
 *      splits off as the `.stat-number`; the rest is the `.stat-label`),
 *      OPTIONALLY followed by a plain paragraph = that stat's `.stat-description`.
 *      (Heading/paragraph QA pairs are also accepted: heading = value+label,
 *      paragraph = description.)
 *    - A trailing plain paragraph that follows the last stat (with no stat
 *      after it) becomes the `.team-callout` lead.
 *    - The block `title` is the section heading.
 *    - Empty body ⇒ the 4 GO defaults below render.
 *
 *  `data-payload-subfield="body"` stays on the grid container; each card
 *  carries `data-array-index`. */

interface Stat {
  value: string;
  label: string;
  description?: string;
}

const DEFAULT_STATS: Stat[] = [
  {
    value: "24/7",
    label: "Trained Staff On-Site",
    description:
      "Licensed caregivers and nurses available around the clock for emergencies and support.",
  },
  {
    value: "1:6",
    label: "Staff-to-Resident Ratio",
    description:
      "Industry-leading staffing ratios ensure personalized attention and prompt response times.",
  },
  {
    value: "100%",
    label: "State Licensed & Accredited",
    description:
      "Full licensure and accreditation from state health departments and industry bodies.",
  },
  {
    value: "15+",
    label: "Years Serving Families",
    description:
      "Established track record of excellence, trust, and compassionate care in senior living.",
  },
];

const DEFAULT_TEAM_CALLOUT =
  "The heart of Golden Oaks is our people. Get to know the caregivers, nurses, and staff who make our community feel like family.";
const TEAM_CTA = "Meet Our Team";
const TEAM_HREF = "/our-team";

/** Leading number / percent / ratio / rating token, e.g. "24/7", "100%",
 *  "15+", "1:6", "5-Star". The `\d+-[A-Za-z]…` arm lets a hyphenated rating
 *  ("5-Star CMS rating") split into value "5-Star" + label "CMS rating". */
const STAT_RE = /^(\d+(?:\.\d+)?[+%]?|\d+\/\d+|\d+:\d+|\d+-[A-Za-z][\w-]*)\s+(.+)$/;

/** Per-slot icon (token-stroked via currentColor) — wraps to slot 0 past 4. */
const SLOT_ICONS = [Users, ClipboardList, ShieldCheck, Clock];

/** Per-slot color cycle (icon stroke + number + top accent bar), tokens only.
 *  Mirrors the mockup .stat-item:nth-child(n) palette. */
const SLOT_COLOR_VARS = [
  "var(--color-sand)",
  "var(--color-secondary-light)",
  "var(--color-accent-light)",
  "var(--color-white)",
];
const SLOT_ICON_STROKE = [
  "var(--color-sand)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-white)",
];
/** Icon-badge tint behind each icon (low-opacity wash of the slot accent). */
const SLOT_ICON_BG = [
  "color-mix(in srgb, var(--color-sand) 14%, transparent)",
  "color-mix(in srgb, var(--color-secondary) 15%, transparent)",
  "color-mix(in srgb, var(--color-accent) 15%, transparent)",
  "color-mix(in srgb, var(--color-white) 10%, transparent)",
];

function nodeToText(n: LexicalNode | undefined): string {
  if (!n) return "";
  const out: string[] = [];
  const walk = (x: LexicalNode) => {
    if (x.type === "text" && typeof x.text === "string") out.push(x.text);
    x.children?.forEach(walk);
  };
  walk(n);
  return out.join(" ").trim();
}

function splitValueLabel(line: string): { value: string; label: string } | null {
  const m = line.match(STAT_RE);
  return m ? { value: m[1], label: m[2] } : null;
}

/** Fold the lexical body into stats (+ descriptions) and an optional trailing
 *  team-callout lead. A value-prefixed paragraph (or a heading) opens a stat;
 *  the next plain paragraph fills its description. A plain paragraph that
 *  arrives with no open stat after the last stat is the team callout. */
function parseBody(body: BlockProps["body"]): {
  stats: Stat[];
  teamCallout?: string;
} {
  const children = body?.root?.children;
  if (!children?.length) {
    return { stats: DEFAULT_STATS, teamCallout: DEFAULT_TEAM_CALLOUT };
  }

  const stats: Stat[] = [];
  const trailingParas: string[] = [];
  let current: Stat | null = null;

  const flush = () => {
    if (current) stats.push(current);
    current = null;
  };

  for (const node of children) {
    if (node.type === "heading") {
      const text = nodeToText(node);
      const split = splitValueLabel(text);
      flush();
      trailingParas.length = 0;
      current = split
        ? { value: split.value, label: split.label }
        : { value: "", label: text };
    } else if (node.type === "paragraph") {
      const text = nodeToText(node);
      if (!text) continue;
      const split = splitValueLabel(text);
      if (split) {
        flush();
        trailingParas.length = 0;
        current = { value: split.value, label: split.label };
      } else if (current && !current.description) {
        current.description = text;
      } else {
        // A plain paragraph with no stat to attach to → team-callout candidate.
        trailingParas.push(text);
      }
    }
  }
  flush();

  if (stats.length === 0) {
    return { stats: DEFAULT_STATS, teamCallout: trailingParas[0] ?? DEFAULT_TEAM_CALLOUT };
  }

  // Backfill any missing values/descriptions from the defaults so a sparse body
  // still renders well.
  stats.forEach((s, i) => {
    const d = DEFAULT_STATS[i];
    if (!s.value) s.value = d?.value ?? "";
    if (!s.description && d) s.description = d.description;
  });

  return { stats, teamCallout: trailingParas[0] };
}

export function StatsBarBlock({ title, body }: BlockProps) {
  const { stats, teamCallout } = parseBody(body);

  return (
    <section
      data-nocms-component="stats-bar"
      className="bg-[var(--color-primary-dark)] py-20 px-10 text-[var(--color-white)] max-md:px-6"
    >
      <div className="mx-auto max-w-[1200px]">
        {title && (
          <h2
            data-role="heading"
            data-payload-subfield="title"
            className="text-center font-heading text-4xl font-bold text-[var(--color-white)] sm:text-[2.5rem]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h2>
        )}

        <dl
          data-payload-subfield="body"
          className="mt-[60px] grid gap-7"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))" }}
        >
          {stats.map((stat, i) => {
            const Icon = SLOT_ICONS[i % SLOT_ICONS.length];
            const numberColor = SLOT_COLOR_VARS[i % SLOT_COLOR_VARS.length];
            const iconStroke = SLOT_ICON_STROKE[i % SLOT_ICON_STROKE.length];
            const iconBg = SLOT_ICON_BG[i % SLOT_ICON_BG.length];
            const barColor = SLOT_ICON_STROKE[i % SLOT_ICON_STROKE.length];
            return (
              <div
                key={i}
                data-array-index={i}
                className="group relative overflow-hidden rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--color-white)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-white)_8%,transparent)] px-7 py-9 text-center transition-[transform,background-color,box-shadow] duration-[350ms] hover:-translate-y-1 hover:bg-[color-mix(in_srgb,var(--color-white)_12%,transparent)] hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-primary-dark)_55%,transparent)]"
              >
                {/* Center-growing top accent bar on hover (per-slot color). */}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-0 h-1 w-0 -translate-x-1/2 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
                  style={{ backgroundColor: barColor }}
                />
                <span
                  aria-hidden="true"
                  className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full"
                  style={{ backgroundColor: iconBg }}
                >
                  <Icon
                    className="h-9 w-9"
                    style={{ color: iconStroke }}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
                <dt
                  className="mb-2 font-heading text-4xl font-bold"
                  style={{ color: numberColor, fontVariantNumeric: "tabular-nums" }}
                >
                  {stat.value}
                </dt>
                <dd className="mb-3 font-body text-lg font-semibold text-[var(--color-white)]">
                  {stat.label}
                </dd>
                {stat.description && (
                  <p className="font-body text-base leading-relaxed text-[color-mix(in_srgb,var(--color-white)_85%,transparent)]">
                    {stat.description}
                  </p>
                )}
              </div>
            );
          })}
        </dl>

        {teamCallout && (
          <div className="mt-12 border-t border-[color-mix(in_srgb,var(--color-white)_10%,transparent)] pt-10 text-center">
            <p className="mx-auto mb-6 max-w-[600px] font-body text-lg leading-relaxed text-[color-mix(in_srgb,var(--color-white)_85%,transparent)]">
              {teamCallout}
            </p>
            <a
              href={TEAM_HREF}
              className="group/team inline-flex items-center gap-2 rounded-[var(--radius)] border-2 border-[var(--color-sand)] bg-[var(--color-sand)] px-7 py-3 font-body text-base font-semibold text-[var(--color-primary-dark)] transition-colors duration-300 hover:bg-[var(--color-white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sand)]"
            >
              {TEAM_CTA}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover/team:translate-x-1"
              >
                &rarr;
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
