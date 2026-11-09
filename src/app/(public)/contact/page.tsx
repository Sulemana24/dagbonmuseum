import { ContactForm } from "@/components/forms/contact-form";
import { Container, PageHero } from "@/components/ui/page-hero";
import { getSiteSettings } from "@/lib/services/content";

export const revalidate = 60;
export const metadata = { title: "Contact", description: "Contact the Dagbon and Ghana Civilization Museum." };

export default async function ContactPage() {
  const s = await getSiteSettings();
  return (
    <>
      <PageHero title="Contact us" intro="Send a question or message to the museum team." />
      <Container className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <ContactForm />
        <dl className="space-y-4 text-sm">
          <div><dt className="text-muted">Email</dt><dd>{s.email}</dd></div>
          <div><dt className="text-muted">Phone</dt><dd>{s.phone}</dd></div>
          <div><dt className="text-muted">Address</dt><dd>{s.address}</dd></div>
        </dl>
      </Container>
    </>
  );
}
