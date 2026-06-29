import * as React from "react";
import type { BlockProps } from "./types";
import { lexicalToText, lexicalListItems } from "./Lexical";
import skinConfig from "@/skin.config";
import { SplitFormBlock } from "./SplitFormBlock";

/** TourFormBlock — the Golden Oaks `tour-form`. ONE slug, two skins via
 *  `settings.variant`:
 *
 *    - `stacked` (default) — the two-column heading + intro + selling-points /
 *      form-card "Schedule a Tour" inquiry SECTION (this file). JS-free; the
 *      form posts to `/api/tour-inquiry` (a placeholder route consumers wire to
 *      their backend). HTML5 required + type validation is the only client check.
 *    - `split` — the full-page "Schedule a Tour" split-screen wizard
 *      (`SplitFormBlock`, a `"use client"` island): a 3-step form on the left,
 *      a sticky crossfading slideshow on the right. See `SplitFormBlock.tsx`.
 *
 *  Read defensively (`settings?.variant ?? "stacked"`) so an un-migrated doc
 *  with no `settings` still renders the stacked section.
 *
 *  Data-flow (stacked):
 *    - Lexical body paragraph → intro copy under the heading.
 *    - Lexical body list items → selling-point bullets in the left column.
 *      Falls back to DEFAULT_SELLING_POINTS when none authored.
 *    - The "Community of Interest" select seeds its first option with
 *      `skinConfig.brandName` so single-property skins read naturally;
 *      multi-property tenants can override the option list in a later pass.
 *
 *  Token-only colors (both variants): inputs `border-text/15`, focus
 *  `border-primary`/`ring-primary/15`, submit `bg-secondary` terracotta. The
 *  `--color-primary` flip re-themes the lot. */

const DEFAULT_INTRO =
  "Take a walk through our community, meet the team, and see for yourself what makes this feel like home. Tell us a bit about your visit and we'll be in touch within one business day.";

const DEFAULT_SELLING_POINTS = [
  "Private, unhurried walk-throughs led by our admissions team",
  "Meet staff and residents — ask anything, no pressure",
  "Sample the dining room and tour available residences",
  "Confirmation within one business day",
];

/** Shared `.form-group` field classes (mockup `.form-group input/select`). */
const INPUT_CLASS =
  "w-full appearance-none rounded-[var(--radius)] border-2 border-text/15 bg-background px-4 py-3.5 font-body text-base text-text transition-[border-color,box-shadow] placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15";

export function TourFormBlock(props: BlockProps) {
  const variant = props.settings?.variant ?? "stacked";
  if (variant === "split") return <SplitFormBlock {...props} data-nocms-component="tour-form-block" />;
  return <StackedTourForm {...props} />;
}

function StackedTourForm({ title, body }: BlockProps) {
  const intro = lexicalToText(body) || DEFAULT_INTRO;
  const items = lexicalListItems(body);
  const sellingPoints = items.length > 0 ? items : DEFAULT_SELLING_POINTS;
  const heading = title || `See ${skinConfig.brandName} for Yourself`;
  const brandName = skinConfig.brandName;

  return (
    <section
      data-nocms-component="tour-form"
      className="bg-surface px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 md:grid-cols-2 lg:gap-16">
        {/* Left: heading + intro + selling points */}
        <div>
          <h2
            data-role="heading"
            data-payload-subfield="title"
            className="font-heading text-4xl font-bold tracking-tight text-text sm:text-5xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {heading}
          </h2>
          <p
            data-role="subheading"
            data-payload-subfield="body"
            className="mt-5 font-body text-lg leading-relaxed text-muted"
          >
            {intro}
          </p>
          <ul className="mt-8 space-y-4">
            {sellingPoints.map((pt, i) => (
              <li
                key={`${i}-${pt.slice(0, 24)}`}
                data-array-index={i}
                className="flex items-start gap-3 font-body text-base text-text"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="mt-1 h-5 w-5 flex-shrink-0 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form card */}
        <div className="rounded-2xl border border-text/5 bg-background p-8 shadow-xl sm:p-12">
          <form action="/api/tour-inquiry" method="post" className="space-y-5">
            <div>
              <label
                htmlFor="tour-name"
                className="mb-1.5 block font-body text-base font-semibold text-text" data-role="text"
              >
                Your Name
              </label>
              <input
                type="text"
                id="tour-name"
                name="name"
                required
                placeholder="First and last name"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tour-email"
                  className="mb-1.5 block font-body text-base font-semibold text-text" data-role="text-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="tour-email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label
                  htmlFor="tour-phone"
                  className="mb-1.5 block font-body text-base font-semibold text-text" data-role="text-3"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="tour-phone"
                  name="phone"
                  placeholder="(555) 000-0000"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tour-date"
                  className="mb-1.5 block font-body text-base font-semibold text-text" data-role="text-4"
                >
                  Preferred Date
                </label>
                <input
                  type="date"
                  id="tour-date"
                  name="preferredDate"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label
                  htmlFor="tour-community"
                  className="mb-1.5 block font-body text-base font-semibold text-text" data-role="text-5"
                >
                  Community of Interest
                </label>
                <select
                  id="tour-community"
                  name="community"
                  defaultValue={brandName}
                  className={INPUT_CLASS}
                >
                  <option value={brandName}>{brandName}</option>
                  <option value="not-sure">Not sure yet</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="tour-message"
                className="mb-1.5 block font-body text-base font-semibold text-text" data-role="text-6"
              >
                Anything we should know?{" "}
                <span className="font-normal text-muted" data-role="text-7">(optional)</span>
              </label>
              <textarea
                id="tour-message"
                name="message"
                rows={4}
                placeholder="Questions, accessibility needs, who's visiting..."
                className={`${INPUT_CLASS} resize-y`}
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary w-full px-6 py-4 font-heading text-base" data-role="cta"
            >
              Schedule a Tour
            </button>

            <p className="text-center font-body text-base leading-relaxed text-muted" data-role="subheading-2">
              No commitment — just a friendly visit. We&apos;ll confirm your
              time within one business day.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
