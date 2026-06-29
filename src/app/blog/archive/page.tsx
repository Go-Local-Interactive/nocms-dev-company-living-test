import { Suspense } from "react";
import type { Metadata } from "next";
import { BlogSidebar } from "@/components/blocks/BlogSidebar";
import { BlogArchiveList } from "./BlogArchiveList";
import { fetchPosts, deriveCategories } from "@/lib/payload";
import { toCardItem } from "@/lib/blog";
import skinConfig from "@/skin.config";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Article Archive | ${skinConfig.brandName}`,
    description: `Browse the complete collection of resources, guides, and insights from ${skinConfig.brandName}.`,
  };
}

export default async function BlogArchivePage() {
  const posts = await fetchPosts(200);
  const categories = deriveCategories(posts);
  const items = posts.map(toCardItem);

  return (
    <div data-nocms-component="blog-archive">
      <section className="section-light">
        <div className="mx-auto max-w-[1200px] px-10 py-16 [@media(max-width:768px)]:py-12 [@media(max-width:480px)]:px-5">
          {/* Archive header */}
          <div className="pb-7 [@media(max-width:480px)]:pt-8">
            <h1 className="mb-2 text-left font-heading text-[2.25rem] font-bold leading-tight text-neutral-900 [@media(max-width:1024px)]:text-[1.75rem] [@media(max-width:480px)]:text-2xl" data-role="heading">
              Article Archive
            </h1>
            <p className="max-w-[560px] text-lg text-muted [@media(max-width:1024px)]:text-base" data-role="subheading">
              Browse our complete collection of resources, guides, and insights
              for families and caregivers.
            </p>
          </div>

          {/* Archive layout — main LEFT, sidebar RIGHT (order); ≤1024 stacks
              with the sidebar bar on top (DOM order). */}
          <div className="grid items-start gap-20 pb-12 min-[1025px]:grid-cols-[1fr_260px] [@media(max-width:1024px)]:gap-0">
            <Suspense fallback={<aside aria-hidden="true" className="min-h-[120px] min-[1025px]:order-2" />}>
              <div className="min-[1025px]:order-2">
                <BlogSidebar categories={categories} basePath="/blog/archive" />
              </div>
            </Suspense>

            <div className="min-[1025px]:order-1">
              {items.length === 0 ? (
                <p className="text-base text-muted" data-role="subheading-2">No articles yet. Check back soon.</p>
              ) : (
                <Suspense fallback={<div className="min-h-[400px]" aria-hidden="true" />}>
                  <BlogArchiveList items={items} />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
