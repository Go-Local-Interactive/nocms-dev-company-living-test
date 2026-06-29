"use client";

/**
 * TourWidget — the slide-in "Schedule a Tour" panel (mockup
 * `components/tour-widget/`), mounted once globally in `app/layout.tsx`.
 *
 * It auto-binds to every `[data-tour-trigger]` element on the page (the header
 * CTA from Task 2 + the mobile-drawer CTA from Task 4 carry it). Clicking a
 * trigger `preventDefault`s the navigation and opens this panel instead; the
 * panel's own "full tour page" link still routes to `/schedule-tour` (the
 * fallback). This mirrors the mockup's `.btn-header` / `.tour-trigger`
 * auto-binding.
 *
 * Behaviors ported 1:1 from the mockup JS:
 *   - right slide-in panel (440px → full-width ≤ 768) + overlay, Escape /
 *     overlay-click / close-button close, body-scroll-lock while open.
 *   - WCAG-compliant validation: required (all), phone regex, future-date;
 *     blur marks a field touched, input/change re-validate touched fields,
 *     submit validates all + focuses the first error, then swaps to a success
 *     state.
 *   - hides the floating Help Badge while open via a `body[data-tour-open]`
 *     signal the Help Badge reacts to (mockup hid `.help-badge` directly).
 *
 * Editor contract: root `data-nocms-component="tour-widget"`; the panel heading
 * + intro copy carry `data-payload-subfield`. Token-only colors — no hex.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/** Local YYYY-MM-DD for today (date input `min` + future-date validation). */
function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

type FieldId = "name" | "phone" | "date";

const PHONE_RE = /^[\d\s()+\-.]{7,}$/;

