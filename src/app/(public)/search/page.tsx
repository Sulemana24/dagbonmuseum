import Image from "next/image";
import Link from "next/link";
import { Container, EmptyState, PageHero } from "@/components/ui/page-hero";
import { SearchBox } from "@/components/ui/pagination";
import { searchPublished } from "@/lib/services/content";

export const metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const hits = q ? await searchPublished(q) : [];
  return (
    <>
      <PageHero title="Search" />
      <Container className="space-y-8">
        <SearchBox placeholder="Search articles, exhibitions, artifacts, resources" />
        {!q ? <p className="text-muted">Enter at least two characters to search.</p> : hits.length === 0 ? (
          <EmptyState title={`No results for "${q}"`} text="Try a different word or check the spelling." />
        ) : (
          <ul className="space-y-4" aria-live="polite">
            {hits.map((h) => (
              <li key={h.href} className="relative flex gap-4 rounded border border-line bg-white p-4">
                <div className="relative size-24 shrink-0 overflow-hidden rounded bg-line">{h.image && <Image src={h.image} alt="" fill sizes="96px" className="object-cover" />}</div>
                <div>
                  <p className="text-sm text-muted">{[h.type, h.category].filter(Boolean).join(", ")}</p>
                  <h2 className="text-xl"><Link href={h.href} className="after:absolute after:inset-0 hover:underline">{h.title}</Link></h2>
                  {h.description && <p className="mt-1 line-clamp-2 text-sm">{h.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
