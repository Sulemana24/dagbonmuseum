import "server-only";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export interface LogRow { id: string; actor: string; action: string; target?: string; createdAt?: string; metadata?: Record<string, unknown> }

export async function listLogs(page: number, action?: string) {
  const limit = 30;
  const snap = await adminDb().collection("activityLogs").orderBy("createdAt", "desc").offset((Math.max(page, 1) - 1) * limit).limit(limit + 1).get();
  const docs = snap.docs.slice(0, limit);
  const uids = [...new Set(docs.map((d) => d.data().actorId as string).filter((id) => id && !id.startsWith("system:")))].slice(0, 100);
  const emails = new Map<string, string>();
  if (uids.length) (await adminAuth().getUsers(uids.map((uid) => ({ uid })))).users.forEach((u) => emails.set(u.uid, u.email ?? u.uid));
  let rows: LogRow[] = docs.map((d) => {
    const x = d.data();
    return { id: d.id, actor: emails.get(x.actorId) ?? x.actorId, action: x.action, target: x.target, metadata: x.metadata,
      createdAt: x.createdAt?.toDate?.().toISOString() };
  });
  if (action) rows = rows.filter((r) => r.action.startsWith(action)); // filters the current page only
  return { rows, hasMore: snap.docs.length > limit };
}
