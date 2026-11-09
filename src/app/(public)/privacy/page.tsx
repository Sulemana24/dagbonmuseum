import { Container, PageHero } from "@/components/ui/page-hero";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy policy" intro="Draft summary pending review by the museum. It is not a legal document." />
      <Container className="max-w-3xl space-y-4 text-lg leading-8">
        <p>The contact and visit forms store your name, email, subject, message and optional organization so staff can reply. A hashed, truncated network identifier is stored to help detect abuse.</p>
        <p>The newsletter form stores your email address and your consent. You can unsubscribe using the link supplied with each message.</p>
        <p>The museum must replace this summary with a policy reviewed against Ghana&apos;s Data Protection Act before launch.</p>
      </Container>
    </>
  );
}
