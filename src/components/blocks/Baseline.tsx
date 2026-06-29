import * as React from "react";
import type { BlockProps } from "./types";
import { Lexical, lexicalToText, lexicalQAPairs } from "./Lexical";
import { mediaUrl, mediaAlt } from "@/lib/payload";

/** Baseline renderers — visually-simple but data-tagged implementations for
 *  the cross-vertical block slugs. Each consumes the atomic block shape and
 *  emits `data-nocms-component` on its root plus `data-payload-subfield` on
 *  bound elements so the nocms inspector can resolve clicks to fields. */

/** Banner — image + text side-by-side. */
export function BannerBlock({ title, body, media }: BlockProps) {
  const img = mediaUrl(media);
  return (
    <section data-nocms-component="banner" className="bg-surface py-16 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {img && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={img}
            alt={mediaAlt(media)}
            className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-md"
            data-payload-subfield="media" data-role="media"
          />
        )}
        <div>
          {title && (
            <h2
              data-payload-subfield="title"
              className="font-heading text-3xl sm:text-4xl font-semibold text-text mb-4" data-role="heading"
            >
              {title}
            </h2>
          )}
          <Lexical value={body} className="prose prose-base text-muted" />
        </div>
      </div>
    </section>
  );
}

/** Content — centered prose. */
export function ContentBlock({ title, body }: BlockProps) {
  return (
    <section data-nocms-component="content" className="bg-background py-16 px-6 sm:px-10 lg:px-16">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2
            data-payload-subfield="title"
            className="font-heading text-3xl sm:text-4xl font-semibold text-text mb-6" data-role="heading-2"
          >
            {title}
          </h2>
        )}
        <Lexical value={body} className="prose prose-base text-muted" />
      </div>
    </section>
  );
}

/** Row-group — two-column body layout. */
export function RowGroupBlock({ title, body }: BlockProps) {
  return (
    <section data-nocms-component="row-group" className="bg-background py-16 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2
            data-payload-subfield="title"
            className="font-heading text-3xl font-semibold text-text mb-8 text-center" data-role="heading-3"
          >
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Lexical value={body} className="prose prose-base text-muted" />
        </div>
      </div>
    </section>
  );
}

/** Code — monospaced block, lexical flattened to text. */
export function CodeBlock({ title, body }: BlockProps) {
  const text = lexicalToText(body);
  return (
    <section data-nocms-component="code" className="bg-background py-12 px-6 sm:px-10 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2
            data-payload-subfield="title"
            className="font-heading text-xl font-semibold text-text mb-3" data-role="heading-4"
          >
            {title}
          </h2>
        )}
        <pre
          className="bg-text text-white rounded-lg p-6 overflow-x-auto"
          data-payload-subfield="body"
        >
          <code className="font-mono text-sm">{text}</code>
        </pre>
      </div>
    </section>
  );
}

/** Faq — heading/paragraph pairs from lexical fold into accordion items. */
export function FaqBlock({ title, body }: BlockProps) {
  const pairs = lexicalQAPairs(body);
  return (
    <section data-nocms-component="faq" className="bg-surface py-20 px-6 sm:px-10 lg:px-16">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2
            data-payload-subfield="title"
            className="font-heading text-3xl sm:text-4xl font-semibold text-text text-center mb-12" data-role="heading-5"
          >
            {title}
          </h2>
        )}
        {pairs.length > 0 ? (
          <div
            className="divide-y divide-text/10 border-y border-text/10"
            data-payload-subfield="body"
          >
            {pairs.map((p, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none font-heading text-lg font-semibold text-text">
                  <span>{p.q}</span>
                  <span className="text-2xl text-primary transition-transform group-open:rotate-45 select-none leading-none" data-role="text">
                    +
                  </span>
                </summary>
                <p className="mt-3 font-body text-base text-muted leading-relaxed" data-role="subheading">{p.a}</p>
              </details>
            ))}
          </div>
        ) : (
          <Lexical value={body} className="prose prose-base text-muted" />
        )}
      </div>
    </section>
  );
}

/** Media-block — single image with optional caption. */
export function MediaBlockBlock({ title, media }: BlockProps) {
  const img = mediaUrl(media);
  return (
    <section data-nocms-component="media-block" className="bg-background py-12 px-6 sm:px-10 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {img ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={img}
            alt={mediaAlt(media)}
            className="w-full h-auto rounded-2xl shadow-md"
            data-payload-subfield="media" data-role="media-2"
          />
        ) : (
          // Placeholder keeps the block clickable so the inspector can open
          // the media picker even when no image is set yet.
          <div
            data-payload-subfield="media"
            className="aspect-[16/9] w-full rounded-2xl border-2 border-dashed border-text/15 bg-surface flex items-center justify-center text-muted"
          >
            <span className="font-body text-sm" data-role="text-2">Click to add an image</span>
          </div>
        )}
        {title && (
          <p
            data-payload-subfield="title"
            className="text-center text-sm text-muted mt-3"
          >
            {title}
          </p>
        )}
      </div>
    </section>
  );
}

/** Spacer — vertical breathing room between blocks. */
export function SpacerBlock() {
  return <div data-nocms-component="spacer" className="h-16 sm:h-24" />;
}

/** Divider — thin horizontal rule with section padding. */
export function DividerBlock() {
  return (
    <div data-nocms-component="divider" className="py-12 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <hr className="border-t border-text/10" />
      </div>
    </div>
  );
}
