import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getPageContent, getSiteSettings } from "@/lib/services/content";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [s, ann] = await Promise.all([
    getSiteSettings(),
    getPageContent("announcement"),
  ]);
  const text =
    ann?.enabled === true && typeof ann.text === "string" ? ann.text : "";
  const href =
    typeof ann?.href === "string" && ann.href.startsWith("https://")
      ? ann.href
      : undefined;
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-forest-deep"
      >
        Skip to main content
      </a>
      {text && (
        <p
          role="status"
          className="bg-gold px-5 py-2 text-center text-sm text-forest-deep"
        >
          {href ? (
            <a href={href} rel="noopener noreferrer" className="underline">
              {text}
            </a>
          ) : (
            text
          )}
        </p>
      )}
      <Header
        name={s.name}
        logo={s.logo ?? { url: "/logo.svg", alt: s.name }}
      />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
