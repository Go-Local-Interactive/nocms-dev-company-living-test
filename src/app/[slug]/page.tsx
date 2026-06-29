import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchPages, fetchPageBySlug } from "@/lib/payload";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { payloadFieldAttrs } from "@/lib/payload-attrs";

type Params = { slug: string };
type Props = { params: Promise<Params> };

// Static routes (blog, communities, floor-plans) always win — Next routes them
// before the catch-all. We still exclude them from generateStaticParams so the
// build doesn't try to render duplicates.
const RESERVED_SLUGS = new Set(["home", "blog", "communities", "floor-plans"]);

export async function generateStaticParams(): Promise<Params[]> {
  const pages = await fetchPages(200);
  const slugs = pages.map((p) => p.slug).filter((s) => !!s && !RESERVED_SLUGS.has(s) && !s.startsWith("floor-plans/"));
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "_placeholder") return { title: "Page" };
  const page = await fetchPageBySlug(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.meta?.title ?? page.title,
    description: page.meta?.description,
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "_placeholder") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight" data-role="heading-2">Page</h1>
        <p className="mt-4 text-zinc-600" data-role="text">Create a page in the CMS to publish it here.</p>
      </div>
    );
  }
  const page = await fetchPageBySlug(slug);
  if (!page) notFound();

  const blocks = page.blocks ?? [];

  return (
    <div data-nocms-component="payload-page">
      {blocks.length === 0 ? (
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1
              {...payloadFieldAttrs({ collection: "pages", docId: page.id, field: "title" })}
              data-role="heading"
              className="font-heading text-4xl sm:text-5xl font-bold text-text"
            >
              {page.title}
            </h1>
            <p className="mt-4 text-muted" data-role="text-2">
              This page has no blocks yet. Add a Hero or Content Block in the CMS to fill it in.
            </p>
          </div>
        </section>
      ) : (
        <RenderBlocks blocks={blocks} docId={page.id} blocksField="blocks" />
      )}
    </div>
  );
}
