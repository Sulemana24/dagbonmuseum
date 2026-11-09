import { EmptyState } from "@/components/ui/page-hero";
import { Pagination } from "@/components/ui/pagination";
import { requirePermission } from "@/lib/auth/session";
import { listLogs } from "@/lib/services/activity-reads";

export const metadata = { title: "Activity logs" };

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePermission("logs:read");
  const page = Math.max(Number((await searchParams).page) || 1, 1);
  const { rows, hasMore } = await listLogs(page);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Activity logs</h1>
      <p className="max-w-2xl text-sm text-muted">Written by the server only; staff cannot edit or delete entries. Passwords, tokens and message contents are never logged. There is no automatic retention limit yet.</p>
      {rows.length ? (
        <div className="overflow-x-auto rounded border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted"><tr><th className="p-3 font-medium">When</th><th className="p-3 font-medium">Who</th><th className="p-3 font-medium">Action</th><th className="p-3 font-medium">Record</th></tr></thead>
            <tbody className="divide-y divide-line">{rows.map((r) => (
              <tr key={r.id}><td className="whitespace-nowrap p-3">{r.createdAt ? new Date(r.createdAt).toLocaleString("en-GB") : "-"}</td><td className="p-3">{r.actor}</td><td className="p-3">{r.action}</td><td className="max-w-[16rem] truncate p-3 text-muted">{r.target ?? ""}</td></tr>
            ))}</tbody>
          </table>
        </div>
      ) : <EmptyState title="No activity yet" text="Administrative actions will be recorded here." />}
      <Pagination base="/admin/logs" params={{}} page={page} hasMore={hasMore} />
    </div>
  );
}
