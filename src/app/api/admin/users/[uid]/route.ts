import { guarded, readJson } from "@/lib/api";
import { setDisabled } from "@/lib/services/users-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  return guarded(req, "users:manage", async (s) => setDisabled(s, (await params).uid, await readJson(req)));
}
