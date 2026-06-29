import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchPageBySlug } from "@/lib/payload";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import skinConfig from "@/skin.config";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("floor-plans");
  return {
    title: page?.meta?.title ?? page?.title ?? `Floor Plans | ${skinConfig.brandName}`,
    description: page?.meta?.description ?? `Explore floor plans at ${skinConfig.brandName}.`,
  };
}

export default async function FloorPlansIndexPage() {
  const page = await fetchPageBySlug("floor-plans");
  if (!page) notFound();
  return (
    <div data-nocms-component="floor-plans-index">
      <RenderBlocks blocks={page.blocks ?? []} docId={page.id} blocksField="blocks" />
    </div>
  );
}
