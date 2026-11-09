import "server-only";
import type { Query } from "firebase-admin/firestore";
import { unstable_cache } from "next/cache";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { siteConfig } from "@/lib/site-config";
import type { Article, Artifact, CollectionName, Exhibition, Resource } from "@/types/content";

type Sort = "newest" | "oldest" | "name";

function serialize<T>(value: unknown): T {
  if (value === null) return undefined as T;
  if (value && typeof value === "object") {
    if ("toDate" in value && typeof (value as { toDate: unknown }).toDate === "function") {
      return (value as { toDate: () => Date }).toDate().toISOString() as T;
    }
    if (Array.isArray(value)) return value.map((v) => serialize(v)) as T;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialize(v)])) as T;
  }
  return value as T;
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isAdminConfigured()) return fallback;
  try { return await fn(); } catch (err) { console.error("[content]", err); return fallback; }
}

export interface ListOptions {
  limit?: number; page?: number; sort?: Sort; featured?: boolean;
  categorySlug?: string; kind?: string;
}

export async function listPublished<T>(col: CollectionName, o: ListOptions = {}) {
  const { limit = 12, page = 1, sort = "newest", featured, categorySlug, kind } = o;
  return safe(async () => {
    let q: Query = adminDb().collection(col).where("status", "==", "published");
    if (featured) q = q.where("featured", "==", true);
    if (categorySlug) q = q.where("categorySlug", "==", categorySlug);
    if (kind) q = q.where("kind", "==", kind);
    q = sort === "name" ? q.orderBy("title", "asc") : q.orderBy("publishedAt", sort === "oldest" ? "asc" : "desc");
    const snap = await q.offset((Math.max(page, 1) - 1) * limit).limit(limit + 1).get();
    const items = snap.docs.slice(0, limit).map((d) => serialize<T>({ id: d.id, ...d.data() }));
    return { items, hasMore: snap.docs.length > limit };
  }, { items: [] as T[], hasMore: false });
}

export async function getPublishedBySlug<T>(col: CollectionName, slug: string): Promise<T | null> {
  return safe(async () => {
    const snap = await adminDb().collection(col).where("status", "==", "published").where("slug", "==", slug).limit(1).get();
    const d = snap.docs[0];
    return d ? serialize<T>({ id: d.id, ...d.data() }) : null;
  }, null);
}

export async function getPublishedByIds<T>(col: CollectionName, ids: string[] = []): Promise<T[]> {
  const unique = [...new Set(ids)].slice(0, 6);
  if (!unique.length) return [];
  return safe(async () => {
    const refs = unique.map((id) => adminDb().collection(col).doc(id));
    const docs = await adminDb().getAll(...refs);
    return docs.filter((d) => d.exists && d.data()?.status === "published").map((d) => serialize<T>({ id: d.id, ...d.data() }));
  }, [] as T[]);
}

export async function listCategories(col: "articleCategories" | "artifactCategories") {
  return safe(async () => {
    const snap = await adminDb().collection(col).orderBy("name").limit(60).get();
    return snap.docs.map((d) => ({ slug: (d.data().slug as string) ?? d.id, name: d.data().name as string }));
  }, [] as { slug: string; name: string }[]);
}

export async function getPageContent(id: string): Promise<Record<string, unknown> | null> {
  return safe(async () => {
    const d = await adminDb().collection("pages").doc(id).get();
    return d.exists ? serialize<Record<string, unknown>>(d.data()) : null;
  }, null);
}

export interface SiteSettings {
  name: string; description: string; address: string; email: string; phone: string;
  openingHours: string; admissionInfo?: string; mapEmbedUrl?: string;
  mission?: string; vision?: string; intro?: string;
  hero?: { heading?: string; text?: string; image?: { url: string; alt: string } };
  logo?: { url: string; alt: string }; faviconUrl?: string; ogImageUrl?: string; seoDescription?: string; footerNote?: string;
  social: { label: string; href: string }[];
  newsletterEnabled?: boolean; newsletterConsent?: string;
}

const storedSettings = unstable_cache(
  () => safe(async () => {
    const d = await adminDb().collection("settings").doc("site").get();
    return d.exists ? serialize<Partial<SiteSettings>>(d.data()) : null;
  }, null),
  ["site-settings"], { revalidate: 60, tags: ["site-settings"] },
);
export { storedSettings as getStoredSettings };

export async function getSiteSettings(): Promise<SiteSettings> {
  const base: SiteSettings = {
    name: siteConfig.name, description: siteConfig.description,
    address: siteConfig.location.address, email: siteConfig.contact.email, phone: siteConfig.contact.phone,
    openingHours: siteConfig.openingHours, social: siteConfig.social,
  };
  return { ...base, ...((await storedSettings()) ?? {}) };
}

export interface SearchHit { type: string; title: string; href: string; description?: string; image?: string; category?: string }

const SEARCH_SOURCES: { col: CollectionName; type: string; base: string }[] = [
  { col: "articles", type: "Article", base: "/history" },
  { col: "exhibitions", type: "Exhibition", base: "/exhibitions" },
  { col: "artifacts", type: "Artifact", base: "/collections" },
  { col: "educationalResources", type: "Learning resource", base: "/learn" },
];

// Firestore has no native full-text search. This scans a bounded set of published records
// (max 150 per collection) and filters in memory. Replace with Algolia/Typesense at scale.
export async function searchPublished(query: string): Promise<SearchHit[]> {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  const groups = await Promise.all(SEARCH_SOURCES.map((s) => safe(async () => {
    const snap = await adminDb().collection(s.col).where("status", "==", "published").orderBy("publishedAt", "desc").limit(150).get();
    return snap.docs.map((d) => ({ s, data: d.data() }));
  }, [] as { s: (typeof SEARCH_SOURCES)[number]; data: FirebaseFirestore.DocumentData }[])));
  return groups.flat().filter(({ data }) =>
    [data.title, data.excerpt, data.description, data.category, ...(data.tags ?? [])]
      .filter(Boolean).join(" ").toLowerCase().includes(needle),
  ).slice(0, 40).map(({ s, data }) => ({
    type: s.type, title: data.title, href: `${s.base}/${data.slug}`,
    description: data.excerpt ?? data.description, image: data.coverImage?.url ?? data.coverImage?.url ?? data.thumbnail?.url, category: data.category,
  }));
}

export type { Article, Artifact, Exhibition, Resource };
