import Image from "next/image";
import { References, RichText } from "@/components/content/rich-text";
import { CardGrid, ContentCard } from "@/components/ui/content-card";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types/content";

const EVIDENCE = { documented: "Documented evidence", "oral-tradition": "Oral tradition", interpretation: "Contemporary interpretation" } as const;

export function ArticleView({ a, related = [] }: { a: Article; related?: Article[] }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      {a.category && <p className="text-sm text-muted">{a.category}</p>}
      <h1 className="mt-2 text-4xl md:text-5xl">{a.title}</h1>
      <p className="mt-4 text-sm text-muted">{[a.author, formatDate(a.publishedAt)].filter(Boolean).join(", ")}</p>
      {a.evidenceType && <p className="mt-3 inline-block rounded-full border border-gold px-3 py-1 text-sm">{EVIDENCE[a.evidenceType]}</p>}
      {a.excerpt && <p className="mt-6 text-xl leading-8 text-ink/80">{a.excerpt}</p>}
      {a.coverImage && (
        <figure className="mt-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded bg-line"><Image src={a.coverImage.url} alt={a.coverImage.alt} fill priority sizes="768px" className="object-cover" /></div>
          {(a.coverImage.caption || a.coverImage.credit) && <figcaption className="mt-2 text-sm text-muted">{a.coverImage.caption} {a.coverImage.credit && `Credit: ${a.coverImage.credit}`}</figcaption>}
        </figure>
      )}
      {a.content && <div className="mt-8"><RichText html={a.content} /></div>}
      <References items={a.references} />
      {related.length > 0 && (
        <section className="mt-14"><h2 className="mb-5 text-2xl">Related articles</h2>
          <CardGrid>{related.map((r) => <ContentCard key={r.id} href={`/history/${r.slug}`} title={r.title} description={r.excerpt} image={r.coverImage} />)}</CardGrid>
        </section>
      )}
    </article>
  );
}
