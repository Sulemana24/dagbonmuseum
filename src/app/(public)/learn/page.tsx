import { ContentCard, CardGrid } from "@/components/ui/content-card";
import { FilterChips, Pagination } from "@/components/ui/pagination";
import { Container, EmptyState, PageHero } from "@/components/ui/page-hero";
import { listPublished } from "@/lib/services/content";
import type { Resource } from "@/types/content";

export const metadata = { title: "Learn", description: "Learning resources for students, teachers, researchers and visitors." };
const TYPES = [["article", "Articles"], ["video", "Videos"], ["document", "Documents"], ["timeline", "Timelines"], ["language", "Dagbani language"]].map(([value, label]) => ({ value, label }));

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ type?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const type = TYPES.some((t) => t.value === sp.type) ? sp.type : undefined;
  const { items, hasMore } = await listPublished<Resource>("educationalResources", { page, kind: undefined });
  const shown = type ? items.filter((r) => r.type === type) : items;
  return (
    <>
      <PageHero title="Learn" intro="Articles, videos, timelines and downloads for students, teachers, researchers and the curious." />
      <Container className="space-y-8">
        <FilterChips base="/learn" params={sp} name="type" options={TYPES} />
        {shown.length ? (
          <CardGrid>{shown.map((r) => <ContentCard key={r.id} href={`/learn/${r.slug}`} title={r.title} description={r.description ?? r.excerpt} image={r.coverImage} meta={r.type} />)}</CardGrid>
        ) : <EmptyState title="No resources found" text="No published learning resources match this filter yet." />}
        <Pagination base="/learn" params={sp} page={page} hasMore={hasMore} />
      </Container>
    </>
  );
}
