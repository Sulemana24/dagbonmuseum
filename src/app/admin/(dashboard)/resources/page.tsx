import { ContentList } from "@/components/admin/content-list";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";

export const metadata = { title: "Educational resources" };

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const s = await requirePermission("content:read");
  return <ContentList title="Educational resources" noun="resource" col="educationalResources" base="/admin/resources" sp={await searchParams} canWrite={hasPermission(s.role, "content:write")} />;
}
