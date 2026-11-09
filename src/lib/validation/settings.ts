import { z } from "zod";
import { EMPTY_IMAGE, httpsUrl, imageSchema, storageUrl } from "./common";

const MAP_HOSTS = ["https://www.google.com/maps/embed", "https://www.openstreetmap.org/export/embed.html"];
const t = (max: number) => z.string().trim().max(max);

export const settingsSchema = z.object({
  name: z.string().trim().min(2, "Enter the museum name.").max(120),
  description: t(300), address: t(300), email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address.")]),
  phone: t(40), openingHours: t(500), admissionInfo: t(1_000),
  mapEmbedUrl: z.union([z.literal(""), httpsUrl.refine((u) => MAP_HOSTS.some((h) => u.startsWith(h)), "Use a Google Maps or OpenStreetMap embed link.")]),
  intro: t(5_000), mission: t(5_000), vision: t(5_000),
  hero: z.object({ heading: t(160), text: t(400), image: imageSchema }),
  logo: imageSchema, faviconUrl: storageUrl, ogImageUrl: storageUrl,
  seoDescription: t(170), footerNote: t(300),
  social: z.array(z.object({ label: z.string().trim().min(1, "Enter a name.").max(40), href: httpsUrl })).max(10),
  newsletterEnabled: z.boolean(),
  newsletterConsent: z.string().trim().min(10, "Write the consent wording.").max(200),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
export const DEFAULT_CONSENT = "I agree to receive museum updates by email and can unsubscribe at any time.";
export const EMPTY_SETTINGS: SettingsInput = {
  name: "", description: "", address: "", email: "", phone: "", openingHours: "", admissionInfo: "", mapEmbedUrl: "", intro: "", mission: "", vision: "",
  hero: { heading: "", text: "", image: EMPTY_IMAGE }, logo: EMPTY_IMAGE, faviconUrl: "", ogImageUrl: "", seoDescription: "", footerNote: "",
  social: [], newsletterEnabled: true, newsletterConsent: DEFAULT_CONSENT,
};
