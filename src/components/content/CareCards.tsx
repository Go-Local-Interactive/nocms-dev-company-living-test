import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

export interface CareType {
  slug: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  href?: string;
}

interface CareCardsProps {
  heading?: string;
  careTypes?: CareType[];
}

const defaultCareTypes: CareType[] = [
  {
    slug: "independent-living",
    tag: "Active Lifestyle",
    title: "Independent Living",
    description: "Spacious apartments, vibrant social life, fitness programs, and the freedom to enjoy every day on your terms.",
    image: "https://images.unsplash.com/photo-1559234938-b60fff04894d?w=800&q=80",
  },
  {
    slug: "assisted-living",
    tag: "Personalized Support",
    title: "Assisted Living",
    description: "Compassionate daily support, medication management, and health monitoring while honoring independence and dignity.",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80",
  },
  {
    slug: "memory-care",
    tag: "Specialized Care",
    title: "Memory Care",
    description: "Expert dementia care in a secure, nurturing environment with structured activities and person-centered approaches.",
    image: "https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=800&q=80",
  },
];

export function CareCards({
  heading = "Find the Right Fit for Your Loved One",
  careTypes = defaultCareTypes,
}: CareCardsProps) {
  return (
    <SectionWrapper bg="surface" pattern data-nocms-component="content/care-cards">
      <h2
        className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text text-center tracking-tight mb-12"
        style={{ textWrap: "balance" } as React.CSSProperties} data-role="heading"
      >
        {heading}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {(careTypes ?? []).map((care) => (
          <a
            key={care.slug}
            href={care.href ?? `/living-options/${care.slug}`}
            className="group relative rounded-xl overflow-hidden h-[460px] md:h-[500px] block focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Image */}
            <img
              src={care.image}
              alt={`${care.title} community`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy" data-role="media"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-text/85 via-text/40 to-transparent z-[1]" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-[2]">
              <Badge variant="primary" className="mb-3 bg-primary-light/30 text-white backdrop-blur-sm">
                {care.tag}
              </Badge>
              <h3 className="font-heading text-2xl font-bold text-white mb-2">
                {care.title}
              </h3>
              <p className="text-white/85 text-sm leading-relaxed mb-4" data-role="subheading">
                {care.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:gap-3 transition-all">
                Learn More <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </SectionWrapper>
  );
}
