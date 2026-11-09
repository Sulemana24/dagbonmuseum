import "server-only";
import { FieldValue, type Transaction } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { canManageArea, hasPermission, type Permission } from "@/lib/auth/roles";
import type { Session } from "@/lib/auth/session";
import { slugify } from "@/lib/validation/article";
import type { ContentIntent } from "@/lib/validation/common";
import { logActivity } from "./activity";
import { ServiceError } from "./errors";

export interface Base { title: string; slug: string }
export interface EngineConfig<I extends Base> {
  col: string; slugCol: string; area: string; noun: string; listPaths: string[]; detailBase: string;
  fields(i: I): Record<string, unknown>;
  onCreate?(tx: Transaction, i: I): Promise<Record<string, unknown>>;
  afterSave?(i: I): Promise<void>;
}

function need<I extends Base>(c: EngineConfig<I>, s: Session, p: Permission) {
  if (!hasPermission(s.role, p)) throw new ServiceError(403, "You do not have permission to do this.");
  if (!canManageArea(s.role, s.areas, c.area)) throw new ServiceError(403, "This area is not assigned to you.");
}

function statusFor<I extends Base>(c: EngineConfig<I>, intent: ContentIntent, current: string, s: Session): string {
  switch (intent) {
    case "save":
      if (current === "published" && !hasPermission(s.role, "content:publish")) throw new ServiceError(403, "Only a content manager can edit published content.");
      return current;
    case "submit":
      need(c, s, "content:write");
      if (current === "published") throw new ServiceError(400, "This is already published.");
      return "pending_review";
    case "publish": need(c, s, "content:publish"); return "published";
    case "unpublish":
      need(c, s, "content:publish");
      if (current !== "published") throw new ServiceError(400, "This is not published.");
      return "draft";
    case "archive": need(c, s, "content:publish"); return "archived";
    case "restore": need(c, s, "content:publish"); return "draft";
  }
}

const refresh = <I extends Base>(c: EngineConfig<I>, ...slugs: (string | undefined)[]) => {
  ["/", "/sitemap.xml", ...c.listPaths].forEach((p) => revalidatePath(p));
  slugs.filter(Boolean).forEach((s) => revalidatePath(`${c.detailBase}/${s}`));
};

export async function createContent<I extends Base>(c: EngineConfig<I>, s: Session, input: I, intent: ContentIntent) {
  need(c, s, "content:write");
  const slug = input.slug || slugify(input.title);
  const status = statusFor(c, intent, "draft", s);
  const db = adminDb();
  let id = "";
  await db.runTransaction(async (tx) => {
    const slugRef = db.collection(c.slugCol).doc(slug);
    if ((await tx.get(slugRef)).exists) throw new ServiceError(409, "That web address (slug) is already used. Choose another.");
    const extra = (await c.onCreate?.(tx, input)) ?? {};
    const ref = db.collection(c.col).doc();
    id = ref.id;
    tx.create(slugRef, { docId: ref.id });
    tx.create(ref, { ...c.fields(input), ...extra, slug, status, authorId: s.uid,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
      publishedAt: status === "published" ? FieldValue.serverTimestamp() : null });
  });
  await c.afterSave?.(input);
  await logActivity({ actorId: s.uid, action: status === "published" ? `${c.noun}.publish` : `${c.noun}.create`, target: id, metadata: { slug, status } });
  if (status === "published") refresh(c, slug);
  return { id };
}

export async function updateContent<I extends Base>(c: EngineConfig<I>, s: Session, id: string, input: I, intent: ContentIntent) {
  need(c, s, "content:write");
  const slug = input.slug || slugify(input.title);
  const db = adminDb();
  let oldSlug = "", status = "", prev = "";
  await db.runTransaction(async (tx) => {
    const ref = db.collection(c.col).doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ServiceError(404, "Not found.");
    const cur = snap.data()!;
    prev = cur.status; oldSlug = cur.slug;
    status = statusFor(c, intent, cur.status, s);
    if (slug !== cur.slug) {
      const newRef = db.collection(c.slugCol).doc(slug);
      if ((await tx.get(newRef)).exists) throw new ServiceError(409, "That web address (slug) is already used. Choose another.");
      tx.create(newRef, { docId: id });
      tx.delete(db.collection(c.slugCol).doc(cur.slug));
    }
    tx.set(ref, { ...cur, ...c.fields(input), slug, status, updatedAt: FieldValue.serverTimestamp(),
      publishedAt: status === "published" ? (cur.publishedAt ?? FieldValue.serverTimestamp()) : (cur.publishedAt ?? null) });
  });
  await c.afterSave?.(input);
  const action = intent === "save" || status === prev ? `${c.noun}.update` : `${c.noun}.${intent}`;
  await logActivity({ actorId: s.uid, action, target: id, metadata: { slug, from: prev, to: status } });
  if (prev === "published" || status === "published") refresh(c, slug, oldSlug);
  return { id };
}

export async function deleteContent<I extends Base>(c: EngineConfig<I>, s: Session, id: string) {
  need(c, s, "content:delete");
  const db = adminDb();
  let slug = "", wasPublished = false;
  await db.runTransaction(async (tx) => {
    const ref = db.collection(c.col).doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ServiceError(404, "Not found.");
    slug = snap.data()!.slug; wasPublished = snap.data()!.status === "published";
    tx.delete(ref); tx.delete(db.collection(c.slugCol).doc(slug));
  });
  await logActivity({ actorId: s.uid, action: `${c.noun}.delete`, target: id, metadata: { slug } });
  if (wasPublished) refresh(c, slug);
}
