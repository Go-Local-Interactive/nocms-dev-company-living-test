import * as React from "react";
import {
  Shield,
  BadgeCheck,
  Star,
  Heart,
  Award,
  type LucideIcon,
} from "lucide-react";
import type { BlockProps } from "./types";
import { mediaItemsUrls, type PayloadBlockItem } from "@/lib/payload";
import { Lexical, lexicalToText, lexicalListItems } from "./Lexical";

/** ContentBlocksBlock — the Golden Oaks `content-blocks` section: ONE wrapper
 *  hosting an ordered, heterogeneous list of typed sub-blocks for text-heavy
 *  informational pages (Understanding Costs, Licensing). All sub-blocks live in
 *  a single narrow (800px) reading column and share a consistent vertical
 *  rhythm (48px between children, 36px ≤768).
 *
 *  Mirrors `components/content-blocks/content-blocks.html` (in situ:
 *  `pages/understanding-costs.html`, `pages/licensing.html`).
 *
 *  ONE block, NOT seven: each `items[]` entry is a typed sub-block keyed by
 *  `item.icon` ∈ {text, photo, photo-inline, pullquote, list, badges, callout}
 *  — the renderer `switch`es on it. The seven sub-renderers live in THIS file.
 *  An unknown type degrades to `cb-text` (a safe default + dev warn).
 *
 *  Sub-block → field mapping (from the plan's Task 5):
 *    - `cb-text`         → `item.label` = h2/h3, `item.text` (lexical) = prose.
 *    - `cb-photo`        → `item.media` + `item.label` (caption) — shared
 *                          `.captioned-figure` utility.
 *    - `cb-photo-inline` → `item.media` + `item.label` (h3) + `item.text`;
 *                          2-col grid, EVEN-indexed photo-inline flips image
 *                          right (rtl trick), stacks ≤768.
 *    - `pullquote`       → `item.text` (quote) + `item.label` (cite) — shared
 *                          `.pullquote` utility.
 *    - `cb-list`         → `item.label` (h3) + `item.text` (lexical ul/ol);
 *                          markers `--color-primary`.
 *    - `cb-badges`       → `item.text` (lexical list of "Name — Detail" rows)
 *                          → 2-col grid of badge cards (sage tint, 64px
 *                          primary-dark icon circle); `item.media` = logo.
 *    - `cb-callout`      → `item.label` (h3) + `item.text` (p) + `item.link`
 *                          (CTA); `bg-primary-dark`, faint leaf, sand text,
 *                          `.btn-secondary` CTA.
 *
 *  Token-only: badge sage tint (`--color-section-sage`), callout primary-dark
 *  (`--color-primary-dark`), list/marker primary, pullquote, callout sand text —
 *  all P0 tokens. No hex / rgba. The `--color-primary` flip re-themes the lot.
 *
 *  Wrapper `title` is an optional leading section heading. Section bg from
 *  `settings.background` (cream / sage / light / sand / dark, or plain white). */

type CbType =
  | "text"
  | "photo"
  | "photo-inline"
  | "pullquote"
  | "list"
  | "badges"
  | "callout";

const KNOWN_TYPES: ReadonlySet<string> = new Set<CbType>([
  "text",
  "photo",
  "photo-inline",
  "pullquote",
  "list",
  "badges",
  "callout",
]);

/** Lucide icons for `cb-badges`. The mockup uses inline SVGs (shield / check /
 *  star / heart); we map a small set keyed by `item.icon`-style names with a
 *  shield default so an unconfigured badge still gets a glyph. */
const BADGE_ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  "badge-check": BadgeCheck,
  check: BadgeCheck,
  star: Star,
  heart: Heart,
  award: Award,
};

/** Map `settings.background` to a P0 section-surface utility. `undefined` (the
 *  default) leaves the wrapper plain white, matching the catalog's default. */
const BACKGROUND_CLASS: Record<string, string> = {
  base: "",
  surface: "section-cream",
  cream: "section-cream",
  sage: "section-sage",
  light: "section-light",
  sand: "section-sand",
  dark: "section-dark",
};

