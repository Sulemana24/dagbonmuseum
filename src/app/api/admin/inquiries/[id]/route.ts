import { guarded, readJson } from "@/lib/api";
import { updateInquiry } from "@/lib/services/inquiries-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(req, "inquiries:write", async (s) => updateInquiry(s, (await params).id, await readJson(req)));
}
