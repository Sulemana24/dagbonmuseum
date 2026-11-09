import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/content/article-view";
import { getPublishedByIds, getPublishedBySlug } from "@/lib/services/content";
import type { Article } from "@/types/content";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getPublishedBySlug<Article>("articles", (await params).slug);
  if (!a) return {};
  return {
    title: a.seoTitle ?? a.title, description: a.seoDescription ?? a.excerpt,
    alternates: { canonical: `/history/${a.slug}` },
    openGraph: { title: a.seoTitle ?? a.title, description: a.seoDescription ?? a.excerpt, type: "article", images: a.coverImage ? [a.coverImage.url] : undefined },
  };
}

export default async function ArticlePage({ params }: Props) {
  const a = await getPublishedBySlug<Article>("articles", (await params).slug);
  if (!a) notFound();
  return <ArticleView a={a} related={await getPublishedByIds<Article>("articles", a.relatedIds)} />;
}
