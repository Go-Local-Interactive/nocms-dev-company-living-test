"use client";

import * as React from "react";
import { Facebook, Twitter, Linkedin, Link2, Printer } from "lucide-react";

/**
 * ArticleShare — the article's social share rail (mockup `.article-social`),
 * a client island for the copy-link + print actions. Renders a sticky vertical
 * rail on desktop (rotated "Share" label) that collapses to a horizontal row
 * ≤768. Facebook / Twitter / LinkedIn are real share-intent links built from
 * the live page URL + title; copy-link writes to the clipboard and flashes a
 * "Copied!" tooltip; print calls `window.print()`.
 *
 * Token-only chrome (44px circles, neutral border → primary on hover). No
 * editable fields — this is article chrome, not post content.
 */

const LINK_BASE =
  "relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-neutral-300 bg-transparent text-muted no-underline transition-[border-color,color,background] hover:border-primary hover:bg-primary-light hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function ArticleShare({ title }: { title: string }) {
  const [copied, setCopied] = React.useState(false);
  const [url, setUrl] = React.useState("");

  React.useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareText = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);

  const onCopy = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const href = url || (typeof window !== "undefined" ? window.location.href : "");
      navigator.clipboard?.writeText(href).then(
        () => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        },
        () => {},
      );
    },
    [url],
  );

  const onPrint = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    window.print();
  }, []);

  return (
    <aside
      data-nocms-component="article-share"
      aria-label="Share this article"
      className="flex flex-col items-center gap-4 pt-2 min-[769px]:sticky min-[769px]:top-24 [@media(max-width:768px)]:flex-row [@media(max-width:768px)]:border-b [@media(max-width:768px)]:border-neutral-200 [@media(max-width:768px)]:pb-6 [@media(max-width:768px)]:mb-8"
    >
      <span className="mb-2 text-base font-semibold uppercase tracking-[0.06em] text-muted [writing-mode:vertical-rl] [transform:rotate(180deg)] [@media(max-width:768px)]:mb-0 [@media(max-width:768px)]:[writing-mode:horizontal-tb] [@media(max-width:768px)]:[transform:none]">
        Share
      </span>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={LINK_BASE}
      >
        <Facebook className="h-5 w-5" aria-hidden="true" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        className={LINK_BASE}
      >
        <Twitter className="h-5 w-5" aria-hidden="true" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={LINK_BASE}
      >
        <Linkedin className="h-5 w-5" aria-hidden="true" />
      </a>

      <div className="h-px w-6 bg-neutral-200 [@media(max-width:768px)]:h-6 [@media(max-width:768px)]:w-px" aria-hidden="true" />

      <button type="button" onClick={onCopy} aria-label="Copy link" className={LINK_BASE}>
        <span
          role="status"
          className={`absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[6px] bg-neutral-900 px-3 py-1.5 text-base font-semibold text-white transition-opacity [@media(max-width:768px)]:left-1/2 [@media(max-width:768px)]:top-auto [@media(max-width:768px)]:bottom-[calc(100%+10px)] [@media(max-width:768px)]:-translate-x-1/2 [@media(max-width:768px)]:translate-y-0 ${
            copied ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          Copied!
        </span>
        <Link2 className="h-5 w-5" aria-hidden="true" />
      </button>

      <button type="button" onClick={onPrint} aria-label="Print article" className={LINK_BASE}>
        <Printer className="h-5 w-5" aria-hidden="true" />
      </button>
    </aside>
  );
}
