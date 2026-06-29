"use client";

/**
 * ExitIntent — the "Free Senior Living Checklist" lead-capture popup (mockup
 * `components/exit-intent/` / `.urgency-popup`), mounted once globally in
 * `app/layout.tsx`.
 *
 * Trigger logic (kept from the prior implementation, mirroring the mockup):
 * arms after 15s on the page, then fires on desktop mouse-leave-top or a 40s
 * mobile/touch fallback — once per session. The body is the checklist email
 * capture: a sage icon, heading + intro, a 3-item checklist, a single email
 * field with WCAG validation + a terracotta "Send It" button, a privacy line,
 * a `tel:` phone row, and a "Check Your Inbox!" success swap that auto-closes
 * after 3s.
 *
 * Editor contract: root `data-nocms-component="exit-intent"`; the heading +
 * checklist items + privacy copy carry `data-payload-subfield`. Phone comes
 * from `skinConfig`. Token-only colors — no hex.
 */

import { useEffect, useRef, useState } from "react";
import { X, FileText, Check, Phone, CircleCheck } from "lucide-react";
import { skinConfig } from "@/lib/skin";

const ARM_DELAY_MS = 15_000;
const MOBILE_FALLBACK_MS = 40_000;
const SUCCESS_CLOSE_MS = 3_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checklist copy — editable content (mockup `.urgency-popup-checklist`). */
const CHECKLIST = [
  "What to look for during a community tour",
  "Questions to ask about care levels and costs",
  "How to talk to a loved one about the move",
];

function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`;
}

export function ExitIntent() {
  const [open, setOpen] = useState(false);
  /** Drives the scale-in: flips true a frame after `open` so it animates. */
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const hasShownRef = useRef(false);
  const armedRef = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const { contactPhone } = skinConfig;

  // ----- Arm + trigger (unchanged behavior) -----
  useEffect(() => {
    const armTimer = window.setTimeout(() => {
      armedRef.current = true;
    }, ARM_DELAY_MS);

    const show = () => {
      if (hasShownRef.current || !armedRef.current) return;
      hasShownRef.current = true;
      setOpen(true);
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("keydown", handleKey);

    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    let mobileTimer: number | undefined;
    if (isTouch) {
      mobileTimer = window.setTimeout(show, MOBILE_FALLBACK_MS);
    }

    return () => {
      window.clearTimeout(armTimer);
      if (mobileTimer !== undefined) window.clearTimeout(mobileTimer);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // ----- Scale-in entry transition (mockup .urgency-popup → .is-visible) -----
  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const id = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  const emailError =
    touched && !EMAIL_RE.test(email.trim())
      ? email.trim() === ""
        ? "Email address is required"
        : "Please enter a valid email address"
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!EMAIL_RE.test(email.trim())) {
      emailRef.current?.focus();
      return;
    }
    setSubmitted(true);
  };

  // Auto-close after the success state shows (mockup setTimeout(hidePopup, 3000)).
  useEffect(() => {
    if (!submitted) return;
    const id = window.setTimeout(() => setOpen(false), SUCCESS_CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [submitted]);

  if (!open) return null;

  return (
    <div data-nocms-component="exit-intent">
      {/* Overlay — neutral-900 @ 55% (mockup color-mix) */}
      <button
        type="button"
        aria-label="Close popup"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[9998] cursor-default bg-text/55 transition-opacity duration-[350ms] ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Popup — centered scale-in card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Free senior living checklist"
        className={`fixed left-1/2 top-1/2 z-[9999] w-[calc(100%-2rem)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white px-6 pb-7 pt-9 shadow-[0_24px_64px_color-mix(in_srgb,var(--color-text)_25%,transparent),0_8px_24px_color-mix(in_srgb,var(--color-text)_12%,transparent)] transition-[opacity,transform] duration-[400ms] min-[481px]:px-10 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close popup"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text/85 transition-colors hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {submitted ? (
          // ----- Success state -----
          <div className="py-5 text-center" role="status" aria-live="polite">
            <CircleCheck
              className="mx-auto mb-4 h-12 w-12 text-primary"
              strokeWidth={2}
              aria-hidden="true"
            />
            <h4 className="mb-2 font-heading text-[22px] font-bold text-text" data-role="heading">
              Check Your Inbox!
            </h4>
            <p className="text-base text-muted" data-role="subheading">
              Your free checklist is on its way. We&apos;re here if you need
              anything else.
            </p>
          </div>
        ) : (
          // ----- Default lead-capture state -----
          <>
            <div className="mx-auto mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-section-sage">
              <FileText
                className="h-7 w-7 text-primary"
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>
            <h4
              data-payload-subfield="heading"
              className="mb-2 text-center font-heading text-2xl font-bold text-text" data-role="heading-2"
            >
              Get Your Free Senior Living Checklist
            </h4>
            <p className="mb-6 text-center text-base leading-relaxed text-muted" data-role="subheading-2">
              Not sure where to start? We put together a step-by-step guide to
              help families navigate the transition with confidence.
            </p>

            <ul
              data-payload-subfield="checklist"
              className="mb-7 list-none rounded-[10px] bg-section-sage px-5 py-4"
            >
              {CHECKLIST.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 py-1.5 text-base leading-snug text-text/85"
                >
                  <Check
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mb-4 flex flex-col gap-2.5 min-[481px]:flex-row"
            >
              <label htmlFor="exit-intent-email" className="sr-only" data-role="text">
                Email address
              </label>
              <input
                ref={emailRef}
                id="exit-intent-email"
                type="email"
                required
                aria-required="true"
                aria-invalid={emailError ? "true" : undefined}
                aria-describedby="exit-intent-email-error"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                className={`flex-1 rounded-md border-2 bg-white px-4 py-3.5 text-base text-text transition-[border-color,box-shadow] placeholder:text-muted focus:outline-none ${
                  emailError
                    ? "border-error shadow-[0_0_0_3px_var(--color-error-light)]"
                    : "border-neutral-300 focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)]"
                }`}
              />
              <button
                type="submit"
                className="cursor-pointer whitespace-nowrap rounded-md bg-secondary px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-secondary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary [@media(max-width:480px)]:w-full" data-role="cta"
              >
                Send It
              </button>
            </form>
            <span
              id="exit-intent-email-error"
              role="alert"
              aria-live="polite"
              className={`-mt-2 mb-3 items-center gap-1.5 text-base leading-snug text-error ${
                emailError ? "flex" : "hidden"
              }`}
            >
              {emailError}
            </span>

            <p
              data-payload-subfield="privacy"
              className="m-0 text-center text-base leading-snug text-muted" data-role="subheading-3"
            >
              No spam, ever. Unsubscribe anytime.
            </p>

            {contactPhone && (
              <a
                href={telHref(contactPhone)}
                className="mt-4 flex items-center justify-center gap-2 border-t border-neutral-300 pt-4 text-base font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" data-role="text-2"
              >
                <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                Or call us: {contactPhone}
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
