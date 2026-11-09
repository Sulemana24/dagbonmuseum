import { EMPTY_IMAGE, type ImageInput } from "@/lib/validation/common";
import type { ArtifactInput } from "@/lib/validation/artifact";
import type { ExhibitionInput } from "@/lib/validation/exhibition";
import type { ResourceInput } from "@/lib/validation/resource";
import type { Artifact, Exhibition, ImageRef, Resource } from "@/types/content";

export const toImage = (i?: ImageRef): ImageInput => (i ? { url: i.url, alt: i.alt ?? "", caption: i.caption ?? "", credit: i.credit ?? "" } : EMPTY_IMAGE);
const refs = (r?: { label: string; url?: string }[]) => (r ?? []).map((x) => ({ label: x.label, url: x.url ?? "" }));

export const toExhibitionInput = (e: Exhibition): ExhibitionInput => ({
  title: e.title, slug: e.slug, excerpt: e.excerpt ?? "", description: e.description ?? "", kind: e.kind ?? "permanent", category: e.category ?? "",
  period: e.period ?? "", startDate: e.startDate ?? "", endDate: e.endDate ?? "", location: e.location ?? "", cover: toImage(e.coverImage),
  gallery: (e.gallery ?? []).map(toImage), artifactIds: e.artifactIds ?? [], featured: !!e.featured, seoTitle: e.seoTitle ?? "", seoDescription: e.seoDescription ?? "",
});

export const toArtifactInput = (a: Artifact): ArtifactInput => ({
  title: a.title, slug: a.slug, excerpt: a.excerpt ?? "", description: a.description ?? "", significance: a.significance ?? "", researchNotes: a.researchNotes ?? "",
  category: a.category ?? "", period: a.period ?? "", materials: a.materials ?? "", origin: a.origin ?? "", attribution: a.attribution ?? "",
  displayLocation: a.displayLocation ?? "", provenance: a.provenance ?? "", imageCredits: a.imageCredits ?? "", images: (a.images ?? []).map(toImage),
  references: refs(a.references), relatedIds: a.relatedIds ?? [], featured: !!a.featured, seoTitle: a.seoTitle ?? "", seoDescription: a.seoDescription ?? "",
});

export const toResourceInput = (r: Resource): ResourceInput => ({
  title: r.title, slug: r.slug, excerpt: r.excerpt ?? "", description: r.description ?? "", type: r.type ?? "article", category: r.category ?? "",
  cover: toImage(r.coverImage), fileUrl: r.fileUrl ?? "", publicDownload: !!r.publicDownload, videoUrl: r.videoUrl ?? "", featured: !!r.featured,
  seoTitle: r.seoTitle ?? "", seoDescription: r.seoDescription ?? "",
});
