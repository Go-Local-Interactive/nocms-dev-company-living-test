import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlogCardPost } from "@/lib/payload";
import { payloadFieldAttrs } from "@/lib/payload-attrs";

/**
 * BlogCard — the Golden Oaks article card used across every blog/resource
 * template. ONE component, switched by `variant` (ports the mockup's single
 * `renderBlogCard(article, variant)`):
 *
 *   - `default`  vertical card (image top, body bottom) — landing grid + related
 *   - `featured` horizontal card (large image left, body right) — landing hero
 *   - `compact`  small horizontal card (80px thumb + title + meta) — sidebars
 *   - `archive`  horizontal list card (180px image left) — archive list
 *
 * Editor contract (posts collection): the card carries the post doc-id via the
 * caller-spread `docAttrs` (`payloadDocAttrs({ collection:"posts", docId })`,
 * applied BY the page) on the `<article>` root, plus per-field
 * `data-payload-field` + `data-role` on each editable field (featuredImage,
 * category, title, excerpt, publishedAt). Cards come from the `posts`
 * collection, so this is a route-level component (NOT a Payload page block) —
 * it is intentionally not in `registry.ts`.
 *
 * Token-only: every color/radius/shadow maps to a Plan 00 token, so flipping
 * `--color-primary` re-tints the tag pill, title hover, avatar ring, and arrow.
 */

export type BlogCardVariant = "default" | "featured" | "compact" | "archive";

interface VariantConfig {
  /** outer <article> chrome */
  article: string;
  /** image wrapper */
  image: string;
  /** body wrapper */
  body: string;
  /** tag pill */
  tag: string;
  /** title <h3> */
  title: string;
  /** show the excerpt? */
  showExcerpt: boolean;
  excerpt: string;
  /** author avatar size */
  avatar: string;
  /** show the avatar image? */
  showAvatar: boolean;
  /** show the corner arrow link? */
  showArrow: boolean;
  /** arrow chrome */
  arrow: string;
  arrowIcon: string;
}

// Shared card chrome (mockup `.blog-card`): white surface, 1px neutral border,
// radius token, hover lift + shadow + primary-light border. `group` enables the
// image zoom + arrow/ title hover states.
const CARD_BASE =
  "group relative flex overflow-hidden transition-[transform,box-shadow,border-color] duration-300";
const CARD_SURFACE =
  "flex-col bg-white border border-neutral-300 rounded-[var(--radius)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-primary-light";

const VARIANTS: Record<BlogCardVariant, VariantConfig> = {
  // Default vertical card.
  default: {
    article: `${CARD_BASE} ${CARD_SURFACE}`,
    image: "overflow-hidden aspect-[16/10] bg-neutral-100",
    body: "flex flex-col flex-1 p-7 [@media(max-width:480px)]:p-5",
    tag: "self-start inline-block text-base font-semibold leading-snug rounded-full px-3.5 py-1 mb-5 bg-primary-light text-primary",
    title:
      "font-heading text-xl font-bold leading-snug text-text mb-4 transition-colors group-hover:text-primary",
    showExcerpt: true,
    excerpt: "text-base leading-relaxed text-muted mb-6 flex-1 line-clamp-3",
    avatar: "w-9 h-9",
    showAvatar: true,
    showArrow: true,
    arrow:
      "absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 z-[2] transition-[background,transform] duration-200 group-hover:bg-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
    arrowIcon: "w-[18px] h-[18px] text-neutral-700 group-hover:text-primary",
  },
  // Featured horizontal card → stacks at ≤1024.
  featured: {
    article: `${CARD_BASE} ${CARD_SURFACE} min-[1025px]:flex-row`,
    image:
      "overflow-hidden bg-neutral-100 flex-1 min-h-[240px] min-[1025px]:min-h-[320px]",
    body: "flex flex-col flex-1 justify-center p-8 [@media(max-width:480px)]:p-5",
    tag: "self-start inline-block text-base font-semibold leading-snug rounded-full px-3.5 py-1 mb-5 bg-secondary-light text-secondary-dark",
    title:
      "font-heading text-2xl min-[1025px]:text-[1.75rem] [@media(max-width:480px)]:text-xl font-bold leading-snug text-text mb-3.5 transition-colors group-hover:text-primary",
    showExcerpt: true,
    excerpt:
      "text-base min-[1025px]:text-lg leading-relaxed text-muted mb-6 flex-1 line-clamp-4",
    avatar: "w-9 h-9",
    showAvatar: true,
    showArrow: true,
    arrow:
      "absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 z-[2] transition-[background,transform] duration-200 group-hover:bg-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
    arrowIcon: "w-[18px] h-[18px] text-neutral-700 group-hover:text-primary",
  },
  // Compact sidebar card — borderless, thumbnail + title + meta only.
  compact: {
    article: `${CARD_BASE} flex-row bg-transparent rounded-none py-4 border-b border-neutral-100`,
    image:
      "overflow-hidden w-20 min-w-20 aspect-square rounded-[var(--radius)] shrink-0 bg-neutral-100",
    body: "flex flex-col flex-1 pl-3.5",
    tag: "self-start inline-block text-base font-semibold leading-snug rounded-full px-2.5 py-0.5 mb-1.5 bg-primary-light text-primary",
    title:
      "font-heading text-base font-bold leading-snug text-text mb-1 line-clamp-2 transition-colors group-hover:text-primary",
    showExcerpt: false,
    excerpt: "",
    avatar: "w-9 h-9",
    showAvatar: false,
    showArrow: false,
    arrow: "",
    arrowIcon: "",
  },
  // Archive list card — horizontal (180px image) → stacks at ≤768.
  archive: {
    article: `${CARD_BASE} min-[769px]:flex-row bg-transparent rounded-none border-0 border-b border-neutral-200 py-8 first:pt-0`,
    image:
      "overflow-hidden rounded-[var(--radius)] bg-neutral-100 w-full aspect-[16/10] min-[769px]:w-[180px] min-[769px]:min-w-[180px] min-[769px]:aspect-[4/3] shrink-0",
    body: "flex flex-col justify-center flex-1 pt-4 min-[769px]:pt-0 min-[769px]:pl-6",
    tag: "self-start inline-block text-base font-semibold leading-snug rounded-full px-2.5 py-0.5 mb-2.5 bg-primary-light text-primary",
    title:
      "font-heading text-[1.15rem] font-bold leading-snug text-text mb-2 transition-colors group-hover:text-primary",
    showExcerpt: true,
    excerpt: "text-base leading-relaxed text-muted mb-3 line-clamp-2",
    avatar: "w-7 h-7",
    showAvatar: true,
    showArrow: true,
    // Archive arrow sits inline (static) at the row end on desktop; hidden ≤768.
    arrow:
      "hidden min-[769px]:flex self-center ml-auto shrink-0 w-11 h-11 items-center justify-center rounded-full bg-transparent border-2 border-neutral-300 transition-[background,border-color] duration-200 group-hover:border-primary group-hover:bg-primary-light",
    arrowIcon: "w-[18px] h-[18px] text-neutral-700 group-hover:text-primary",
  },
};

