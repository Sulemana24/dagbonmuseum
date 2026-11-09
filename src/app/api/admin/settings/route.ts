import { guarded, readJson } from "@/lib/api";
import { saveSettings } from "@/lib/services/settings-admin";

export async function PUT(req: Request) {
  return guarded(req, "settings:write", async (s) => saveSettings(s, await readJson(req)));
}
