import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

export interface ActivityInput {
  actorId: string; action: string; target?: string; metadata?: Record<string, string | number | boolean | string[] | null>;
}

/** Never pass passwords, tokens or other secrets in metadata. Logs are write-only for staff (server-written). */
export async function logActivity(a: ActivityInput) {
  try {
    await adminDb().collection("activityLogs").add({ ...a, metadata: a.metadata ?? {}, createdAt: FieldValue.serverTimestamp() });
  } catch (err) {
    console.error("[activity-log]", err); // logging must not break the action; see README on limitations
  }
}
