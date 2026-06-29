"use client";

import * as React from "react";

/**
 * Animated mouse-icon scroll cue (mockup `.scroll-cue`). Decorative: smooth-
 * scrolls to the next section below the hero on click. Styling + the
 * `scrollBounce` / `wheelPulse` animations live in `globals.css` (`.scroll-cue`),
 * so this only owns the click behaviour. `aria-label` keeps it accessible;
 * the SVG is presentational.
 */
export function ScrollCue() {
  const ref = React.useRef<HTMLButtonElement>(null);

  function handleClick() {
    const heroSection = ref.current?.closest("section");
    const next = heroSection?.nextElementSibling as HTMLElement | null;
    (next ?? heroSection?.parentElement)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="mt-12 flex justify-center" data-nocms-component="scroll-cue.client">
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className="scroll-cue"
        aria-label="Scroll to learn more"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="3" width="12" height="18" rx="6" ry="6" />
          <rect className="scroll-wheel" x="11" y="7" width="2" height="4" rx="1" />
        </svg>
      </button>
    </div>
  );
}
