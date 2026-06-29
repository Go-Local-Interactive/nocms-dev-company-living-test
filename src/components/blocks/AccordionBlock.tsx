import * as React from "react";
import type { BlockProps } from "./types";
import { lexicalToText, lexicalQAPairs, lexicalQACategories } from "./Lexical";
import { TabbedAccordion, type FaqCategory } from "./TabbedAccordion";

/** AccordionBlock — the Golden Oaks `accordion`. ONE slug, two skins via
 *  `settings.variant`:
 *
 *    - `accordion` (default) — a vertical stack of native `<details>`
 *      disclosure widgets (this file). JS-free: the browser handles open/close,
 *      the chevron rotates via the `group-open:` Tailwind state.
 *    - `tabbed` — the FAQ layout (`TabbedAccordion`, a `"use client"` island):
 *      a sage pill tab bar + inline search above the category-grouped accordion.
 *      See `TabbedAccordion.tsx`.
 *
 *  Read defensively (`settings?.variant ?? "accordion"`) so an un-migrated doc
 *  with no `settings` still renders the flat list.
 *
 *  Items = editable repeatable atoms (DO NOT change the contract):
 *    - Body lexical heading/paragraph pairs (heading → question, paragraph →
 *      answer) become accordion items via `lexicalQAPairs` (or, for `tabbed`,
 *      `lexicalQACategories` which groups by top-level `h2`).
 *    - The lexical container keeps `data-payload-subfield="body"`; each item
 *      keeps `data-array-index={i}`.
 *    - Empty body ⇒ the GO default FAQs (`DEFAULT_FAQ_CATEGORIES`).
 *    - The block's `title` is the section heading.
 *
 *  Token-only colors (both variants): card `bg-background`, `border-text/10`,
 *  hover `border-primary/30`, chevron `group-open:text-primary`. The
 *  `--color-primary` flip re-themes the lot. */

/** The GO default FAQs, grouped by the 6 mockup categories. Used by the
 *  `tabbed` variant directly and flattened by the `accordion` variant. */
export const DEFAULT_FAQ_CATEGORIES: FaqCategory[] = [
  {
    category: "Cost & Finances",
    items: [
      {
        q: "What does it cost to live here?",
        a: "Monthly rates vary by floor plan and level of care. Independent Living starts at $3,200/month, Assisted Living at $4,800/month, and Memory Care at $6,200/month — each including a comprehensive package of services, amenities, and care support.",
      },
      {
        q: "What is included in the monthly fee?",
        a: "Your private residence, three chef-prepared meals daily, all utilities, weekly housekeeping, full amenity access, 50+ monthly activities, scheduled transportation, and 24/7 on-site nursing and emergency response.",
      },
      {
        q: "Do you accept long-term care insurance?",
        a: "Yes — we work with most major long-term care insurance providers, and our billing team helps you understand your benefits and assists with claims from day one.",
      },
    ],
  },
  {
    category: "Daily Life",
    items: [
      {
        q: "What does a typical day look like?",
        a: "As active or relaxed as you like — morning fitness or yoga, a creative arts workshop, lunch with friends, an afternoon lecture or book club, happy hour on the terrace, and evening entertainment. There's always something happening, but you're never obligated to join.",
      },
      {
        q: "Can I bring my own furniture and belongings?",
        a: "Absolutely. We encourage residents to personalize their apartments with their own furniture, artwork, photos, and treasured belongings — your apartment is your home.",
      },
      {
        q: "Are pets allowed?",
        a: "Yes, we are a pet-friendly community. Small to medium dogs and cats are welcome in all living areas, subject to our pet policy guidelines.",
      },
    ],
  },
  {
    category: "Care & Health",
    items: [
      {
        q: "What levels of care do you offer?",
        a: "A full continuum — Independent Living, Assisted Living, Memory Care, and Respite / Short-Term Care — so you never have to leave the community you call home as needs change.",
      },
      {
        q: "Is there a nurse on-site 24/7?",
        a: "Yes. Licensed nursing staff are on-site around the clock, 365 days a year — RNs, LPNs, and CNAs — with a physician medical director overseeing all clinical programs.",
      },
      {
        q: "How do you handle medication management?",
        a: "Our nursing staff provides secure storage, timely administration per physician orders, regular pharmacist reviews, and detailed electronic documentation (eMAR) for accuracy.",
      },
    ],
  },
  {
    category: "Moving In",
    items: [
      {
        q: "How quickly can I move in?",
        a: "Most families complete the process within 2 to 4 weeks from first visit to move-in day. For urgent situations — a hospital discharge or sudden caregiver need — we can expedite within days.",
      },
      {
        q: "Can I tour the community before deciding?",
        a: "Absolutely — we encourage it. We offer in-person tours, virtual tours, Lunch & Learn visits, and overnight respite stays so you can experience community life firsthand.",
      },
    ],
  },
  {
    category: "Visiting & Family",
    items: [
      {
        q: "Can family and friends visit anytime?",
        a: "Yes. General visiting hours are 8:00 AM to 8:00 PM daily, and we're flexible about timing. We have private dining rooms, family lounges, and beautiful outdoor spaces for gatherings.",
      },
      {
        q: "Can family members join for meals?",
        a: "We love when families join us. Guest dining is available in our Main Dining Room and Bistro, and our Private Dining Room can be reserved for special occasions.",
      },
    ],
  },
  {
    category: "Our Community",
    items: [
      {
        q: "Is Golden Oaks licensed and accredited?",
        a: "Yes — fully licensed by the state Department of Health and accredited by leading industry organizations. We maintain an open-door policy with our inspection reports.",
      },
      {
        q: "What sets you apart from other communities?",
        a: "A full continuum of care, local ownership, low staff turnover, chef-driven dining, beautiful grounds, and transparent pricing with no hidden fees or surprise increases.",
      },
    ],
  },
];

