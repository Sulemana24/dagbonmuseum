import { NextResponse } from "next/server";
import { authorizeApi, sameOrigin } from "@/lib/auth/session";
import { errorResponse } from "@/lib/services/errors";
import { deleteMedia, updateMedia } from "@/lib/services/media-admin";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const auth = await authorizeApi("media:write");
  if ("error" in auth) return auth.error;
  try { await updateMedia(auth.session, (await params).id, await req.json().catch(() => null)); return NextResponse.json({ ok: true }); } catch (e) { return errorResponse(e); }
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const auth = await authorizeApi("media:delete");
  if ("error" in auth) return auth.error;
  try { await deleteMedia(auth.session, (await params).id); return NextResponse.json({ ok: true }); } catch (e) { return errorResponse(e); }
}
