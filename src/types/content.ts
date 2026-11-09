export interface ImageRef { url: string; alt: string; caption?: string; credit?: string }

export type EvidenceType = "documented" | "oral-tradition" | "interpretation";

interface Base {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: ImageRef;
  category?: string;
  categorySlug?: string;
  status: "draft" | "pending_review" | "published" | "archived";
  featured?: boolean;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  relatedIds?: string[];
}

export interface Article extends Base {
  content?: string; // HTML, sanitized at render time
  author?: string;
  tags?: string[];
  evidenceType?: EvidenceType;
  references?: { label: string; url?: string }[];
}

export interface Exhibition extends Base {
  kind?: "permanent" | "temporary" | "digital" | "past";
  description?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  gallery?: ImageRef[];
  artifactIds?: string[];
}

export interface Artifact extends Base {
  collectionId?: string;
  description?: string;
  significance?: string;
  period?: string;
  materials?: string;
  origin?: string;
  attribution?: string;
  displayLocation?: string; // public-facing only; never put storage locations here
  provenance?: string;
  researchNotes?: string;
  references?: { label: string; url?: string }[];
  imageCredits?: string;
  images?: ImageRef[];
}

export interface Resource extends Base {
  description?: string;
  type?: "article" | "video" | "document" | "timeline" | "language";
  fileUrl?: string;
  videoUrl?: string;
  publicDownload?: boolean;
}

export type CollectionName = "articles" | "exhibitions" | "artifacts" | "educationalResources";
