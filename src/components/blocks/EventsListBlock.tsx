import * as React from "react";
import type { BlockProps } from "./types";
import { lexicalToText, lexicalQAPairs } from "./Lexical";

/** EventsListBlock — vertical list of upcoming events used on the
 *  Activities & Events page. Modeled on amber-hollow's `.event-card` layout
 *  but flattened to a row-per-event with a left-side date chip (month + day)
 *  and right-side title + time + description column.
 *
 *  Data-flow convention:
 *    - Each heading/paragraph pair is one event: h3 = event title, paragraph
 *      = "Month Day · Time · Description" (split on `·` or `|`). Whatever
 *      pieces are present are surfaced; missing pieces fall back.
 *    - Empty body falls back to the 4 default upcoming events below.
 *    - The block's `title` is the section heading. */

interface EventItem {
  month: string;
  day: string;
  title: string;
  time: string;
  description: string;
}

const DEFAULT_EVENTS: EventItem[] = [
  {
    month: "Jun",
    day: "12",
    title: "Summer Garden Party",
    time: "3:00 – 5:00 PM",
    description: "Live jazz trio on the lawn, lemonade, and seasonal small plates from our kitchen. Families welcome.",
  },
  {
    month: "Jun",
    day: "19",
    title: "Father's Day Brunch",
    time: "10:00 AM – 1:00 PM",
    description: "A multi-generational brunch in the main dining room — carving station, mimosas, and a photo booth.",
  },
  {
    month: "Jun",
    day: "26",
    title: "Watercolor Workshop",
    time: "2:00 – 4:00 PM",
    description: "Local artist Linda Park guides a relaxed afternoon of botanical watercolors. All supplies provided.",
  },
  {
    month: "Jul",
    day: "04",
    title: "Independence Day Cookout",
    time: "5:00 – 8:00 PM",
    description: "Classic Americana cookout on the back patio with live music, lawn games, and a sunset firework view.",
  },
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parseDate(token: string): { month: string; day: string } | null {
  const t = token.trim();
  for (let i = 0; i < 12; i++) {
    const re = new RegExp(`^(?:${MONTHS[i]}|${MONTH_NAMES[i]})\\s+(\\d{1,2})\\b`, "i");
    const m = t.match(re);
    if (m) return { month: MONTHS[i].slice(0, 3).replace(/^./, (c) => c.toUpperCase()), day: m[1].padStart(2, "0") };
  }
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return { month: MONTHS[Number(iso[2]) - 1]?.slice(0, 3).replace(/^./, (c) => c.toUpperCase()) ?? "", day: iso[3] };
  return null;
}

// A real clock-time token: an optional range of times like "3:00 – 5:00 PM"
// or "10am". Must START with a clock time and stay short — prose like
// "Doors open at 6pm sharp" has leading words and so is NOT classified as time.
const TIME_RE = /^\s*\d{1,2}(:\d{2})?\s*(am|pm)?\s*(?:[–—-]\s*\d{1,2}(:\d{2})?\s*(am|pm)?)?\s*$/i;

function parseMeta(line: string, fallback: EventItem): Omit<EventItem, "title"> {
  const parts = line.split(/\s*[·|]\s*/).filter(Boolean);
  let month = "";
  let day = "";
  let time = fallback.time;
  const descParts: string[] = [];

  for (const part of parts) {
    const date = parseDate(part);
    if (date && !month) {
      month = date.month;
      day = date.day;
    } else if (TIME_RE.test(part) && time === fallback.time) {
      time = part.trim();
    } else {
      descParts.push(part.trim());
    }
  }

  return {
    month,
    day,
    time,
    description: descParts.join(" · ") || fallback.description,
  };
}

export function EventsListBlock({ title, body }: BlockProps) {
  const overrides = lexicalQAPairs(body);
  const hasOverrides = overrides.length > 0;
  const intro = hasOverrides ? undefined : lexicalToText(body) || undefined;

  const events: EventItem[] = hasOverrides
    ? overrides.map((o, i) => {
        const fallback = DEFAULT_EVENTS[i] ?? DEFAULT_EVENTS[0];
        const meta = parseMeta(o.a, fallback);
        return { title: o.q || fallback.title, ...meta };
      })
    : DEFAULT_EVENTS;

  return (
    <section
      data-nocms-component="events-list"
      className="py-20 px-6 sm:px-10 lg:px-16 bg-background"
    >
      <div className="max-w-4xl mx-auto">
        {(title || intro) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {title && (
              <h2
                data-role="heading"
                data-payload-subfield="title"
                className="font-heading text-4xl sm:text-5xl font-bold text-text tracking-tight"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                {title}
              </h2>
            )}
            {intro && (
              <p
                data-role="subheading"
                data-payload-subfield="body"
                className="mt-4 font-body text-lg text-muted leading-relaxed"
              >
                {intro}
              </p>
            )}
          </div>
        )}
        <ol
          data-payload-subfield="body"
          className="flex flex-col divide-y divide-text/10 border-y border-text/10"
        >
          {events.map((evt, i) => (
            <li
              key={i}
              data-array-index={i}
              className="grid grid-cols-[5rem_1fr] sm:grid-cols-[6rem_1fr] gap-5 sm:gap-7 py-6 group hover:bg-surface/50 transition-colors px-2 sm:px-4"
            >
              <div className="flex flex-col items-center justify-center rounded-xl bg-primary/10 border border-primary/15 py-3">
                {evt.month && (
                  <span className="font-body text-xs font-bold uppercase tracking-widest text-primary">
                    {evt.month}
                  </span>
                )}
                {evt.day && (
                  <span
                    className="font-heading text-3xl sm:text-4xl font-bold text-text leading-none mt-1"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {evt.day}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-xl sm:text-2xl font-semibold text-text leading-tight group-hover:text-primary transition-colors" data-role="heading-2">
                  {evt.title}
                </h3>
                {evt.time && (
                  <p className="mt-1 font-body text-sm font-medium text-primary">
                    {evt.time}
                  </p>
                )}
                {evt.description && (
                  <p className="mt-2 font-body text-base text-muted leading-relaxed" data-role="subheading-2">
                    {evt.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
