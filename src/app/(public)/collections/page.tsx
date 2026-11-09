import Link from "next/link";
import { ContentCard, CardGrid } from "@/components/ui/content-card";
import { FilterChips, Pagination, SearchBox, hrefWith } from "@/components/ui/pagination";
import { Container, EmptyState, PageHero } from "@/components/ui/page-hero";
import { listCategories, listPublished } from "@/lib/services/content";
import type { Artifact } from "@/types/content";

export const metadata = { title: "Collections", description: "Search the museum's digital collection and artifact archive." };
type SP = { category?: string; sort?: string; view?: string; page?: string };
const SORTS = [["newest", "Newest"], ["oldest", "Oldest"], ["name", "Name"]] as const;

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(Number(sp.page) || 1, 1);
  const sort = SORTS.some(([v]) => v === sp.sort) ? (sp.sort as "newest" | "oldest" | "name") : "newest";
  const layout = sp.view === "list" ? "list" : "grid";
  const unfiltered = !sp.category && page === 1;
  const [cats, list, featured] = await Promise.all([
    listCategories("artifactCategories"),
    listPublished<Artifact>("artifacts", { page, sort, categorySlug: sp.category }),
    unfiltered ? listPublished<Artifact>("artifacts", { featured: true, limit: 3 }) : Promise.resolve({ items: [] as Artifact[] }),
  ]);
  const card = (a: Artifact) => (
    <ContentCard key={a.id} layout={layout} href={`/collections/${a.slug}`} title={a.title} description={a.excerpt ?? a.description}
      image={a.coverImage ?? a.images?.[0]} meta={[a.category, a.period].filter(Boolean).join(", ") || undefined} />
  );
  const Wrap = layout === "list" ? ({ children }: { children: React.ReactNode }) => <div className="space-y-4">{children}</div> : CardGrid;
  const tab = (active: boolean) => `rounded px-3 py-1.5 text-sm ${active ? "bg-forest text-cream" : "border border-line bg-white"}`;
  return (
    <>
      <PageHero title="Collections" intro="Search and browse artifacts and historical materials in the museum's digital archive." />
      <Container className="space-y-8">
        <SearchBox placeholder="Search artifacts by name or keyword" />
        {cats.length > 0 && <FilterChips base="/collections" params={sp} name="category" options={cats.map((c) => ({ value: c.slug, label: c.name }))} />}
        {featured.items.length > 0 && (
          <section><h2 className="mb-4 text-2xl">Featured</h2><CardGrid>{featured.items.map((a) => card({ ...a }))}</CardGrid></section>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2" role="group" aria-label="Sort">
            <span className="text-muted">Sort:</span>
            {SORTS.map(([v, l]) => <Link key={v} href={hrefWith("/collections", sp, { sort: v, page: undefined })} className={tab(sort === v)} aria-current={sort === v}>{l}</Link>)}
          </div>
          <div className="flex gap-2" role="group" aria-label="View">
            {(["grid", "list"] as const).map((v) => <Link key={v} href={hrefWith("/collections", sp, { view: v })} className={tab(layout === v)} aria-current={layout === v}>{v === "grid" ? "Grid" : "List"}</Link>)}
          </div>
        </div>
        {list.items.length ? <Wrap>{list.items.map(card)}</Wrap> : <EmptyState title="No artifacts found" text="No published artifacts match these filters." />}
        <Pagination base="/collections" params={sp} page={page} hasMore={list.hasMore} />
      </Container>
    </>
  );
}
