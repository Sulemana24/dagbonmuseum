import { z } from "zod";

export const MEDIA_TYPES = {
  "image/jpeg": { ext: "jpg", kind: "image", maxBytes: 8 * 1024 * 1024 },
  "image/png": { ext: "png", kind: "image", maxBytes: 8 * 1024 * 1024 },
  "image/webp": { ext: "webp", kind: "image", maxBytes: 8 * 1024 * 1024 },
  "image/gif": { ext: "gif", kind: "image", maxBytes: 8 * 1024 * 1024 },
  "application/pdf": { ext: "pdf", kind: "document", maxBytes: 20 * 1024 * 1024 },
} as const;
export type MediaMime = keyof typeof MEDIA_TYPES;
export const isMime = (v: string): v is MediaMime => v in MEDIA_TYPES;

export const uploadRequestSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().refine(isMime, "This file type is not allowed. Use JPEG, PNG, WebP, GIF or PDF."),
  size: z.number().int().positive(),
}).refine((d) => !isMime(d.contentType) || d.size <= MEDIA_TYPES[d.contentType].maxBytes, { path: ["size"], message: "This file is too large (images 8 MB, PDFs 20 MB)." });

export const mediaUpdateSchema = z.object({
  title: z.string().trim().max(160), alt: z.string().trim().max(200), caption: z.string().trim().max(300), credit: z.string().trim().max(200),
});

/** Identify a file from its first bytes. Browser-supplied MIME types are never trusted. */
export function detectType(b: Uint8Array): MediaMime | null {
  const at = (i: number, s: string) => s.split("").every((c, k) => b[i + k] === c.charCodeAt(0));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && at(1, "PNG")) return "image/png";
  if (at(0, "GIF87a") || at(0, "GIF89a")) return "image/gif";
  if (at(0, "RIFF") && at(8, "WEBP")) return "image/webp";
  if (at(0, "%PDF-")) return "application/pdf";
  return null;
}
