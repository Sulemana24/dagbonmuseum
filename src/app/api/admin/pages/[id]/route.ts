import { guarded, readJson } from "@/lib/api";
import { savePage } from "@/lib/services/pages-admin";

// Public pages go live immediately, so this needs the publish permission.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(req, "content:publish", async (s) => savePage(s, (await params).id, await readJson(req)));
}
