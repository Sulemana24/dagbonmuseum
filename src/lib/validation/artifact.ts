import { z } from "zod";
import { SLUG_RE, EMPTY_IMAGE, imageSchema, referenceSchema, seoFields } from "./common";

const t = (max: number) => z.string().trim().max(max);
export const artifactInputSchema = z.object({
  title: z.string().trim().min(3, "Enter a name of at least 3 characters.").max(160),
  slug: t(120).regex(SLUG_RE, "Use lowercase letters, numbers and single hyphens."),
  excerpt: t(400), description: t(20_000), significance: t(20_000), researchNotes: t(20_000),
  category: t(80), period: t(120), materials: t(200), origin: t(200), attribution: t(200),
  displayLocation: t(200), provenance: t(5_000), imageCredits: t(500),
  images: z.array(imageSchema).max(20),
  references: z.array(referenceSchema).max(30),
  relatedIds: z.array(z.string().min(1).max(64)).max(12),
  featured: z.boolean(),
  ...seoFields,
});
export type ArtifactInput = z.infer<typeof artifactInputSchema>;
export const EMPTY_ARTIFACT: ArtifactInput = { title: "", slug: "", excerpt: "", description: "", significance: "", researchNotes: "", category: "", period: "", materials: "", origin: "", attribution: "", displayLocation: "", provenance: "", imageCredits: "", images: [EMPTY_IMAGE], references: [], relatedIds: [], featured: false, seoTitle: "", seoDescription: "" };
export { EMPTY_IMAGE };
