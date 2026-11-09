import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { authorizeApi } from "@/lib/auth/session";

// Small title lookup used by the "connect artifacts" pickers. Scans the 200 most recently edited records.
export async function GET(req: Request) {
  const auth = await authorizeApi("content:read");
  if ("error" in auth) return auth.error;
  const u = new URL(req.url);
  const col = u.searchParams.get("type") === "artifacts" ? "artifacts" : null;
  if (!col) return NextResponse.json({ error: "Unknown type." }, { status: 400 });
  const term = (u.searchParams.get("q") ?? "").trim().toLowerCase();
  const snap = await adminDb().collection(col).orderBy("updatedAt", "desc").limit(200).get();
  const items = snap.docs.map((d) => ({ id: d.id, title: d.data().title as string, status: d.data().status as string, collectionId: d.data().collectionId as string | undefined }))
    .filter((i) => !term || `${i.title} ${i.collectionId ?? ""}`.toLowerCase().includes(term)).slice(0, 20);
  return NextResponse.json({ items });
}
