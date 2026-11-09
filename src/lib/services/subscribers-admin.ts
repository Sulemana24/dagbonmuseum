import "server-only";
import { FieldValue, type Query } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import type { Session } from "@/lib/auth/session";
import { logActivity } from "./activity";
import { ServiceError } from "./errors";

export const SUB_STATUSES = ["subscribed", "unsubscribed", "suppressed"] as const;
export interface SubscriberRow { id: string; email: string; status: string; subscribedAt?: string; unsubscribedAt?: string }
const iso = (v: unknown) => (v && typeof v === "object" && "toDate" in v ? (v as { toDate: () => Date }).toDate().toISOString() : undefined);
// The unsubscribe token is deliberately never returned to the dashboard.
const toRow = (id: string, d: FirebaseFirestore.DocumentData): SubscriberRow => ({ id, email: d.email, status: d.status, subscribedAt: iso(d.subscribedAt), unsubscribedAt: iso(d.unsubscribedAt) });

export async function listSubscribers(o: { status?: string; q?: string; page?: number }) {
  const limit = 25, page = Math.max(o.page ?? 1, 1);
  let q: Query = adminDb().collection("newsletterSubscribers");
  if (o.status) q = q.where("status", "==", o.status);
  q = q.orderBy("subscribedAt", "desc");
  const term = o.q?.trim().toLowerCase();
  const snap = term ? await q.limit(300).get() : await q.offset((page - 1) * limit).limit(limit + 1).get();
  let rows = snap.docs.map((d) => toRow(d.id, d.data()));
  if (term) rows = rows.filter((r) => r.email.toLowerCase().includes(term)).slice(0, 50);
  return { rows: term ? rows : rows.slice(0, limit), hasMore: !term && snap.docs.length > limit };
}

const action = z.object({ action: z.enum(["suppress", "delete"]) });
export async function manageSubscriber(s: Session, id: string, raw: unknown) {
  const { action: a } = action.parse(raw);
  const ref = adminDb().collection("newsletterSubscribers").doc(id);
  if (!(await ref.get()).exists) throw new ServiceError(404, "Subscriber not found.");
  if (a === "suppress") await ref.update({ status: "suppressed", unsubscribedAt: FieldValue.serverTimestamp() }); else await ref.delete();
  await logActivity({ actorId: s.uid, action: `subscriber.${a}`, target: id });
}

/** Spreadsheet formula injection guard: cells starting with = + - @ are prefixed with an apostrophe. */
const cell = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;

export async function exportSubscribersCsv(s: Session) {
  const snap = await adminDb().collection("newsletterSubscribers").where("status", "==", "subscribed").orderBy("subscribedAt", "desc").limit(10_000).get();
  const lines = ["email,status,subscribed_at,consent"];
  snap.docs.forEach((d) => { const r = toRow(d.id, d.data()); lines.push([cell(r.email), cell(r.status), cell(r.subscribedAt ?? ""), cell(d.data().consent ? "yes" : "no")].join(",")); });
  await logActivity({ actorId: s.uid, action: "subscriber.export", metadata: { rows: snap.size } });
  return lines.join("\n");
}
