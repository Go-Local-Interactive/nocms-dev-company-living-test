import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CTABanner } from "@/components/content/CTABanner";
import { fetchLocations, fetchLocationBySlug } from "@/lib/payload";
import { LexicalRichText } from "@/lib/lexical-to-html";
import { payloadDocAttrs, payloadFieldAttrs } from "@/lib/payload-attrs";
import skinConfig from "@/skin.config";

type Params = { slug: string };
type Props = { params: Promise<Params> };

// NOTE (Plan 08): the Golden Oaks mockup has NO per-community page (floor-plan
// layouts live under /floor-plans/[slug]). This data-driven route renders the
// single seeded `main-community` (Plan 08 Task 3) so the nav link isn't dead,
// but it is NOT a 1:1 mockup target — P9 should not flag it against a mockup.
export async function generateStaticParams(): Promise<Params[]> {
  // Payload `Locations` is shared across verticals. Filter to `type: "single"`
  // entries — those are individual communities (not city/state aggregators).
  const editorial = await fetchLocations(200);
  const singles = editorial.filter((l) => l.locationType === "single");
  if (singles.length === 0) return [{ slug: "_placeholder" }];
  return singles.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "_placeholder") return { title: "Community" };
  const editorial = await fetchLocationBySlug(slug);
  const name = editorial?.title ?? "Community";
  const city = editorial?.city ?? "";
  const state = editorial?.state ?? "";
  return {
    title: editorial?.meta?.title ?? `${name}${city ? ` — ${city}, ${state}` : ""}`,
    description:
      editorial?.meta?.description ??
      (editorial?.address?.street
        ? `Senior living at ${editorial.address.street}, ${city}.${editorial.address.phone ? ` Call ${editorial.address.phone}.` : ""}`
        : undefined),
  };
}

export default async function CommunityDetailPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "_placeholder") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight" data-role="heading-2">Communities</h1>
        <p className="mt-4 text-zinc-600" data-role="text">
          No communities are configured yet. Add a location record in your CMS
          to publish it here.
        </p>
      </div>
    );
  }

  const editorial = await fetchLocationBySlug(slug);
  if (!editorial) notFound();

  const name = editorial.title;
  const subheading = [editorial.city, editorial.state].filter(Boolean).join(", ");
  const phone = editorial.address?.phone ?? skinConfig.contactPhone;
  const email = editorial.address?.email ?? skinConfig.contactEmail;
  const street = editorial.address?.street;

  return (
    <>
      <section
        data-nocms-component="community-header"
        {...payloadDocAttrs({ collection: "locations", docId: editorial.id })}
        className="bg-surface py-10 lg:py-14"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
            <Link href="/communities" className="hover:text-primary transition-colors">
              Communities
            </Link>
            <span className="mx-2" data-role="text-2">/</span>
            <span className="text-text">{name}</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1
                data-role="heading"
                {...payloadFieldAttrs({ collection: "locations", docId: editorial.id, field: "title" })}
                className="font-heading text-4xl lg:text-5xl font-bold text-text leading-tight"
              >
                {name}
              </h1>
              {subheading && (
                <p data-role="subheading" className="mt-3 text-lg text-muted">
                  {subheading}
                </p>
              )}
            </div>
            <a
              href="/schedule-tour"
              data-role="cta"
              className="inline-flex items-center justify-center bg-primary text-white font-semibold px-6 py-3 rounded-md shadow-md hover:opacity-90 transition-opacity"
            >
              Schedule a tour
            </a>
          </div>
          {(street || phone || email) && (
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-muted">
              {street && (
                <span>
                  {street}
                  {subheading ? `, ${subheading}` : ""}
                </span>
              )}
              {phone && (
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="hover:text-primary transition-colors">
                  {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                  {email}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {editorial.description && (
        <section className="py-12 lg:py-16 bg-background">
          <div
            className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"
            {...payloadFieldAttrs({ collection: "locations", docId: editorial.id, field: "description" })}
          >
            <LexicalRichText
              value={editorial.description}
              className="text-text leading-relaxed prose prose-lg max-w-none"
            />
          </div>
        </section>
      )}

      <CTABanner
        heading={`Visit ${name}`}
        description="Schedule a tour and see why families choose us."
        primaryCta={{ label: "Schedule a tour", href: "/schedule-tour" }}
        phone={phone ?? undefined}
      />
    </>
  );
}
