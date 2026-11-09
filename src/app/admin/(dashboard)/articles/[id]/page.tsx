import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/article-form";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";
import { getArticleAdmin } from "@/lib/services/admin-reads";
import type { ArticleInput } from "@/lib/validation/article";
import type { Article } from "@/types/content";

export const metadata = { title: "Edit article" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requirePermission("content:write");
  const a = await getArticleAdmin<Article>((await params).id);
  if (!a) notFound();
  const initial: ArticleInput = {
    title: a.title, slug: a.slug, excerpt: a.excerpt ?? "", content: a.content ?? "", categorySlug: (a.categorySlug ?? "") as ArticleInput["categorySlug"],
    tags: (a.tags ?? []).join(", "), author: a.author ?? "", evidenceType: a.evidenceType ?? "", coverUrl: a.coverImage?.url ?? "",
    coverAlt: a.coverImage?.alt ?? "", coverCaption: a.coverImage?.caption ?? "", coverCredit: a.coverImage?.credit ?? "",
    references: (a.references ?? []).map((r) => ({ label: r.label, url: r.url ?? "" })), seoTitle: a.seoTitle ?? "", seoDescription: a.seoDescription ?? "", featured: !!a.featured,
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit article</h1>
      <ArticleForm id={a.id} status={a.status} initial={initial} canPublish={hasPermission(s.role, "content:publish")} canDelete={hasPermission(s.role, "content:delete")} />
    </div>
  );
}
