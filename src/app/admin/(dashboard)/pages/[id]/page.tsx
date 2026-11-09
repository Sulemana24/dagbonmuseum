import { notFound } from "next/navigation";
import { PageEditor } from "@/components/admin/page-editor";
import { requirePermission } from "@/lib/auth/session";
import { PAGES } from "@/lib/page-config";
import { getPageRaw } from "@/lib/services/pages-admin";

export const metadata = { title: "Edit page" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content:publish");
  const id = (await params).id;
  const page = PAGES[id];
  if (!page) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">{page.title}</h1>
      <p className="text-sm text-muted">{page.description} Saving publishes immediately.</p>
      <PageEditor id={id} fields={page.fields} initial={await getPageRaw(id)} />
    </div>
  );
}
