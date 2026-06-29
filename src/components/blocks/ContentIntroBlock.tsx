import * as React from "react";
import type { BlockProps } from "./types";
import { Lexical, lexicalToText } from "./Lexical";

/** ContentIntroBlock — the Golden Oaks `content-intro` section: a single large
 *  lead paragraph (20px/1.8) with a decorative Libre-Baskerville drop cap on
 *  its first letter, placed immediately after a hero. Sits on a near-white
 *  band with a faint, centered `branch-pattern.png` overlay (the mockup
 *  `.has-branch-bg` modifier) tinted via the `--color-leaf-pattern-tint` token.
 *
 *  Mirrors `components/content-intro/content-intro.html` (in situ:
 *  `pages/magnolia.html` #intro → `.content-intro > p.has-drop-cap`).
 *
 *  Data-flow convention:
 *    - `body` (lexical) is the lead prose. The FIRST paragraph carries the drop
 *      cap (the `.has-drop-cap` analogue). Empty body ⇒ the GO default copy.
 *    - `title` renders nothing visually here (the mockup intro has none); the
 *      prop stays wired for editability and, if seeded, surfaces as a small
 *      overline (the P0 `.overline` utility) above the prose.
 *    - `settings.background` may swap the default `.has-branch-bg` band for a
 *      P0 section surface (cream/sage/light/sand).
 *
 *  The drop cap, prose color, and branch tint are all token-driven, so the P0
 *  `--color-primary` flip-test re-themes the cap. */

const DEFAULT_BODY =
  "At Golden Oaks, we believe that finding the right living space is deeply personal. That's why we offer a range of thoughtfully designed floor plans across all care levels — from spacious two-bedroom suites with premium finishes to efficient studios perfect for those who prefer simplicity. Every plan includes our full suite of services and support, so you can focus on enjoying life. Our transparent pricing means no surprises — what you see is what you get.";

/** Map `settings.background` to a P0 section-surface utility. `undefined`
 *  (the default) keeps the mockup's `.has-branch-bg` near-white band. */
const BACKGROUND_CLASS: Record<string, string> = {
  base: "has-branch-bg",
  surface: "section-cream",
  cream: "section-cream",
  sage: "section-sage",
  light: "section-light",
  sand: "section-sand",
};

export function ContentIntroBlock({ title, body, settings }: BlockProps) {
  const hasBody = Boolean(body?.root?.children?.length);
  const bg = settings?.background
    ? (BACKGROUND_CLASS[settings.background] ?? "has-branch-bg")
    : "has-branch-bg";

  return (
    <section
      data-nocms-component="content-intro"
      className={`${bg} py-20 [@media(max-width:768px)]:py-12`}
    >
      <div className="container mx-auto max-w-[1200px] px-10 [@media(max-width:480px)]:px-5">
        {title && (
          <p
            data-role="overline"
            data-payload-subfield="title"
            className="overline text-center"
          >
            {title}
          </p>
        )}
        {/* `.content-intro` (globals.css P0/P2) = 20px/1.8 neutral-700 prose,
            dropping to 16px/1.7 ≤480 — reused, not duplicated. The drop cap is
            a Tailwind `first-letter:` chain scoped to the FIRST paragraph
            (`[&_p:first-of-type]`) so it lands on the lead `<p>` whether the
            body is rendered via `<Lexical>` (paragraphs nested in a wrapper) or
            the plain fallback. 4.5rem serif primary cap → 3.2rem ≤480; all
            token-driven (`first-letter:text-primary`), so the P0 primary flip
            re-themes it. */}
        <div className="content-intro [&_p:first-of-type]:first-letter:float-left [&_p:first-of-type]:first-letter:mr-2 [&_p:first-of-type]:first-letter:mt-1.5 [&_p:first-of-type]:first-letter:font-heading [&_p:first-of-type]:first-letter:text-[4.5rem] [&_p:first-of-type]:first-letter:font-bold [&_p:first-of-type]:first-letter:leading-[0.8] [&_p:first-of-type]:first-letter:text-primary [@media(max-width:480px)]:[&_p:first-of-type]:first-letter:mt-1 [@media(max-width:480px)]:[&_p:first-of-type]:first-letter:text-[3.2rem]">
          {hasBody ? (
            <Lexical value={body} subfield="body" />
          ) : (
            <p data-payload-subfield="body">{lexicalToText(body) || DEFAULT_BODY}</p>
          )}
        </div>
      </div>
    </section>
  );
}
