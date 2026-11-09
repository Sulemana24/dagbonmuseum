import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageViewer } from "@/components/content/image-viewer";
import { ContentCard, CardGrid } from "@/components/ui/content-card";
import { getPublishedByIds, getPublishedBySlug } from "@/lib/services/content";
import { formatDate } from "@/lib/utils";
import type { Artifact, Exhibition } from "@/types/content";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getPublishedBySlug<Exhibition>("exhibitions", (await params).slug);
  if (!e) return {};
  return { title: e.seoTitle ?? e.title, description: e.seoDescription ?? e.excerpt, alternates: { canonical: `/exhibitions/${e.slug}` },
    openGraph: { title: e.title, description: e.excerpt, images: e.coverImage ? [e.coverImage.url] : undefined } };
}

export default async function ExhibitionPage({ params }: Props) {
  const e = await getPublishedBySlug<Exhibition>("exhibitions", (await params).slug);
  if (!e) notFound();
  const artifacts = await getPublishedByIds<Artifact>("artifacts", e.artifactIds);
  const images = [e.coverImage, ...(e.gallery ?? [])].filter((i): i is NonNullable<typeof i> => Boolean(i));
  const dates = [formatDate(e.startDate), formatDate(e.endDate)].filter(Boolean).join(" to ");
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-sm text-muted">{[e.kind, e.category].filter(Boolean).join(", ")}</p>
      <h1 className="mt-2 max-w-3xl text-4xl md:text-5xl">{e.title}</h1>
      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
        {(dates || e.period) && <div><dt className="inline text-muted">When: </dt><dd className="inline">{dates || e.period}</dd></div>}
        {e.location && <div><dt className="inline text-muted">Where: </dt><dd className="inline">{e.location}</dd></div>}
      </dl>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <ImageViewer images={images} />
        <div className="space-y-4 text-lg leading-8">
          {e.excerpt && <p className="text-xl text-ink/80">{e.excerpt}</p>}
          {e.description && <p className="whitespace-pre-line">{e.description}</p>}
        </div>
      </div>
      {artifacts.length > 0 && (
        <section className="mt-16"><h2 className="mb-5 text-2xl">Collections in this exhibition</h2>
          <CardGrid>{artifacts.map((a) => <ContentCard key={a.id} href={`/collections/${a.slug}`} title={a.title} description={a.excerpt} image={a.coverImage ?? a.images?.[0]} meta={a.category} />)}</CardGrid>
        </section>
      )}
    </div>
  );
}
