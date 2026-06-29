"use client";

/**
 * HeaderNav — the interactive nav island for the site header.
 *
 * Server `Header.tsx` renders the green bar shell (logo, phone, CTA); this
 * client island owns the parts that need state, ported 1:1 from the mockup
 * `components/header/header.html` JS:
 *   - MEGA-MENU DROPDOWNS  — click toggles a group open, closes siblings,
 *     outside-click + Escape close.
 *   - HEADER SEARCH PANEL  — trigger toggles the anchored panel, Escape +
 *     outside-click close, clear button, focus the input on open.
 *   - MOBILE NAV DRAWER    — hamburger (≤ lg) opens a right-slide off-canvas
 *     panel built from the SAME `mainNav` config (accordion groups), with
 *     body-scroll-lock, "Menu" header + close, Escape / outside-click /
 *     link-click close, focus-restore to the hamburger, and a full-width
 *     terracotta CTA + phone at the bottom (mockup `.mobile-nav*`).
 *   - STICKY HEADER SCROLL — adds `is-scrolled` (shadow) past 100px and
 *     `is-hidden` (translateY -100%) on scroll-down / reveals on scroll-up.
 *
 * A single `open` state acts as the drawer coordinator (mirrors the mockup
 * `window.closeAllDrawers`): only one of {dropdown, search, mobile drawer} can
 * be open at once, since opening any one replaces the others. The priority-plus
 * "More" overflow is intentionally NOT ported — the template's fixed 5-group
 * nav fits >= 1024 (deferred; see Task 2 notes).
 *
 * All colors come from the P0 `@theme` tokens via Tailwind utilities — no hex.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X, ChevronDown, Menu, Phone } from "lucide-react";
import { mainNav, popularSearches, navIcons } from "@/lib/nav.config";
import { skinConfig } from "@/lib/skin";

/** Which single drawer is currently open. `null` = all closed. */
type OpenDrawer =
  | { kind: "dropdown"; index: number }
  | { kind: "search" }
  | { kind: "drawer" }
  | null;

