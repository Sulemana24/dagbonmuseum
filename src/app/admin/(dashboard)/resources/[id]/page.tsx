import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/resource-form";
import { toResourceInput } from "@/lib/content-mappers";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";
import { getContentAdmin } from "@/lib/services/admin-reads";
import type { Resource } from "@/types/content";

export const metadata = { title: "Edit resource" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const s = await requirePermission("content:write");
  const doc = await getContentAdmin<Resource>("educationalResources", (await params).id);
  if (!doc) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit resource</h1>
      <ResourceForm id={doc.id} status={doc.status} initial={toResourceInput(doc)} canPublish={hasPermission(s.role, "content:publish")} canDelete={hasPermission(s.role, "content:delete")} />
    </div>
  );
}