/** Flat fallback for the `accordion` variant (first item of each category). */
const DEFAULT_FAQS_FLAT = DEFAULT_FAQ_CATEGORIES.flatMap((c) => c.items);

export function AccordionBlock(props: BlockProps) {
  const variant = props.settings?.variant ?? "accordion";

  const { title, body } = props;
  const overrides = lexicalQAPairs(body);
  const hasOverrides = overrides.length > 0;
  const intro = hasOverrides ? undefined : lexicalToText(body) || undefined;

  if (variant === "tabbed") {
    const authoredCats = lexicalQACategories(body);
    const categories: FaqCategory[] =
      authoredCats.length > 0 ? authoredCats : DEFAULT_FAQ_CATEGORIES;
    return (
      <TabbedAccordion
        categories={categories}
        title={title ?? undefined}
        intro={intro} data-nocms-component="accordion-block"
      />
    );
  }

  // ── accordion (default): flat native <details> list ──
  const items = hasOverrides ? overrides : DEFAULT_FAQS_FLAT;

  return (
    <section
      data-nocms-component="accordion"
      className="bg-surface px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-3xl">
        {(title || intro) && (
          <div className="mx-auto mb-12 max-w-3xl text-center">
            {title && (
              <h2
                data-role="heading"
                data-payload-subfield="title"
                className="font-heading text-4xl font-bold tracking-tight text-text sm:text-5xl"
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
        <div data-payload-subfield="body" className="flex flex-col gap-3">
          {items.map((item, i) => (
            <details
              key={i}
              data-array-index={i}
              className="group overflow-hidden rounded-[var(--radius)] border border-text/10 bg-background transition-[box-shadow,border-color] hover:border-primary/30 hover:shadow-md"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-body text-lg font-semibold text-neutral-900 transition-colors hover:text-primary-dark [@media(max-width:768px)]:px-5 [@media(max-width:768px)]:py-4 [@media(max-width:768px)]:text-base">
                <span>{item.q}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 flex-shrink-0 text-neutral-500 transition-transform duration-300 group-open:rotate-180 group-open:text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <p className="px-6 pb-6 font-body text-base leading-[1.7] text-neutral-700 [@media(max-width:768px)]:px-5 [@media(max-width:768px)]:pb-5" data-role="subheading-2">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
