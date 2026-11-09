import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { isRole } from "@/lib/auth/roles";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS, cookieOptions, getSession, sameOrigin } from "@/lib/auth/session";
import { logActivity } from "@/lib/services/activity";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const body = z.object({ idToken: z.string().min(20).max(4096) });

/** Exchange a fresh Firebase ID token for an HTTP-only session cookie. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  if (!rateLimit(`session:${clientKey(req)}`, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  if (!isAdminConfigured()) return NextResponse.json({ error: "Admin sign-in is not configured yet." }, { status: 503 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    const decoded = await adminAuth().verifyIdToken(parsed.data.idToken, true);
    // Require a recent sign-in so a stolen old token cannot mint a session.
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    // Authorization comes from server-set custom claims, never from anything the client sends.
    if (!isRole(decoded.role)) return NextResponse.json({ error: "This account does not have admin access." }, { status: 403 });
    const user = await adminAuth().getUser(decoded.uid);
    if (user.disabled) return NextResponse.json({ error: "This account has been disabled." }, { status: 403 });
    const cookie = await adminAuth().createSessionCookie(parsed.data.idToken, { expiresIn: SESSION_MAX_AGE_MS });
    (await cookies()).set(SESSION_COOKIE, cookie, cookieOptions(SESSION_MAX_AGE_MS));
    await logActivity({ actorId: decoded.uid, action: "auth.sign_in", metadata: { role: decoded.role } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sign-in failed. Please try again." }, { status: 401 });
  }
}

/** Sign out: revoke the user's refresh tokens (invalidates this and other sessions) and clear the cookie. */
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const session = await getSession();
  if (session) {
    await adminAuth().revokeRefreshTokens(session.uid);
    await logActivity({ actorId: session.uid, action: "auth.sign_out" });
  }
  (await cookies()).set(SESSION_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  return NextResponse.json({ ok: true });
}
