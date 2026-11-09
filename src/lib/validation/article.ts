import { z } from "zod";
import { heritageCategories } from "@/lib/site-config";

const CATEGORY_SLUGS = heritageCategories.map((c) => c.slug) as [string, ...string[]];
// Until the media library exists, cover images must live in the museum's own Firebase Storage.
const STORAGE_HOSTS = ["firebasestorage.googleapis.com", "storage.googleapis.com"];
const httpsUrl = z.string().trim().url("Enter a full link.").refine((u) => u.startsWith("https://"), "Use an https:// link.");
const optionalHttps = z.union([z.literal(""), httpsUrl]);

export function slugify(input: string): string {
  const s = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100).replace(/-+$/g, "");
  return s || "article";
}

export const articleInputSchema = z.object({
  title: z.string().trim().min(3, "Enter a title of at least 3 characters.").max(160),
  slug: z.string().trim().max(120).regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, "Use lowercase letters, numbers and single hyphens."),
  excerpt: z.string().trim().max(400, "Keep the introduction under 400 characters."),
  content: z.string().max(100_000),
  categorySlug: z.union([z.literal(""), z.enum(CATEGORY_SLUGS)]),
  tags: z.string().max(400),
  author: z.string().trim().max(120),
  evidenceType: z.enum(["", "documented", "oral-tradition", "interpretation"]),
  coverUrl: z.union([z.literal(""), httpsUrl.refine((u) => { try { return STORAGE_HOSTS.includes(new URL(u).hostname); } catch { return false; } }, "Use an image stored in Firebase Storage.")]),
  coverAlt: z.string().trim().max(200),
  coverCaption: z.string().trim().max(300),
  coverCredit: z.string().trim().max(200),
  references: z.array(z.object({ label: z.string().trim().min(1, "Enter a source name.").max(200), url: optionalHttps })).max(30),
  seoTitle: z.string().trim().max(70, "Keep the SEO title under 70 characters."),
  seoDescription: z.string().trim().max(170, "Keep the SEO description under 170 characters."),
  featured: z.boolean(),
}).refine((d) => !d.coverUrl || d.coverAlt.length >= 3, { path: ["coverAlt"], message: "Describe the cover image for screen readers." });

export type ArticleInput = z.infer<typeof articleInputSchema>;
