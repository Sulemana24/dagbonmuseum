import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { ROLES } from "@/lib/auth/roles";
import { authorizeApi, sameOrigin } from "@/lib/auth/session";
import { logActivity } from "@/lib/services/activity";

const body = z.object({
  uid: z.string().min(1).max(128),
  role: z.enum(ROLES),
  areas: z.array(z.enum(["articles", "exhibitions", "artifacts", "resources", "pages"])).max(5).default([]),
});

/** Super Admin only. Changes a user's role and invalidates their sessions. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const auth = await authorizeApi("users:manage");
  if ("error" in auth) return auth.error;
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid role change." }, { status: 400 });
  const { uid, role, areas } = parsed.data;
  if (uid === auth.session.uid) return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 }); // prevents lock-out
  try {
    const user = await adminAuth().getUser(uid);
    const previous = (user.customClaims?.role as string | undefined) ?? "none";
    await adminAuth().setCustomUserClaims(uid, { role, areas });
    await adminAuth().revokeRefreshTokens(uid); // forces re-login with the new claims
    await adminDb().collection("users").doc(uid).set({ email: user.email ?? null, role, areas, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await logActivity({ actorId: auth.session.uid, action: "user.role_change", target: uid, metadata: { from: previous, to: role, areas } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not change this role." }, { status: 400 });
  }
}
