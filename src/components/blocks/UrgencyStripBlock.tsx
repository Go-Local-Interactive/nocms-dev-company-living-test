import * as React from "react";
import { Phone } from "lucide-react";
import type { BlockProps } from "./types";
import { lexicalToText } from "./Lexical";
import skinConfig from "@/skin.config";

/** UrgencyStripBlock — warm inline phone-CTA bar pages drop between content
 *  sections to offer a shortcut to human help. Mirrors the Golden Oaks
 *  `urgency-strip`: secondary-light field with a left accent border, a phone
 *  icon circle, heading + body, a click-to-call button, and a callback
 *  promise.
 *
 *  Copy is CMS-driven — `title` (heading), `body` (description, lexical), and
 *  the callback promise (rides on `settings.variant` is NOT used here; the
 *  promise is the block's optional `blockName`-independent third field). The
 *  phone number comes from `skinConfig.contactPhone` so it stays in sync with
 *  the rest of the chrome. Defaults render the Golden Oaks copy when empty.
 *
 *  Row → stacked (`md:flex-col`) at 768 with full-width actions; tighter
 *  spacing at 480. */

const DEFAULTS = {
  heading: "Need Help Sooner?",
  body: "If your situation is urgent, we're here for you. Call us directly and we'll prioritize your family's needs.",
  callback: "We'll call back within 2 hours",
};

/** `(555) 867-5309` → `+15558675309`-ish tel: target (digits only, leading +). */
function telHref(display: string | undefined): string {
  const digits = (display ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "tel:";
}

export function UrgencyStripBlock({ title, body, items }: BlockProps) {
  const heading = title || DEFAULTS.heading;
  const copy = lexicalToText(body) || DEFAULTS.body;
  // Callback promise is editable via the first item's label (keeps the atomic
  // schema flat — title/body/items only).
  const callback = items?.[0]?.label || DEFAULTS.callback;

  const phoneDisplay = skinConfig.contactPhone ?? "";

  return (
    <section
      data-nocms-component="urgency-strip"
      className="px-6 sm:px-10 lg:px-16"
    >
      <div className="max-w-7xl mx-auto my-12 [@media(max-width:480px)]:my-8 flex items-center justify-between gap-6 rounded-md bg-secondary-light border-l-[5px] border-secondary p-6 px-8 max-md:flex-col max-md:items-start max-md:gap-4 [@media(max-width:480px)]:p-5">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex-shrink-0 h-11 w-11 rounded-full bg-secondary flex items-center justify-center"
          >
            <Phone className="h-[22px] w-[22px] text-white" strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <h4
              data-role="heading"
              data-payload-subfield="title"
              className="font-heading text-lg font-bold text-text leading-snug"
            >
              {heading}
            </h4>
            <p
              data-role="subheading"
              data-payload-subfield="body"
              className="mt-0.5 font-body text-base text-text/80 leading-relaxed"
            >
              {copy}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 max-md:w-full max-md:flex-col max-md:items-start">
          <a
            href={telHref(phoneDisplay)}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-md bg-accent-dark px-6 py-3 font-body text-lg font-bold text-white transition-all duration-300 hover:bg-secondary-dark hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-dark focus-visible:ring-offset-2 max-md:w-full" data-role="cta"
          >
            <Phone className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            <span data-payload-subfield="contactPhone">{phoneDisplay}</span>
          </a>
          <span
            data-role="caption"
            data-payload-subfield="items.0.label"
            className="font-body text-base font-semibold text-secondary-dark whitespace-nowrap"
          >
            {callback}
          </span>
        </div>
      </div>
    </section>
  );
}
