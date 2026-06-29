import type { MetadataRoute } from "next";
import { fetchPages, fetchPosts, fetchLocations } from "@/lib/payload";

export const dynamic = "force-static";

const BASE_URL = process.env.SITE_URL ?? "https://example.com";

// Slugs owned by static routes (`/blog`, `/communities`, `/floor-plans`,
// `/`). The dynamic `/[slug]` catch-all skips these; the sitemap emits them
// once via the static-route list below.
const RESERVED_SLUGS = new Set(["home", "blog", "communities", "floor-plans"]);
const FLOOR_PLAN_PREFIX = "floor-plans/";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts, locations] = await Promise.all([
    fetchPages(500),
    fetchPosts(500),
    fetchLocations(500),
  ]);

  const staticPages = ["", "/blog", "/communities", "/floor-plans"];

  const dynamicPages = pages
    .map((p) => p.slug ?? "")
    .filter((s) => s && !RESERVED_SLUGS.has(s) && !s.startsWith(FLOOR_PLAN_PREFIX))
    .map((slug) => `/${slug}`);

  const floorPlanPages = pages
    .map((p) => p.slug ?? "")
    .filter((s) => s.startsWith(FLOOR_PLAN_PREFIX))
    .map((slug) => `/${slug}`);

  const blogPages = posts.map((p) => `/blog/${p.slug}`);

  const communityPages = locations
    .filter((l) => l.locationType === "single")
    .map((l) => `/communities/${l.slug}`);

  const allPages = [
    ...staticPages,
    ...dynamicPages,
    ...floorPlanPages,
    ...blogPages,
    ...communityPages,
  ];

  return allPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : path.split("/").length <= 2 ? 0.8 : 0.6,
  }));
}
