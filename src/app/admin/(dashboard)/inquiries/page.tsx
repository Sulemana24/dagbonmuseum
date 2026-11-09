import Link from "next/link";
import { EmptyState } from "@/components/ui/page-hero";
import { FilterChips, Pagination } from "@/components/ui/pagination";
import { requirePermission } from "@/lib/auth/session";
import { INQUIRY_LABEL, INQUIRY_STATUSES } from "@/lib/inquiry-constants";
import { listInquiries } from "@/lib/services/inquiries-admin";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Visitor inquiries" };

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  await requirePermission("inquiries:read");
  const sp = await searchParams;
  const status = INQUIRY_STATUSES.find((s) => s === sp.status);
  const page = Math.max(Number(sp.page) || 1, 1);
  const { rows, hasMore } = await listInquiries({ status, q: sp.q, page });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Visitor inquiries</h1>
      <form className="flex max-w-md gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search inquiries</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Search name, email, subject or message" className="min-w-0 flex-1 rounded border border-line bg-white px-3 py-2" />
        {status && <input type="hidden" name="status" value={status} />}
        <button className="rounded bg-forest px-4 py-2 text-cream">Search</button>
      </form>
      <FilterChips base="/admin/inquiries" params={{ status, q: sp.q }} name="status" options={INQUIRY_STATUSES.map((s) => ({ value: s, label: INQUIRY_LABEL[s] }))} />
      {rows.length ? (
        <div className="overflow-x-auto rounded border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted"><tr><th className="p-3 font-medium">From</th><th className="p-3 font-medium">Subject</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Received</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-3"><p>{r.name}</p><p className="text-xs text-muted">{r.email}</p></td>
                  <td className="max-w-sm p-3"><Link href={`/admin/inquiries/${r.id}`} className="font-medium text-forest underline">{r.subject}</Link><p className="truncate text-xs text-muted">{r.message}</p></td>
                  <td className="p-3"><span className={`rounded-full px-3 py-1 text-xs ${r.status === "new" ? "bg-amber-100 text-amber-900" : "bg-line"}`}>{INQUIRY_LABEL[r.status] ?? r.status}</span></td>
                  <td className="p-3">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="No inquiries" text="Messages sent through the contact and visit forms appear here." />}
      {!sp.q && <Pagination base="/admin/inquiries" params={{ status, q: sp.q }} page={page} hasMore={hasMore} />}
    </div>
  );
}
