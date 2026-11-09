import { ArticleForm, EMPTY_ARTICLE } from "@/components/admin/article-form";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";

export const metadata = { title: "New article" };

export default async function NewArticlePage() {
  const s = await requirePermission("content:write");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">New article</h1>
      <ArticleForm initial={EMPTY_ARTICLE} canPublish={hasPermission(s.role, "content:publish")} canDelete={false} />
    </div>
  );
}
