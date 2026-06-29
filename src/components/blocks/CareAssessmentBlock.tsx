"use client";

import * as React from "react";
import type { BlockProps } from "./types";
import { lexicalToText } from "./Lexical";
import { skinConfig } from "@/lib/skin";

/** CareAssessmentBlock — the Golden Oaks `care-assessment`: the multi-step
 *  "Find Your Care Level" quiz on `pages/care-assessment.html`. A 6-question
 *  single-select quiz with a sticky 6-dot progress bar, then a scored
 *  recommendation screen + lead form, then a success card ("You're All Set!").
 *
 *  PAGE COMPOSITION: this block is the quiz body ONLY. The Header-Minimal /
 *  Footer-Minimal chrome comes from P1 (P8 sets `meta.chrome="minimal"` on the
 *  `/care-assessment` page) — do NOT render chrome here.
 *
 *  QUIZ DATA is rich + in-code: the 6 questions, the per-option scores, and the
 *  three scored recommendations live in the typed `QUESTIONS` / `RECOMMENDATIONS`
 *  constants below (Golden Oaks default copy). v1 keeps this copy in the renderer
 *  (overridable wholesale via the `title`/`body` atoms); deep per-option editing
 *  is a schema follow-up (the future per-question `items` atom — see the
 *  schema-batch note).
 *
 *  ENGINE (presentational): `useState` for the `current` step + `answers`.
 *  Selecting an option enables Next; Next advances + marks the progress dot
 *  complete (Back reverses); the final Next computes `totalScore` and maps it to
 *  a recommendation via `getRecommendation(score)` (≤2 Independent, ≤5 Assisted,
 *  else Memory Care). The results screen renders the recommendation + a lead form
 *  (name / phone / email / best-time) with the same WCAG validation as the P6
 *  SplitFormBlock / RequestPricingFormBlock (inline `.form-error` spans + an
 *  `aria-live` error summary, email/phone regex); submit → the success card.
 *
 *  GRACEFUL DEGRADATION (non-negotiable): ALL six questions render in the DOM
 *  (active one visible, the rest `hidden`) so a no-JS visitor still sees every
 *  question + every field. JS layers the step navigation, scoring, validation,
 *  and success swap on top.
 *
 *  SUBMISSION is presentational. `handleSubmit` is the single hook a consumer
 *  wires to their backend (default = no-op → success state); see the POST-HOOK
 *  comment in `handleSubmit`.
 *
 *  Token-only colors: progress active dot `bg-primary` (ring `ring-primary-light`),
 *  option selected `border-primary bg-section-sage` + radio/icon `text-primary`,
 *  results badge `bg-primary-light text-primary-dark`, recommendation card
 *  `bg-section-sage` border-l `border-primary`, submit `bg-secondary`. The
 *  `--color-primary` flip re-themes the lot. */

const DEFAULT_HEADING = "Find Your Care Level";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+\-.]{7,}$/;

/** One answer option: a radio-styled card carrying its score + icon. */
interface QuizOption {
  value: string;
  score: number;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

/** One quiz question: number label + heading + subtitle + 4 options. */
interface QuizQuestion {
  id: string;
  heading: string;
  subtitle: string;
  options: QuizOption[];
}

/** Shared SVG wrapper for the answer-icon glyphs (stroke, no fill). */
function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 [@media(max-width:480px)]:h-[18px] [@media(max-width:480px)]:w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round" data-nocms-component="care-assessment-block"
    >
      {children}
    </svg>
  );
}

/** The 6 Golden Oaks quiz questions (mockup `.question` slides, in order).
 *  who-for / daily-help / health-memory / quality-of-life / timeline / budget. */
