import { TextBlocks } from "@/components/content/text-blocks";
import { ContactForm } from "@/components/forms/contact-form";
import { Container, PageHero } from "@/components/ui/page-hero";
import { getPageContent, getSiteSettings } from "@/lib/services/content";

export const revalidate = 60;
export const metadata = { title: "Visit Us", description: "Plan your visit: location, hours, admission and accessibility." };
const MAP_HOSTS = ["https://www.google.com/maps/embed", "https://www.openstreetmap.org/export/embed.html"];

export default async function VisitPage() {
  const [s, page] = await Promise.all([getSiteSettings(), getPageContent("visit")]);
  const faqs = Array.isArray(page?.faqs) ? (page.faqs as { q: string; a: string }[]) : [];
  const map = s.mapEmbedUrl && MAP_HOSTS.some((h) => s.mapEmbedUrl!.startsWith(h)) ? s.mapEmbedUrl : undefined;
  return (
    <>
      <PageHero title="Visit us" intro="Everything you need to plan a visit. Details marked 'To be confirmed' will be updated by the museum." />
      <Container className="space-y-12">
        <dl className="grid gap-6 sm:grid-cols-3">
          <div><dt className="text-sm text-muted">Address</dt><dd className="mt-1 text-lg">{s.address}</dd></div>
          <div><dt className="text-sm text-muted">Opening hours</dt><dd className="mt-1 whitespace-pre-line text-lg">{s.openingHours}</dd></div>
          <div><dt className="text-sm text-muted">Admission</dt><dd className="mt-1 whitespace-pre-line text-lg">{s.admissionInfo ?? "To be confirmed"}</dd></div>
        </dl>
        {map && <iframe title="Museum location map" src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-80 w-full rounded border border-line" />}
        <TextBlocks data={page} fields={[["directions", "Directions"], ["groups", "Group visits"], ["schools", "School visits"], ["accessibility", "Accessibility"], ["guidelines", "Visitor guidelines"]]} />
        {faqs.length > 0 && (
          <section className="max-w-3xl"><h2 className="text-2xl">Frequently asked questions</h2>
            {faqs.map((f) => <details key={f.q} className="mt-3 rounded border border-line bg-white p-4"><summary className="cursor-pointer font-medium">{f.q}</summary><p className="mt-2">{f.a}</p></details>)}
          </section>
        )}
        <section className="max-w-xl"><h2 className="mb-5 text-2xl">Ask about your visit</h2><ContactForm kind="visit" /></section>
      </Container>
    </>
  );
}
