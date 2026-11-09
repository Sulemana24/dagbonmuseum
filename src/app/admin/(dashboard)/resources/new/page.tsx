import { ResourceForm } from "@/components/admin/resource-form";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";
import { EMPTY_RESOURCE } from "@/lib/validation/resource";

export const metadata = { title: "New resource" };

export default async function Page() {
  const s = await requirePermission("content:write");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">New resource</h1>
      <ResourceForm initial={EMPTY_RESOURCE} canPublish={hasPermission(s.role, "content:publish")} canDelete={false} />
    </div>
  );
}
