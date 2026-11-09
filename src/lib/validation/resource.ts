import { z } from "zod";
import { SLUG_RE, EMPTY_IMAGE, imageSchema, optionalHttps, seoFields, storageUrl } from "./common";

export const resourceInputSchema = z.object({
  title: z.string().trim().min(3, "Enter a title of at least 3 characters.").max(160),
  slug: z.string().trim().max(120).regex(SLUG_RE, "Use lowercase letters, numbers and single hyphens."),
  excerpt: z.string().trim().max(400),
  description: z.string().trim().max(20_000),
  type: z.enum(["article", "video", "document", "timeline", "language"]),
  category: z.string().trim().max(80),
  cover: imageSchema,
  fileUrl: storageUrl,
  publicDownload: z.boolean(),
  videoUrl: optionalHttps,
  featured: z.boolean(),
  ...seoFields,
}).refine((d) => !d.publicDownload || !!d.fileUrl, { path: ["publicDownload"], message: "Choose a file before making it a public download." });
export type ResourceInput = z.infer<typeof resourceInputSchema>;
export const EMPTY_RESOURCE: ResourceInput = { title: "", slug: "", excerpt: "", description: "", type: "article", category: "", cover: EMPTY_IMAGE, fileUrl: "", publicDownload: false, videoUrl: "", featured: false, seoTitle: "", seoDescription: "" };
