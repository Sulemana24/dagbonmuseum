import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageViewer } from "@/components/content/image-viewer";
import { References } from "@/components/content/rich-text";
import { ContentCard, CardGrid } from "@/components/ui/content-card";
import { getPublishedByIds, getPublishedBySlug } from "@/lib/services/content";
import { formatDate } from "@/lib/utils";
import type { Artifact } from "@/types/content";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getPublishedBySlug<Artifact>("artifacts", (await params).slug);
  if (!a) return {};
  const img = a.coverImage ?? a.images?.[0];
  return { title: a.seoTitle ?? a.title, description: a.seoDescription ?? a.excerpt, alternates: { canonical: `/collections/${a.slug}` },
    openGraph: { title: a.title, description: a.excerpt, images: img ? [img.url] : undefined } };
}

export default async function ArtifactPage({ params }: Props) {
  const a = await getPublishedBySlug<Artifact>("artifacts", (await params).slug);
  if (!a) notFound();
  const related = await getPublishedByIds<Artifact>("artifacts", a.relatedIds);
  const images = a.images?.length ? a.images : a.coverImage ? [a.coverImage] : [];
  // Only populated fields are shown.
  const facts: [string, string | undefined][] = [
    ["Collection ID", a.collectionId], ["Category", a.category], ["Historical period", a.period], ["Materials", a.materials],
    ["Place of origin", a.origin], ["Creator or attribution", a.attribution], ["Displayed at", a.displayLocation],
    ["Provenance", a.provenance], ["Added to the archive", formatDate(a.publishedAt)],
  ];
  const text: [string, string | undefined][] = [["Description", a.description], ["Cultural significance", a.significance], ["Research notes", a.researchNotes]];
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="max-w-3xl text-4xl md:text-5xl">{a.title}</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <ImageViewer images={images} />
        <div>
          <dl className="divide-y divide-line rounded border border-line bg-white">
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-3 px-4 py-3 text-sm"><dt className="text-muted">{k}</dt><dd className="col-span-2 whitespace-pre-line">{v}</dd></div>
            ))}
          </dl>
          {a.imageCredits && <p className="mt-3 text-sm text-muted">Image credits: {a.imageCredits}</p>}
        </div>
      </div>
      <div className="mt-12 max-w-3xl space-y-8">
        {text.filter(([, v]) => v).map(([k, v]) => <section key={k}><h2 className="text-2xl">{k}</h2><p className="mt-3 whitespace-pre-line text-lg leading-8">{v}</p></section>)}
        <References items={a.references} />
      </div>
      {related.length > 0 && (
        <section className="mt-16"><h2 className="mb-5 text-2xl">Related artifacts</h2>
          <CardGrid>{related.map((r) => <ContentCard key={r.id} href={`/collections/${r.slug}`} title={r.title} image={r.coverImage ?? r.images?.[0]} meta={r.category} />)}</CardGrid>
        </section>
      )}
    </div>
  );
}
