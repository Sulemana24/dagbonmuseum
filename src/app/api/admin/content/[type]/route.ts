import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi, sameOrigin } from "@/lib/auth/session";
import { createContent } from "@/lib/services/content-engine";
import { errorResponse } from "@/lib/services/errors";
import { isContentType, modules } from "@/lib/services/modules";
import { CONTENT_INTENTS } from "@/lib/validation/common";

type Ctx = { params: Promise<{ type: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { type } = await params;
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  if (!isContentType(type)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  const auth = await authorizeApi("content:write");
  if ("error" in auth) return auth.error;
  try {
    const m = modules[type];
    const { intent, input } = z.object({ intent: z.enum(CONTENT_INTENTS), input: m.schema }).parse(await req.json().catch(() => null));
    return NextResponse.json(await createContent(m.cfg, auth.session, input, intent));
  } catch (e) { return errorResponse(e); }
}
