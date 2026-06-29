import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type * as React from "react";
import {
  fetchPosts,
  fetchPostBySlug,
  mediaUrl,
  mediaAlt,
  toCardPost,
  categoryLabel,
  categorySlug,
  readTimeLabel,
  type PayloadPost,
} from "@/lib/payload";
import { LexicalRichText } from "@/lib/lexical-to-html";
import { payloadDocAttrs, payloadFieldAttrs } from "@/lib/payload-attrs";
import { relatedPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blocks/BlogCard";
import { ArticleShare } from "./ArticleShare";
import skinConfig from "@/skin.config";

type Params = { slug: string };
type Props = { params: Promise<Params> };

export const dynamic = "force-static";

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await fetchPosts(200);
  if (posts.length === 0) return [{ slug: "_placeholder" }];
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "_placeholder") return { title: "Blog" };
  const post = await fetchPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.meta?.title ?? `${post.title} | ${skinConfig.brandName}`,
    description: post.meta?.description ?? post.excerpt,
  };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "_placeholder") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-heading text-3xl font-bold text-text" data-role="heading-2">Blog</h1>
        <p className="mt-4 text-muted" data-role="text">No posts yet.</p>
      </div>
    );
  }
  const [post, allPosts] = await Promise.all([fetchPostBySlug(slug), fetchPosts(200)]);
  if (!post) notFound();

  const docId = post.id;
  const field = (name: string): Record<string, string> =>
    payloadFieldAttrs({ collection: "posts", docId, field: name });

  const cover = mediaUrl(post.featuredImage);
  const coverAlt = mediaAlt(post.featuredImage) || post.title;
  const category = categoryLabel(post);
  const catSlug = categorySlug(post);
  const dateValue = post.publishedAt ?? post.updatedAt;

  const author = post.author && typeof post.author !== "string" ? post.author : null;
  const authorPhoto = author ? mediaUrl(author.photo) : null;

  const related = relatedPosts(post, allPosts, 3);

  return (
    <article data-nocms-component="blog-post" {...payloadDocAttrs({ collection: "posts", docId })}>
      {/* ===== ARTICLE HERO (full-bleed) ===== */}
      <section className="relative flex h-[520px] items-center justify-center overflow-hidden text-center text-white [@media(max-width:1024px)]:h-[450px] [@media(max-width:768px)]:h-[400px] [@media(max-width:480px)]:h-[360px]">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-role="media"
            {...field("featuredImage")}
            src={cover}
            alt={coverAlt}
            className="absolute inset-0 z-0 h-full w-full object-cover"
            loading="eager"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[2]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-hero-overlay-from-soft) 0%, var(--color-hero-overlay-to) 100%)",
          }}
        />
        <div className="relative z-[3] mx-auto w-full max-w-[800px] px-10 [@media(max-width:480px)]:px-5">
          <nav aria-label="Breadcrumb" className="mb-5 text-base">
            <ol className="m-0 flex flex-wrap items-center justify-center gap-0 p-0">
              <li className="flex items-center">
                <Link href="/" className="text-white no-underline transition-colors hover:text-sand">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <span aria-hidden="true" className="mx-2 font-normal text-white/65" data-role="text-2">/</span>
                <Link href="/blog" className="text-white no-underline transition-colors hover:text-sand">
                  Resources
                </Link>
              </li>
              {category && (
                <li className="flex items-center">
                  <span aria-hidden="true" className="mx-2 font-normal text-white/65" data-role="text-3">/</span>
                  <span aria-current="page" className="font-semibold text-white">{category}</span>
                </li>
              )}
            </ol>
          </nav>

          {category && (
            <span
              data-role="tag"
              {...field("category")}
              className="mb-5 inline-block rounded-full bg-black/35 px-4 py-1.5 text-base font-semibold text-white"
            >
              {category}
            </span>
          )}

          <h1
            data-role="heading"
            {...field("title")}
            className="mx-auto mb-0 max-w-[720px] font-heading text-[2.75rem] font-bold leading-[1.15] text-white [@media(max-width:1024px)]:text-[2.25rem] [@media(max-width:768px)]:text-[1.75rem] [@media(max-width:480px)]:text-2xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {post.title}
          </h1>

          {(author || dateValue) && (
            <div
              data-role="meta"
              {...field("publishedAt")}
              className="mt-5 flex flex-wrap items-center justify-center gap-5"
            >
              {author?.name && (
                <span className="flex items-center gap-3">
                  {authorPhoto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={authorPhoto}
                      alt={mediaAlt(author.photo) || author.name}
                      loading="lazy"
                      className="h-11 w-11 rounded-full border-2 border-white/30 object-cover" data-role="media-2"
                    />
                  )}
                  <span className="text-base font-semibold text-white">{author.name}</span>
                </span>
              )}
              {author?.name && dateValue && (
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/40" />
              )}
              {dateValue && <span className="text-base text-white/85">{formatDate(dateValue)}</span>}
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/40" />
              <span className="text-base text-white/85">{readTimeLabel(post)}</span>
            </div>
          )}
        </div>
      </section>

      {/* ===== ARTICLE CONTENT (share rail + body) ===== */}
      <section className="bg-background">
        <div className="mx-auto max-w-[860px] px-10 py-16 [@media(max-width:768px)]:py-12 [@media(max-width:480px)]:px-5">
          <div className="grid items-start gap-10 [@media(min-width:769px)]:grid-cols-[60px_1fr] [@media(max-width:768px)]:gap-0">
            <ArticleShare title={post.title} />

            <div>
              {/* Article body — lexical content styled by the .article-body
                  prose layer in globals.css. */}
              <div {...field("content")}>
                <LexicalRichText value={post.content} className="article-body" />
              </div>

              {/* Tags (derived from the post's category). */}
              {category && (
                <div className="mt-12 flex flex-wrap gap-2 border-t border-neutral-200 pt-8">
                  <Link
                    href={`/blog?category=${catSlug}`}
                    className="rounded-full border-2 border-neutral-300 bg-transparent px-4 py-2 text-base font-semibold text-primary no-underline transition-[border-color,background,color] hover:border-primary hover:bg-primary-light hover:text-primary"
                  >
                    {category}
                  </Link>
                </div>
              )}

              {/* Author bio. */}
              {author?.name && (
                <div className="mt-12 flex items-start gap-6 rounded-[var(--radius)] bg-section-sage p-8 [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:items-center [@media(max-width:768px)]:text-center">
                  {authorPhoto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={authorPhoto}
                      alt={mediaAlt(author.photo) || author.name}
                      loading="lazy"
                      className="h-20 w-20 shrink-0 rounded-full border-[3px] border-primary-light object-cover" data-role="media-3"
                    />
                  )}
                  <div className="flex flex-col gap-2">
                    <span className="font-heading text-xl font-bold text-neutral-900">{author.name}</span>
                    {author.role && <span className="text-base font-semibold text-primary">{author.role}</span>}
                    {author.bio && <p className="text-base leading-relaxed text-muted" data-role="subheading">{author.bio}</p>}
                  </div>
                </div>
              )}

              {/* Newsletter sign-up (brand strings from skin.config). */}
              <div className="relative mt-12 overflow-hidden rounded-[var(--radius)] bg-primary-dark px-10 py-12 text-center [@media(max-width:768px)]:px-6 [@media(max-width:768px)]:py-9">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.05]"
                  style={{ backgroundImage: "url('/golden-oaks/leaf-sprigs-white.png')" }}
                />
                <div className="relative z-[1]">
                  <h2 className="mb-3 text-center font-heading text-2xl font-bold text-white" data-role="heading-3">Stay Informed</h2>
                  <p className="mb-6 text-base leading-relaxed text-sand" data-role="subheading-2">
                    Get helpful articles, guides, and community updates from{" "}
                    {skinConfig.brandName} delivered to your inbox.
                  </p>
                  <form
                    action={skinConfig.contactEmail ? `mailto:${skinConfig.contactEmail}` : undefined}
                    method="post"
                    className="mx-auto flex max-w-[440px] gap-3 [@media(max-width:768px)]:flex-col"
                  >
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Your email address"
                      aria-label="Email address"
                      className="min-h-11 flex-1 rounded-[var(--radius)] border-2 border-transparent bg-white px-4 py-3.5 text-base text-neutral-900 outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-accent focus:ring-[3px] focus:ring-accent/25"
                    />
                    <button
                      type="submit"
                      className="min-h-11 whitespace-nowrap rounded-[var(--radius)] border-2 border-secondary bg-secondary px-7 py-3.5 text-base font-semibold text-white transition-[background,border-color] hover:border-secondary-dark hover:bg-secondary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" data-role="cta"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED ARTICLES ===== */}
      {related.length > 0 && (
        <section className="bg-section-sage py-16">
          <div className="mx-auto max-w-[1200px] px-10 [@media(max-width:480px)]:px-5">
            <h2 className="mb-6 text-left font-heading text-2xl font-bold text-neutral-900" data-role="heading-4">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-3 gap-7 [@media(max-width:1024px)]:grid-cols-2 [@media(max-width:768px)]:grid-cols-1 [@media(max-width:768px)]:gap-6">
              {related.map((rel: PayloadPost) => (
                <BlogCard
                  key={rel.id}
                  post={toCardPost(rel)}
                  variant="default"
                  docAttrs={payloadDocAttrs({ collection: "posts", docId: rel.id })}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Back to all articles ===== */}
      <div className="mx-auto max-w-[860px] px-10 pb-16 [@media(max-width:480px)]:px-5">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-semibold text-primary no-underline transition-all hover:gap-3"
        >
          ← Back to all articles
        </Link>
      </div>
    </article>
  );
}
