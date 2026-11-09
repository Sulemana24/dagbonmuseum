import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { canManageArea } from "@/lib/auth/roles";
import type { Session } from "@/lib/auth/session";
import { buildPageSchema, PAGES } from "@/lib/page-config";
import { logActivity } from "./activity";
import { ServiceError } from "./errors";

export async function savePage(s: Session, id: string, raw: unknown) {
  if (!PAGES[id]) throw new ServiceError(404, "Unknown page.");
  if (!canManageArea(s.role, s.areas, "pages")) throw new ServiceError(403, "This area is not assigned to you.");
  const parsed = buildPageSchema(id).parse(raw) as Record<string, unknown>;
  // Drop empty values so empty sections are hidden publicly.
  const data = Object.fromEntries(Object.entries(parsed).filter(([, v]) => !(v === "" || (Array.isArray(v) && v.length === 0))));
  await adminDb().collection("pages").doc(id).set({ ...data, updatedAt: FieldValue.serverTimestamp(), updatedBy: s.uid });
  await logActivity({ actorId: s.uid, action: "page.update", target: id });
  if (id === "announcement") revalidatePath("/", "layout"); else revalidatePath(`/${id}`);
}

export async function getPageRaw(id: string): Promise<Record<string, unknown>> {
  const d = await adminDb().collection("pages").doc(id).get();
  const { updatedAt: _u, updatedBy: _b, ...rest } = (d.data() ?? {}) as Record<string, unknown>;
  void _u; void _b;
  return rest;
}
