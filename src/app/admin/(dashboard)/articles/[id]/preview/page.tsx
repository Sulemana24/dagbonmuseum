import { notFound } from "next/navigation";
import { ArticleView } from "@/components/content/article-view";
import { requirePermission } from "@/lib/auth/session";
import { getArticleAdmin, STATUS_LABEL } from "@/lib/services/admin-reads";
import type { Article } from "@/types/content";

export const metadata = { title: "Preview" };

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content:read");
  const a = await getArticleAdmin<Article>((await params).id);
  if (!a) notFound();
  return (
    <div className="-mx-5 -my-10 lg:-mx-10">
      <p role="status" className="bg-gold px-5 py-2 text-center text-sm text-forest-deep">Preview only. Status: {STATUS_LABEL[a.status] ?? a.status}. Visitors cannot see this page unless it is published.</p>
      <ArticleView a={a} />
    </div>
  );
}