interface SubProps {
  item: PayloadBlockItem;
  /** Index in the `items[]` array (drives `data-array-index` + subfield paths). */
  i: number;
  /** Resolved media `{ url, alt }` for this item (null when no media). */
  media: { url: string; alt: string } | null;
}

/* ============================ SUB-RENDERERS ============================ */

/** `cb-text` — `item.label` = h2, `item.text` (lexical) = prose. The `.cb-text`
 *  globals styling lives inline here (18px/1.8 neutral-700; h2 serif 1.5rem →
 *  1.35rem ≤480; p mb-5; links primary underline). Lexical h3s inside `text`
 *  render via `<Lexical>` at the smaller h3 size. */
function CbText({ item, i }: SubProps) {
  const hasText = Boolean(item.text?.root?.children?.length);
  return (
    <div className="text-[18px] leading-[1.8] text-neutral-700 [&_h2]:mb-4 [&_h2]:mt-0 [&_h2]:text-left [&_h2]:font-heading [&_h2]:text-[1.5rem] [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-left [&_h3]:font-heading [&_h3]:text-[1.2rem] [&_h3]:font-bold [&_h3]:text-neutral-900 [&_p]:mb-5 [&_p:last-child]:mb-0 [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary-dark [@media(max-width:480px)]:[&_h2]:text-[1.35rem]" data-nocms-component="content-blocks-block">
      {item.label && (
        <h2
          data-payload-subfield={`items.${i}.label`}
          className="mb-4 mt-0 text-left font-heading text-[1.5rem] font-bold text-neutral-900 [@media(max-width:480px)]:text-[1.35rem]" data-role="heading-2"
        >
          {item.label}
        </h2>
      )}
      {hasText && <Lexical value={item.text} subfield={`items.${i}.text`} />}
    </div>
  );
}

/** `cb-photo` — full-width `.captioned-figure` (shared globals utility): image
 *  with `--radius`, `item.label` rendered as the overlaid `figcaption`. The
 *  figure `margin:0` (the wrapper owns the vertical rhythm). */
function CbPhoto({ item, i, media }: SubProps) {
  if (!media) return null;
  return (
    <figure className="captioned-figure !my-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-payload-subfield={`items.${i}.media`}
        src={media.url}
        alt={media.alt || (item.label ?? "")}
        loading="lazy" data-role="media"
      />
      {item.label && (
        <figcaption data-payload-subfield={`items.${i}.label`}>
          {item.label}
        </figcaption>
      )}
    </figure>
  );
}

/** `cb-photo-inline` — side-by-side `item.media` + (`item.label` h3 + `item.text`
 *  prose). 2-col grid, 40px gap, align-start. The image flips to the right via the
 *  mockup's `direction:rtl` trick (children reset to `ltr`) on EVEN sibling
 *  positions; the flip is OFF ≤768 where the grid stacks to 1 col. The mockup's
 *  `.cb-photo-inline:nth-of-type(even)` counts position among ALL sibling <div>s,
 *  and every item renders as exactly one wrapper <div>, so the 1-based child
 *  position == i+1 → flip when i is odd. */
function CbPhotoInline({ item, i, media }: SubProps) {
  const hasText = Boolean(item.text?.root?.children?.length);
  // i+1 even (i odd) ⇒ even sibling <div> ⇒ flips, matching :nth-of-type(even).
  const flip = i % 2 === 1;
  return (
    <div
      className={`grid grid-cols-2 items-start gap-10 [@media(max-width:768px)]:grid-cols-1 [@media(max-width:768px)]:gap-6 ${
        flip
          ? "[direction:rtl] [&>*]:[direction:ltr] [@media(max-width:768px)]:[direction:ltr]"
          : ""
      }`}
    >
      {media && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          data-payload-subfield={`items.${i}.media`}
          src={media.url}
          alt={media.alt || (item.label ?? "")}
          loading="lazy"
          className="block h-auto w-full rounded-[var(--radius)]" data-role="media-2"
        />
      )}
      <div className="text-[18px] leading-[1.8] text-neutral-700 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:text-primary [&_a]:underline [@media(max-width:768px)]:text-[16px]">
        {item.label && (
          <h3
            data-payload-subfield={`items.${i}.label`}
            className="mb-3 mt-0 font-heading text-[1.2rem] font-bold text-neutral-900" data-role="heading-3"
          >
            {item.label}
          </h3>
        )}
        {hasText && <Lexical value={item.text} subfield={`items.${i}.text`} />}
      </div>
    </div>
  );
}

