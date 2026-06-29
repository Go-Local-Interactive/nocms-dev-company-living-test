import type { Metadata } from "next";
import Link from "next/link";
import { CTABanner } from "@/components/content/CTABanner";
import skinConfig from "@/skin.config";
import { fetchLocations } from "@/lib/payload";

export const metadata: Metadata = {
  title: `Our Communities | ${skinConfig.brandName}`,
  description: `Find a ${skinConfig.brandName} senior living community near you.`,
};

export default async function CommunitiesIndexPage() {
  // NOTE (Plan 08): the Golden Oaks mockup has NO community-list / per-community
  // page — apartment layouts live under /floor-plans. This data-driven route is
  // kept so the seeded single `main-community` (Plan 08 Task 3) has a home and
  // the nav link isn't dead, but it is NOT a 1:1 mockup target — P9 should not
  // flag it against any mockup file.
  //
  // Payload is the source of truth for which communities exist. The
  // `Locations` collection is shared across verticals — `type: "single"`
  // entries are individual communities (vs. city/state aggregators).
  const editorial = await fetchLocations();
  const communities = editorial.filter((l) => l.locationType === "single");

  const states = new Set(
    communities.map((c) => c.state).filter((s): s is string => Boolean(s)),
  );
  const groupByState = communities.length > 6 && states.size >= 2;

  return (
    <>
      <section
        data-nocms-component="communities-hero"
        className="bg-primary py-16 lg:py-20 text-center text-white"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1
            data-role="heading"
            className="font-heading text-4xl sm:text-5xl font-bold leading-tight"
          >
            Our communities
          </h1>
          <p data-role="subheading" className="mt-4 text-lg text-white/85">
            {communities.length}{" "}
            {communities.length === 1 ? "community" : "communities"} ready to
            welcome you home.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {communities.length === 0 ? (
            <p className="text-center text-muted" data-role="text">
              No communities yet — add one in your CMS to publish it here.
            </p>
          ) : groupByState ? (
            <div className="space-y-12">
              {Array.from(states)
                .sort()
                .map((state) => {
                  const inState = communities.filter((c) => c.state === state);
                  return (
                    <div key={state}>
                      <h2
                        data-role="heading"
                        className="font-heading text-2xl font-bold text-text mb-6"
                      >
                        {state}
                      </h2>
                      <CommunityCards communities={inState} />
                    </div>
                  );
                })}
              {(() => {
                // Communities with no state would match no per-state group
                // and silently disappear, even though they're counted in the
                // header. Render them in a neutral "ungrouped" bucket so every
                // community appears exactly once.
                const ungrouped = communities.filter((c) => !c.state);
                if (ungrouped.length === 0) return null;
                return (
                  <div key="__ungrouped">
                    <h2
                      data-role="heading"
                      className="font-heading text-2xl font-bold text-text mb-6"
                    >
                      More communities
                    </h2>
                    <CommunityCards communities={ungrouped} />
                  </div>
                );
              })()}
            </div>
          ) : (
            <CommunityCards communities={communities} />
          )}
        </div>
      </section>

      <CTABanner
        heading="Don't see a community near you?"
        description="Call us — we may have an opening at a nearby community, or we can recommend partners."
        primaryCta={{ label: "Contact us", href: "/contact-us" }}
        phone={skinConfig.contactPhone}
      />
    </>
  );
}

function CommunityCards({
  communities,
}: {
  communities: Awaited<ReturnType<typeof fetchLocations>>;
}) {
  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {communities.map((c) => {
        const subheading = [c.city, c.state].filter(Boolean).join(", ");
        return (
          <li key={c.id} className="group">
            <Link
              href={`/communities/${c.slug}`}
              className="block rounded-xl border border-text/10 bg-surface p-6 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <h3
                data-role="heading"
                className="font-heading text-xl font-semibold text-text group-hover:text-primary transition-colors"
              >
                {c.title}
              </h3>
              {subheading && (
                <p className="mt-2 text-muted">{subheading}</p>
              )}
              <span
                data-role="cta"
                className="mt-4 inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all"
              >
                Learn more →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
