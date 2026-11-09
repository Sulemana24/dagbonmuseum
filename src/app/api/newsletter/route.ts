import { createHash, randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getSiteSettings } from "@/lib/services/content";
import { DEFAULT_CONSENT } from "@/lib/validation/settings";
import { newsletterSchema } from "@/lib/validation/forms";

export async function POST(req: Request) {
  if (!rateLimit(`news:${clientKey(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and confirm consent." }, { status: 400 });
  if (!isAdminConfigured()) return NextResponse.json({ error: "Subscriptions are not open yet." }, { status: 503 });

  const settings = await getSiteSettings();
  if (settings.newsletterEnabled === false) return NextResponse.json({ error: "Subscriptions are closed right now." }, { status: 503 });
  const { email } = parsed.data;
  // Document ID = hash of the email, so duplicates are impossible without exposing addresses in IDs.
  const ref = adminDb().collection("newsletterSubscribers").doc(createHash("sha256").update(email).digest("hex"));
  try {
    const existing = await ref.get();
    if (existing.exists && existing.data()?.status === "subscribed") {
      // Same response as a new signup so the form cannot be used to probe who is subscribed.
      return NextResponse.json({ ok: true });
    }
    await ref.set({
      email, status: "subscribed", consent: true,
      consentText: settings.newsletterConsent ?? DEFAULT_CONSENT,
      unsubscribeToken: randomBytes(24).toString("hex"),
      subscribedAt: FieldValue.serverTimestamp(), unsubscribedAt: null,
    }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