function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`;
}

export function HeaderNav() {
  const [open, setOpen] = useState<OpenDrawer>(null);
  const [query, setQuery] = useState("");
  /** Which drawer accordion group is expanded (mobile). `null` = all collapsed. */
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const closeAll = useCallback(() => setOpen(null), []);

  const { contactPhone } = skinConfig;

  // ----- MEGA-MENU DROPDOWNS -----
  const toggleDropdown = useCallback((index: number) => {
    setOpen((prev) =>
      prev && prev.kind === "dropdown" && prev.index === index
        ? null
        : { kind: "dropdown", index }
    );
  }, []);

  // ----- HEADER SEARCH PANEL -----
  const toggleSearch = useCallback(() => {
    setOpen((prev) => (prev && prev.kind === "search" ? null : { kind: "search" }));
  }, []);

  const searchOpen = open?.kind === "search";

  // ----- MOBILE NAV DRAWER -----
  const drawerOpen = open?.kind === "drawer";

  const toggleDrawer = useCallback(() => {
    setOpen((prev) => (prev && prev.kind === "drawer" ? null : { kind: "drawer" }));
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen((prev) => (prev && prev.kind === "drawer" ? null : prev));
  }, []);

  const toggleGroup = useCallback((index: number) => {
    setExpandedGroup((prev) => (prev === index ? null : index));
  }, []);

  // Body-scroll-lock while the drawer is open (mockup sets body.overflow:hidden).
  // The lock toggles purely off `drawerOpen` and always resets to "" on
  // close/unmount — the header drawer is the only thing that locks body scroll,
  // so a deterministic reset avoids stranding the page unscrollable if a
  // link-click navigation races the React commit. A final unmount cleanup
  // guarantees release even on a client navigation that swaps this island out.
  //
  // Also publishes a `body[data-drawer-open]` signal (mockup hides the floating
  // Help Badge behind the open drawer via a `.mobile-nav.is-open ~ .help-badge`
  // sibling selector; our chrome is mounted as siblings in layout.tsx, so the
  // Help Badge reacts to this body attribute instead — see HelpBadge.tsx).
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    if (drawerOpen) {
      document.body.dataset.drawerOpen = "true";
    } else {
      delete document.body.dataset.drawerOpen;
    }
    return () => {
      document.body.style.overflow = "";
      delete document.body.dataset.drawerOpen;
    };
  }, [drawerOpen]);

  // Focus the input shortly after the panel opens (mirrors the mockup setTimeout).
  useEffect(() => {
    if (!searchOpen) return;
    const id = window.setTimeout(() => searchInputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [searchOpen]);

  // Outside-click closes whichever drawer is open. The mobile drawer owns the
  // full viewport (fixed overlay) and lives outside `navRef`, so its own
  // backdrop click is handled on the overlay element — here we just ignore
  // clicks while it is open so the panel itself doesn't self-close.
  useEffect(() => {
    if (!open || open.kind === "drawer") return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (navRef.current?.contains(target)) return;
      setOpen(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Escape closes and restores focus to the trigger that opened the panel
  // (search trigger for search; hamburger for the mobile drawer).
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const wasSearch = open?.kind === "search";
      const wasDrawer = open?.kind === "drawer";
      setOpen(null);
      if (wasSearch) searchTriggerRef.current?.focus();
      if (wasDrawer) hamburgerRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // ----- STICKY HEADER SCROLL EFFECT -----
  // Toggles classes on the server-rendered <header id="site-header"> element.
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        header.classList.toggle("is-scrolled", y > 100);
        if (y <= 50) {
          header.classList.remove("is-hidden");
        } else if (y > lastScrollY + 5) {
          header.classList.add("is-hidden");
        } else if (y < lastScrollY - 5) {
          header.classList.remove("is-hidden");
        }
        lastScrollY = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Primary"
        data-nocms-component="site-header-nav"
        className="ml-8 mr-6 hidden min-w-0 flex-1 items-center gap-3 lg:flex"
      >
      <ul className="flex flex-1 list-none items-center gap-8">
        {mainNav.map((group, index) => {
          const isOpen = open?.kind === "dropdown" && open.index === index;
          return (
            <li key={group.label} className="relative shrink-0 whitespace-nowrap" data-nocms-component="header-nav.client">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => toggleDropdown(index)}
                className="flex items-center gap-1.5 py-1.5 text-base font-medium leading-none text-white transition-colors hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {group.label}
                <ChevronDown
                  className={`h-[17px] w-[17px] transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              <ul
                className={`absolute top-[calc(100%+16px)] z-[1001] m-0 max-h-[calc(100vh-120px)] min-w-[380px] list-none overflow-y-auto rounded-md bg-white p-4 shadow-lg transition-[opacity,transform,visibility] duration-200 ${
                  // Mockup centers each dropdown under its trigger at wide desktop
                  // and only edge-anchors (first two left, rest right) in the tight
                  // <=1024 range to avoid viewport clipping. Our desktop nav shows
                  // >=1024, so: edge-anchor 1024-1279, center from xl (>=1280) up.
                  index < 2
                    ? "left-0 xl:left-1/2 xl:-translate-x-1/2"
                    : "right-0 xl:left-1/2 xl:right-auto xl:-translate-x-1/2"
                } ${
                  isOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-2 opacity-0"
                }`}
              >
                {group.items.map((item) => {
                  const Icon = navIcons[item.icon];
                  return (
                    <li key={`${item.href}-${item.label}`}>
                      <a
                        href={item.href}
                        className={`flex items-start gap-3.5 rounded p-4 leading-none text-text/85 transition-colors hover:bg-section-cream focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                          item.highlight
                            ? "mb-1 border-b border-text/10 pb-4"
                            : ""
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 min-w-9 items-center justify-center rounded-lg ${
                            item.highlight
                              ? "bg-primary text-white"
                              : "bg-primary-light text-primary-dark"
                          }`}
                        >
                          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className="text-base font-semibold text-text">
                            {item.label}
                          </span>
                          {item.blurb && (
                            <small
                              className={`text-base font-normal leading-snug ${
                                item.highlight
                                  ? "font-semibold text-primary-dark"
                                  : "text-muted"
                              }`}
                            >
                              {item.blurb}
                            </small>
                          )}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>

      {/* ----- Search trigger + anchored panel ----- */}
      <div ref={searchWrapRef} className="relative inline-flex">
        <button
          ref={searchTriggerRef}
          type="button"
          aria-label="Search"
          title="Search"
          aria-expanded={searchOpen}
          aria-controls="header-search-panel"
          aria-haspopup="dialog"
          onClick={toggleSearch}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 aria-expanded:bg-white/20 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-sand"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>

        <div
          id="header-search-panel"
          role="dialog"
          aria-label="Site search"
          aria-modal="false"
          hidden={!searchOpen}
          className={`absolute right-0 top-[calc(100%+12px)] z-[1100] w-[400px] max-w-[calc(100vw-32px)] rounded-md bg-white shadow-lg transition-[opacity,transform] duration-200 ${
            searchOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          <div className="p-5">
            <form
              role="search"
              aria-label="Search"
              className="relative flex items-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="header-search-input" className="sr-only" data-role="text">
                Search
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="search"
                id="header-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search floor plans, care levels, FAQs…"
                autoComplete="off"
                className="w-full rounded-md border-2 border-transparent bg-surface px-11 py-3.5 text-lg text-text transition-colors placeholder:text-muted focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_var(--color-primary-light)] focus:outline-none"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-text"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </form>

            <div className="mt-5 border-t border-text/10 pt-4" aria-label="Popular searches">
              <p className="mb-2 text-base font-bold uppercase tracking-wide text-text/85" data-role="subheading">
                Popular searches
              </p>
              <ul className="m-0 list-none p-0">
                {popularSearches.map((item) => {
                  const Icon = navIcons[item.icon];
                  return (
                    <li key={`${item.href}-${item.label}`}>
                      <a
                        href={item.href}
                        className="flex items-center gap-3 rounded-md px-2 py-2.5 text-base text-text transition-colors hover:bg-section-cream hover:text-primary-dark focus-visible:bg-section-cream focus-visible:text-primary-dark focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                      >
                        <Icon
                          className="h-[18px] w-[18px] shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>

      {/* ----- Hamburger (≤ lg) — animates to an X when the drawer is open -----
          `order-last` keeps it after the server-rendered phone/CTA cluster in
          the header flex row, matching the mockup `.header-right` order. */}
      <button
        ref={hamburgerRef}
        type="button"
        aria-label={drawerOpen ? "Close menu" : "Open menu"}
        aria-expanded={drawerOpen}
        aria-controls="mobile-nav-drawer"
        aria-haspopup="dialog"
        onClick={toggleDrawer}
        className="order-last ml-3 inline-flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 aria-expanded:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
      >
        <span
          className={`block h-0.5 w-5 rounded-sm bg-white transition-transform duration-300 ${
            drawerOpen ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`my-[3px] block h-0.5 w-5 rounded-sm bg-white transition-opacity duration-300 ${
            drawerOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-sm bg-white transition-transform duration-300 ${
            drawerOpen ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      {/* ----- Mobile nav drawer — fixed full-viewport overlay, right slide-in -----
          Built from the SAME `mainNav` config as the desktop dropdowns. */}
      <div
        className={`fixed inset-0 z-[999] lg:hidden ${
          drawerOpen ? "visible opacity-100" : "invisible opacity-0"
        } transition-[opacity,visibility] duration-300`}
        aria-hidden={!drawerOpen}
      >
        {/* Backdrop — click closes (mockup outside-click). */}
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={drawerOpen ? 0 : -1}
          onClick={closeDrawer}
          className="absolute inset-0 h-full w-full cursor-default bg-text/40"
        />

        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute right-0 top-0 flex h-full w-full max-w-full flex-col overflow-y-auto bg-white pb-8 transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Sticky header — "Menu" + close */}
          <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-text/10 bg-white px-5 py-4">
            <span className="font-heading text-lg font-bold text-text" data-role="text-2">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => {
                closeDrawer();
                hamburgerRef.current?.focus();
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-text transition-colors hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Accordion groups — one per mainNav group */}
          <div className="px-3 py-2">
            {mainNav.map((group, index) => {
              const groupOpen = expandedGroup === index;
              return (
                <div key={group.label}>
                  <button
                    type="button"
                    aria-expanded={groupOpen}
                    onClick={() => toggleGroup(index)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-left font-body text-lg font-semibold text-text transition-colors hover:bg-section-cream hover:text-primary-dark focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="min-w-0 flex-1">{group.label}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${
                        groupOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {groupOpen && (
                    <div className="mb-1 pb-3 pt-1">
                      {group.items.map((item) => {
                        const Icon = navIcons[item.icon];
                        return (
                          <a
                            key={`${item.href}-${item.label}`}
                            href={item.href}
                            onClick={closeDrawer}
                            className={`flex items-start gap-3 rounded-lg p-3 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                              item.highlight
                                ? "mb-1 border border-text/10 bg-section-cream"
                                : "hover:bg-section-cream"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                                item.highlight
                                  ? "bg-primary text-white"
                                  : "bg-primary-light text-primary-dark"
                              }`}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <strong className="block text-base font-semibold text-text">
                                {item.label}
                              </strong>
                              {item.blurb && (
                                <small
                                  className={`block text-base font-normal leading-snug ${
                                    item.highlight
                                      ? "font-semibold text-primary-dark"
                                      : "text-muted"
                                  }`}
                                >
                                  {item.blurb}
                                </small>
                              )}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Full-width terracotta CTA — carries data-tour-trigger (Task 6) */}
          <div className="mt-4 border-t border-text/10 px-5 pt-4">
            <a
              href="/schedule-tour"
              data-tour-trigger
              onClick={closeDrawer}
              className="block rounded-md bg-secondary px-4 py-3.5 text-center text-lg font-bold text-white transition-colors hover:bg-secondary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-role="cta"
            >
              Schedule a Tour
            </a>
          </div>

          {/* Phone */}
          {contactPhone && (
            <div className="mt-3 px-5 text-center">
              <a
                href={telHref(contactPhone)}
                onClick={closeDrawer}
                className="text-base font-bold text-primary transition-colors hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {contactPhone}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
