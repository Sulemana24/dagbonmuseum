import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ token: z.string().regex(/^[a-f0-9]{48}$/) });

export async function POST(req: Request) {
  if (!rateLimit(`unsub:${clientKey(req)}`, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "This unsubscribe link is not valid." }, { status: 400 });
  if (!isAdminConfigured()) return NextResponse.json({ error: "Unavailable right now." }, { status: 503 });
  const snap = await adminDb().collection("newsletterSubscribers").where("unsubscribeToken", "==", parsed.data.token).limit(1).get();
  if (snap.empty) return NextResponse.json({ error: "This unsubscribe link is not valid." }, { status: 404 });
  await snap.docs[0].ref.update({ status: "unsubscribed", unsubscribedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ ok: true });
}
