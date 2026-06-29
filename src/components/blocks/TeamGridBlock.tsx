import * as React from "react";
import type { BlockProps } from "./types";
import { mediaUrl, mediaAlt } from "@/lib/payload";
import { lexicalToText, lexicalQAPairs } from "./Lexical";

/** TeamGridBlock — 3-column responsive grid of leadership / caregiver cards
 *  used on the "Our Team" page. Modeled on amber-hollow's `.team-grid` /
 *  `.team-card` markup — portrait photo on top with a dark gradient overlay,
 *  name + role + optional bio below.
 *
 *  Data-flow convention:
 *    - Each heading/paragraph pair in the body is one team member: h3 text
 *      is parsed as "Name — Role" (separated by em-dash, en-dash, or hyphen),
 *      the following paragraph is their bio.
 *    - `mediaArray[i]` is the portrait for member i.
 *    - Empty body falls back to 4 default members. */

interface Member {
  name: string;
  role: string;
  bio: string;
  /** In-code GO default portrait (`public/golden-oaks/{leader,team}-*.jpg`),
   *  used when `mediaArray[i]` carries no uploaded ref. */
  image: string;
}

const DEFAULT_MEMBERS: Member[] = [
  {
    name: "Margaret Whitfield",
    role: "Executive Director",
    bio: "Twenty-five years guiding senior communities — Margaret leads with the calm certainty families lean on during life's biggest transitions.",
    image: "/golden-oaks/leader-linda-nakamura.jpg",
  },
  {
    name: "Dr. James Okafor",
    role: "Medical Director",
    bio: "Board-certified geriatrician partnering with residents and families on care plans that prioritize dignity, comfort, and independence.",
    image: "/golden-oaks/leader-james-whitfield.jpg",
  },
  {
    name: "Rosa Delgado",
    role: "Director of Nursing",
    bio: "Leads our 24/7 nursing team with the same hands-on warmth she brings to every resident — bedside, hallway, or family meeting.",
    image: "/golden-oaks/team-rosa-gutierrez.jpg",
  },
  {
    name: "Thomas Beckett",
    role: "Director of Life Enrichment",
    bio: "Curates a calendar that goes beyond bingo — pottery, jazz nights, gardening clubs, and trips that keep residents engaged with the wider world.",
    image: "/golden-oaks/team-tom-brennan.jpg",
  },
];

/** Portrait cycle for body-overridden members beyond the 4 defaults. */
const DEFAULT_MEMBER_IMAGES = [
  "/golden-oaks/leader-linda-nakamura.jpg",
  "/golden-oaks/leader-james-whitfield.jpg",
  "/golden-oaks/team-rosa-gutierrez.jpg",
  "/golden-oaks/team-tom-brennan.jpg",
  "/golden-oaks/team-sarah-mitchell.jpg",
  "/golden-oaks/team-marcus-brown.jpg",
  "/golden-oaks/team-anita-desai.jpg",
  "/golden-oaks/team-david-park.jpg",
];

const ROLE_SPLIT_RE = /\s+[—–-]\s+/;

function parseHeading(h: string, fallback: Member): { name: string; role: string } {
  const parts = h.split(ROLE_SPLIT_RE);
  if (parts.length >= 2) return { name: parts[0].trim(), role: parts.slice(1).join(" - ").trim() };
  return { name: h.trim() || fallback.name, role: fallback.role };
}

export function TeamGridBlock({ title, body, mediaArray }: BlockProps) {
  const overrides = lexicalQAPairs(body);
  const hasOverrides = overrides.length > 0;
  const intro = hasOverrides ? undefined : lexicalToText(body) || undefined;
  const photos = mediaArray ?? [];

  const members: Member[] = hasOverrides
    ? overrides.map((o, i) => {
        const fallback =
          DEFAULT_MEMBERS[i] ??
          { name: "", role: "", bio: "", image: DEFAULT_MEMBER_IMAGES[i % DEFAULT_MEMBER_IMAGES.length] };
        const { name, role } = parseHeading(o.q, fallback);
        return { name, role, bio: o.a || fallback.bio, image: fallback.image };
      })
    : DEFAULT_MEMBERS;

  return (
    <section
      data-nocms-component="team-grid"
      className="py-20 px-6 sm:px-10 lg:px-16 bg-background"
    >
      <div className="max-w-7xl mx-auto">
        {(title || intro) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {title && (
              <h2
                data-role="heading"
                data-payload-subfield="title"
                className="font-heading text-4xl sm:text-5xl font-bold text-text tracking-tight"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                {title}
              </h2>
            )}
            {intro && (
              <p
                data-role="subheading"
                data-payload-subfield="body"
                className="mt-4 font-body text-lg text-muted leading-relaxed"
              >
                {intro}
              </p>
            )}
          </div>
        )}
        <div
          data-array-prop="mediaArray"
          data-payload-subfield="mediaArray"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {members.map((m, i) => {
            const photo = photos[i];
            // Uploaded ref wins; else the in-code GO default portrait for this
            // slot (`||`, not `??`, so an empty/missing ref falls through).
            const photoSrc = mediaUrl(photo) || m.image;
            return (
              <article
                key={i}
                data-array-index={i}
                className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 aspect-[4/5] bg-surface"
              >
                {photoSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    data-payload-subfield={`mediaArray.${i}`}
                    src={photoSrc}
                    alt={mediaAlt(photo) || m.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy" data-role="media"
                  />
                ) : (
                  <div
                    data-payload-subfield={`mediaArray.${i}`}
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface to-accent/20"
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-text/90 via-text/60 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 text-background">
                  <h3 className="font-heading text-xl font-semibold leading-tight" data-role="heading-2">{m.name}</h3>
                  <p className="font-body text-sm mt-1 text-background/85">{m.role}</p>
                  {m.bio && (
                    <p className="font-body text-sm mt-3 leading-relaxed text-background/80 max-h-0 overflow-hidden opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500" data-role="subheading-2">
                      {m.bio}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
