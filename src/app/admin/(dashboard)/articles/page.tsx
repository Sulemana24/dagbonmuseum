import { ContentList } from "@/components/admin/content-list";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";

export const metadata = { title: "Articles" };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const s = await requirePermission("content:read");
  return <ContentList title="Articles" noun="article" col="articles" base="/admin/articles" sp={await searchParams} canWrite={hasPermission(s.role, "content:write")} previewBase="preview" />;
}
