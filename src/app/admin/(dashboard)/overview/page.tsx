import Link from "next/link";
import { PublishedChart } from "@/components/admin/published-chart";
import { hasPermission } from "@/lib/auth/roles";
import { requireStaff } from "@/lib/auth/session";
import { getDashboardStats, getRecentActivity } from "@/lib/services/admin-reads";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const [session, sp] = await Promise.all([requireStaff(), searchParams]);
  const stats = await getDashboardStats().catch(() => null);
  const activity = hasPermission(session.role, "logs:read") ? await getRecentActivity().catch(() => []) : null;
  const cards = stats && [
    ["Published articles", stats.pub], ["Draft and review articles", stats.draft], ["Exhibitions", stats.ex], ["Artifacts", stats.art],
    ["Educational resources", stats.res], ["Unread visitor inquiries", stats.inq], ["Newsletter subscribers", stats.subs],
  ] as const;
  return (
    <div className="space-y-8">
      {sp.denied && <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">You do not have permission to open that page.</p>}
      <h1 className="text-3xl">Overview</h1>
      {cards ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, n]) => <li key={label} className="rounded border border-line bg-white p-5"><p className="text-3xl font-serif text-forest">{n}</p><p className="mt-1 text-sm text-muted">{label}</p></li>)}
        </ul>
      ) : <p role="alert" className="rounded border border-line bg-white p-4 text-sm">Statistics could not be loaded. Check the Firebase Admin settings.</p>}
      {stats && <section className="rounded border border-line bg-white p-5"><h2 className="mb-3 text-xl">Articles published per month</h2><PublishedChart data={stats.chart} /></section>}
      <section className="rounded border border-line bg-white p-5">
        <h2 className="text-xl">Website traffic</h2>
        <p className="mt-2 text-sm text-muted">Traffic analytics are not configured yet, so no visitor numbers are shown.</p>
      </section>
      {hasPermission(session.role, "content:write") && <Link href="/admin/articles/new" className="inline-block rounded bg-forest px-5 py-3 text-cream hover:bg-forest-deep">New article</Link>}
      {activity && (
        <section className="rounded border border-line bg-white p-5">
          <h2 className="text-xl">Recent activity</h2>
          {activity.length ? (
            <ul className="mt-3 divide-y divide-line text-sm">{activity.map((a) => <li key={a.id} className="flex justify-between gap-4 py-2"><span>{a.action}{a.target ? ` (${a.target})` : ""}</span><span className="text-muted">{formatDate(a.createdAt)}</span></li>)}</ul>
          ) : <p className="mt-2 text-sm text-muted">No activity recorded yet.</p>}
        </section>
      )}
    </div>
  );
}
