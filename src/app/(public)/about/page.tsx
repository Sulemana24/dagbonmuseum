import { TextBlocks } from "@/components/content/text-blocks";
import { Container, EmptyState, PageHero } from "@/components/ui/page-hero";
import { getPageContent } from "@/lib/services/content";

export const revalidate = 60;
export const metadata = {
  title: "About",
  description: "About the Dagbon and Ghana Civilization Museum.",
};

export default async function AboutPage() {
  const page = await getPageContent("about");
  const team = Array.isArray(page?.team)
    ? (page.team as { name: string; role?: string }[])
    : [];
  return (
    <>
      <PageHero
        title="About the museum"
        intro={typeof page?.intro === "string" ? page.intro : undefined}
      />
      <Container className="space-y-12">
        {page ? (
          <>
            <TextBlocks
              data={page}
              fields={[
                ["story", "Our story"],
                ["mission", "Mission"],
                ["vision", "Vision"],
                ["values", "Core values"],
                ["preservation", "Cultural preservation"],
                ["education", "Education"],
                ["community", "Community engagement"],
              ]}
            />
            {team.length > 0 && (
              <section>
                <h2 className="text-2xl">Leadership and team</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                  {team.map((m) => (
                    <li
                      key={m.name}
                      className="rounded border border-line bg-white p-4"
                    >
                      <p className="font-medium">{m.name}</p>
                      <p className="text-sm text-muted">{m.role}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <EmptyState
            title="About content has not been added"
            text="The museum's story, mission and vision will appear here once staff add them in the dashboard."
          />
        )}
      </Container>
    </>
  );
}
