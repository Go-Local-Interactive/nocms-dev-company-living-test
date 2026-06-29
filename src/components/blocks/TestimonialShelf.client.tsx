"use client";

import * as React from "react";

/**
 * TestimonialShelfTrack — the marquee island for the testimonial `shelf`
 * variant (homepage `.testimonials-section .shelf-track`). The renderer emits
 * the static, editable `.go-shelf-track` of review cards as a server component;
 * this island only owns the auto-scroll seam: on mount it clones the original
 * cards once (marked `aria-hidden`, inert to AT + tab) and appends them so the
 * CSS `go-shelf-scroll` animation (translateX → -50%) loops seamlessly. The
 * scroll itself, the pause-on-hover, and the `prefers-reduced-motion` opt-out
 * all live in the global `.go-shelf-track` CSS — not here.
 *
 * Degrades gracefully: with JS disabled the static track still renders all the
 * cards (the global CSS animation simply scrolls the single, un-duplicated set;
 * the reduced-motion media query stops it entirely). No hex / rgba here — the
 * island sets no styles, only structure.
 */
export function TestimonialShelfTrack({ children }: { children: React.ReactNode }) {
  const trackRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (track.dataset.cloned === "true") return;

    // Snapshot the original (editable) cards, then append aria-hidden clones so
    // the -50% scroll wraps without a visible jump.
    const originals = Array.from(track.children);
    for (const node of originals) {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("data-clone", "true");
      // Strip every editor-binding hook (self + descendants) so the duplicated
      // cards aren't treated as extra inline-edit / array targets.
      [clone, ...Array.from(clone.querySelectorAll("*"))].forEach((el) => {
        el.removeAttribute("data-payload-subfield");
        el.removeAttribute("data-array-index");
        el.removeAttribute("data-array-prop");
        el.removeAttribute("data-nocms-component");
      });
      // Keep clones out of the tab order.
      clone.querySelectorAll("a, button, [tabindex]").forEach((el) => {
        el.setAttribute("tabindex", "-1");
      });
      track.appendChild(clone);
    }
    track.dataset.cloned = "true";
  }, []);

  return (
    <div ref={trackRef} className="go-shelf-track" data-nocms-component="testimonial-shelf.client">
      {children}
    </div>
  );
}