const QUESTIONS: QuizQuestion[] = [
  {
    id: "who-for",
    heading: "Who Are You Exploring Care For?",
    subtitle: "This helps us tailor our recommendation to your situation.",
    options: [
      {
        value: "self",
        score: 0,
        label: "Myself",
        desc: "I'm planning for my own future",
        icon: (
          <Glyph>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </Glyph>
        ),
      },
      {
        value: "parent",
        score: 0,
        label: "My parent",
        desc: "Helping Mom or Dad find the right fit",
        icon: (
          <Glyph>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </Glyph>
        ),
      },
      {
        value: "spouse",
        score: 0,
        label: "My spouse or partner",
        desc: "Finding care for the person I love",
        icon: (
          <Glyph>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Glyph>
        ),
      },
      {
        value: "other",
        score: 0,
        label: "Another family member",
        desc: "A grandparent, sibling, or other loved one",
        icon: (
          <Glyph>
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </Glyph>
        ),
      },
    ],
  },
  {
    id: "daily-help",
    heading: "How Much Help Is Needed With Daily Tasks?",
    subtitle:
      "Think about things like bathing, dressing, cooking, and managing medications.",
    options: [
      {
        value: "independent",
        score: 0,
        label: "Fully independent",
        desc: "Can handle all daily activities without assistance",
        icon: (
          <Glyph>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </Glyph>
        ),
      },
      {
        value: "some-help",
        score: 1,
        label: "A little help here and there",
        desc: "Mostly independent but needs occasional reminders or assistance",
        icon: (
          <Glyph>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </Glyph>
        ),
      },
      {
        value: "significant-help",
        score: 2,
        label: "Regular daily assistance",
        desc: "Needs help with several daily activities like bathing or meals",
        icon: (
          <Glyph>
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </Glyph>
        ),
      },
      {
        value: "full-help",
        score: 3,
        label: "Full-time hands-on care",
        desc: "Requires around-the-clock support with most activities",
        icon: (
          <Glyph>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Glyph>
        ),
      },
    ],
  },
  {
    id: "health-memory",
    heading: "Are There Any Health or Memory Concerns?",
    subtitle:
      "This helps us understand the level of medical or cognitive support that may be needed.",
    options: [
      {
        value: "no-concerns",
        score: 0,
        label: "No major concerns",
        desc: "Generally healthy with routine medical needs",
        icon: (
          <Glyph>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </Glyph>
        ),
      },
      {
        value: "medication",
        score: 1,
        label: "Medication management needed",
        desc: "Takes multiple medications that need tracking and reminders",
        icon: (
          <Glyph>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </Glyph>
        ),
      },
      {
        value: "memory",
        score: 3,
        label: "Memory loss or confusion",
        desc: "Experiencing forgetfulness, wandering, or difficulty with familiar tasks",
        icon: (
          <Glyph>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </Glyph>
        ),
      },
      {
        value: "complex",
        score: 2,
        label: "Complex medical needs",
        desc: "Chronic conditions requiring regular medical monitoring",
        icon: (
          <Glyph>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </Glyph>
        ),
      },
    ],
  },
  {
    id: "quality-of-life",
    heading: "What Matters Most for Quality of Life?",
    subtitle: "Choose the priority that resonates most.",
    options: [
      {
        value: "social",
        score: 0,
        label: "An active social life",
        desc: "Friends, events, dining together, and a vibrant community",
        icon: (
          <Glyph>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </Glyph>
        ),
      },
      {
        value: "privacy",
        score: 0,
        label: "Peace and privacy",
        desc: "A quiet, comfortable home with support when needed",
        icon: (
          <Glyph>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </Glyph>
        ),
      },
      {
        value: "structure",
        score: 1,
        label: "Structured daily routine",
        desc: "Consistent schedule with guided activities and familiar rhythms",
        icon: (
          <Glyph>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </Glyph>
        ),
      },
      {
        value: "safety",
        score: 2,
        label: "Safety and security",
        desc: "24/7 supervision with a secure, monitored environment",
        icon: (
          <Glyph>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </Glyph>
        ),
      },
    ],
  },
  {
    id: "timeline",
    heading: "When Are You Considering the Move?",
    subtitle:
      "There's no wrong answer — we're here whether you're just starting to explore or need help right away.",
    options: [
      {
        value: "exploring",
        score: 0,
        label: "Just exploring options",
        desc: "Researching for the future, no immediate plans",
        icon: (
          <Glyph>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </Glyph>
        ),
      },
      {
        value: "6-months",
        score: 0,
        label: "Within the next 6 months",
        desc: "Actively planning and want to find the right community",
        icon: (
          <Glyph>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </Glyph>
        ),
      },
      {
        value: "3-months",
        score: 0,
        label: "Within the next 3 months",
        desc: "Ready to move forward and compare communities",
        icon: (
          <Glyph>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </Glyph>
        ),
      },
      {
        value: "urgent",
        score: 0,
        label: "Urgently — within weeks",
        desc: "A change in health or circumstances means we need to act soon",
        icon: (
          <Glyph>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </Glyph>
        ),
      },
    ],
  },
  {
    id: "budget",
    heading: "What Monthly Budget Are You Considering?",
    subtitle:
      "This helps us match you with the right options. All our pricing is transparent with no hidden fees.",
    options: [
      {
        value: "under-3k",
        score: 0,
        label: "Under $3,000/month",
        desc: "Looking for the most affordable options",
        icon: (
          <Glyph>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </Glyph>
        ),
      },
      {
        value: "3k-5k",
        score: 0,
        label: "$3,000 – $5,000/month",
        desc: "Mid-range with good value and amenities",
        icon: (
          <Glyph>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </Glyph>
        ),
      },
      {
        value: "5k-8k",
        score: 0,
        label: "$5,000 – $8,000/month",
        desc: "Premium care with full amenities and services",
        icon: (
          <Glyph>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </Glyph>
        ),
      },
      {
        value: "not-sure",
        score: 0,
        label: "Not sure yet",
        desc: "I'd like help understanding costs and financial options",
        icon: (
          <Glyph>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </Glyph>
        ),
      },
    ],
  },
];