/** `pullquote` — shared global `.pullquote`: serif italic blockquote
 *  (`item.text`) + a small `cite` (`item.label`). In a content-blocks context
 *  the bottom margin is 56px (the mockup `.content-blocks .pullquote` override);
 *  the wrapper rhythm handles the rest so the base `.pullquote` margin is reset. */
function CbPullquote({ item, i }: SubProps) {
  const quote = lexicalToText(item.text);
  if (!quote && !item.label) return null;
  return (
    <div className="pullquote !my-0">
      <blockquote data-payload-subfield={`items.${i}.text`}>{quote}</blockquote>
      {item.label && (
        <cite data-payload-subfield={`items.${i}.label`}>{item.label}</cite>
      )}
    </div>
  );
}

/** `cb-list` — `item.label` (h3) + `item.text` (a lexical ul/ol). Markers are
 *  `--color-primary` (ol markers bold). The lexical list renders via `<Lexical>`;
 *  marker color + list indentation are applied with scoped utilities. */
function CbList({ item, i }: SubProps) {
  const hasText = Boolean(item.text?.root?.children?.length);
  return (
    <div className="text-[18px] leading-[1.8] text-neutral-700 [@media(max-width:768px)]:text-[16px]">
      {item.label && (
        <h3
          data-payload-subfield={`items.${i}.label`}
          className="mb-4 mt-0 font-heading text-[1.2rem] font-bold text-neutral-900" data-role="heading-4"
        >
          {item.label}
        </h3>
      )}
      {hasText && (
        <Lexical
          value={item.text}
          subfield={`items.${i}.text`}
          className="[&_li]:mb-2.5 [&_li]:pl-1 [&_li]:marker:text-primary [&_ol]:m-0 [&_ol]:ml-6 [&_ol]:p-0 [&_ol_li]:marker:font-semibold [&_ul]:m-0 [&_ul]:ml-6 [&_ul]:p-0"
        />
      )}
    </div>
  );
}

/** `cb-badges` — a 2-col grid of badge cards (1-col ≤768). Each card is encoded
 *  as one lexical list row `"Name — Detail"` in `item.text`; we split on the
 *  em/en dash. Card: sage tint, hover primary-light border; 64px primary-dark
 *  icon circle with a white glyph. If `item.media` is present the badge becomes
 *  a `has-image` logo tile (80×64 white). The whole sub-block binds
 *  `items.${i}.text` (the rows are editable as the lexical list). */
