import { notFound } from "next/navigation";
import { ArtifactForm } from "@/components/admin/artifact-form";
import { toArtifactInput } from "@/lib/content-mappers";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";
import { getContentAdmin } from "@/lib/services/admin-reads";
import type { Artifact } from "@/types/content";

export const metadata = { title: "Edit artifact" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const s = await requirePermission("content:write");
  const doc = await getContentAdmin<Artifact>("artifacts", (await params).id);
  if (!doc) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit artifact</h1>
      <ArtifactForm id={doc.id} status={doc.status} collectionId={doc.collectionId} initial={toArtifactInput(doc)} canPublish={hasPermission(s.role, "content:publish")} canDelete={hasPermission(s.role, "content:delete")} />
    </div>
  );
}
