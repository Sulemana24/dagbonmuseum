import { Container, PageHero } from "@/components/ui/page-hero";

export const metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of use" intro="Placeholder pending review by the museum." />
      <Container className="max-w-3xl text-lg leading-8"><p>Terms of use have not been supplied yet. The museum must provide verified text, including image and content reuse conditions, before launch.</p></Container>
    </>
  );
}