function CbBadges({ item, i, media }: SubProps) {
  const rows = lexicalListItems(item.text);
  if (rows.length === 0) return null;
  return (
    <div
      data-payload-subfield={`items.${i}.text`}
      className="grid grid-cols-2 gap-5 [@media(max-width:768px)]:grid-cols-1 [@media(max-width:768px)]:gap-4"
    >
      {rows.map((row, j) => {
        const [name, ...rest] = row.split(/\s+[—–-]\s+/);
        const detail = rest.join(" — ");
        const Icon = BADGE_ICONS[item.icon ?? ""] ?? Shield;
        // Only the FIRST badge can carry the shared item.media logo (one media
        // slot per item); the rest fall back to the icon circle.
        const logo = j === 0 ? media : null;
        return (
          <div
            key={j}
            className="flex flex-row items-center gap-5 rounded-[var(--radius)] border border-transparent bg-section-sage px-6 py-7 transition-[border-color,box-shadow] duration-200 hover:border-primary-light hover:shadow-[0_4px_16px_color-mix(in_srgb,var(--color-text)_8%,transparent)]"
          >
            {logo ? (
              <span className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-[var(--radius)] border border-neutral-100 bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.url}
                  alt={logo.alt || name || ""}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain" data-role="media-3"
                />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary-dark"
              >
                <Icon className="h-9 w-9 text-white" strokeWidth={1.8} aria-hidden="true" />
              </span>
            )}
            <div>
              <div className="mb-1 text-[16px] font-bold leading-[1.3] text-neutral-900">
                {name}
              </div>
              {detail && (
                <div className="text-[16px] leading-[1.4] text-neutral-500">
                  {detail}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** `cb-callout` — a dark CTA box: `--color-primary-dark` bg, faint leaf overlay
 *  (the P0 `.leaf-pattern` analogue, opacity .06), centered. `item.label` = h3
 *  (white), `item.text` = p (sand, max-w-480 centered), `item.link` = a
 *  `.btn-secondary` CTA. */
function CbCallout({ item, i }: SubProps) {
  const text = lexicalToText(item.text);
  const cta = item.link;
  return (
    <div className="relative overflow-hidden rounded-[var(--radius)] bg-primary-dark p-10 text-center [@media(max-width:768px)]:px-6 [@media(max-width:768px)]:py-7">
      {/* Faint leaf overlay — token-tinted, behind the content (z-1 lifts it). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/golden-oaks/leaf-pattern.jpg')] bg-cover bg-center bg-no-repeat opacity-[0.06]"
      />
      <div className="relative z-[1]">
        {item.label && (
          <h3
            data-payload-subfield={`items.${i}.label`}
            className="mb-2.5 mt-0 font-heading text-[1.25rem] font-bold text-white" data-role="heading-5"
          >
            {item.label}
          </h3>
        )}
        {text && (
          <p
            data-payload-subfield={`items.${i}.text`}
            className="mx-auto mb-5 max-w-[480px] text-[16px] text-sand" data-role="subheading"
          >
            {text}
          </p>
        )}
        {cta?.label && (
          <a
            data-payload-subfield={`items.${i}.link.label`}
            href={cta.url || "#"}
            className="btn btn-secondary" data-role="cta"
          >
            {cta.label}
          </a>
        )}
      </div>
    </div>
  );
}

/* ============================== DEFAULTS ============================== */

/** GO default items — a representative example exercising ALL seven sub-types
 *  in the mockup catalog's order (text, photo, text, list, pullquote,
 *  photo-inline, badges, callout), ported from
 *  `components/content-blocks/content-blocks.html`. Rendered only when `items`
 *  is empty so the block is never blank. */
function lexParagraphs(...paras: string[]): NonNullable<PayloadBlockItem["text"]> {
  return {
    root: {
      type: "root",
      children: paras.map((p) => ({
        type: "paragraph",
        children: [{ type: "text", text: p }],
      })),
    },
  };
}

function lexList(items: string[]): NonNullable<PayloadBlockItem["text"]> {
  return {
    root: {
      type: "root",
      children: [
        {
          type: "list",
          listType: "bullet",
          children: items.map((t) => ({
            type: "listitem",
            children: [{ type: "text", text: t }],
          })),
        },
      ],
    },
  };
}

const DEFAULT_ITEMS: PayloadBlockItem[] = [
  {
    icon: "text",
    label: "Our Commitment to Quality",
    text: lexParagraphs(
      "At Golden Oaks, we believe that transparency and accountability are the foundations of trust. We are proud to maintain all required licenses and have earned voluntary accreditations that reflect our dedication to providing the highest standard of senior living services.",
      "Every member of our team participates in ongoing training and education to ensure we consistently meet the standards set by our accrediting bodies. We welcome questions from families and encourage you to verify our credentials at any time.",
    ),
  },
  {
    icon: "photo",
    label: "Our team meets weekly to review care standards and resident feedback",
    media: "/golden-oaks/why-care.jpg",
  },
  {
    icon: "text",
    label: "State Licensing",
    text: lexParagraphs(
      "Golden Oaks operates under a Continuing Care Retirement Community (CCRC) license issued by the State Department of Health and Human Services. Our license covers all levels of care provided at our community, including independent living, assisted living, and memory care.",
    ),
  },
  {
    icon: "list",
    label: "Annual Compliance Areas",
    text: lexList([
      "Resident rights and dignity protections",
      "Staffing ratios and qualifications",
      "Medication management and health services",
      "Fire safety and emergency preparedness",
      "Nutritional standards and food safety",
      "Building codes and accessibility requirements",
    ]),
  },
  {
    icon: "pullquote",
    label: "— Jennifer M., daughter of a Golden Oaks resident",
    text: lexParagraphs(
      "When we were researching communities for my mother, the licensing and accreditation records at Golden Oaks gave us real peace of mind.",
    ),
  },
  {
    icon: "photo-inline",
    label: "Staff Credentials",
    media: "/golden-oaks/life-fitness.jpg",
    text: lexParagraphs(
      "All Golden Oaks clinical staff hold current, valid licenses and certifications as required by state and federal regulations. Our team includes registered nurses, licensed practical nurses, certified nursing assistants, licensed social workers, and certified activity professionals.",
    ),
  },
  {
    icon: "badges",
    text: lexList([
      "CARF Accredited — Commission on Accreditation of Rehabilitation Facilities",
      "Joint Commission Gold Seal — The Joint Commission",
      "CMS 5-Star Rating — Centers for Medicare & Medicaid Services",
      "SAGECare Platinum — Services & Advocacy for LGBTQ+ Elders",
    ]),
  },
  {
    icon: "callout",
    label: "Questions About Our Licensing?",
    text: lexParagraphs(
      "Our team is happy to provide documentation or answer any questions about our credentials and compliance history.",
    ),
    link: { label: "Contact Our Team", url: "/contact-us" },
  },
];

/* ============================== WRAPPER ============================== */

export function ContentBlocksBlock({ title, items, settings }: BlockProps) {
  const list: PayloadBlockItem[] =
    items && items.length > 0 ? items : DEFAULT_ITEMS;
  const itemMedia = mediaItemsUrls(list);

  const bg = settings?.background
    ? (BACKGROUND_CLASS[settings.background] ?? "")
    : "";

  return (
    <section
      data-nocms-component="content-blocks"
      className={`content-blocks py-20 [@media(max-width:768px)]:py-12 ${bg}`.trim()}
    >
      <div className="container mx-auto max-w-[800px] px-10 [@media(max-width:480px)]:px-5">
        {title && (
          <h2
            data-role="heading"
            data-payload-subfield="title"
            className="mb-12 font-heading text-[1.75rem] font-bold text-neutral-900"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {title}
          </h2>
        )}
        <div data-array-prop="items" data-payload-subfield="items">
          {list.map((item, i) => {
            const type = (item.icon ?? "text") as string;
            const known = KNOWN_TYPES.has(type);
            if (!known && process.env.NODE_ENV !== "production") {
              console.warn(
                `[ContentBlocksBlock] unknown cb-type "${type}" at items.${i} — rendering cb-text`,
              );
            }
            const effective = (known ? type : "text") as CbType;
            const sub: SubProps = {
              item,
              i,
              media: itemMedia[i] ?? null,
            };
            // Mockup: .content-blocks > * = 48px bottom rhythm, but .pullquote
            // overrides to 56px. last: resets the final child; mobile tightens to 36px.
            const wrapperMb = effective === "pullquote" ? "mb-14" : "mb-12";
            return (
              <div
                key={i}
                data-array-index={i}
                data-cb-type={type}
                className={`${wrapperMb} last:mb-0 [@media(max-width:768px)]:mb-9`}
              >
                <SubBlock type={effective} sub={sub} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Dispatch one sub-block by its resolved (known) type. */
function SubBlock({ type, sub }: { type: CbType; sub: SubProps }) {
  switch (type) {
    case "photo":
      return <CbPhoto {...sub} />;
    case "photo-inline":
      return <CbPhotoInline {...sub} />;
    case "pullquote":
      return <CbPullquote {...sub} />;
    case "list":
      return <CbList {...sub} />;
    case "badges":
      return <CbBadges {...sub} />;
    case "callout":
      return <CbCallout {...sub} />;
    case "text":
    default:
      return <CbText {...sub} />;
  }
}
