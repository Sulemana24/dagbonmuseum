import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation/forms";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientKey(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    // A filled honeypot also lands here; reply generically so bots learn nothing.
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Messages cannot be received yet. Please try again later." }, { status: 503 });
  }
  const { website: _hp, consent, ...data } = parsed.data;
  void _hp;
  try {
    await adminDb().collection("inquiries").add({
      ...data, consent, status: "new", internalNotes: [], assignedTo: null,
      ipHash: createHash("sha256").update(clientKey(req)).digest("hex").slice(0, 16),
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
