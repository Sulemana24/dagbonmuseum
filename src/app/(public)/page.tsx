import Image from "next/image";
import Link from "next/link";
import { ContentCard, CardGrid } from "@/components/ui/content-card";
import { EmptyState } from "@/components/ui/page-hero";
import { getSiteSettings, listPublished } from "@/lib/services/content";
import { heritageCategories } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";
import type { Article, Artifact, Exhibition, Resource } from "@/types/content";

export const revalidate = 60;

function Section({ title, href, linkLabel, children, tone = "plain" }: {
  title: string; href?: string; linkLabel?: string; children: React.ReactNode; tone?: "plain" | "white";
}) {
  return (
    <section className={tone === "white" ? "bg-white" : ""}>
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl">{title}</h2>
          {href && <Link href={href} className="text-sm text-forest underline">{linkLabel}</Link>}
        </div>
        {children}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [s, exhibitions, artifacts, resources, stories] = await Promise.all([
    getSiteSettings(),
    listPublished<Exhibition>("exhibitions", { featured: true, limit: 3 }),
    listPublished<Artifact>("artifacts", { featured: true, limit: 3 }),
    listPublished<Resource>("educationalResources", { limit: 3 }),
    listPublished<Article>("articles", { limit: 3 }),
  ]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-forest text-cream">
        {s.hero?.image && <Image src={s.hero.image.url} alt={s.hero.image.alt} fill priority sizes="100vw" className="-z-10 object-cover opacity-40" />}
        <div className="mx-auto max-w-6xl px-5 py-24 md:py-36">
          <p className="mb-4 text-sm text-gold">{s.name}</p>
          <h1 className="max-w-3xl text-4xl leading-tight !text-cream md:text-6xl">{s.hero?.heading ?? "Preserving Our Heritage. Inspiring Future Generations."}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/90">
            {s.hero?.text ?? "Discover the history, traditions, people, and cultural treasures that tell the story of Dagbon and Ghana's rich civilization."}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/history" className="rounded bg-gold px-6 py-3 font-medium text-forest-deep hover:bg-cream">Explore Our Heritage</Link>
            <Link href="/visit" className="rounded border border-cream/50 px-6 py-3 font-medium hover:bg-cream hover:text-forest">Plan Your Visit</Link>
          </div>
          {!s.hero?.image && <p className="mt-16 text-sm text-cream/70">Hero photograph to be added by the museum in Settings.</p>}
        </div>
      </section>

      {s.intro && (
        <section className="mx-auto max-w-3xl px-5 py-16">
          <h2 className="text-3xl">About the museum</h2>
          <p className="mt-4 whitespace-pre-line text-lg leading-8">{s.intro}</p>
        </section>
      )}

      <Section title="Explore our heritage" tone="white">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {heritageCategories.map((c) => (
            <li key={c.slug} className="relative rounded border border-line bg-cream p-5 hover:border-gold">
              <h3 className="text-lg"><Link href={`/history?category=${c.slug}`} className="after:absolute after:inset-0">{c.label}</Link></h3>
              <p className="mt-2 text-sm text-ink/80">{c.blurb}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Featured exhibitions" href="/exhibitions" linkLabel="All exhibitions">
        {exhibitions.items.length ? (
          <CardGrid>{exhibitions.items.map((e) => (
            <ContentCard key={e.id} href={`/exhibitions/${e.slug}`} title={e.title} description={e.excerpt ?? e.description} image={e.coverImage} meta={[e.kind, e.period].filter(Boolean).join(", ") || undefined} />
          ))}</CardGrid>
        ) : <EmptyState title="No featured exhibitions yet" text="Exhibitions appear here once staff publish them and mark them as featured." />}
      </Section>

      <Section title="Featured collections" href="/collections" linkLabel="Browse the archive" tone="white">
        {artifacts.items.length ? (
          <CardGrid>{artifacts.items.map((a) => (
            <ContentCard key={a.id} href={`/collections/${a.slug}`} title={a.title} description={a.excerpt ?? a.description} image={a.coverImage ?? a.images?.[0]} meta={[a.category, a.period].filter(Boolean).join(", ") || undefined} />
          ))}</CardGrid>
        ) : <EmptyState title="No featured artifacts yet" text="Artifacts appear here once staff publish and feature them." />}
      </Section>

      {(s.mission || s.vision) && (
        <section className="bg-forest text-cream">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
            {s.mission && <div><h2 className="text-3xl !text-gold">Our mission</h2><p className="mt-4 whitespace-pre-line leading-8">{s.mission}</p></div>}
            {s.vision && <div><h2 className="text-3xl !text-gold">Our vision</h2><p className="mt-4 whitespace-pre-line leading-8">{s.vision}</p></div>}
          </div>
        </section>
      )}

      <Section title="Learn" href="/learn" linkLabel="All resources">
        {resources.items.length ? (
          <CardGrid>{resources.items.map((r) => (
            <ContentCard key={r.id} href={`/learn/${r.slug}`} title={r.title} description={r.description ?? r.excerpt} image={r.coverImage} meta={r.type} />
          ))}</CardGrid>
        ) : <EmptyState title="Learning resources are coming" text="Articles, videos and downloads will appear here once published." />}
      </Section>

      <Section title="Plan your visit" href="/visit" linkLabel="Visit information" tone="white">
        <dl className="grid gap-6 text-sm sm:grid-cols-3">
          <div><dt className="text-muted">Location</dt><dd className="mt-1 text-base">{s.address}</dd></div>
          <div><dt className="text-muted">Opening hours</dt><dd className="mt-1 text-base">{s.openingHours}</dd></div>
          <div><dt className="text-muted">Admission</dt><dd className="mt-1 text-base">{s.admissionInfo ?? "To be confirmed"}</dd></div>
        </dl>
        <Link href="/visit" className="mt-8 inline-block rounded bg-forest px-6 py-3 text-cream hover:bg-forest-deep">Plan your visit</Link>
      </Section>

      <Section title="Latest stories" href="/history" linkLabel="All stories">
        {stories.items.length ? (
          <CardGrid>{stories.items.map((a) => (
            <ContentCard key={a.id} href={`/history/${a.slug}`} title={a.title} description={a.excerpt} image={a.coverImage} meta={formatDate(a.publishedAt)} />
          ))}</CardGrid>
        ) : <EmptyState title="No stories published yet" text="Articles and announcements will appear here." />}
      </Section>

      <section className="bg-forest-deep text-cream">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <h2 className="text-3xl !text-cream">Begin with a story, an object, or a visit</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/collections" className="rounded bg-gold px-6 py-3 font-medium text-forest-deep hover:bg-cream">Explore the collections</Link>
            <Link href="/history" className="rounded border border-cream/50 px-6 py-3 hover:bg-cream hover:text-forest">Learn about Dagbon</Link>
            <Link href="/visit" className="rounded border border-cream/50 px-6 py-3 hover:bg-cream hover:text-forest">Visit the museum</Link>
          </div>
          <p className="mt-8 text-sm text-cream/70">Subscribe to museum updates using the form in the footer.</p>
        </div>
      </section>
    </>
  );
}
