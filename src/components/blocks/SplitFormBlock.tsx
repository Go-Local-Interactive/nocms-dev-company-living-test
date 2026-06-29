"use client";

import * as React from "react";
import type { BlockProps } from "./types";
import { mediaArrayUrls } from "@/lib/payload";
import { lexicalToText } from "./Lexical";
import { skinConfig } from "@/lib/skin";

/** SplitFormBlock — the Golden Oaks `tour-form` `split` variant: the
 *  full-height "Schedule a Tour" page (mockup `components/split-form/`,
 *  in situ on `pages/schedule-tour.html`). A two-column split: LEFT is a
 *  scrollable 3-step form wizard (breadcrumb → centered h1/subtitle →
 *  progress stepper → step panels → confirmation → success state); RIGHT is
 *  a `sticky` crossfading image slideshow with a green gradient overlay,
 *  hidden ≤768.
 *
 *  Selected by `TourFormBlock` when `settings.variant === "split"`. The
 *  `stacked` (default) variant stays in `TourFormBlock` itself.
 *
 *  GRACEFUL DEGRADATION (non-negotiable): every step panel renders in the DOM
 *  (step 1 shown, 2-3 `hidden`) so a no-JS visitor still sees + can fill every
 *  field. The `<form>` keeps semantics; JS layers the wizard (per-step
 *  validation, confirmation summary, success swap) on top. Re-skins entirely
 *  off the P0 tokens — the `--color-primary` flip re-themes the stepper, the
 *  sage summary card, and the terracotta submit.
 *
 *  Submission is presentational. The `onSubmit` handler is the single hook a
 *  consumer wires to their backend (default = no-op → success state); see the
 *  POST-HOOK comment in `handleSubmit`. The `stacked` variant keeps the
 *  classic `action="/api/tour-inquiry"` form post.
 *
 *  Data-flow:
 *    - `title` → the centered h1 (default `See {brandName} for Yourself`).
 *    - `body` → the centered subtitle (default below).
 *    - `mediaArray` → the slideshow images; falls back to the 6 GO "life-*"
 *      scenes when unauthored.
 *    - Phone in the post-submit "Call Us" row comes from `skinConfig`. */

const DEFAULT_SUBTITLE =
  "Schedule a private tour and see our community in person.";

/** The 6 GO slideshow scenes (mockup `.image-slideshow img` order). */
const DEFAULT_SLIDES: Array<{ src: string; alt: string }> = [
  {
    src: "/golden-oaks/life-gardens.jpg",
    alt: "Residents walking through the gardens on a sunny afternoon",
  },
  {
    src: "/golden-oaks/life-dining.jpg",
    alt: "Residents enjoying a meal together in the dining room",
  },
  {
    src: "/golden-oaks/life-arts.jpg",
    alt: "Residents participating in an arts and crafts activity",
  },
  {
    src: "/golden-oaks/life-celebrations.jpg",
    alt: "Community celebration event",
  },
  {
    src: "/golden-oaks/step-tour-assessment.jpg",
    alt: "A family being welcomed on a tour",
  },
  {
    src: "/golden-oaks/why-family.jpg",
    alt: "A family spending time together",
  },
];

const CARE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "independent", label: "Independent Living" },
  { value: "assisted", label: "Assisted Living" },
  { value: "memory", label: "Memory Care" },
  { value: "respite", label: "Respite / Short-Term Stay" },
  { value: "unsure", label: "Not sure yet" },
];

const STEP_LABELS = ["About You", "Tour Details", "Confirm"] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+\-.]{7,}$/;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  careInterest: string;
  message: string;
}

const EMPTY_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredDate: "",
  careInterest: "",
  message: "",
};

