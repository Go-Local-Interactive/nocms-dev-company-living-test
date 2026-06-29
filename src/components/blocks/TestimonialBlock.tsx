import * as React from "react";
import type { BlockProps } from "./types";
import { lexicalToText, lexicalQAPairs, lexicalParagraphs } from "./Lexical";
import { mediaUrl, mediaAlt } from "@/lib/payload";
import { VideoTestimonialPlayer } from "./VideoTestimonial.client";
import { TestimonialShelfTrack } from "./TestimonialShelf.client";

/** TestimonialBlock — the Golden Oaks resident/family voice, ONE block with
 *  three `settings.variant` skins (mockup `components/{reviews-grid,
 *  video-testimonial}` + homepage `.testimonials-section`):
 *
 *    - `reviews` (DEFAULT): cream section + faint leaf-pattern overlay, centered
 *      h2 (`title`) + optional subtitle (`body`), a 3-up grid (→2 ≤1024 →1 ≤640)
 *      of review cards. Cards CYCLE 4 color skins via tokens (sage+green-left /
 *      cream+copper-top / linen+gold-left / white+sage-bottom), each with a gold
 *      star row, an italic quote, and an author row (round `mediaArray[i]` photo
 *      + name/relation).
 *    - `video`: centered h2 + an aggregate rating bar (5 accent stars, score,
 *      "from N reviews", "Read Reviews") + a 2-col (→1 ≤1024) video testimonial —
 *      a 16/9 poster button (`media`/`mediaArray[0]`) with a play button, CC chip
 *      and `<details>` transcript, and a content side with a "Video Testimonial"
 *      overline, a quote with a `--color-primary-light` left rule, and an author
 *      row. The poster→`<video>` swap is the `VideoTestimonialPlayer` client
 *      island; the renderer stays a server component emitting editable markup and
 *      degrades gracefully (no-JS → the poster links to the video file).
 *    - `shelf`: the homepage marquee — a horizontally scrolling track of review
 *      cards (star row + quote + author). The auto-scroll + duplication is the
 *      `TestimonialShelfTrack` client island (pause-on-hover, motion-reduce safe);
 *      the renderer emits the static, editable track 1:1.
 *
 *  Editor contract: root `data-nocms-component="testimonial"`; h2 `data-role` +
 *  `data-payload-subfield="title"`; subtitle/quote `data-payload-subfield="body"`;
 *  per-card `data-array-index={i}` with the author photo
 *  `data-payload-subfield={`mediaArray.${i}`}`; the video poster
 *  `data-payload-subfield="media"`; the rating-bar container
 *  `data-payload-subfield="rating"`.
 *
 *  Data-flow convention (lexical `body` overrides the in-code GO defaults):
 *    - Per-card overrides via heading/paragraph pairs: h3 → attribution
 *      ("Margaret Chen — Daughter of a resident"), paragraph → quote. Pair i maps
 *      to card i; the attribution splits on em-dash / hyphen / comma into
 *      name/relation (no separator ⇒ whole string is the name, default relation).
 *    - With no pairs, body text is the section subtitle (reviews) / the featured
 *      quote (video) and the in-code defaults fill the cards.
 *    - `mediaArray[i]` is card i's author photo; the `video` poster is `media`
 *      (or `mediaArray[0]`). `rating` is the aggregate score (default 4.8).
 *  The seeder (P8) follows this same convention. */

interface Review {
  quote: string;
  name: string;
  relation: string;
  stars?: number;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    quote:
      "My mother has blossomed at Golden Oaks. The staff treats her like family, not just a resident. She's made genuine friendships and stays engaged with activities she loves.",
    name: "Margaret Chen",
    relation: "Daughter of a resident",
  },
  {
    quote:
      "Dad moved into Independent Living last year, and it's been transformative. He's exercising regularly, joined the book club, and tells me he feels like a teenager again.",
    name: "James Rodriguez",
    relation: "Son of a resident",
  },
  {
    quote:
      "The Memory Care team showed us extraordinary patience and compassion with my grandmother. They explained everything and involved us in every care decision along the way.",
    name: "Sarah Williams",
    relation: "Granddaughter",
  },
  {
    quote:
      "We toured five communities before finding Golden Oaks. The transparency, the warmth of the staff, and the quality of the dining program set them apart immediately. Mom loves it here.",
    name: "Linda Patel",
    relation: "Daughter of a resident",
  },
  {
    quote:
      "The Assisted Living program gave my husband back his confidence. The care team knows him by name, understands his routines, and treats him with such dignity. I sleep better at night knowing he's here.",
    name: "Dorothy Huang",
    relation: "Wife of a resident",
  },
  {
    quote:
      "What impressed us most was how they handled the transition. The team made moving day feel like a celebration, not a loss. Two months in, my father says this is the happiest he's been in years.",
    name: "Robert Kim",
    relation: "Son of a resident",
  },
];

