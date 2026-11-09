import { ExhibitionForm } from "@/components/admin/exhibition-form";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";
import { EMPTY_EXHIBITION } from "@/lib/validation/exhibition";

export const metadata = { title: "New exhibition" };

export default async function Page() {
  const s = await requirePermission("content:write");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">New exhibition</h1>
      <ExhibitionForm initial={EMPTY_EXHIBITION} canPublish={hasPermission(s.role, "content:publish")} canDelete={false} />
    </div>
  );
}
