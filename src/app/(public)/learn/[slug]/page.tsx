import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublishedBySlug } from "@/lib/services/content";
import type { Resource } from "@/types/content";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getPublishedBySlug<Resource>("educationalResources", (await params).slug);
  return r ? { title: r.seoTitle ?? r.title, description: r.seoDescription ?? r.description, alternates: { canonical: `/learn/${r.slug}` } } : {};
}

export default async function ResourcePage({ params }: Props) {
  const r = await getPublishedBySlug<Resource>("educationalResources", (await params).slug);
  if (!r) notFound();
  const download = r.publicDownload && r.fileUrl?.startsWith("https://") ? r.fileUrl : undefined; // only files intentionally marked public
  const video = r.videoUrl?.startsWith("https://") ? r.videoUrl : undefined;
  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      <p className="text-sm text-muted">{[r.type, r.category].filter(Boolean).join(", ")}</p>
      <h1 className="mt-2 text-4xl md:text-5xl">{r.title}</h1>
      {r.coverImage && <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded bg-line"><Image src={r.coverImage.url} alt={r.coverImage.alt} fill sizes="768px" className="object-cover" /></div>}
      {r.description && <p className="mt-8 whitespace-pre-line text-lg leading-8">{r.description}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        {download && <a href={download} rel="noopener noreferrer" className="rounded bg-forest px-6 py-3 text-cream hover:bg-forest-deep">Download</a>}
        {video && <a href={video} rel="noopener noreferrer" className="rounded border border-forest px-6 py-3 text-forest hover:bg-forest hover:text-cream">Watch video</a>}
      </div>
    </article>
  );
}
