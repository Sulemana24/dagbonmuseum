import { notFound } from "next/navigation";
import { ExhibitionForm } from "@/components/admin/exhibition-form";
import { toExhibitionInput } from "@/lib/content-mappers";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";
import { getContentAdmin } from "@/lib/services/admin-reads";
import type { Exhibition } from "@/types/content";

export const metadata = { title: "Edit exhibition" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const s = await requirePermission("content:write");
  const doc = await getContentAdmin<Exhibition>("exhibitions", (await params).id);
  if (!doc) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit exhibition</h1>
      <ExhibitionForm id={doc.id} status={doc.status} initial={toExhibitionInput(doc)} canPublish={hasPermission(s.role, "content:publish")} canDelete={hasPermission(s.role, "content:delete")} />
    </div>
  );
}