export function TourWidget() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<Record<FieldId, string>>({
    name: "",
    phone: "",
    date: "",
  });
  const [touched, setTouched] = useState<Record<FieldId, boolean>>({
    name: false,
    phone: false,
    date: false,
  });
  /** Date input `min` — set after mount to avoid a hydration mismatch. */
  const [minDate, setMinDate] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  /** The trigger element that opened the panel — focus is restored to it. */
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const fieldRefs: Record<FieldId, React.RefObject<HTMLInputElement | null>> = {
    name: nameRef,
    phone: phoneRef,
    date: dateRef,
  };

  useEffect(() => setMinDate(todayISO()), []);

  const openPanel = useCallback(() => {
    setSubmitted(false);
    setOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    lastTriggerRef.current?.focus();
    lastTriggerRef.current = null;
  }, []);

  // ----- Bind every [data-tour-trigger] → open (preventDefault navigation) ---
  useEffect(() => {
    const triggers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tour-trigger]")
    );
    const onClick = (e: Event) => {
      e.preventDefault();
      lastTriggerRef.current = e.currentTarget as HTMLElement;
      openPanel();
    };
    triggers.forEach((el) => el.addEventListener("click", onClick));
    return () =>
      triggers.forEach((el) => el.removeEventListener("click", onClick));
  }, [openPanel]);

  // ----- Body-scroll-lock + Help-Badge hide signal while open -----
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      document.body.dataset.tourOpen = "true";
    } else {
      delete document.body.dataset.tourOpen;
    }
    return () => {
      document.body.style.overflow = "";
      delete document.body.dataset.tourOpen;
    };
  }, [open]);

  // ----- Focus the first field after the slide-in animation (mockup 400ms) ---
  useEffect(() => {
    if (!open || submitted) return;
    const id = window.setTimeout(() => nameRef.current?.focus(), 400);
    return () => window.clearTimeout(id);
  }, [open, submitted]);

  // ----- Escape closes (restores focus to the opening trigger) -----
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel]);

  // ----- Validation (mirrors the mockup rules) -----
  const errorFor = useCallback(
    (id: FieldId, val: string): string | null => {
      const v = val.trim();
      if (id === "name") {
        if (!v) return "Your Name is required";
      } else if (id === "phone") {
        if (!v) return "Phone Number is required";
        if (!PHONE_RE.test(v)) return "Please enter a valid phone number";
      } else {
        if (!v) return "Preferred Date is required";
        const picked = new Date(`${v}T00:00:00`);
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        if (picked < start) return "Please choose a date today or later";
      }
      return null;
    },
    []
  );

  const setValue = (id: FieldId, val: string) =>
    setValues((prev) => ({ ...prev, [id]: val }));

  const markTouched = (id: FieldId) =>
    setTouched((prev) => ({ ...prev, [id]: true }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, date: true });
    const order: FieldId[] = ["name", "phone", "date"];
    const firstError = order.find((id) => errorFor(id, values[id]));
    if (firstError) {
      fieldRefs[firstError].current?.focus();
      return;
    }
    setSubmitted(true);
  };

  const fields: { id: FieldId; label: string; type: string; placeholder?: string }[] = [
    { id: "name", label: "Your Name", type: "text", placeholder: "First and last name" },
    { id: "phone", label: "Phone Number", type: "tel", placeholder: "(555) 000-0000" },
    { id: "date", label: "Preferred Date", type: "date" },
  ];

  return (
    <div data-nocms-component="tour-widget">
      {/* Overlay — neutral-900 @ 40% (mockup color-mix) */}
      <button
        type="button"
        aria-label="Close tour panel"
        tabIndex={open ? 0 : -1}
        onClick={closePanel}
        className={`fixed inset-0 z-[2000] cursor-default bg-text/40 transition-[opacity,visibility] duration-[350ms] ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Panel — right slide-in */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-[2001] flex h-full w-full max-w-full flex-col overflow-y-auto bg-white shadow-[-4px_0_24px_color-mix(in_srgb,var(--color-text)_12%,transparent)] transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] min-[769px]:w-[440px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header — primary-dark → primary gradient (mockup 145deg) */}
        <div className="relative bg-gradient-to-br from-primary-dark to-primary px-8 pb-6 pt-8 text-white">
          <button
            type="button"
            aria-label="Close tour panel"
            onClick={closePanel}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <h3
            id="tour-title"
            data-payload-subfield="tourHeading"
            className="mb-2 font-heading text-2xl font-bold text-white" data-role="heading"
          >
            Schedule a Tour
          </h3>
          <p
            data-payload-subfield="tourIntro"
            className="text-base leading-snug text-white/85" data-role="subheading"
          >
            We&apos;d love to show you around. Pick a time that works and
            we&apos;ll take care of the rest.
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          {submitted ? (
            <div className="py-6 text-center" role="status" aria-live="polite">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                className="mx-auto mb-3"
              >
                <circle cx="24" cy="24" r="24" className="fill-success-light" />
                <path
                  d="M15 25l6 6 12-12"
                  className="stroke-success"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h4 className="mb-2 font-heading text-xl font-bold text-text" data-role="heading-2">
                Tour Request Received!
              </h4>
              <p className="text-base text-muted" data-role="subheading-2">
                We&apos;ll confirm your visit within 24 hours.
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} noValidate>
                {fields.map((field) => {
                  const err = touched[field.id]
                    ? errorFor(field.id, values[field.id])
                    : null;
                  const showSuccess =
                    touched[field.id] && !err && values[field.id].trim() !== "";
                  return (
                    <div key={field.id} className="mb-5">
                      <label
                        htmlFor={`tour-${field.id}`}
                        className={`mb-1.5 block text-base font-semibold ${
                          err ? "text-error" : "text-text/85"
                        }`}
                      >
                        {field.label}
                      </label>
                      <input
                        ref={fieldRefs[field.id]}
                        id={`tour-${field.id}`}
                        type={field.type}
                        placeholder={field.placeholder}
                        required
                        aria-required="true"
                        aria-invalid={err ? "true" : undefined}
                        aria-describedby={`tour-${field.id}-error`}
                        min={field.id === "date" ? minDate : undefined}
                        value={values[field.id]}
                        onChange={(e) => setValue(field.id, e.target.value)}
                        onBlur={() => markTouched(field.id)}
                        className={`w-full rounded-md border-2 bg-white px-4 py-3.5 text-base text-text transition-[border-color,box-shadow] placeholder:text-muted focus:outline-none ${
                          err
                            ? "border-error shadow-[0_0_0_3px_var(--color-error-light)]"
                            : showSuccess
                              ? "border-success focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)]"
                              : "border-[color-mix(in_srgb,var(--color-text)_29%,white)] focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)]"
                        }`}
                      />
                      <span
                        id={`tour-${field.id}-error`}
                        aria-live="polite"
                        className={`mt-1.5 items-center gap-1.5 text-base leading-snug text-error ${
                          err ? "flex" : "hidden"
                        }`}
                      >
                        {err}
                      </span>
                    </div>
                  );
                })}
                <button
                  type="submit"
                  className="mt-2 w-full cursor-pointer rounded-md bg-secondary px-4 py-4 text-base font-semibold text-white transition-[background-color,transform] hover:-translate-y-px hover:bg-secondary-dark focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-secondary" data-role="cta"
                >
                  Request My Tour
                </button>
              </form>
              <p className="mt-4 text-center text-base leading-snug text-muted" data-role="subheading-3">
                No commitment — just a friendly visit. We&apos;ll confirm your
                time within 24 hours.
              </p>
              <a
                href="/schedule-tour"
                className="mt-6 block border-t border-text/10 pt-5 text-center text-base font-semibold text-primary transition-colors hover:text-primary-dark" data-role="text"
              >
                Want to tell us more? Visit the full tour page &rarr;
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
