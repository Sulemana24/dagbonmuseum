import { z } from "zod";
import { SLUG_RE, EMPTY_IMAGE, imageSchema, isoDate, seoFields } from "./common";

export const exhibitionInputSchema = z.object({
  title: z.string().trim().min(3, "Enter a title of at least 3 characters.").max(160),
  slug: z.string().trim().max(120).regex(SLUG_RE, "Use lowercase letters, numbers and single hyphens."),
  excerpt: z.string().trim().max(400),
  description: z.string().trim().max(20_000),
  kind: z.enum(["permanent", "temporary", "digital", "past"]),
  category: z.string().trim().max(80),
  period: z.string().trim().max(120),
  startDate: isoDate, endDate: isoDate,
  location: z.string().trim().max(200),
  cover: imageSchema,
  gallery: z.array(imageSchema).max(30),
  artifactIds: z.array(z.string().min(1).max(64)).max(40),
  featured: z.boolean(),
  ...seoFields,
}).refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, { path: ["endDate"], message: "The end date must not be before the start date." });
export type ExhibitionInput = z.infer<typeof exhibitionInputSchema>;
export const EMPTY_EXHIBITION: ExhibitionInput = { title: "", slug: "", excerpt: "", description: "", kind: "permanent", category: "", period: "", startDate: "", endDate: "", location: "", cover: EMPTY_IMAGE, gallery: [], artifactIds: [], featured: false, seoTitle: "", seoDescription: "" };
