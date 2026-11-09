import { guarded, readJson } from "@/lib/api";
import { manageSubscriber } from "@/lib/services/subscribers-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(req, "subscribers:manage", async (s) => manageSubscriber(s, (await params).id, await readJson(req)));
}
