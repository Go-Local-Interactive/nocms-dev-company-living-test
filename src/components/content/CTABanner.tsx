import { ArrowRight, Phone } from "lucide-react";

interface CtaCta {
  label: string;
  href: string;
}

interface CTABannerProps {
  heading: string;
  description?: string;
  primaryCta?: CtaCta;
  secondaryCta?: CtaCta;
  variant?: "primary" | "dark" | "accent";
  phone?: string;
}

const variantClasses: Record<string, string> = {
  primary: "bg-primary text-white",
  dark: "bg-rich-brown text-white",
  accent: "bg-accent text-white",
};

export function CTABanner({
  heading,
  description,
  primaryCta = { label: "Schedule a Tour", href: "/schedule-tour" },
  secondaryCta,
  variant = "primary",
  phone,
}: CTABannerProps) {
  return (
    <section className={`py-16 lg:py-20 ${variantClasses[variant] ?? variantClasses.primary}`} data-nocms-component="content/cta-banner">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="font-heading text-3xl sm:text-4xl font-bold mb-4"
          style={{ textWrap: "balance" } as React.CSSProperties} data-role="heading"
        >
          {heading}
        </h2>
        {description && (
          <p className="text-white/85 text-lg mb-8 max-w-2xl mx-auto" data-role="subheading">{description}</p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={primaryCta.href}
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-4 rounded-md text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {primaryCta.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-md text-base hover:bg-white/10 transition-all"
            >
              {secondaryCta.label}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              {phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
