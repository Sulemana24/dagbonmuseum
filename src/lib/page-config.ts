import { z } from "zod";
import { optionalHttps } from "@/lib/validation/common";

export type FieldDef =
  | { key: string; label: string; type: "text" | "textarea" | "lines" | "url" | "boolean"; hint?: string }
  | { key: string; label: string; type: "list"; hint?: string; itemFields: { key: string; label: string; textarea?: boolean }[] };

export const PAGES: Record<string, { title: string; description: string; fields: FieldDef[] }> = {
  about: {
    title: "About page", description: "Shown on /about. Leave a field empty to hide it.",
    fields: [
      { key: "intro", label: "Introduction", type: "textarea" }, { key: "story", label: "Our story", type: "textarea", hint: "Only add history the museum has verified." },
      { key: "mission", label: "Mission", type: "textarea" }, { key: "vision", label: "Vision", type: "textarea" },
      { key: "values", label: "Core values", type: "lines", hint: "One value per line." },
      { key: "preservation", label: "Cultural preservation objectives", type: "textarea" }, { key: "education", label: "Educational objectives", type: "textarea" },
      { key: "community", label: "Community engagement", type: "textarea" },
      { key: "team", label: "Leadership and team", type: "list", itemFields: [{ key: "name", label: "Name" }, { key: "role", label: "Role" }] },
    ],
  },
  visit: {
    title: "Visit information", description: "Shown on /visit. Address, hours and admission are in Website settings.",
    fields: [
      { key: "directions", label: "Directions", type: "textarea" }, { key: "groups", label: "Group visits", type: "textarea" },
      { key: "schools", label: "School visits", type: "textarea" }, { key: "accessibility", label: "Accessibility", type: "textarea", hint: "Only list facilities that exist." },
      { key: "guidelines", label: "Visitor guidelines", type: "textarea" },
      { key: "faqs", label: "Frequently asked questions", type: "list", itemFields: [{ key: "q", label: "Question" }, { key: "a", label: "Answer", textarea: true }] },
    ],
  },
  announcement: {
    title: "Public announcement", description: "A banner shown at the top of every public page while enabled.",
    fields: [
      { key: "enabled", label: "Show the announcement", type: "boolean" }, { key: "text", label: "Message", type: "text" },
      { key: "href", label: "Link (optional, https)", type: "url" },
    ],
  },
};

export const PAGE_IDS = Object.keys(PAGES);

export function buildPageSchema(id: string) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of PAGES[id].fields) {
    shape[f.key] =
      f.type === "text" ? z.string().trim().max(300)
      : f.type === "textarea" ? z.string().trim().max(20_000)
      : f.type === "lines" ? z.array(z.string().trim().max(200)).max(30)
      : f.type === "url" ? optionalHttps
      : f.type === "boolean" ? z.boolean()
      : z.array(z.object(Object.fromEntries((f as Extract<FieldDef, { type: "list" }>).itemFields.map((i) => [i.key, z.string().trim().max(2_000)])))).max(30);
  }
  return z.object(shape);
}
