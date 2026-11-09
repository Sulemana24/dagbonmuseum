import Link from "next/link";
import { requirePermission } from "@/lib/auth/session";
import { PAGES } from "@/lib/page-config";

export const metadata = { title: "Pages" };

export default async function PagesIndex() {
  await requirePermission("content:publish");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Pages</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {Object.entries(PAGES).map(([id, p]) => (
          <li key={id} className="rounded border border-line bg-white p-5"><h2 className="text-xl"><Link href={`/admin/pages/${id}`} className="text-forest underline">{p.title}</Link></h2><p className="mt-1 text-sm text-muted">{p.description}</p></li>
        ))}
        <li className="rounded border border-line bg-white p-5"><h2 className="text-xl"><Link href="/admin/settings" className="text-forest underline">Homepage, footer and contact details</Link></h2><p className="mt-1 text-sm text-muted">Hero, introduction, mission, vision, address, hours and footer are in Website settings (Super Admin).</p></li>
      </ul>
    </div>
  );
}