/** today's date as YYYY-MM-DD for the date `min` (mockup sets it on load). */
function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`;
}

/** Shared `.form-group` field classes (mockup). */
const LABEL_CLASS = "mb-1.5 block font-body text-base font-semibold text-text";
const INPUT_CLASS =
  "w-full appearance-none rounded-[var(--radius)] border-2 border-text/15 bg-background px-4 py-3.5 font-body text-base text-text transition-[border-color,box-shadow] placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 aria-[invalid]:border-error aria-[invalid]:ring-4 aria-[invalid]:ring-error-light";

export function SplitFormBlock({ title, body, mediaArray }: BlockProps) {
  const heading = title || `See ${skinConfig.brandName} for Yourself`;
  const subtitle = lexicalToText(body) || DEFAULT_SUBTITLE;

  const authored = mediaArrayUrls(mediaArray);
  const slides =
    authored.length > 0
      ? authored.map((m) => ({ src: m.url, alt: m.alt || "" }))
      : DEFAULT_SLIDES;

  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [minDate, setMinDate] = React.useState("");
  const [slide, setSlide] = React.useState(0);

  const summaryRef = React.useRef<HTMLDivElement>(null);

  // Set the date picker min to today on the client (avoids SSR/hydration skew).
  React.useEffect(() => setMinDate(todayISO()), []);

  // Crossfading slideshow (mockup 5s interval).
  React.useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(
      () => setSlide((s) => (s + 1) % slides.length),
      5000,
    );
    return () => window.clearInterval(id);
  }, [slides.length]);

  const set = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    // Clear an existing error as the user corrects it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  };

  /** Validate a step's fields → { id: message } map (mockup rules). */
  const validate = React.useCallback(
    (s: number): Record<string, string> => {
      const next: Record<string, string> = {};
      if (s === 1) {
        if (!form.firstName.trim()) next.firstName = "First Name is required";
        if (!form.lastName.trim()) next.lastName = "Last Name is required";
        if (!form.email.trim()) next.email = "Email Address is required";
        else if (!EMAIL_RE.test(form.email.trim()))
          next.email = "Please enter a valid email address";
        if (!form.phone.trim()) next.phone = "Phone Number is required";
        else if (!PHONE_RE.test(form.phone.trim()))
          next.phone = "Please enter a valid phone number";
      } else if (s === 2) {
        if (!form.preferredDate.trim())
          next.preferredDate = "Preferred Date is required";
        if (!form.careInterest.trim())
          next.careInterest = "Care Level Interest is required";
      }
      return next;
    },
    [form],
  );

  const goToStep = (s: number) => {
    setStep(s);
    // Scroll the panel back to top (mockup scrolls the left column).
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinue = (s: number) => {
    const found = validate(s);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the error summary (mockup focuses #form-error-summary).
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    goToStep(s + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ── SUBMISSION HOOK ───────────────────────────────────────────────
    // Presentational by default: no network call, just the success state.
    // A consumer wires their backend here, e.g.:
    //   await fetch("/api/tour-inquiry", { method: "POST",
    //     body: JSON.stringify(form) });
    // ──────────────────────────────────────────────────────────────────
    setSubmitted(true);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const errorList = Object.entries(errors).filter(([, m]) => m);
  const careLabel =
    CARE_OPTIONS.find((o) => o.value === form.careInterest)?.label ??
    "Not specified";
  const dateLabel = form.preferredDate
    ? new Date(`${form.preferredDate}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No preference";

  return (
    <section
      data-nocms-component="tour-form"
      className="grid min-h-[calc(100vh-72px)] grid-cols-1 min-[769px]:grid-cols-2"
    >
      {/* LEFT — scrollable form panel */}
      <div className="bg-background">
        <div className="mx-auto max-w-[560px] px-12 py-15 [@media(max-width:1024px)]:px-10 [@media(max-width:1024px)]:py-16 [@media(max-width:768px)]:px-8 [@media(max-width:768px)]:pb-15 [@media(max-width:768px)]:pt-10 [@media(max-width:480px)]:px-5 [@media(max-width:480px)]:pb-12 [@media(max-width:480px)]:pt-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-10 text-base text-neutral-500"
          >
            <ol className="m-0 flex flex-wrap items-center gap-0 p-0">
              <li className="flex items-center">
                <a
                  href="/"
                  className="text-neutral-500 transition-colors hover:text-primary-dark" data-role="text"
                >
                  Home
                </a>
              </li>
              <li className="flex items-center">
                <span aria-hidden="true" className="mx-2 text-neutral-500" data-role="text-2">
                  /
                </span>
                <span aria-current="page" className="text-neutral-900" data-role="text-3">
                  Schedule a Tour
                </span>
              </li>
            </ol>
          </nav>

          <h1
            data-role="heading"
            data-payload-subfield="title"
            className="mb-3 text-center font-heading text-[2.5rem] font-bold text-text [@media(max-width:768px)]:text-[2rem] [@media(max-width:480px)]:text-[1.75rem]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {submitted ? "Thank You!" : heading}
          </h1>
          <p
            data-role="subheading"
            data-payload-subfield="body"
            className="mb-4 text-center font-body text-lg leading-[1.7] text-neutral-700"
          >
            {submitted
              ? "We’ve received your tour request. Our admissions team will reach out within one business day to confirm your visit."
              : subtitle}
          </p>

          {!submitted && (
            <>
              {/* Progress stepper */}
              <div
                role="navigation"
                aria-label="Form progress"
                className="mb-10 mt-8 flex items-center"
              >
                {STEP_LABELS.map((label, i) => {
                  const n = i + 1;
                  const isActive = n === step;
                  const isComplete = n < step;
                  const isLast = i === STEP_LABELS.length - 1;
                  return (
                    <div
                      key={label}
                      className={`flex items-center ${isLast ? "flex-none" : "flex-1"}`}
                    >
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-base font-bold transition-all duration-300 [@media(max-width:768px)]:h-7 [@media(max-width:768px)]:w-7 ${
                          isActive
                            ? "border-primary bg-primary text-background ring-4 ring-primary/20"
                            : isComplete
                              ? "border-primary bg-primary text-background"
                              : "border-neutral-300 bg-background text-neutral-300"
                        }`}
                      >
                        {isComplete ? (
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span>{n}</span>
                        )}
                      </div>
                      <span
                        className={`ml-2.5 whitespace-nowrap text-base font-semibold transition-colors duration-300 [@media(max-width:768px)]:hidden ${
                          isActive || isComplete
                            ? "text-primary-dark"
                            : "text-neutral-500"
                        }`}
                      >
                        {label}
                      </span>
                      {!isLast && (
                        <div
                          className={`mx-0 h-0.5 flex-1 transition-colors duration-300 ${
                            isComplete ? "bg-primary" : "bg-neutral-300"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Error summary (aria-live) */}
              {errorList.length > 0 && (
                <div
                  ref={summaryRef}
                  tabIndex={-1}
                  role="alert"
                  aria-live="assertive"
                  className="mb-6 rounded-[var(--radius)] border-2 border-error bg-error-light p-4"
                >
                  <h3 className="mb-2 flex items-center gap-2 font-heading text-base font-bold text-error" data-role="heading-2">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-5 w-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Please fix the following:
                  </h3>
                  <ul className="m-0 list-disc pl-8 text-base text-error">
                    {errorList.map(([id, msg]) => (
                      <li key={id}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* All 3 step panels render in the DOM; non-active are hidden so
                  no-JS visitors still see every field. */}
              <form onSubmit={handleSubmit} noValidate>
                {/* Step 1 — About You */}
                <div className={step === 1 ? "block" : "hidden"}>
                  <h3 className="mb-1 text-left font-heading text-xl text-text" data-role="heading-3">
                    Tell Us About Yourself
                  </h3>
                  <p className="mb-7 font-body text-base text-neutral-500" data-role="subheading-2">
                    So we can personalize your visit and follow up with you.
                  </p>

                  <div className="grid grid-cols-2 gap-4 [@media(max-width:768px)]:grid-cols-1">
                    <Field
                      id="first-name"
                      label="First Name"
                      error={errors.firstName}
                    >
                      <input
                        type="text"
                        id="first-name"
                        autoComplete="given-name"
                        placeholder="Your first name"
                        value={form.firstName}
                        onChange={set("firstName")}
                        aria-invalid={errors.firstName ? "true" : undefined}
                        className={INPUT_CLASS}
                      />
                    </Field>
                    <Field
                      id="last-name"
                      label="Last Name"
                      error={errors.lastName}
                    >
                      <input
                        type="text"
                        id="last-name"
                        autoComplete="family-name"
                        placeholder="Your last name"
                        value={form.lastName}
                        onChange={set("lastName")}
                        aria-invalid={errors.lastName ? "true" : undefined}
                        className={INPUT_CLASS}
                      />
                    </Field>
                  </div>

                  <Field id="email" label="Email Address" error={errors.email}>
                    <input
                      type="email"
                      id="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set("email")}
                      aria-invalid={errors.email ? "true" : undefined}
                      className={INPUT_CLASS}
                    />
                  </Field>

                  <Field id="phone" label="Phone Number" error={errors.phone}>
                    <input
                      type="tel"
                      id="phone"
                      autoComplete="tel"
                      placeholder="(555) 000-0000"
                      value={form.phone}
                      onChange={set("phone")}
                      aria-invalid={errors.phone ? "true" : undefined}
                      className={INPUT_CLASS}
                    />
                  </Field>

                  <div className="mt-8 flex gap-3 [@media(max-width:768px)]:flex-col-reverse">
                    <button
                      type="button"
                      onClick={() => handleContinue(1)}
                      className="btn btn-secondary flex-1 px-6 py-3.5 text-base" data-role="cta"
                    >
                      Continue
                    </button>
                  </div>
                </div>

                {/* Step 2 — Tour Details */}
                <div className={step === 2 ? "block" : "hidden"}>
                  <h3 className="mb-1 text-left font-heading text-xl text-text" data-role="heading-4">
                    Tour Details
                  </h3>
                  <p className="mb-7 font-body text-base text-neutral-500" data-role="subheading-3">
                    Help us prepare the best experience for your visit.
                  </p>

                  <div className="grid grid-cols-2 gap-4 [@media(max-width:768px)]:grid-cols-1">
                    <Field
                      id="preferred-date"
                      label="Preferred Date"
                      error={errors.preferredDate}
                    >
                      <input
                        type="date"
                        id="preferred-date"
                        min={minDate}
                        value={form.preferredDate}
                        onChange={set("preferredDate")}
                        aria-invalid={errors.preferredDate ? "true" : undefined}
                        className={INPUT_CLASS}
                      />
                    </Field>
                    <Field
                      id="care-interest"
                      label="Care Level Interest"
                      error={errors.careInterest}
                    >
                      <select
                        id="care-interest"
                        value={form.careInterest}
                        onChange={set("careInterest")}
                        aria-invalid={errors.careInterest ? "true" : undefined}
                        className={`${INPUT_CLASS} bg-[length:12px] bg-[right_16px_center] bg-no-repeat pr-10`}
                      >
                        <option value="" disabled>
                          Select one
                        </option>
                        {CARE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field id="message" label="Anything we should know? (optional)">
                    <textarea
                      id="message"
                      rows={3}
                      placeholder="Special requests, accessibility needs, questions..."
                      value={form.message}
                      onChange={set("message")}
                      className={`${INPUT_CLASS} resize-y`}
                    />
                  </Field>

                  <div className="mt-8 flex gap-3 [@media(max-width:768px)]:flex-col-reverse">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="btn flex-1 border-2 border-neutral-300 bg-transparent px-6 py-3.5 text-base text-neutral-700 hover:border-neutral-500 hover:bg-section-sage" data-role="text-4"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => handleContinue(2)}
                      className="btn btn-secondary flex-1 px-6 py-3.5 text-base" data-role="cta-2"
                    >
                      Continue
                    </button>
                  </div>
                </div>

                {/* Step 3 — Confirmation */}
                <div className={step === 3 ? "block" : "hidden"}>
                  <h3 className="mb-1 text-left font-heading text-xl text-text" data-role="heading-5">
                    Review Your Information
                  </h3>
                  <p className="mb-7 font-body text-base text-neutral-500" data-role="subheading-4">
                    Please confirm everything looks correct before submitting.
                  </p>

                  <div className="mb-6 rounded-[var(--radius)] bg-section-sage p-6">
                    <SummaryRow
                      label="Name"
                      value={`${form.firstName} ${form.lastName}`.trim() || "—"}
                    />
                    <SummaryRow label="Email" value={form.email || "—"} />
                    <SummaryRow label="Phone" value={form.phone || "—"} />
                    <SummaryRow label="Preferred Date" value={dateLabel} />
                    <SummaryRow label="Care Interest" value={careLabel} />
                    {form.message.trim() && (
                      <SummaryRow label="Message" value={form.message.trim()} />
                    )}
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="mt-3 inline-block cursor-pointer border-0 bg-transparent font-body text-base font-semibold text-primary underline underline-offset-[3px] hover:text-secondary-dark" data-role="text-5"
                    >
                      Edit my information
                    </button>
                  </div>

                  <div className="mt-8 flex gap-3 [@media(max-width:768px)]:flex-col-reverse">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="btn flex-1 border-2 border-neutral-300 bg-transparent px-6 py-3.5 text-base text-neutral-700 hover:border-neutral-500 hover:bg-section-sage" data-role="text-6"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn btn-secondary flex-1 px-6 py-3.5 text-base" data-role="cta-3"
                    >
                      Request My Tour
                    </button>
                  </div>
                </div>
              </form>

              <p className="mt-4 flex items-center justify-center gap-1 text-center font-body text-base text-neutral-500" data-role="subheading-5">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Your information is secure and will never be shared.
              </p>
            </>
          )}

          {submitted && (
            <div className="pt-2">
              <div className="py-5 text-center">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="mx-auto mb-4 h-14 w-14 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="8 12 11 15 16 9" />
                </svg>
              </div>

              {/* What Happens Next */}
              <div className="mt-12 border-t border-section-sage pt-12">
                <h3 className="mb-9 text-center font-heading text-2xl text-neutral-900" data-role="heading-6">
                  What Happens Next
                </h3>
                {NEXT_STEPS.map((s, i) => (
                  <div key={i} className="mb-7 flex gap-5 last:mb-0">
                    <div className="flex h-11 w-11 min-w-11 items-center justify-center rounded-full bg-primary-light font-heading text-lg font-bold text-primary-dark">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="mb-1 font-heading text-base text-neutral-900" data-role="heading-7">
                        {s.title}
                      </h4>
                      <p className="m-0 font-body text-base leading-[1.6] text-neutral-700" data-role="subheading-6">
                        {s.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <figure className="mt-10 rounded-xl border-l-4 border-primary bg-section-sage p-8">
                <blockquote className="mb-4 font-heading text-lg italic leading-[1.7] text-neutral-700" data-role="text-7">
                  &ldquo;From the moment we walked in, we felt like family. The
                  staff answered every question with patience, and Mom knew this
                  was the place before we even finished the tour.&rdquo;
                </blockquote>
                <figcaption className="font-body text-base font-semibold text-neutral-900" data-role="text-8">
                  Margaret D.
                  <span className="mt-0.5 block font-normal text-neutral-500" data-role="text-9">
                    Daughter of current resident
                  </span>
                </figcaption>
              </figure>

              {/* Alternative contact */}
              <div className="mt-10 border-t border-section-sage pt-10">
                <h3 className="mb-5 text-center font-heading text-xl text-text" data-role="heading-8">
                  Prefer to Reach Us Directly?
                </h3>
                <div className="flex items-center gap-4 border-b border-section-sage py-4">
                  <div className="flex h-11 w-11 min-w-11 items-center justify-center rounded-full bg-primary-light">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-5 w-5 text-primary-dark"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </div>
                  <div className="font-body text-base">
                    <strong className="block text-neutral-900" data-role="text-10">Call Us</strong>
                    {skinConfig.contactPhone && (
                      <a
                        href={telHref(skinConfig.contactPhone)}
                        className="text-primary underline underline-offset-[3px]"
                      >
                        {skinConfig.contactPhone}
                      </a>
                    )}
                    <span className="text-neutral-500" data-role="text-11">
                      {" "}
                      — Available 8am – 6pm daily
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 py-4">
                  <div className="flex h-11 w-11 min-w-11 items-center justify-center rounded-full bg-primary-light">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-5 w-5 text-primary-dark"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="font-body text-base">
                    <strong className="block text-neutral-900" data-role="text-12">
                      Send a Message
                    </strong>
                    <a
                      href="/contact-us"
                      className="text-primary underline underline-offset-[3px]" data-role="text-13"
                    >
                      Contact Us Online
                    </a>
                    <span className="text-neutral-500" data-role="text-14">
                      {" "}
                      — We respond within 24 hours
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — sticky crossfading slideshow (hidden ≤768) */}
      <div className="relative min-h-screen [@media(max-width:768px)]:hidden">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0">
            {slides.map((s, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                className={`absolute inset-0 block h-full w-full object-cover transition-opacity duration-[1200ms] ${
                  i === slide ? "opacity-100" : "opacity-0"
                }`} data-role="media"
              />
            ))}
          </div>
          {/* Green gradient overlay (mockup primary-dark @ .15→.35) */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-primary-dark/15 to-primary-dark/35" />
        </div>
      </div>
    </section>
  );
}

const NEXT_STEPS: Array<{ title: string; body: string }> = [
  {
    title: "We'll Confirm Your Visit",
    body: "Within one business day, our admissions team will call or email to confirm a date and time that works for everyone.",
  },
  {
    title: "A Personal Welcome",
    body: "Your dedicated guide will meet you at the door for a private walk-through of our residences, dining, and common areas.",
  },
  {
    title: "Your Questions, Answered",
    body: "We'll sit down together to discuss care options, pricing, availability, and anything else on your mind — no pressure, no rush.",
  },
];

/** One `.form-group`: label + field + inline `.form-error`. */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      {children}
      <span
        role="alert"
        aria-live="polite"
        className={`mt-1.5 text-base leading-snug text-error ${error ? "block" : "hidden"}`}
      >
        {error}
      </span>
    </div>
  );
}

/** One row in the confirmation summary card. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-primary/10 py-2.5 text-base last:border-b-0">
      <span className="font-semibold text-neutral-500">{label}</span>
      <span className="text-right text-neutral-900">{value}</span>
    </div>
  );
}
