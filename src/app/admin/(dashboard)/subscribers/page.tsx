import { SubscriberActions } from "@/components/admin/subscriber-actions";
import { EmptyState } from "@/components/ui/page-hero";
import { FilterChips, Pagination } from "@/components/ui/pagination";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";
import { listSubscribers, SUB_STATUSES } from "@/lib/services/subscribers-admin";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Newsletter subscribers" };

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const s = await requirePermission("subscribers:read");
  const sp = await searchParams;
  const status = SUB_STATUSES.find((x) => x === sp.status);
  const page = Math.max(Number(sp.page) || 1, 1);
  const { rows, hasMore } = await listSubscribers({ status, q: sp.q, page });
  const canManage = hasPermission(s.role, "subscribers:manage");
  const canExport = hasPermission(s.role, "subscribers:export");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Newsletter subscribers</h1>
        {canExport && (
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a href="/api/admin/subscribers/export" download className="rounded bg-forest px-5 py-3 text-cream hover:bg-forest-deep">Export subscribed list (CSV)</a>
        )}
      </div>
      <p className="max-w-2xl text-sm text-muted">This list only collects consenting subscribers. Newsletters cannot be sent until an email service is connected.</p>
      <form className="flex max-w-md gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search by email</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Search by email" className="min-w-0 flex-1 rounded border border-line bg-white px-3 py-2" />
        {status && <input type="hidden" name="status" value={status} />}
        <button className="rounded bg-forest px-4 py-2 text-cream">Search</button>
      </form>
      <FilterChips base="/admin/subscribers" params={{ status, q: sp.q }} name="status" options={SUB_STATUSES.map((x) => ({ value: x, label: x[0].toUpperCase() + x.slice(1) }))} />
      {rows.length ? (
        <div className="overflow-x-auto rounded border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted"><tr><th className="p-3 font-medium">Email</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Subscribed</th><th className="p-3 font-medium">Unsubscribed</th>{canManage && <th className="p-3 font-medium">Actions</th>}</tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}><td className="p-3">{r.email}</td><td className="p-3 capitalize">{r.status}</td><td className="p-3">{formatDate(r.subscribedAt)}</td><td className="p-3">{formatDate(r.unsubscribedAt) ?? "-"}</td>
                  {canManage && <td className="p-3"><SubscriberActions id={r.id} email={r.email} status={r.status} /></td>}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="No subscribers" text="People who subscribe from the website footer appear here." />}
      {!sp.q && <Pagination base="/admin/subscribers" params={{ status, q: sp.q }} page={page} hasMore={hasMore} />}
    </div>
  );
}
