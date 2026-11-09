import { MediaLibrary } from "@/components/admin/media-library";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";
import { listMedia } from "@/lib/services/media-admin";

export const metadata = { title: "Media library" };

export default async function MediaPage() {
  const s = await requirePermission("content:read");
  const items = await listMedia().catch(() => []);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Media library</h1>
      <MediaLibrary initial={items} canWrite={hasPermission(s.role, "media:write")} canDelete={hasPermission(s.role, "media:delete")} />
    </div>
  );
}
