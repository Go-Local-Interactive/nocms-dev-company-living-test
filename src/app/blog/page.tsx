import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { BlogCard } from "@/components/blocks/BlogCard";
import { BlogSidebar } from "@/components/blocks/BlogSidebar";
import { BlogGrid } from "./BlogGrid";
import {
  fetchPageBySlug,
  fetchPosts,
  toCardPost,
  deriveCategories,
} from "@/lib/payload";
import { toCardItem, pickFeatured } from "@/lib/blog";
import { payloadDocAttrs } from "@/lib/payload-attrs";
import skinConfig from "@/skin.config";

const BLOG_INDEX_SLUG = "blog";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug(BLOG_INDEX_SLUG);
  return {
    title: page?.meta?.title ?? `Resources & Insights | ${skinConfig.brandName}`,
    description:
      page?.meta?.description ??
      `Articles, tips, and guides from ${skinConfig.brandName}.`,
  };
}

export default async function BlogIndexPage() {
  const [page, posts] = await Promise.all([
    fetchPageBySlug(BLOG_INDEX_SLUG),
    fetchPosts(),
  ]);
  const headerBlocks = page?.blocks ?? [];
  const categories = deriveCategories(posts);

  // Featured = most-recent (or a `featured` post once the schema adds one). It
  // anchors the hero and is dropped from the default grid below.
  const featured = pickFeatured(posts);

  // The full, serialized post list — the client grid re-filters this from the
  // live URL params (static export can't read searchParams server-side).
  const items = posts.map(toCardItem);

  return (
    <div data-nocms-component="payload-page">
      {/* Seeded page header band (hero block etc.) renders above the featured
          hero, carrying its own editor contract via RenderBlocks. */}
      {headerBlocks.length > 0 && (
        <RenderBlocks blocks={headerBlocks} docId={page!.id} blocksField="blocks" />
      )}

      {/* ===== FEATURED ARTICLE HERO ===== */}
      <section className="relative overflow-hidden bg-primary-dark py-12 [@media(max-width:768px)]:py-9">
        {/* Faint leaf-sprigs overlay (mockup ::after, opacity 0.06). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.06]"
          style={{ backgroundImage: "url('/golden-oaks/leaf-sprigs-white.png')" }}
        />
        <div className="relative z-[1] mx-auto max-w-[1200px] px-10 [@media(max-width:480px)]:px-5">
          <nav aria-label="Breadcrumb" className="mb-7 text-base">
            <ol className="m-0 flex flex-wrap items-center gap-0 p-0">
              <li className="flex items-center">
                <Link href="/" className="text-white/85 no-underline transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <span aria-hidden="true" className="mx-2 font-normal text-white/65" data-role="text">/</span>
                <Link href="/blog" className="text-white/85 no-underline transition-colors hover:text-white">
                  Resources
                </Link>
              </li>
              <li className="flex items-center">
                <span aria-hidden="true" className="mx-2 font-normal text-white/65" data-role="text-2">/</span>
                <span aria-current="page" className="font-semibold text-white" data-role="text-3">Featured</span>
              </li>
            </ol>
          </nav>
          <h1 className="sr-only" data-role="heading">Resources &amp; Insights</h1>

          {featured ? (
            <div className="blog-on-dark">
              <BlogCard
                post={toCardPost(featured)}
                variant="featured"
                docAttrs={payloadDocAttrs({ collection: "posts", docId: featured.id })}
              />
            </div>
          ) : (
            <p className="max-w-2xl text-lg text-sand/85" data-role="subheading">
              New articles are on the way. Check back soon for resources, guides,
              and insights from {skinConfig.brandName}.
            </p>
          )}
        </div>
      </section>

      {/* ===== BLOG LAYOUT (sidebar + grid) ===== */}
      <section className="section-light">
        <div className="mx-auto max-w-[1200px] px-10 py-16 [@media(max-width:768px)]:py-12 [@media(max-width:480px)]:px-5">
          <div className="grid items-start gap-10 pb-12 min-[1025px]:grid-cols-[240px_1fr]">
            <Suspense fallback={<aside aria-hidden="true" className="min-h-[200px]" />}>
              <BlogSidebar categories={categories} basePath="/blog" />
            </Suspense>

            <div className="flex flex-col gap-9">
              {items.length === 0 ? (
                <p className="text-base text-muted" data-role="subheading-2">No articles yet. Check back soon.</p>
              ) : (
                <Suspense
                  fallback={<div className="min-h-[300px]" aria-hidden="true" />}
                >
                  <BlogGrid items={items} featuredId={featured?.id} />
                </Suspense>
              )}

              {/* Previous Posts → archive */}
              <div className="pt-8 text-center">
                <Link
                  href="/blog/archive"
                  className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-primary bg-transparent px-8 py-3.5 font-body text-lg font-semibold text-primary no-underline transition-[background,color,border-color,gap] hover:gap-3 hover:border-primary-dark hover:bg-primary-dark hover:text-white"
                >
                  Previous Posts
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