/** A scored recommendation (mockup `getRecommendation` result objects). */
interface Recommendation {
  heading: string;
  description: string;
  title: string;
  body: string;
  features: string[];
}

const RECOMMENDATIONS: { independent: Recommendation; assisted: Recommendation; memory: Recommendation } = {
  independent: {
    heading: "Independent Living Looks Like a Great Fit",
    description:
      "Based on your answers, it sounds like your loved one is looking for an active, social lifestyle with the peace of mind that comes from a supportive community.",
    title: "Independent Living at Golden Oaks",
    body: "Enjoy a maintenance-free lifestyle with chef-prepared dining, a full social calendar, fitness amenities, and the freedom to live on your own terms — with help nearby if you ever need it.",
    features: [
      "Private apartments with full kitchens",
      "Three chef-prepared meals daily",
      "Fitness center, pool, and classes",
      "Full social and activities calendar",
      "Housekeeping and transportation",
      "Emergency call system included",
    ],
  },
  assisted: {
    heading: "Assisted Living May Be the Right Choice",
    description:
      "Based on your answers, it sounds like some daily support would help your loved one stay comfortable, safe, and engaged — while still maintaining independence where possible.",
    title: "Assisted Living at Golden Oaks",
    body: "Get personalized help with daily activities like bathing, dressing, and medication management — all within a warm, social community that feels like home.",
    features: [
      "Personalized care plans",
      "Medication management",
      "Help with bathing and dressing",
      "Social activities and outings",
      "24/7 trained staff on-site",
      "Restaurant-style dining",
    ],
  },
  memory: {
    heading: "Memory Care Could Provide the Support You Need",
    description:
      "Based on your answers, specialized memory care may offer the best combination of safety, structure, and compassionate support for your loved one.",
    title: "Memory Care at Golden Oaks",
    body: "Our secure, purpose-built memory care neighborhood provides expert dementia and Alzheimer's care with structured routines, therapeutic activities, and round-the-clock supervision.",
    features: [
      "Secure, monitored environment",
      "Specialized dementia-trained staff",
      "Therapeutic activity programs",
      "Structured daily routines",
      "Family support and education",
      "Sensory and cognitive therapies",
    ],
  },
};

/** Map a total score to a care-level recommendation (mockup buckets:
 *  ≤2 Independent · ≤5 Assisted · else Memory Care). */
function getRecommendation(score: number): Recommendation {
  if (score <= 2) return RECOMMENDATIONS.independent;
  if (score <= 5) return RECOMMENDATIONS.assisted;
  return RECOMMENDATIONS.memory;
}

