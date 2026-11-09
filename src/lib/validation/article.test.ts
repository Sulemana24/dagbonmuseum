import { describe, expect, it } from "vitest";
import { articleInputSchema, slugify } from "./article";

const base = { title: "The Dagbon calendar", slug: "", excerpt: "", content: "<p>Hi</p>", categorySlug: "festivals", tags: "", author: "",
  evidenceType: "documented", coverUrl: "", coverAlt: "", coverCaption: "", coverCredit: "", references: [], seoTitle: "", seoDescription: "", featured: false };

describe("slugify", () => {
  it("makes clean slugs", () => {
    expect(slugify("  Damba Festival: A History! ")).toBe("damba-festival-a-history");
    expect(slugify("Café Ñandú")).toBe("cafe-nandu");
    expect(slugify("???")).toBe("article");
  });
});

describe("articleInputSchema", () => {
  it("accepts a minimal article", () => expect(articleInputSchema.safeParse(base).success).toBe(true));
  it("rejects bad slugs and unknown categories", () => {
    expect(articleInputSchema.safeParse({ ...base, slug: "Bad Slug" }).success).toBe(false);
    expect(articleInputSchema.safeParse({ ...base, categorySlug: "nope" }).success).toBe(false);
  });
  it("only allows Firebase Storage cover images, and requires alt text", () => {
    expect(articleInputSchema.safeParse({ ...base, coverUrl: "https://evil.example/x.jpg", coverAlt: "A drum" }).success).toBe(false);
    expect(articleInputSchema.safeParse({ ...base, coverUrl: "https://firebasestorage.googleapis.com/v0/b/x/o/a.jpg", coverAlt: "" }).success).toBe(false);
    expect(articleInputSchema.safeParse({ ...base, coverUrl: "https://firebasestorage.googleapis.com/v0/b/x/o/a.jpg", coverAlt: "A drum" }).success).toBe(true);
  });
  it("rejects non-https reference links", () => {
    expect(articleInputSchema.safeParse({ ...base, references: [{ label: "Src", url: "javascript:alert(1)" }] }).success).toBe(false);
  });
});
