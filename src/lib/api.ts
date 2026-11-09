import "server-only";
import { NextResponse } from "next/server";
import type { Permission } from "@/lib/auth/roles";
import { authorizeApi, sameOrigin, type Session } from "@/lib/auth/session";
import { errorResponse } from "@/lib/services/errors";

/** Standard guard for admin mutations: same-origin, signed in, permitted, errors mapped safely. */
export async function guarded(req: Request, permission: Permission, fn: (s: Session) => Promise<unknown>) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const auth = await authorizeApi(permission);
  if ("error" in auth) return auth.error;
  try { return NextResponse.json((await fn(auth.session)) ?? { ok: true }); } catch (e) { return errorResponse(e); }
}
export const readJson = (req: Request) => req.json().catch(() => null);
