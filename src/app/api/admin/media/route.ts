import { NextResponse } from "next/server";
import { authorizeApi, sameOrigin } from "@/lib/auth/session";
import { errorResponse } from "@/lib/services/errors";
import { initUpload, listMedia } from "@/lib/services/media-admin";

export async function GET(req: Request) {
  const auth = await authorizeApi("content:read");
  if ("error" in auth) return auth.error;
  const u = new URL(req.url);
  try { return NextResponse.json({ items: await listMedia(u.searchParams.get("kind") ?? undefined, u.searchParams.get("q") ?? undefined) }); } catch (e) { return errorResponse(e); }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const auth = await authorizeApi("media:write");
  if ("error" in auth) return auth.error;
  try { return NextResponse.json(await initUpload(auth.session, await req.json().catch(() => null))); } catch (e) { return errorResponse(e); }
}
