import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath, revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import type { Session } from "@/lib/auth/session";
import { imageDoc } from "@/lib/validation/common";
import { settingsSchema } from "@/lib/validation/settings";
import { logActivity } from "./activity";

/** Empty values are omitted so the public site falls back to its "To be confirmed" placeholders. */
const prune = <T extends Record<string, unknown>>(o: T) =>
  Object.fromEntries(
    Object.entries(o).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  ) as Partial<T>;

export async function saveSettings(s: Session, raw: unknown) {
  const v = settingsSchema.parse(raw);
  const hero = prune({
    heading: v.hero.heading,
    text: v.hero.text,
    image: v.hero.image.url
      ? { url: v.hero.image.url, alt: v.hero.image.alt }
      : undefined,
  });
  const logo = imageDoc(v.logo);
  const doc = {
    ...prune({
      name: v.name,
      description: v.description,
      address: v.address,
      email: v.email,
      phone: v.phone,
      openingHours: v.openingHours,
      admissionInfo: v.admissionInfo,
      mapEmbedUrl: v.mapEmbedUrl,
      intro: v.intro,
      mission: v.mission,
      vision: v.vision,
      faviconUrl: v.faviconUrl,
      ogImageUrl: v.ogImageUrl,
      seoDescription: v.seoDescription,
      footerNote: v.footerNote,
    }),
    ...(Object.keys(hero).length ? { hero } : {}),
    ...(logo ? { logo: { url: logo.url, alt: logo.alt } } : {}),
    social: v.social,
    newsletterEnabled: v.newsletterEnabled,
    newsletterConsent: v.newsletterConsent,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: s.uid,
  };
  await adminDb().collection("settings").doc("site").set(doc);
  await logActivity({
    actorId: s.uid,
    action: "settings.update",
    target: "site",
    metadata: {
      fields: Object.keys(doc).filter(
        (k) => !["updatedAt", "updatedBy"].includes(k),
      ),
    },
  });
  revalidateTag("site-settings");
  revalidatePath("/", "layout");
}

import type { SettingsInput } from "@/lib/validation/settings";
import { DEFAULT_CONSENT, EMPTY_SETTINGS } from "@/lib/validation/settings";

/** Fresh (uncached) read for the settings form. Only stored values are shown, never placeholders. */
export async function getSettingsInput(): Promise<SettingsInput> {
  const d = ((
    await adminDb().collection("settings").doc("site").get()
  ).data() ?? {}) as Record<string, unknown>;
  const str = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");
  const img = (v: unknown) => {
    const o = (v ?? {}) as { url?: string; alt?: string };
    return { url: o.url ?? "", alt: o.alt ?? "", caption: "", credit: "" };
  };
  const hero = (d.hero ?? {}) as {
    heading?: string;
    text?: string;
    image?: unknown;
  };
  return {
    ...EMPTY_SETTINGS,
    name: str("name"),
    description: str("description"),
    address: str("address"),
    email: str("email"),
    phone: str("phone"),
    openingHours: str("openingHours"),
    admissionInfo: str("admissionInfo"),
    mapEmbedUrl: str("mapEmbedUrl"),
    intro: str("intro"),
    mission: str("mission"),
    vision: str("vision"),
    hero: {
      heading: hero.heading ?? "",
      text: hero.text ?? "",
      image: img(hero.image),
    },
    logo: img(d.logo),
    faviconUrl: str("faviconUrl"),
    ogImageUrl: str("ogImageUrl"),
    seoDescription: str("seoDescription"),
    footerNote: str("footerNote"),
    social: Array.isArray(d.social)
      ? (d.social as { label: string; href: string }[])
      : [],
    newsletterEnabled: d.newsletterEnabled !== false,
    newsletterConsent: str("newsletterConsent") || DEFAULT_CONSENT,
  };
}
