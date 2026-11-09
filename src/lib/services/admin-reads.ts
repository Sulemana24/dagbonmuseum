import "server-only";
import type { Query } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

function plain<T>(v: unknown): T {
  if (v === null) return undefined as T;
  if (v && typeof v === "object") {
    if ("toDate" in v && typeof (v as { toDate: unknown }).toDate === "function") return (v as { toDate: () => Date }).toDate().toISOString() as T;
    if (Array.isArray(v)) return v.map(plain) as T;
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)])) as T;
  }
  return v as T;
}

export interface AdminRow { id: string; title: string; slug: string; status: string; category?: string; kind?: string; type?: string; updatedAt?: string; featured?: boolean }
export const ARTICLE_STATUSES = ["draft", "pending_review", "published", "archived"] as const;
export const STATUS_LABEL: Record<string, string> = { draft: "Draft", pending_review: "Awaiting review", published: "Published", archived: "Archived" };

// With a search term we scan the 200 most recently edited articles in memory (no pagination).
export async function listContentAdmin(col: string, o: { status?: string; q?: string; page?: number }) {
  const limit = 20, page = Math.max(o.page ?? 1, 1);
  let q: Query = adminDb().collection(col);
  if (o.status) q = q.where("status", "==", o.status);
  q = q.orderBy("updatedAt", "desc");
  const term = o.q?.trim().toLowerCase();
  const snap = term ? await q.limit(200).get() : await q.offset((page - 1) * limit).limit(limit + 1).get();
  let rows = snap.docs.map((d) => plain<AdminRow>({ id: d.id, ...d.data() }));
  if (term) rows = rows.filter((r) => `${r.title} ${r.slug} ${r.category ?? ""}`.toLowerCase().includes(term)).slice(0, 50);
  return { rows: term ? rows : rows.slice(0, limit), hasMore: !term && snap.docs.length > limit };
}

export async function getContentAdmin<T>(col: string, id: string): Promise<(T & { id: string }) | null> {
  const d = await adminDb().collection(col).doc(id).get();
  return d.exists ? plain<T & { id: string }>({ id: d.id, ...d.data() }) : null;
}

const count = async (q: Query) => (await q.count().get()).data().count;

export async function getDashboardStats() {
  const db = adminDb();
  const since = new Date(); since.setMonth(since.getMonth() - 5); since.setDate(1); since.setHours(0, 0, 0, 0);
  const [pub, draft, ex, art, res, inq, subs, recent] = await Promise.all([
    count(db.collection("articles").where("status", "==", "published")),
    count(db.collection("articles").where("status", "in", ["draft", "pending_review"])),
    count(db.collection("exhibitions")), count(db.collection("artifacts")), count(db.collection("educationalResources")),
    count(db.collection("inquiries").where("status", "==", "new")),
    count(db.collection("newsletterSubscribers").where("status", "==", "subscribed")),
    db.collection("articles").where("status", "==", "published").where("publishedAt", ">=", since).orderBy("publishedAt").select("publishedAt").limit(500).get(),
  ]);
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(since); d.setMonth(since.getMonth() + i); return { key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString("en-GB", { month: "short" }), count: 0 }; });
  recent.docs.forEach((doc) => { const d = doc.data().publishedAt.toDate() as Date; const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`); if (m) m.count++; });
  return { pub, draft, ex, art, res, inq, subs, chart: months.map(({ month, count }) => ({ month, count })) };
}

export async function getRecentActivity(limit = 8) {
  const snap = await adminDb().collection("activityLogs").orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => plain<{ id: string; actorId: string; action: string; target?: string; createdAt?: string }>({ id: d.id, ...d.data() }));
}

export const getArticleAdmin = <T>(id: string) => getContentAdmin<T>("articles", id);
