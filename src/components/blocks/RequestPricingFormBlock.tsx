"use client";

import * as React from "react";
import type { BlockProps } from "./types";
import { lexicalToText } from "./Lexical";
import { skinConfig } from "@/lib/skin";

/** RequestPricingFormBlock — the Golden Oaks `request-pricing-form`: the
 *  single-page lead form on `pages/request-pricing.html` (the `.form-page`
 *  section). A centered `max-w` form on `bg-surface`: heading + subtitle, a
 *  sage `pricing-note` callout, then the form — first/last name row, email,
 *  phone, a "Preferred Contact Method" radio-pill fieldset, care-level +
 *  move-in-timeline selects (2-col row), a relationship select, an optional
 *  message, the `bg-secondary` "Request My Quote" submit, and a privacy line
 *  with a lock icon. On submit the form is replaced by the success section
 *  (checkmark + "Thank You!" + "What Happens Next" + testimonial + alternative
 *  contact).
 *
 *  PAGE COMPOSITION: the page hero (`hero-toprow` + content-intro) and the
 *  header-minimal / footer-minimal chrome come from P1/P2 — this block is the
 *  form section ONLY; P8 composes the full page around it.
 *
 *  GRACEFUL DEGRADATION (non-negotiable): the form is a real `<form>` with
 *  every field present, so a no-JS visitor can still fill + submit it (the
 *  default `action` is a documented hook below). JS layers the WCAG validation,
 *  the inline error summary, and the success swap on top.
 *
 *  SUBMISSION is presentational. `handleSubmit` is the single hook a consumer
 *  wires to their backend (default = no-op → success state); see the POST-HOOK
 *  comment in `handleSubmit`.
 *
 *  Data-flow:
 *    - `title` → the centered h2 (default "Get Your Personalized Quote").
 *    - `body` → the centered subtitle (default below).
 *    - Phone in the success "Call Us" row comes from `skinConfig.contactPhone`.
 *
 *  Token-only colors: pill selected `border-primary bg-primary/10 text-primary`,
 *  note `bg-section-sage`, submit `bg-secondary`. The `--color-primary` flip
 *  re-themes the lot. */

const DEFAULT_HEADING = "Get Your Personalized Quote";
const DEFAULT_SUBTITLE =
  "Share a few details and we'll prepare a custom pricing package tailored to your needs.";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+\-.]{7,}$/;

const CARE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "independent", label: "Independent Living" },
  { value: "assisted", label: "Assisted Living" },
  { value: "memory", label: "Memory Care" },
  { value: "respite", label: "Respite / Short-Term Stay" },
  { value: "unsure", label: "Not sure yet" },
];

const TIMELINE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "immediate", label: "As soon as possible" },
  { value: "1-3", label: "Within 1–3 months" },
  { value: "3-6", label: "Within 3–6 months" },
  { value: "6-12", label: "Within 6–12 months" },
  { value: "planning", label: "Just planning ahead" },
];

const RELATIONSHIP_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "self", label: "I'm looking for myself" },
  { value: "spouse", label: "Spouse or partner" },
  { value: "child", label: "Adult child" },
  { value: "other-family", label: "Other family member" },
  { value: "professional", label: "Healthcare professional or advisor" },
];

/** The 3 contact-method pills (mockup `.contact-pref-pill`). */
const CONTACT_PREFS: Array<{ value: string; label: string; icon: React.ReactNode }> = [
  {
    value: "email",
    label: "Email",
    icon: (
      <>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </>
    ),
  },
  {
    value: "phone",
    label: "Phone",
    icon: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
  },
  {
    value: "either",
    label: "Either is fine",
    icon: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
  },
];

/** The success-state "What Happens Next" steps (mockup `.next-step-item`). */
const NEXT_STEPS: Array<{ title: string; body: string }> = [
  {
    title: "We'll Prepare Your Quote",
    body: "Our admissions team will review your needs and put together a personalized pricing package, including any applicable financial assistance options.",
  },
  {
    title: "A Personal Call",
    body: "Within one business day, a member of our team will call to walk you through the quote, answer questions, and discuss your options in detail.",
  },
  {
    title: "Tour & Next Steps",
    body: "If you'd like to see the community in person, we'll schedule a private tour at your convenience. There's never any pressure or obligation.",
  },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactPref: string;
  careLevel: string;
  timeline: string;
  relationship: string;
  message: string;
}

const EMPTY_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  contactPref: "email",
  careLevel: "",
  timeline: "",
  relationship: "",
  message: "",
};

