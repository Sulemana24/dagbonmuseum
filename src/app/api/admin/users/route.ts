import { guarded, readJson } from "@/lib/api";
import { createStaff } from "@/lib/services/users-admin";

export async function POST(req: Request) {
  return guarded(req, "users:manage", async (s) => createStaff(s, await readJson(req)));
}
