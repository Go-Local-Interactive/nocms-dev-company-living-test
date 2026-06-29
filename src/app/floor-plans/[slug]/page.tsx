import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchPageBySlug, fetchPages } from "@/lib/payload";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import skinConfig from "@/skin.config";

const SLUG_PREFIX = "floor-plans/";

type Params = { slug: string };
type Props = { params: Promise<Params> };

export async function generateStaticParams(): Promise<Params[]> {
  const pages = await fetchPages(500);
  const slugs = pages
    .map((p) => p.slug ?? "")
    .filter((s) => s.startsWith(SLUG_PREFIX))
    .map((s) => s.slice(SLUG_PREFIX.length));
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "_placeholder") return { title: "Floor plan" };
  const page = await fetchPageBySlug(`${SLUG_PREFIX}${slug}`);
  return {
    title: page?.meta?.title ?? page?.title ?? skinConfig.brandName,
    description: page?.meta?.description ?? skinConfig.tagline,
  };
}

export default async function FloorPlanDetailPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "_placeholder") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Floor plans</h1>
        <p className="mt-4 text-zinc-600">
          No floor plans are configured yet. Add a page with a `floor-plans/` slug prefix in your CMS to publish it here.
        </p>
      </div>
    );
  }
  const page = await fetchPageBySlug(`${SLUG_PREFIX}${slug}`);
  if (!page) notFound();
  return (
    <div data-nocms-component="floor-plan-detail">
      <RenderBlocks blocks={page.blocks ?? []} docId={page.id} blocksField="blocks" />
    </div>
  );
}
