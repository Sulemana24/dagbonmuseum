import "server-only";
import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { hasPermission, type Permission } from "@/lib/auth/roles";
import type { Session } from "@/lib/auth/session";
import { detectType, isMime, MEDIA_TYPES, mediaUpdateSchema, uploadRequestSchema } from "@/lib/validation/media";
import { logActivity } from "./activity";
import { ServiceError } from "./errors";
import type { z } from "zod";

const col = () => adminDb().collection("media");
const need = (s: Session, p: Permission) => { if (!hasPermission(s.role, p)) throw new ServiceError(403, "You do not have permission to do this."); };

export interface MediaItem {
  id: string; filename: string; title?: string; url: string; contentType: string; kind: "image" | "document"; size: number;
  alt?: string; caption?: string; credit?: string; createdAt?: string;
}
const iso = (v: unknown) => (v && typeof v === "object" && "toDate" in v ? (v as { toDate: () => Date }).toDate().toISOString() : undefined);
const toItem = (id: string, d: FirebaseFirestore.DocumentData): MediaItem => ({
  id, filename: d.filename, title: d.title ?? undefined, url: d.url, contentType: d.contentType, kind: d.kind, size: d.size,
  alt: d.alt ?? undefined, caption: d.caption ?? undefined, credit: d.credit ?? undefined, createdAt: iso(d.createdAt),
});

// Scans the 200 most recent ready files in memory; add a search index if the library grows.
export async function listMedia(kind?: string, q?: string): Promise<MediaItem[]> {
  const snap = await col().where("status", "==", "ready").orderBy("createdAt", "desc").limit(200).get();
  const term = q?.trim().toLowerCase();
  return snap.docs.map((d) => toItem(d.id, d.data()))
    .filter((m) => (!kind || m.kind === kind) && (!term || `${m.filename} ${m.title ?? ""} ${m.alt ?? ""}`.toLowerCase().includes(term)));
}

export async function initUpload(s: Session, raw: unknown) {
  need(s, "media:write");
  const { filename, contentType, size }: z.infer<typeof uploadRequestSchema> = uploadRequestSchema.parse(raw);
  if (!isMime(contentType)) throw new ServiceError(400, "This file type is not allowed.");
  const t = MEDIA_TYPES[contentType];
  const path = `public/media/${randomUUID()}.${t.ext}`;
  const safeName = filename.replace(/[^\w.\- ]+/g, "_").slice(0, 120);
  const ref = col().doc();
  await ref.set({ filename: safeName, contentType, kind: t.kind, size, path, status: "pending", uploadedBy: s.uid, createdAt: FieldValue.serverTimestamp() });
  const [uploadUrl] = await adminStorage().bucket().file(path).getSignedUrl({ version: "v4", action: "write", expires: Date.now() + 10 * 60_000, contentType });
  return { id: ref.id, uploadUrl };
}

/** After the browser uploads, verify size and real file type from the stored bytes before the file is usable. */
export async function finalizeUpload(s: Session, id: string) {
  need(s, "media:write");
  const ref = col().doc(id);
  const snap = await ref.get();
  const d = snap.data();
  if (!d || d.status !== "pending" || d.uploadedBy !== s.uid) throw new ServiceError(404, "Upload not found.");
  const bucket = adminStorage().bucket();
  const file = bucket.file(d.path);
  const reject = async (msg: string) => { await file.delete({ ignoreNotFound: true }); await ref.delete(); throw new ServiceError(400, msg); };
  if (!(await file.exists())[0]) { await ref.delete(); throw new ServiceError(400, "The file was not received. Please try again."); }
  const limit = MEDIA_TYPES[d.contentType as keyof typeof MEDIA_TYPES].maxBytes;
  const size = Number((await file.getMetadata())[0].size);
  if (size > limit) return reject("This file is too large.");
  const [head] = await file.download({ start: 0, end: 15 });
  if (detectType(head) !== d.contentType) return reject("The file's contents do not match its type, so it was rejected.");
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(d.path)}?alt=media`;
  await ref.update({ status: "ready", url, size, title: d.filename.replace(/\.[^.]+$/, ""), alt: "", caption: null, credit: null });
  await logActivity({ actorId: s.uid, action: "media.upload", target: id, metadata: { contentType: d.contentType, size } });
  return toItem(id, { ...d, url, size, title: d.filename });
}

export async function updateMedia(s: Session, id: string, raw: unknown) {
  need(s, "media:write");
  const v = mediaUpdateSchema.parse(raw);
  const ref = col().doc(id);
  if (!(await ref.get()).exists) throw new ServiceError(404, "File not found.");
  await ref.update({ title: v.title, alt: v.alt, caption: v.caption || null, credit: v.credit || null });
  await logActivity({ actorId: s.uid, action: "media.update", target: id });
}

export async function deleteMedia(s: Session, id: string) {
  need(s, "media:delete");
  const ref = col().doc(id);
  const d = (await ref.get()).data();
  if (!d || d.status !== "ready") throw new ServiceError(404, "File not found.");
  for (const c of ["articles", "exhibitions", "artifacts", "educationalResources"]) {
    const used = await adminDb().collection(c).where("mediaUrls", "array-contains", d.url).limit(1).get();
    if (!used.empty) throw new ServiceError(409, `This file is still used by "${used.docs[0].data().title}". Remove it there first.`);
  }
  await adminStorage().bucket().file(d.path).delete({ ignoreNotFound: true });
  await ref.delete();
  await logActivity({ actorId: s.uid, action: "media.delete", target: id, metadata: { filename: d.filename } });
}
