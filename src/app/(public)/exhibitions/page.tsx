import { ContentCard, CardGrid } from "@/components/ui/content-card";
import { FilterChips, Pagination, SearchBox } from "@/components/ui/pagination";
import { Container, EmptyState, PageHero } from "@/components/ui/page-hero";
import { listPublished } from "@/lib/services/content";
import type { Exhibition } from "@/types/content";

export const metadata = { title: "Exhibitions", description: "Permanent, temporary, digital and past exhibitions." };
const KINDS = [["permanent", "Permanent"], ["temporary", "Temporary"], ["digital", "Digital"], ["past", "Past"]].map(([value, label]) => ({ value, label }));

export default async function ExhibitionsPage({ searchParams }: { searchParams: Promise<{ kind?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const kind = KINDS.some((k) => k.value === sp.kind) ? sp.kind : undefined;
  const { items, hasMore } = await listPublished<Exhibition>("exhibitions", { page, kind });
  return (
    <>
      <PageHero title="Exhibitions" intro="Browse published exhibitions, from permanent displays to digital and past shows." />
      <Container className="space-y-8">
        <SearchBox placeholder="Search exhibitions and more" />
        <FilterChips base="/exhibitions" params={sp} name="kind" options={KINDS} />
        {items.length ? (
          <CardGrid>{items.map((e) => (
            <ContentCard key={e.id} href={`/exhibitions/${e.slug}`} title={e.title} description={e.excerpt ?? e.description} image={e.coverImage} meta={[e.kind, e.period].filter(Boolean).join(", ") || undefined} />
          ))}</CardGrid>
        ) : <EmptyState title="No exhibitions found" text="No published exhibitions match this filter." />}
        <Pagination base="/exhibitions" params={sp} page={page} hasMore={hasMore} />
      </Container>
    </>
  );
}
