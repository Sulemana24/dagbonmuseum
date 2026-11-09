import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { hasPermission, isRole, type Permission, type Role } from "./roles";

export const SESSION_COOKIE = "museum_session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export interface Session {
  uid: string;
  email: string;
  role: Role;
  areas: string[];
}

export const cookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(maxAgeMs / 1000),
});

/** Verifies the session cookie with Firebase, including revocation. Returns null if anything is wrong. */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!isAdminConfigured()) return null;
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    if (!isRole(decoded.role)) return null;
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      role: decoded.role,
      areas: Array.isArray(decoded.areas) ? (decoded.areas as string[]) : [],
    };
  } catch {
    return null;
  }
});

/** For admin pages and layouts. Redirects instead of rendering anything for unauthorized users. */
export async function requireStaff(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

export async function requirePermission(
  permission: Permission,
): Promise<Session> {
  const s = await requireStaff();
  if (!hasPermission(s.role, permission)) redirect("/admin/overview?denied=1");
  return s;
}

/** For route handlers and server actions: returns the session or a ready-made error response. */
export async function authorizeApi(
  permission: Permission,
): Promise<{ session: Session } | { error: NextResponse }> {
  const s = await getSession();
  if (!s)
    return {
      error: NextResponse.json({ error: "Sign in required." }, { status: 401 }),
    };
  if (!hasPermission(s.role, permission))
    return {
      error: NextResponse.json(
        { error: "You do not have permission to do this." },
        { status: 403 },
      ),
    };
  return { session: s };
}

/** Rejects cross-site state-changing requests (defence in depth on top of SameSite=Lax). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
