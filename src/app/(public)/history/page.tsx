import { ContentCard, CardGrid } from "@/components/ui/content-card";
import { FilterChips, Pagination, SearchBox } from "@/components/ui/pagination";
import { Container, EmptyState, PageHero } from "@/components/ui/page-hero";
import { listPublished } from "@/lib/services/content";
import { heritageCategories } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types/content";

export const metadata = { title: "History and Heritage", description: "Articles on the history and heritage of Dagbon and Ghana." };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const { items, hasMore } = await listPublished<Article>("articles", { page, limit: 12, categorySlug: sp.category });
  return (
    <>
      <PageHero title="History and Heritage" intro="Articles on the history, traditions and living culture of Dagbon within Ghana's wider story." />
      <Container className="space-y-8">
        <SearchBox placeholder="Search articles and more" />
        <FilterChips base="/history" params={sp} name="category" options={heritageCategories.map((c) => ({ value: c.slug, label: c.label }))} />
        {items.length ? (
          <CardGrid>{items.map((a) => (
            <ContentCard key={a.id} href={`/history/${a.slug}`} title={a.title} description={a.excerpt} image={a.coverImage} meta={[a.category, formatDate(a.publishedAt)].filter(Boolean).join(", ")} />
          ))}</CardGrid>
        ) : <EmptyState title="No articles found" text="Nothing is published in this category yet." />}
        <Pagination base="/history" params={sp} page={page} hasMore={hasMore} />
      </Container>
    </>
  );
}
