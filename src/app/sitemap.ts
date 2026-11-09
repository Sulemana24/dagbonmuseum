import type { MetadataRoute } from "next";
import { listPublished } from "@/lib/services/content";
import { siteConfig } from "@/lib/site-config";
import type { CollectionName } from "@/types/content";

export const revalidate = 3600;
const SOURCES: [CollectionName, string][] = [["articles", "history"], ["exhibitions", "exhibitions"], ["artifacts", "collections"], ["educationalResources", "learn"]];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticRoutes = ["", "/about", "/history", "/exhibitions", "/collections", "/learn", "/visit", "/contact"].map((p) => ({ url: `${base}${p}` }));
  const dynamic = await Promise.all(SOURCES.map(async ([col, path]) => {
    const { items } = await listPublished<{ slug: string; publishedAt?: string }>(col, { limit: 500 });
    return items.map((i) => ({ url: `${base}/${path}/${i.slug}`, lastModified: i.publishedAt }));
  }));
  return [...staticRoutes, ...dynamic.flat()];
}
