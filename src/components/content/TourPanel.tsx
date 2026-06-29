"use client";

import { useState } from "react";
import { X, Calendar, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TourPanelProps {
  trigger?: React.ReactNode;
}

export function TourPanel({ trigger }: TourPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-primary text-white font-semibold px-6 py-3 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          aria-label="Schedule a tour"
        >
          <Calendar className="h-5 w-5" aria-hidden="true" />
          Book a Tour
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-text/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Schedule a tour"
      >
        <div className="flex items-center justify-between p-6 border-b border-text/10">
          <h2 className="font-heading text-xl font-bold text-text" data-role="heading">Schedule Your Tour</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="h-10 w-10 rounded-full hover:bg-surface flex items-center justify-center transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5 text-text" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
          {submitted ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-primary mx-auto mb-6" aria-hidden="true" />
              <h3 className="font-heading text-2xl font-bold text-text mb-3" data-role="heading">Tour Requested!</h3>
              <p className="text-muted" data-role="subheading">
                We will be in touch within 24 hours to confirm your visit. We look forward to showing you around.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-muted text-sm mb-6">
                Tours are available 7 days a week. Fill in your details and we will find a time that works for you.
              </p>

              <div>
                <label htmlFor="tour-name" className="block text-sm font-medium text-text mb-1.5">
                  <User className="inline h-4 w-4 mr-1.5 text-muted" aria-hidden="true" />
                  Full Name <span className="text-secondary">*</span>
                </label>
                <input
                  id="tour-name"
                  type="text"
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-lg border border-text/10 bg-background text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="tour-phone" className="block text-sm font-medium text-text mb-1.5">
                  <Phone className="inline h-4 w-4 mr-1.5 text-muted" aria-hidden="true" />
                  Phone Number <span className="text-secondary">*</span>
                </label>
                <input
                  id="tour-phone"
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  className="w-full px-4 py-3 rounded-lg border border-text/10 bg-background text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="tour-email" className="block text-sm font-medium text-text mb-1.5">
                  <Mail className="inline h-4 w-4 mr-1.5 text-muted" aria-hidden="true" />
                  Email Address <span className="text-secondary">*</span>
                </label>
                <input
                  id="tour-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-text/10 bg-background text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="tour-date" className="block text-sm font-medium text-text mb-1.5">
                  <Calendar className="inline h-4 w-4 mr-1.5 text-muted" aria-hidden="true" />
                  Preferred Date
                </label>
                <input
                  id="tour-date"
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-text/10 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="tour-interest" className="block text-sm font-medium text-text mb-1.5">
                  Interested In
                </label>
                <select
                  id="tour-interest"
                  className="w-full px-4 py-3 rounded-lg border border-text/10 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select care type...</option>
                  <option value="independent">Independent Living</option>
                  <option value="assisted">Assisted Living</option>
                  <option value="memory">Memory Care</option>
                  <option value="respite">Respite Care</option>
                  <option value="unsure">Not sure yet</option>
                </select>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Request Tour
              </Button>

              <p className="text-muted text-xs text-center">
                No commitment required. We just want to show you around.
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