/** The 5 validated fields (mockup `fields` array): required + format rules. */
const VALIDATED: Array<{ key: keyof FormData; label: string; email?: boolean; phone?: boolean }> = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email Address", email: true },
  { key: "phone", label: "Phone Number", phone: true },
  { key: "careLevel", label: "Care Level" },
];

function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`;
}

/** Shared `.form-group` field classes (mockup). */
const LABEL_CLASS = "mb-1.5 block font-body text-base font-semibold text-neutral-700";
const INPUT_CLASS =
  "w-full appearance-none rounded-[var(--radius)] border-2 border-neutral-300 bg-background px-4 py-3.5 font-body text-base text-neutral-900 transition-[border-color,box-shadow] placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 aria-[invalid]:border-error aria-[invalid]:ring-4 aria-[invalid]:ring-error-light";

export function RequestPricingFormBlock({ title, body }: BlockProps) {
  const heading = title || DEFAULT_HEADING;
  const subtitle = lexicalToText(body) || DEFAULT_SUBTITLE;

  const [form, setForm] = React.useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const summaryRef = React.useRef<HTMLDivElement>(null);

  /** Validate a single field → message | "" (mockup rules). */
  const validateField = React.useCallback(
    (key: keyof FormData, value: string): string => {
      const cfg = VALIDATED.find((f) => f.key === key);
      if (!cfg) return "";
      const val = value.trim();
      if (!val) return `${cfg.label} is required`;
      if (cfg.email && !EMAIL_RE.test(val))
        return "Please enter a valid email address";
      if (cfg.phone && !PHONE_RE.test(val))
        return "Please enter a valid phone number";
      return "";
    },
    [],
  );

  const set =
    (key: keyof FormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
      // Re-validate on input only after the field has been touched (mockup).
      if (touched[key]) {
        setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
      }
    };

  const onBlur = (key: keyof FormData) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validateField(key, form[key]) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    const nextTouched: Record<string, boolean> = {};
    for (const f of VALIDATED) {
      nextTouched[f.key] = true;
      const msg = validateField(f.key, form[f.key]);
      if (msg) found[f.key] = msg;
    }
    setTouched((t) => ({ ...t, ...nextTouched }));
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Move focus to the error summary (mockup focuses #form-error-summary).
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    // ── SUBMISSION HOOK ───────────────────────────────────────────────
    // Presentational by default: no network call, just the success state.
    // A consumer wires their backend here, e.g.:
    //   await fetch("/api/pricing-inquiry", { method: "POST",
    //     body: JSON.stringify(form) });
    // ──────────────────────────────────────────────────────────────────
    setSubmitted(true);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // The error summary lists fields in form order with anchor links.
  const errorList = VALIDATED.map((f) => ({
    key: f.key,
    msg: errors[f.key],
  })).filter((e) => e.msg);

  const focusField = (key: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(`rpf-${key}`)?.focus();
  };

  return (
    <section
      data-nocms-component="request-pricing-form"
      className="bg-surface px-10 pb-20 pt-16 [@media(max-width:768px)]:px-6 [@media(max-width:768px)]:pb-15 [@media(max-width:768px)]:pt-12 [@media(max-width:480px)]:px-5 [@media(max-width:480px)]:pb-12 [@media(max-width:480px)]:pt-9"
    >
      <div className="mx-auto max-w-[640px]">
        <h2
          data-role="heading"
          data-payload-subfield="title"
          className="mb-2 text-center font-heading text-2xl font-bold text-neutral-900 [@media(max-width:480px)]:text-[1.35rem]"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          {submitted ? "Thank You!" : heading}
        </h2>

        {!submitted && (
          <>
            <p
              data-role="subheading"
              data-payload-subfield="body"
              className="mb-9 text-center font-body text-lg leading-[1.7] text-neutral-700"
            >
              {subtitle}
            </p>

            {/* Pricing note — sage callout */}
            <div className="mb-8 rounded-r-[var(--radius)] border-l-4 border-primary bg-section-sage px-6 py-5 font-body text-base leading-[1.6] text-neutral-700">
              <strong className="text-neutral-900" data-role="text">
                Transparent pricing, always.
              </strong>{" "}
              Your quote will include all-inclusive monthly rates with no hidden
              fees. We&apos;ll also outline any available financial assistance
              programs that may apply to your situation.
            </div>

            {/* Error summary (aria-live assertive) */}
            {errorList.length > 0 && (
              <div
                ref={summaryRef}
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
                className="mb-7 rounded-[var(--radius)] border-2 border-error bg-error-light px-6 py-5"
              >
                <h3 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-error" data-role="heading-2">
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
                <ul className="m-0 list-none p-0">
                  {errorList.map((e) => (
                    <li key={e.key} className="py-1">
                      <a
                        href={`#rpf-${e.key}`}
                        onClick={focusField(e.key)}
                        className="text-base font-medium text-error underline underline-offset-2 hover:text-neutral-900"
                      >
                        {e.msg}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} action="/api/pricing-inquiry" noValidate>
              {/* First / last name row */}
              <div className="grid grid-cols-2 gap-4 [@media(max-width:768px)]:grid-cols-1">
                <Field id="rpf-firstName" label="First Name" error={errors.firstName}>
                  <input
                    type="text"
                    id="rpf-firstName"
                    name="first-name"
                    autoComplete="given-name"
                    placeholder="Your first name"
                    value={form.firstName}
                    onChange={set("firstName")}
                    onBlur={onBlur("firstName")}
                    aria-invalid={errors.firstName ? "true" : undefined}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field id="rpf-lastName" label="Last Name" error={errors.lastName}>
                  <input
                    type="text"
                    id="rpf-lastName"
                    name="last-name"
                    autoComplete="family-name"
                    placeholder="Your last name"
                    value={form.lastName}
                    onChange={set("lastName")}
                    onBlur={onBlur("lastName")}
                    aria-invalid={errors.lastName ? "true" : undefined}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>

              <Field id="rpf-email" label="Email Address" error={errors.email}>
                <input
                  type="email"
                  id="rpf-email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  onBlur={onBlur("email")}
                  aria-invalid={errors.email ? "true" : undefined}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field id="rpf-phone" label="Phone Number" error={errors.phone}>
                <input
                  type="tel"
                  id="rpf-phone"
                  name="phone"
                  autoComplete="tel"
                  placeholder="(555) 000-0000"
                  value={form.phone}
                  onChange={set("phone")}
                  onBlur={onBlur("phone")}
                  aria-invalid={errors.phone ? "true" : undefined}
                  className={INPUT_CLASS}
                />
              </Field>

              {/* Preferred Contact Method — radio pills */}
              <fieldset className="mb-2 border-0 p-0">
                <legend className="mb-3 font-body text-base font-semibold text-neutral-900">
                  Preferred Contact Method
                </legend>
                <div className="flex flex-wrap gap-3 [@media(max-width:480px)]:flex-col">
                  {CONTACT_PREFS.map((pref) => {
                    const selected = form.contactPref === pref.value;
                    return (
                      <label
                        key={pref.value}
                        className="relative min-w-[120px] flex-1 cursor-pointer [@media(max-width:480px)]:min-w-0"
                      >
                        <input
                          type="radio"
                          name="contact-pref"
                          value={pref.value}
                          checked={selected}
                          onChange={set("contactPref")}
                          className="peer absolute h-0 w-0 opacity-0"
                        />
                        <span
                          className={`flex items-center justify-center gap-2 rounded-[var(--radius)] border-2 px-4 py-3.5 text-center font-body text-base leading-tight transition-all peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                            selected
                              ? "border-primary bg-primary/10 font-semibold text-primary shadow-[0_0_0_1px_var(--color-primary)]"
                              : "border-neutral-300 bg-background font-medium text-neutral-700 hover:border-neutral-500"
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="h-[18px] w-[18px] flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {pref.icon}
                          </svg>
                          {pref.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2.5 font-body text-base text-neutral-700" data-role="subheading-2">
                  We&rsquo;ll reach out within one business day using your
                  preferred method &mdash; no pressure, no obligation.
                </p>
              </fieldset>

              {/* Care level + move-in timeline (2-col row) */}
              <div className="mt-6 grid grid-cols-2 gap-4 [@media(max-width:768px)]:grid-cols-1">
                <Field id="rpf-careLevel" label="Care Level Interest" error={errors.careLevel}>
                  <select
                    id="rpf-careLevel"
                    name="care-level"
                    value={form.careLevel}
                    onChange={set("careLevel")}
                    onBlur={onBlur("careLevel")}
                    aria-invalid={errors.careLevel ? "true" : undefined}
                    className={`${INPUT_CLASS} pr-10`}
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
                <Field id="rpf-timeline" label="Move-In Timeline">
                  <select
                    id="rpf-timeline"
                    name="timeline"
                    value={form.timeline}
                    onChange={set("timeline")}
                    className={`${INPUT_CLASS} pr-10`}
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    {TIMELINE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Relationship */}
              <Field
                id="rpf-relationship"
                label="Your Relationship to the Prospective Resident"
              >
                <select
                  id="rpf-relationship"
                  name="relationship"
                  value={form.relationship}
                  onChange={set("relationship")}
                  className={`${INPUT_CLASS} pr-10`}
                >
                  <option value="" disabled>
                    Select one
                  </option>
                  {RELATIONSHIP_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Optional message */}
              <Field
                id="rpf-message"
                label="Anything else we should know?"
                optional
              >
                <textarea
                  id="rpf-message"
                  name="message"
                  rows={4}
                  placeholder="Current care needs, floor plan preferences, financial assistance questions..."
                  value={form.message}
                  onChange={set("message")}
                  className={`${INPUT_CLASS} resize-y`}
                />
              </Field>

              <button
                type="submit"
                className="btn btn-secondary mt-2 w-full px-8 py-4 text-lg" data-role="cta"
              >
                Request My Quote
              </button>
            </form>

            <p className="mt-4 text-center font-body text-base text-neutral-500" data-role="subheading-3">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="mr-1 inline-block h-3.5 w-3.5 -translate-y-px align-middle"
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
            {/* Success message */}
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
              <p className="mx-auto mb-8 max-w-[400px] font-body text-base text-neutral-700" data-role="subheading-4">
                We&apos;ve received your pricing request. Our admissions team
                will prepare a personalized quote and reach out within one
                business day.
              </p>
            </div>

            {/* What Happens Next */}
            <div className="mt-12 border-t border-neutral-100 pt-12">
              <h3 className="mb-9 text-center font-heading text-2xl text-neutral-900" data-role="heading-3">
                What Happens Next
              </h3>
              {NEXT_STEPS.map((s, i) => (
                <div key={i} className="mb-7 flex gap-5 last:mb-0">
                  <div className="flex h-11 w-11 min-w-11 items-center justify-center rounded-full bg-primary-light font-heading text-lg font-bold text-primary-dark">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="mb-1 font-heading text-base text-neutral-900" data-role="heading-4">
                      {s.title}
                    </h4>
                    <p className="m-0 font-body text-base leading-[1.6] text-neutral-700" data-role="subheading-5">
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <figure className="mt-10 rounded-xl border-l-4 border-primary bg-section-sage p-8">
              <blockquote className="mb-4 font-heading text-lg italic leading-[1.7] text-neutral-700" data-role="text-2">
                &ldquo;The pricing was straightforward and honest &mdash; no
                hidden fees, no surprises. They even helped us figure out that
                Dad qualified for VA benefits we didn&apos;t know about. That
                made all the difference.&rdquo;
              </blockquote>
              <figcaption className="font-body text-base font-semibold text-neutral-900" data-role="text-3">
                Karen L.
                <span className="mt-0.5 block font-normal text-neutral-500" data-role="text-4">
                  Daughter of current resident
                </span>
              </figcaption>
            </figure>

            {/* Alternative contact */}
            <div className="mt-10 border-t border-neutral-100 pt-10">
              <h3 className="mb-5 text-center font-heading text-xl text-neutral-900" data-role="heading-5">
                Prefer to Reach Us Directly?
              </h3>
              <div className="flex items-center gap-4 border-b border-neutral-100 py-4">
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
                  <strong className="block text-neutral-900" data-role="text-5">Call Us</strong>
                  {skinConfig.contactPhone && (
                    <a
                      href={telHref(skinConfig.contactPhone)}
                      className="text-primary underline underline-offset-[3px]"
                    >
                      {skinConfig.contactPhone}
                    </a>
                  )}
                  <span className="text-neutral-500" data-role="text-6">
                    {" "}
                    &mdash; Available 8am &ndash; 6pm daily
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
                  <strong className="block text-neutral-900" data-role="text-7">
                    Send a Message
                  </strong>
                  <a
                    href="/contact-us"
                    className="text-primary underline underline-offset-[3px]" data-role="text-8"
                  >
                    Contact Us Online
                  </a>
                  <span className="text-neutral-500" data-role="text-9">
                    {" "}
                    &mdash; We respond within 24 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** One `.form-group`: label (+ optional "(optional)") + field + inline error. */
function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
        {optional && (
          <span className="font-normal text-neutral-500" data-role="text-10"> (optional)</span>
        )}
      </label>
      {children}
      <span
        role="alert"
        aria-live="polite"
        className={`mt-1.5 items-center gap-1.5 text-base font-medium leading-snug text-error ${error ? "flex" : "hidden"}`}
      >
        {error}
      </span>
    </div>
  );
}
