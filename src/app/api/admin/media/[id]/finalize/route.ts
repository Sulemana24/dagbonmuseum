import { NextResponse } from "next/server";
import { authorizeApi, sameOrigin } from "@/lib/auth/session";
import { errorResponse } from "@/lib/services/errors";
import { finalizeUpload } from "@/lib/services/media-admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const auth = await authorizeApi("media:write");
  if ("error" in auth) return auth.error;
  try { return NextResponse.json(await finalizeUpload(auth.session, (await params).id)); } catch (e) { return errorResponse(e); }
}
