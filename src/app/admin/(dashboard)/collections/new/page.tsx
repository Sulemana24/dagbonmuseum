import { ArtifactForm } from "@/components/admin/artifact-form";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";
import { EMPTY_ARTIFACT } from "@/lib/validation/artifact";

export const metadata = { title: "New artifact" };

export default async function Page() {
  const s = await requirePermission("content:write");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">New artifact</h1>
      <ArtifactForm initial={EMPTY_ARTIFACT} canPublish={hasPermission(s.role, "content:publish")} canDelete={false} />
    </div>
  );
}
