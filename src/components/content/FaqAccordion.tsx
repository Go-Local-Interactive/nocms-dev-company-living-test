"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

interface FaqAccordionProps {
  faqs?: FaqItem[];
  categories?: string[];
  heading?: string;
}

const defaultFaqs: FaqItem[] = [
  {
    question: "What is the difference between independent living and assisted living?",
    answer: "Independent living is designed for active seniors who want a maintenance-free lifestyle with social activities and amenities. Assisted living provides additional daily support such as medication management, bathing, dressing, and meal preparation for those who need help with activities of daily living.",
    category: "Care Levels",
  },
  {
    question: "How much does senior living cost?",
    answer: "Costs vary based on the level of care, room type, and location. Independent living typically starts around $2,500/month, assisted living from $4,000/month, and memory care from $5,500/month. We offer transparent pricing with no hidden fees and can help explore financial assistance options.",
    category: "Pricing",
  },
  {
    question: "Can I tour the community before making a decision?",
    answer: "Absolutely! We welcome and encourage tours. You can schedule a personal tour any day of the week. During your visit, you will meet staff, see available floor plans, enjoy a complimentary meal, and get a feel for daily life in our community.",
    category: "Getting Started",
  },
  {
    question: "What happens if care needs change over time?",
    answer: "Our community offers a continuum of care, so residents can transition seamlessly between independent living, assisted living, and memory care as needs evolve. Our care team conducts regular assessments and works with families to adjust care plans proactively.",
    category: "Care Levels",
  },
  {
    question: "Are pets allowed?",
    answer: "Yes! We are a pet-friendly community. We know that pets are family, and we welcome cats and dogs (with some size and breed considerations). Our community even has pet-friendly walking paths and a pet relief area.",
    category: "Daily Life",
  },
  {
    question: "What activities and amenities are available?",
    answer: "We offer 200+ monthly activities including fitness classes, art workshops, live entertainment, educational lectures, gardening, book clubs, and more. Amenities include a fitness center, swimming pool, salon, library, theater room, and beautifully landscaped grounds.",
    category: "Daily Life",
  },
];

export function FaqAccordion({
  faqs = defaultFaqs,
  categories,
  heading = "Frequently Asked Questions",
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allCategories = categories ?? [...new Set(faqs.map((f) => f.category).filter(Boolean))] as string[];
  const filtered = activeCategory ? faqs.filter((f) => f.category === activeCategory) : faqs;

  return (
    <section className="bg-background py-16 lg:py-24" data-nocms-component="content/faq-accordion">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <HelpCircle className="h-8 w-8 text-primary mx-auto mb-4" aria-hidden="true" />
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text" data-role="heading">{heading}</h2>
        </div>

        {/* Category tabs */}
        {allCategories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === null
                  ? "bg-primary text-white"
                  : "bg-surface text-muted hover:text-text"
              }`}
            >
              All
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "bg-surface text-muted hover:text-text"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Accordion items */}
        <div className="space-y-3">
          {filtered.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className="bg-surface rounded-lg border border-text/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-background/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-text pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-muted leading-relaxed" data-role="subheading">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
