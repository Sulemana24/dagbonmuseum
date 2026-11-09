import { UnsubscribeButton } from "./unsubscribe-button";
import { Container, PageHero } from "@/components/ui/page-hero";

export const metadata = { title: "Unsubscribe", robots: { index: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <PageHero title="Unsubscribe" />
      <Container>{token ? <UnsubscribeButton token={token} /> : <p>This unsubscribe link is missing its token.</p>}</Container>
    </>
  );
}