const BEST_TIME_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "morning", label: "Morning (9am – 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm – 5pm)" },
  { value: "evening", label: "Evening (5pm – 8pm)" },
  { value: "anytime", label: "Anytime works" },
];

interface LeadForm {
  name: string;
  phone: string;
  email: string;
  bestTime: string;
}

const EMPTY_LEAD: LeadForm = { name: "", phone: "", email: "", bestTime: "" };

/** The 3 validated lead fields (mockup `resFields`): required + format rules. */
const VALIDATED: Array<{ key: keyof LeadForm; label: string; email?: boolean; phone?: boolean }> = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone Number", phone: true },
  { key: "email", label: "Email Address", email: true },
];

function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`;
}

/** Shared `.results-field` classes (mockup). */
const LABEL_CLASS = "mb-1.5 block font-body text-base font-semibold text-neutral-900";
const INPUT_CLASS =
  "w-full appearance-none rounded-[var(--radius)] border-2 border-neutral-300 bg-background px-4 py-3.5 font-body text-base text-neutral-900 transition-[border-color,box-shadow] placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 aria-[invalid]:border-error aria-[invalid]:ring-4 aria-[invalid]:ring-error-light";

/** The animated chevron used on the Back / Next buttons. */
function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={dir === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );
}

export function CareAssessmentBlock({ title, body }: BlockProps) {
  const heading = title || DEFAULT_HEADING;
  // Intro copy is overridable via `body`; the rich quiz copy stays in-code.
  const intro = lexicalToText(body);

  // ── Quiz engine state ───────────────────────────────────────────────────
  // `current` = active step (0-5 = questions, 6 = results). `answers[i]` holds
  // the selected option's score; `showResults` flips to the recommendation.
  const [current, setCurrent] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [selected, setSelected] = React.useState<Record<number, string>>({});
  const [showResults, setShowResults] = React.useState(false);

  // ── Lead-form state (mirrors RequestPricingFormBlock's WCAG validator) ───
  const [form, setForm] = React.useState<LeadForm>(EMPTY_LEAD);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const summaryRef = React.useRef<HTMLDivElement>(null);

  const scrollTop = React.useCallback(() => {
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const selectOption = (qIndex: number, opt: QuizOption) => {
    setSelected((s) => ({ ...s, [qIndex]: opt.value }));
    setAnswers((a) => ({ ...a, [qIndex]: opt.score }));
  };

  const goNext = () => {
    if (selected[current] === undefined) return;
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
      scrollTop();
    } else {
      setShowResults(true);
      scrollTop();
    }
  };

  const goBack = () => {
    if (showResults) {
      setShowResults(false);
      scrollTop();
      return;
    }
    if (current > 0) {
      setCurrent((c) => c - 1);
      scrollTop();
    }
  };

  const totalScore = QUESTIONS.reduce(
    (sum, _q, i) => sum + (answers[i] ?? 0),
    0,
  );
  const rec = getRecommendation(totalScore);

  // ── Lead-form validation (mockup rules) ──────────────────────────────────
  const validateField = React.useCallback(
    (key: keyof LeadForm, value: string): string => {
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
    (key: keyof LeadForm) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
      if (touched[key]) {
        setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
      }
    };

  const onBlur = (key: keyof LeadForm) => () => {
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
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    // ── SUBMISSION HOOK ───────────────────────────────────────────────
    // Presentational by default: no network call, just the success state.
    // A consumer wires their backend here, e.g.:
    //   await fetch("/api/care-assessment", { method: "POST",
    //     body: JSON.stringify({ ...form, score: totalScore,
    //       answers: selected, recommendation: rec.title }) });
    // ──────────────────────────────────────────────────────────────────
    setSubmitted(true);
    scrollTop();
  };

  const errorList = VALIDATED.map((f) => ({
    key: f.key,
    msg: errors[f.key],
  })).filter((e) => e.msg);

  const focusField = (key: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(`ca-${key}`)?.focus();
  };

  return (
    <section
      data-nocms-component="care-assessment"
      className="flex flex-1 flex-col bg-section-light"
    >
      {/* SR-only page heading (overridable via `title`) */}
      <h1 className="sr-only" data-role="heading" data-payload-subfield="title">
        {heading}
      </h1>

      {/* ===== PROGRESS BAR ===== */}
      <div className="sticky top-0 z-[100] border-b border-neutral-100 bg-surface py-5">
        <div className="mx-auto max-w-[1200px] px-10 [@media(max-width:768px)]:px-6 [@media(max-width:480px)]:px-5">
          <div className="mx-auto flex max-w-[640px] items-center">
            {QUESTIONS.map((_q, i) => {
              const isActive = !showResults && i === current;
              const isComplete = showResults || i < current;
              const filled = isActive || isComplete;
              const last = i === QUESTIONS.length - 1;
              return (
                <div
                  key={i}
                  className={`flex items-center ${last ? "flex-none" : "flex-1"}`}
                >
                  <div
                    className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 font-body text-base font-bold transition-all duration-300 [@media(max-width:480px)]:h-7 [@media(max-width:480px)]:w-7 ${
                      filled
                        ? "border-primary bg-primary text-background"
                        : "border-neutral-300 bg-surface text-neutral-300"
                    } ${isActive ? "shadow-[0_0_0_4px_var(--color-primary-light)]" : ""}`}
                    aria-current={isActive ? "step" : undefined}
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
                      <span>{i + 1}</span>
                    )}
                  </div>
                  {!last && (
                    <div
                      className={`h-0.5 flex-1 transition-colors duration-300 ${
                        isComplete ? "bg-primary" : "bg-neutral-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== QUIZ BODY ===== */}
      <main className="flex flex-1 items-start justify-center px-6 pb-20 pt-12 [@media(max-width:768px)]:px-4 [@media(max-width:768px)]:pb-15 [@media(max-width:768px)]:pt-8 [@media(max-width:480px)]:p-0 [@media(max-width:480px)]:pb-10">
        <div className="w-full max-w-[640px] rounded-[var(--radius)] bg-surface px-11 py-12 shadow-[0_4px_24px_color-mix(in_srgb,var(--color-text)_8%,transparent)] [@media(max-width:768px)]:px-7 [@media(max-width:768px)]:py-9 [@media(max-width:480px)]:rounded-none [@media(max-width:480px)]:px-5 [@media(max-width:480px)]:py-7 [@media(max-width:480px)]:shadow-none">
          {/* ── Questions (ALL render; only the active one is visible) ── */}
          {QUESTIONS.map((q, i) => {
            const active = !showResults && i === current;
            const isLast = i === QUESTIONS.length - 1;
            return (
              <div
                key={q.id}
                data-array-index={i}
                data-question={i}
                hidden={!active}
                className={active ? "block" : "hidden"}
              >
                <div className="mb-2 font-body text-base font-semibold uppercase tracking-[0.05em] text-primary">
                  Question {i + 1} of {QUESTIONS.length}
                </div>
                <h2 className="mb-2 text-left font-heading text-[1.75rem] font-bold leading-tight text-neutral-900" data-role="heading-2">
                  {q.heading}
                </h2>
                <p className="mb-8 font-body text-base leading-[1.5] text-neutral-500" data-role="subheading">
                  {q.subtitle}
                </p>

                {/* Answer options — radio-styled cards */}
                <div
                  className="mb-9 flex flex-col gap-3"
                  role="radiogroup"
                  aria-label={q.heading}
                >
                  {q.options.map((opt) => {
                    const isSel = selected[i] === opt.value;
                    return (
                      <div
                        key={opt.value}
                        role="radio"
                        tabIndex={0}
                        aria-checked={isSel}
                        onClick={() => selectOption(i, opt)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            selectOption(i, opt);
                          }
                        }}
                        className={`group relative flex cursor-pointer items-center gap-4 rounded-[var(--radius)] border-2 px-5 py-[18px] transition-[border-color,background,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [@media(max-width:480px)]:px-4 [@media(max-width:480px)]:py-3.5 ${
                          isSel
                            ? "border-primary bg-section-sage shadow-[0_0_0_3px_var(--color-primary-light)]"
                            : "border-neutral-100 hover:border-primary-light hover:bg-section-sage"
                        }`}
                      >
                        {/* Radio dot */}
                        <div
                          className={`flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isSel ? "border-primary" : "border-neutral-300"
                          }`}
                        >
                          <div
                            className={`h-2.5 w-2.5 rounded-full transition-colors ${
                              isSel ? "bg-primary" : "bg-transparent"
                            }`}
                          />
                        </div>
                        {/* Icon circle */}
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors [@media(max-width:480px)]:h-9 [@media(max-width:480px)]:w-9 ${
                            isSel
                              ? "bg-primary-light text-primary"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {opt.icon}
                        </div>
                        {/* Label + description */}
                        <div className="flex-1">
                          <span className="mb-0.5 block font-body text-[17px] font-semibold text-neutral-900">
                            {opt.label}
                          </span>
                          <span className="font-body text-base leading-[1.4] text-neutral-500">
                            {opt.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Nav: Back (hidden on Q1) + Next / See My Results */}
                <div className="flex items-center justify-between gap-4 [@media(max-width:480px)]:flex-col-reverse [@media(max-width:480px)]:gap-3">
                  {i > 0 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius)] px-5 py-3 font-body text-base font-semibold text-neutral-500 transition-colors hover:text-neutral-900 [@media(max-width:480px)]:w-full [@media(max-width:480px)]:justify-center" data-role="text"
                    >
                      <Chevron dir="left" /> Back
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={selected[i] === undefined}
                    className="ml-auto inline-flex min-h-12 items-center gap-2 rounded-[var(--radius)] bg-secondary px-8 py-3.5 font-body text-base font-semibold text-background transition-[background,transform] hover:bg-secondary-dark hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 [@media(max-width:480px)]:w-full [@media(max-width:480px)]:justify-center" data-role="cta"
                  >
                    {isLast ? "See My Results" : "Next"} <Chevron dir="right" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* ===== RESULTS SCREEN ===== */}
          {showResults && !submitted && (
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-[20px] bg-primary-light px-4 py-2 font-body text-base font-semibold text-primary-dark">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Assessment Complete
              </div>
              <h2 className="mb-3 text-left font-heading text-[1.75rem] font-bold leading-tight text-neutral-900" data-role="heading-3">
                {rec.heading}
              </h2>
              <p className="mb-3 font-body text-[17px] leading-[1.6] text-neutral-700" data-role="subheading-2">
                {rec.description}
              </p>
              <p className="mb-8 font-body text-[17px] leading-[1.6] text-neutral-700" data-role="subheading-3">
                This is just a starting point &mdash; not a permanent decision.
                Needs change over time, and transitioning between care levels at
                Golden Oaks is seamless &mdash; your loved one stays in a
                familiar community with familiar faces. We reassess regularly to
                make sure the fit is always right.
              </p>

              {/* Recommendation card */}
              <div className="mb-8 rounded-[var(--radius)] border-l-4 border-primary bg-section-sage p-7">
                <h3 className="mb-2 font-heading text-[1.75rem] font-bold leading-tight text-primary-dark" data-role="heading-4">
                  {rec.title}
                </h3>
                <p className="m-0 font-body text-base leading-[1.5] text-neutral-700" data-role="subheading-4">
                  {rec.body}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 [@media(max-width:768px)]:grid-cols-1">
                  {rec.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 font-body text-base text-neutral-700"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-4 w-4 flex-shrink-0 text-primary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="my-8 h-px bg-neutral-100" />

              <h3 className="mb-2 text-center font-heading text-[1.75rem] font-bold leading-tight text-neutral-900" data-role="heading-5">
                Get Your Personalized Care Plan
              </h3>
              <p className="mb-5 text-center font-body text-base text-neutral-500" data-role="subheading-5">
                A care advisor will review your results and follow up with a
                detailed recommendation tailored to your family&apos;s needs.
              </p>

              {/* Error summary (aria-live assertive) */}
              {errorList.length > 0 && (
                <div
                  ref={summaryRef}
                  tabIndex={-1}
                  role="alert"
                  aria-live="assertive"
                  className="mb-7 rounded-[var(--radius)] border-2 border-error bg-error-light px-6 py-5"
                >
                  <h4 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-error" data-role="heading-6">
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
                  </h4>
                  <ul className="m-0 list-none p-0">
                    {errorList.map((e) => (
                      <li key={e.key} className="py-1">
                        <a
                          href={`#ca-${e.key}`}
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

              {/* Lead form */}
              <form
                onSubmit={handleSubmit}
                action="/api/care-assessment"
                noValidate
                className="grid grid-cols-2 gap-4 [@media(max-width:768px)]:grid-cols-1"
              >
                <LeadField id="ca-name" label="Your Name" error={errors.name}>
                  <input
                    type="text"
                    id="ca-name"
                    name="name"
                    autoComplete="name"
                    placeholder="First and last name"
                    value={form.name}
                    onChange={set("name")}
                    onBlur={onBlur("name")}
                    aria-invalid={errors.name ? "true" : undefined}
                    className={INPUT_CLASS}
                  />
                </LeadField>
                <LeadField id="ca-phone" label="Phone Number" error={errors.phone}>
                  <input
                    type="tel"
                    id="ca-phone"
                    name="phone"
                    autoComplete="tel"
                    placeholder="(555) 000-0000"
                    value={form.phone}
                    onChange={set("phone")}
                    onBlur={onBlur("phone")}
                    aria-invalid={errors.phone ? "true" : undefined}
                    className={INPUT_CLASS}
                  />
                </LeadField>
                <LeadField
                  id="ca-email"
                  label="Email Address"
                  error={errors.email}
                  fullWidth
                >
                  <input
                    type="email"
                    id="ca-email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set("email")}
                    onBlur={onBlur("email")}
                    aria-invalid={errors.email ? "true" : undefined}
                    className={INPUT_CLASS}
                  />
                </LeadField>
                <LeadField id="ca-bestTime" label="Best Time to Reach You" fullWidth>
                  <select
                    id="ca-bestTime"
                    name="best-time"
                    value={form.bestTime}
                    onChange={set("bestTime")}
                    className={`${INPUT_CLASS} pr-10`}
                  >
                    <option value="">Select a time</option>
                    {BEST_TIME_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </LeadField>

                <button
                  type="submit"
                  className="col-span-full mt-2 min-h-12 rounded-[var(--radius)] bg-secondary px-4 py-4 font-body text-base font-semibold text-background transition-[background,transform] hover:bg-secondary-dark hover:-translate-y-px" data-role="cta-2"
                >
                  Send My Results to a Care Advisor
                </button>
                <p className="col-span-full text-center font-body text-base text-neutral-500" data-role="subheading-6">
                  No obligation. No spam. Just helpful guidance from our team.
                </p>
              </form>

              {/* Back to questions + call-now */}
              <div className="mt-5 flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 font-body text-base font-semibold text-neutral-500 transition-colors hover:text-neutral-900" data-role="text-2"
                >
                  <Chevron dir="left" /> Back to questions
                </button>
                {skinConfig.contactPhone && (
                  <a
                    href={telHref(skinConfig.contactPhone)}
                    className="inline-flex items-center justify-center gap-2 font-body text-base font-semibold text-primary transition-colors hover:text-primary-dark" data-role="text-3"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-[18px] w-[18px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Or call us now: {skinConfig.contactPhone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ===== SUCCESS STATE ===== */}
          {submitted && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary-light">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-9 w-9 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="9 12 12 15 16 10" />
                </svg>
              </div>
              <h2 className="mb-3 text-center font-heading text-[1.75rem] font-bold leading-tight text-neutral-900" data-role="heading-7">
                You&apos;re All Set!
              </h2>
              <p className="mx-auto mb-7 max-w-[420px] font-body text-[17px] text-neutral-500" data-role="subheading-7">
                A care advisor will reach out within 24 hours with your
                personalized care plan. In the meantime, feel free to explore
                our community.
              </p>
              <a href="/" className="btn btn-primary px-7 py-3.5 text-base" data-role="cta-3">
                Explore {skinConfig.brandName}
              </a>
            </div>
          )}
        </div>
      </main>
    </section>
  );
}

/** One `.results-field`: label + field + inline error (mockup). */
function LeadField({
  id,
  label,
  error,
  fullWidth,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={fullWidth ? "col-span-full" : undefined}>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
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
