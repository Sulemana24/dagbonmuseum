import "server-only";
import type { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTION_ID_PREFIX, heritageCategories } from "@/lib/site-config";
import { articleInputSchema, slugify, type ArticleInput } from "@/lib/validation/article";
import { artifactInputSchema, type ArtifactInput } from "@/lib/validation/artifact";
import { galleryDocs, imageDoc, orNull } from "@/lib/validation/common";
import { exhibitionInputSchema, type ExhibitionInput } from "@/lib/validation/exhibition";
import { resourceInputSchema, type ResourceInput } from "@/lib/validation/resource";
import type { Base, EngineConfig } from "./content-engine";

const urls = (...u: (string | undefined | null)[]) => u.filter((x): x is string => !!x); // used to block deleting media still in use

const articles: EngineConfig<ArticleInput> = {
  col: "articles", slugCol: "articleSlugs", area: "articles", noun: "article", listPaths: ["/history"], detailBase: "/history",
  fields(i) {
    const cat = heritageCategories.find((c) => c.slug === i.categorySlug);
    return {
      title: i.title, excerpt: orNull(i.excerpt), content: i.content, categorySlug: cat?.slug ?? null, category: cat?.label ?? null,
      tags: i.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12), author: orNull(i.author), evidenceType: i.evidenceType || null,
      coverImage: i.coverUrl ? { url: i.coverUrl, alt: i.coverAlt, caption: orNull(i.coverCaption), credit: orNull(i.coverCredit) } : null,
      references: i.references.map((r) => ({ label: r.label, url: r.url || null })),
      seoTitle: orNull(i.seoTitle), seoDescription: orNull(i.seoDescription), featured: i.featured, mediaUrls: urls(i.coverUrl),
    };
  },
};

const exhibitions: EngineConfig<ExhibitionInput> = {
  col: "exhibitions", slugCol: "exhibitionSlugs", area: "exhibitions", noun: "exhibition", listPaths: ["/exhibitions"], detailBase: "/exhibitions",
  fields: (i) => ({
    title: i.title, excerpt: orNull(i.excerpt), description: orNull(i.description), kind: i.kind, category: orNull(i.category), period: orNull(i.period),
    startDate: orNull(i.startDate), endDate: orNull(i.endDate), location: orNull(i.location), coverImage: imageDoc(i.cover), gallery: galleryDocs(i.gallery),
    artifactIds: i.artifactIds, featured: i.featured, seoTitle: orNull(i.seoTitle), seoDescription: orNull(i.seoDescription),
    mediaUrls: urls(i.cover.url, ...i.gallery.map((g) => g.url)),
  }),
};

const artifacts: EngineConfig<ArtifactInput> = {
  col: "artifacts", slugCol: "artifactSlugs", area: "artifacts", noun: "artifact", listPaths: ["/collections"], detailBase: "/collections",
  fields: (i) => ({
    title: i.title, excerpt: orNull(i.excerpt), description: orNull(i.description), significance: orNull(i.significance), researchNotes: orNull(i.researchNotes),
    category: orNull(i.category), categorySlug: i.category.trim() ? slugify(i.category) : null, period: orNull(i.period), materials: orNull(i.materials),
    origin: orNull(i.origin), attribution: orNull(i.attribution), displayLocation: orNull(i.displayLocation), provenance: orNull(i.provenance),
    imageCredits: orNull(i.imageCredits), images: galleryDocs(i.images), references: i.references.map((r) => ({ label: r.label, url: r.url || null })),
    relatedIds: i.relatedIds, featured: i.featured, seoTitle: orNull(i.seoTitle), seoDescription: orNull(i.seoDescription),
    mediaUrls: urls(...i.images.map((g) => g.url)),
  }),
  // Unique, sequential collection IDs (e.g. DGM-2026-0001) from a transactional counter.
  async onCreate(tx) {
    const ref = adminDb().collection("counters").doc("artifacts");
    const n = ((await tx.get(ref)).data()?.n ?? 0) + 1;
    tx.set(ref, { n });
    return { collectionId: `${COLLECTION_ID_PREFIX}-${new Date().getFullYear()}-${String(n).padStart(4, "0")}` };
  },
  async afterSave(i) {
    const name = i.category.trim();
    if (name) await adminDb().collection("artifactCategories").doc(slugify(name)).set({ slug: slugify(name), name }, { merge: true });
  },
};

const resources: EngineConfig<ResourceInput> = {
  col: "educationalResources", slugCol: "resourceSlugs", area: "resources", noun: "resource", listPaths: ["/learn"], detailBase: "/learn",
  fields: (i) => ({
    title: i.title, excerpt: orNull(i.excerpt), description: orNull(i.description), type: i.type, category: orNull(i.category), coverImage: imageDoc(i.cover),
    fileUrl: orNull(i.fileUrl), publicDownload: i.publicDownload, videoUrl: orNull(i.videoUrl), featured: i.featured,
    seoTitle: orNull(i.seoTitle), seoDescription: orNull(i.seoDescription), mediaUrls: urls(i.cover.url, i.fileUrl),
  }),
};

export const CONTENT_TYPES = ["articles", "exhibitions", "artifacts", "resources"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
export const isContentType = (v: string): v is ContentType => (CONTENT_TYPES as readonly string[]).includes(v);

export interface ContentModule { schema: z.ZodTypeAny; cfg: EngineConfig<Base> }
export const modules: Record<ContentType, ContentModule> = {
  articles: { schema: articleInputSchema, cfg: articles as unknown as EngineConfig<Base> },
  exhibitions: { schema: exhibitionInputSchema, cfg: exhibitions as unknown as EngineConfig<Base> },
  artifacts: { schema: artifactInputSchema, cfg: artifacts as unknown as EngineConfig<Base> },
  resources: { schema: resourceInputSchema, cfg: resources as unknown as EngineConfig<Base> },
};