const DEFAULT_VIDEO = {
  quote:
    "When we walked in for our first tour, Mom grabbed my hand and said 'I could see myself here.' That was six months ago, and she hasn't stopped smiling since.",
  name: "The Martinez Family",
  relation: "Independent Living resident since 2025",
  videoSrc: "/golden-oaks/testimonial-martinez.mp4",
  captions: "/golden-oaks/testimonial-martinez.vtt",
  poster: "/golden-oaks/testimonial-video.jpg",
  transcript: [
    "Elena Martinez (daughter): “We'd looked at five or six places before we came to Golden Oaks. Mom was nervous. She'd told me flat out she didn't want to leave her house.”",
    "“When we walked in for our first tour, Mom grabbed my hand and said ‘I could see myself here.’ That was six months ago, and she hasn't stopped smiling since.”",
    "Rosa Martinez (resident): “My apartment has better light than my old house, if you can believe that. And the garden — I spend half my afternoons out there. I've made real friends. Not just acquaintances. Friends.”",
    "Elena: “What I didn't expect was how much easier it would make our relationship. Now when I come by, we just… visit. We have coffee. We talk about her grandkids. It's been a gift for both of us.”",
  ],
};

const DEFAULT_REVIEWS_SUBTITLE =
  "Real stories from the residents and families who call Golden Oaks home.";

/** "Margaret Chen — Daughter of a resident" → { name, relation }. */
function splitAttribution(
  line: string,
  fallback: { name: string; relation: string },
): { name: string; relation: string } {
  // Split on em/en dash or comma, OR a hyphen ONLY when whitespace surrounds it
  // ("Name - Relation") — never an intra-word hyphen, so "memory-care" survives.
  const m = line.split(/\s*[—–]\s*|\s*,\s*|\s+-\s+/);
  if (m.length >= 2) {
    return {
      name: m[0].trim() || fallback.name,
      relation: m.slice(1).join(" — ").trim() || fallback.relation,
    };
  }
  return { name: line.trim() || fallback.name, relation: fallback.relation };
}

function reviewsFromBody(body: BlockProps["body"]): Review[] {
  const pairs = lexicalQAPairs(body);
  if (!pairs.length) return DEFAULT_REVIEWS;
  return pairs.map((p, i) => {
    const fallback = DEFAULT_REVIEWS[i % DEFAULT_REVIEWS.length];
    const { name, relation } = splitAttribution(p.q, fallback);
    return { quote: p.a || fallback.quote, name, relation };
  });
}

