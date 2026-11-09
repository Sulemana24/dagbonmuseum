import "server-only";
import { FieldValue, type Query } from "firebase-admin/firestore";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { isRole } from "@/lib/auth/roles";
import type { Session } from "@/lib/auth/session";
import { logActivity } from "./activity";
import { ServiceError } from "./errors";

import { INQUIRY_STATUSES } from "@/lib/inquiry-constants";

export interface InquiryRow { id: string; name: string; email: string; subject: string; message: string; status: string; kind?: string; organization?: string; assignedTo?: string | null; createdAt?: string; notes: { text: string; authorEmail: string; at: string }[] }
const iso = (v: unknown) => (v && typeof v === "object" && "toDate" in v ? (v as { toDate: () => Date }).toDate().toISOString() : undefined);
const toRow = (id: string, d: FirebaseFirestore.DocumentData): InquiryRow => ({
  id, name: d.name, email: d.email, subject: d.subject, message: d.message, status: d.status, kind: d.kind, organization: d.organization,
  assignedTo: d.assignedTo ?? null, createdAt: iso(d.createdAt), notes: Array.isArray(d.internalNotes) ? d.internalNotes : [],
});

export async function listInquiries(o: { status?: string; q?: string; page?: number }) {
  const limit = 20, page = Math.max(o.page ?? 1, 1);
  let q: Query = adminDb().collection("inquiries");
  if (o.status) q = q.where("status", "==", o.status);
  q = q.orderBy("createdAt", "desc");
  const term = o.q?.trim().toLowerCase();
  const snap = term ? await q.limit(200).get() : await q.offset((page - 1) * limit).limit(limit + 1).get();
  let rows = snap.docs.map((d) => toRow(d.id, d.data()));
  if (term) rows = rows.filter((r) => `${r.name} ${r.email} ${r.subject} ${r.message}`.toLowerCase().includes(term)).slice(0, 50);
  return { rows: term ? rows : rows.slice(0, limit), hasMore: !term && snap.docs.length > limit };
}

export async function getInquiry(id: string) {
  const d = await adminDb().collection("inquiries").doc(id).get();
  return d.exists ? toRow(d.id, d.data()!) : null;
}

const patchSchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  note: z.string().trim().min(1).max(2_000).optional(),
  assignedTo: z.union([z.string().min(1).max(128), z.null()]).optional(),
});

export async function updateInquiry(s: Session, id: string, raw: unknown) {
  const p = patchSchema.parse(raw);
  const ref = adminDb().collection("inquiries").doc(id);
  if (!(await ref.get()).exists) throw new ServiceError(404, "Inquiry not found.");
  const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (p.status) update.status = p.status;
  if (p.assignedTo !== undefined) {
    if (p.assignedTo) {
      const u = await adminAuth().getUser(p.assignedTo).catch(() => null);
      if (!u || !isRole(u.customClaims?.role)) throw new ServiceError(400, "That person is not a staff member.");
    }
    update.assignedTo = p.assignedTo;
  }
  if (p.note) update.internalNotes = FieldValue.arrayUnion({ text: p.note, authorEmail: s.email, at: new Date().toISOString() });
  await ref.update(update);
  // Message contents are never copied into the audit log.
  await logActivity({ actorId: s.uid, action: p.status ? "inquiry.status_change" : p.note ? "inquiry.note" : "inquiry.assign", target: id, metadata: { status: p.status ?? null } });
}
