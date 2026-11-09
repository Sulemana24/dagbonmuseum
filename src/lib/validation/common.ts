import { z } from "zod";

export const CONTENT_INTENTS = ["save", "submit", "publish", "unpublish", "archive", "restore"] as const;
export type ContentIntent = (typeof CONTENT_INTENTS)[number];

export const SLUG_RE = /^([a-z0-9]+(-[a-z0-9]+)*)?$/;
const STORAGE_HOSTS = ["firebasestorage.googleapis.com", "storage.googleapis.com"];

export const httpsUrl = z.string().trim().url("Enter a full link.").refine((u) => u.startsWith("https://"), "Use an https:// link.");
export const optionalHttps = z.union([z.literal(""), httpsUrl]);
export const storageUrl = z.union([z.literal(""), httpsUrl.refine((u) => { try { return STORAGE_HOSTS.includes(new URL(u).hostname); } catch { return false; } }, "Choose a file from the media library.")]);
export const isoDate = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker.")]);

export const imageSchema = z.object({
  url: storageUrl, alt: z.string().trim().max(200), caption: z.string().trim().max(300), credit: z.string().trim().max(200),
}).refine((d) => !d.url || d.alt.length >= 3, { path: ["alt"], message: "Describe the image for screen readers." });
export type ImageInput = z.infer<typeof imageSchema>;
export const EMPTY_IMAGE: ImageInput = { url: "", alt: "", caption: "", credit: "" };

export const referenceSchema = z.object({ label: z.string().trim().min(1, "Enter a source name.").max(200), url: optionalHttps });

export const orNull = (s: string) => (s.trim() ? s.trim() : null);
export const imageDoc = (i: ImageInput) => (i.url ? { url: i.url, alt: i.alt, caption: orNull(i.caption), credit: orNull(i.credit) } : null);
export const galleryDocs = (list: ImageInput[]) => list.filter((i) => i.url).map((i) => imageDoc(i)!);
export const seoFields = {
  seoTitle: z.string().trim().max(70, "Keep the SEO title under 70 characters."),
  seoDescription: z.string().trim().max(170, "Keep the SEO description under 170 characters."),
};