/** Gold star row (fill = accent token). `count` stars, decorative. */
function Stars({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={`flex gap-[3px] ${className ?? ""}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="fill-[var(--color-accent)]"
          width={16}
          height={16}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/** Round author photo + name/relation. `photo` carries the array subfield attr
 *  so the i-th image is inline-editable; falls back to an initial monogram. */
function AuthorRow({
  photo,
  name,
  relation,
  index,
  photoClassName,
}: {
  photo: BlockProps["media"];
  name: string;
  relation: string;
  index: number;
  photoClassName?: string;
}) {
  const src = mediaUrl(photo);
  const cls = photoClassName ?? "h-12 w-12";
  return (
    <div className="mt-auto flex items-center gap-[14px]">
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          data-payload-subfield={`mediaArray.${index}`}
          src={src}
          alt={mediaAlt(photo) || name}
          className={`${cls} flex-shrink-0 rounded-full border-2 border-[var(--color-secondary-light)] object-cover`}
          loading="lazy"
        />
      ) : (
        <span
          data-payload-subfield={`mediaArray.${index}`}
          aria-hidden="true"
          className={`${cls} flex flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-secondary-light)] bg-[var(--color-primary-light)] font-heading text-lg font-bold text-[var(--color-primary-dark)]`}
        >
          {name.trim().charAt(0) || "G"}
        </span>
      )}
      <div className="text-left">
        <span className="block font-body text-base font-semibold text-[var(--color-neutral-900)]">
          {name}
        </span>
        <span className="font-body text-base text-[var(--color-neutral-500)]">{relation}</span>
      </div>
    </div>
  );
}

/** Per-card color cycle for the reviews grid (mockup `.review-card:nth-child(4n+k)`),
 *  tokens only: sage+green-left / cream+copper-top / linen+gold-left /
 *  white+sage-bottom. */
const REVIEW_CARD_SKINS = [
  "bg-[var(--color-primary-light)] border-l-[3px] border-l-[var(--color-primary)]",
  "bg-[var(--color-section-cream)] border-t-[3px] border-t-[var(--color-secondary)]",
  "bg-[var(--color-linen)] border-l-[3px] border-l-[var(--color-accent)]",
  "bg-[var(--color-white)] border border-[var(--color-primary-light)] border-b-[3px] border-b-[var(--color-primary)]",
];

/** Per-card warm tones for the homepage shelf (mockup
 *  `.testimonial-card:nth-child(6n+k)`). The mockup's --secondary-15/-25,
 *  --primary-12, --accent-15/-25 shades are re-derived via color-mix on the P0
 *  base tokens (token-only, mirrors StatsBarBlock's icon-bg wash). */
const SHELF_CARD_TONES = [
  "color-mix(in srgb, var(--color-secondary) 15%, var(--color-white))",
  "color-mix(in srgb, var(--color-primary) 12%, var(--color-white))",
  "var(--color-linen)",
  "color-mix(in srgb, var(--color-secondary) 25%, var(--color-white))",
  "color-mix(in srgb, var(--color-accent) 15%, var(--color-white))",
  "color-mix(in srgb, var(--color-accent) 25%, var(--color-white))",
];

function Heading({ title }: { title?: string | null }) {
  if (!title) return null;
  return (
    <h2
      data-role="heading"
      data-payload-subfield="title"
      className="text-center font-heading text-4xl font-bold leading-tight text-[var(--color-neutral-900)] sm:text-[2.5rem]"
      style={{ textWrap: "balance" } as React.CSSProperties}
    >
      {title}
    </h2>
  );
}

/* ----------------------------- reviews variant ----------------------------- */

function ReviewsVariant({ title, body, mediaArray }: BlockProps) {
  const reviews = reviewsFromBody(body);
  const hasPairs = lexicalQAPairs(body).length > 0;
  const subtitle = hasPairs ? undefined : lexicalToText(body) || DEFAULT_REVIEWS_SUBTITLE;
  const photos = mediaArray ?? [];

  return (
    <section
      data-nocms-component="testimonial"
      className="relative overflow-hidden bg-[var(--color-section-cream)] px-6 py-16 sm:px-10 lg:px-16"
    >
      {/* Faint repeating leaf-pattern overlay (P0 leaf tint + texture). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          background:
            "var(--color-leaf-pattern-tint) url('/golden-oaks/leaf-pattern.jpg') center / 600px repeat",
        }}
      />
      <div className="relative z-[1] mx-auto max-w-[1200px]">
        <Heading title={title} />
        {subtitle && (
          <p
            data-role="subheading"
            data-payload-subfield="body"
            className="mx-auto mb-10 mt-3 max-w-[640px] text-center font-body text-lg leading-relaxed text-[var(--color-neutral-500)]"
          >
            {subtitle}
          </p>
        )}
        <div
          data-array-prop="mediaArray"
          data-payload-subfield="mediaArray"
          className="grid grid-cols-1 gap-6 min-[641px]:grid-cols-2 min-[1025px]:grid-cols-3"
        >
          {reviews.map((r, i) => (
            <article
              key={`${r.name}-${i}`}
              data-array-index={i}
              className={`flex flex-col rounded-[var(--radius)] p-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] [@media(max-width:640px)]:p-6 ${
                REVIEW_CARD_SKINS[i % REVIEW_CARD_SKINS.length]
              }`}
            >
              <Stars count={r.stars ?? 5} className="mb-4" />
              <blockquote className="mb-6 flex-1 font-body text-base italic leading-[1.7] text-[var(--color-neutral-700)]">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <AuthorRow photo={photos[i]} name={r.name} relation={r.relation} index={i} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ video variant ------------------------------ */

const RATING_LINK_HREF = "/testimonials";

function VideoVariant({ title, body, media, mediaArray, rating }: BlockProps) {
  const pairs = lexicalQAPairs(body);
  const paras = lexicalParagraphs(body);
  const quote = pairs[0]?.a || paras[0] || DEFAULT_VIDEO.quote;
  const attrib = pairs[0]
    ? splitAttribution(pairs[0].q, { name: DEFAULT_VIDEO.name, relation: DEFAULT_VIDEO.relation })
    : { name: DEFAULT_VIDEO.name, relation: DEFAULT_VIDEO.relation };

  const poster = media ?? mediaArray?.[0];
  // Uploaded poster wins; else the in-code GO default poster (`||`, not `??`,
  // so an empty/missing ref falls through).
  const posterSrc = mediaUrl(poster) || DEFAULT_VIDEO.poster;
  const posterAlt = mediaAlt(poster);
  const score = typeof rating === "number" && rating > 0 ? rating.toFixed(1) : "4.8";
  const videoLabel = `Play video testimonial from ${attrib.name} (captions and transcript available)`;

  return (
    <section
      data-nocms-component="testimonial"
      className="overflow-hidden bg-[var(--color-white)] px-6 py-16 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <Heading title={title} />

        {/* Aggregate rating bar. */}
        <div
          data-payload-subfield="rating"
          className="mb-12 mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
        >
          <Stars count={5} className="[&_svg]:h-5 [&_svg]:w-5" />
          <span className="font-body text-lg font-bold text-[var(--color-neutral-900)]">
            {score}
          </span>
          <span className="font-body text-base text-[var(--color-neutral-500)] [@media(max-width:768px)]:hidden">
            from 120+ reviews
          </span>
          <span aria-hidden="true" className="font-body text-base text-[var(--color-neutral-500)]">
            &middot;
          </span>
          <a
            href={RATING_LINK_HREF}
            className="font-body text-base text-[var(--color-primary)] underline underline-offset-[3px] hover:text-[var(--color-primary-dark)] focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            Read Reviews
          </a>
        </div>

        {/* Two-column video testimonial (→ 1 col ≤1024px). */}
        <div className="grid grid-cols-1 items-start gap-12 min-[1025px]:grid-cols-2">
          <div className="flex flex-col">
            <VideoTestimonialPlayer
              video={DEFAULT_VIDEO.videoSrc}
              captions={DEFAULT_VIDEO.captions}
              poster={posterSrc}
              label={videoLabel}
            >
              {/* Editable poster. No-JS: an <a href={video}> wraps the poster so
                  the file stays reachable; the island suppresses it once hydrated. */}
              <a
                href={DEFAULT_VIDEO.videoSrc}
                className="video-thumbnail group/video relative block aspect-video w-full cursor-pointer overflow-hidden rounded-[var(--radius)] focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--color-primary)]"
                aria-label={videoLabel}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-payload-subfield="media"
                  src={posterSrc}
                  alt={posterAlt}
                  className="h-full w-full object-cover transition-transform duration-[400ms] group-hover/video:scale-[1.03]"
                  loading="lazy"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-rich-brown)_38%,transparent)] transition-colors duration-300 group-hover/video:bg-[color-mix(in_srgb,var(--color-rich-brown)_22%,transparent)]"
                />
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 z-[1] flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-rich-brown)_55%,transparent)] transition-[transform,background-color] duration-300 group-hover/video:scale-110 group-hover/video:bg-[color-mix(in_srgb,var(--color-rich-brown)_70%,transparent)]"
                >
                  <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-[var(--color-white)]">
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                </span>
                <span
                  aria-hidden="true"
                  title="Closed captions available"
                  className="absolute bottom-3 right-3 z-[2] inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-white)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-rich-brown)_78%,transparent)] px-2.5 py-1 font-body text-base font-semibold tracking-[0.04em] text-[var(--color-white)]"
                >
                  CC
                </span>
              </a>
            </VideoTestimonialPlayer>

            {/* Transcript disclosure. */}
            <details className="mt-5 font-body text-base">
              <summary className="inline-block cursor-pointer py-2 font-semibold text-[var(--color-primary)] underline underline-offset-4 marker:hidden [&::-webkit-details-marker]:hidden">
                Read full transcript
              </summary>
              <div className="mt-3 rounded-[4px] border-l-[3px] border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-5 py-4">
                {DEFAULT_VIDEO.transcript.map((line, i) => (
                  <p
                    key={i}
                    className="mb-3 font-body text-base leading-[1.7] text-[var(--color-neutral-700)] last:mb-0"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </details>
          </div>

          {/* Content side. */}
          <div className="py-4">
            <span className="mb-4 inline-flex items-center gap-1.5 font-body text-base font-semibold uppercase tracking-[0.05em] text-[var(--color-primary)]">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-[18px] w-[18px] fill-none stroke-[var(--color-primary)] stroke-2"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              Video Testimonial
            </span>
            <p
              data-payload-subfield="body"
              className="mb-7 border-l-[3px] border-[var(--color-primary-light)] pl-6 font-body text-[22px] italic leading-[1.6] text-[var(--color-neutral-700)] [@media(max-width:768px)]:pl-4 [@media(max-width:768px)]:text-lg"
            >
              {quote}
            </p>
            <AuthorRow
              photo={poster}
              name={attrib.name}
              relation={attrib.relation}
              index={0}
              photoClassName="h-14 w-14 [@media(max-width:480px)]:h-11 [@media(max-width:480px)]:w-11"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ shelf variant ------------------------------ */

function ShelfVariant({ title, body, mediaArray }: BlockProps) {
  const reviews = reviewsFromBody(body);
  const photos = mediaArray ?? [];

  return (
    <section
      data-nocms-component="testimonial"
      className="overflow-hidden bg-[var(--color-white)] px-0 py-16"
    >
      {title && (
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">
          <Heading title={title} />
        </div>
      )}
      <div className="relative mt-14 pb-2">
        <TestimonialShelfTrack>
          <div className="contents" data-array-prop="mediaArray" data-payload-subfield="mediaArray">
            {reviews.map((r, i) => (
              <article
                key={`${r.name}-${i}`}
                data-array-index={i}
                className="flex w-[360px] min-w-[360px] max-w-[360px] flex-shrink-0 flex-col rounded-[var(--radius)] p-8 transition-[transform,box-shadow] duration-[350ms] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] [@media(max-width:768px)]:w-[300px] [@media(max-width:768px)]:min-w-[300px] [@media(max-width:768px)]:max-w-[300px] [@media(max-width:768px)]:p-6 [@media(max-width:480px)]:w-[260px] [@media(max-width:480px)]:min-w-[260px] [@media(max-width:480px)]:max-w-[260px]"
                style={{ backgroundColor: SHELF_CARD_TONES[i % SHELF_CARD_TONES.length] }}
              >
                <Stars count={r.stars ?? 5} className="mb-4" />
                <p className="mb-6 font-body text-base italic leading-[1.7] text-[var(--color-neutral-700)]">
                  {r.quote}
                </p>
                <AuthorRow photo={photos[i]} name={r.name} relation={r.relation} index={i} />
              </article>
            ))}
          </div>
        </TestimonialShelfTrack>
      </div>
    </section>
  );
}

/* -------------------------------- dispatch -------------------------------- */

export function TestimonialBlock(props: BlockProps) {
  // Preserve any prior `google-reviews` effort: treat it as the reviews grid.
  const variant = props.settings?.variant;
  if (variant === "video") return <VideoVariant {...props} />;
  if (variant === "shelf") return <ShelfVariant {...props} />;
  return <ReviewsVariant {...props} />;
}