export interface BlogCardProps {
  post: BlogCardPost;
  variant?: BlogCardVariant;
  /** Doc-identity attrs from the page (`payloadDocAttrs({collection:"posts",
   *  docId: post.id})`) — spread on the `<article>` root for click-to-edit. */
  docAttrs?: Record<string, string>;
  className?: string;
}

export function BlogCard({ post, variant = "default", docAttrs, className }: BlogCardProps) {
  const v = VARIANTS[variant];
  const href = `/blog/${post.slug}`;
  const cover = post.coverImage;
  const field = (name: string) =>
    payloadFieldAttrs({ collection: "posts", docId: post.id, field: name });

  return (
    <article
      data-nocms-component="blog-card"
      {...docAttrs}
      className={[v.article, className].filter(Boolean).join(" ")}
    >
      <div data-role="media" {...field("featuredImage")} className={v.image}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.src}
            alt={cover.alt}
            loading="lazy"
            className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105" data-role="media-2"
          />
        ) : (
          <div
            aria-hidden="true"
            className="w-full h-full bg-gradient-to-br from-primary-light via-surface to-accent-light"
          />
        )}
      </div>

      <div className={v.body}>
        {post.category && (
          <span data-role="tag" {...field("category")} className={v.tag}>
            {post.category}
          </span>
        )}

        <h3 className={v.title} data-role="heading-2">
          {/* Title link covers the whole card via ::after-equivalent inset
              anchor; tabindex on the arrow is -1 so the title is the one stop. */}
          <Link
            href={href}
            data-role="heading"
            {...field("title")}
            className="no-underline text-inherit after:absolute after:inset-0 after:z-[1] after:content-['']"
          >
            {post.title}
          </Link>
        </h3>

        {v.showExcerpt && post.excerpt && (
          <p data-role="body" {...field("excerpt")} className={v.excerpt}>
            {post.excerpt}
          </p>
        )}

        {(post.author || post.readTime) && (
          <div
            data-role="meta"
            {...field("publishedAt")}
            className="flex items-center justify-between gap-3 mt-auto"
          >
            <div className="flex items-center gap-2.5">
              {v.showAvatar && post.author?.photoSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.photoSrc}
                  alt={post.author.photoAlt ?? ""}
                  loading="lazy"
                  className={`${v.avatar} rounded-full object-cover border-2 border-primary-light shrink-0`} data-role="media-3"
                />
              )}
              <div className="flex flex-col">
                {post.author?.name && (
                  <span className="text-base font-semibold leading-tight text-text">
                    {post.author.name}
                  </span>
                )}
                {post.readTime && (
                  <span className="text-base leading-tight text-muted">{post.readTime}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {v.showArrow && (
        <Link
          href={href}
          aria-label={`Read article: ${post.title}`}
          tabIndex={-1}
          className={v.arrow}
        >
          <ArrowUpRight className={v.arrowIcon} strokeWidth={2} aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
