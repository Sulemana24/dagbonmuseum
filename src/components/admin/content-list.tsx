import Link from "next/link";
import { EmptyState } from "@/components/ui/page-hero";
import { FilterChips, Pagination } from "@/components/ui/pagination";
import { ARTICLE_STATUSES, listContentAdmin, STATUS_LABEL } from "@/lib/services/admin-reads";
import { formatDate } from "@/lib/utils";

const PILL: Record<string, string> = { published: "bg-green-100 text-green-900", pending_review: "bg-amber-100 text-amber-900", draft: "bg-line text-ink", archived: "bg-neutral-200 text-neutral-700" };

export async function ContentList({ title, noun, col, base, sp, canWrite, previewBase }: {
  title: string; noun: string; col: string; base: string; canWrite: boolean; previewBase?: string;
  sp: { status?: string; q?: string; page?: string };
}) {
  const status = ARTICLE_STATUSES.find((s) => s === sp.status);
  const page = Math.max(Number(sp.page) || 1, 1);
  const { rows, hasMore } = await listContentAdmin(col, { status, q: sp.q, page });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{title}</h1>
        {canWrite && <Link href={`${base}/new`} className="rounded bg-forest px-5 py-3 text-cream hover:bg-forest-deep">New {noun}</Link>}
      </div>
      <form className="flex max-w-md gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search {title}</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Search title or web address" className="min-w-0 flex-1 rounded border border-line bg-white px-3 py-2" />
        {status && <input type="hidden" name="status" value={status} />}
        <button className="rounded bg-forest px-4 py-2 text-cream">Search</button>
      </form>
      <FilterChips base={base} params={{ status, q: sp.q }} name="status" options={ARTICLE_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
      {rows.length ? (
        <div className="overflow-x-auto rounded border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted"><tr><th className="p-3 font-medium">Title</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Type or category</th><th className="p-3 font-medium">Updated</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-3"><Link className="font-medium text-forest underline" href={canWrite ? `${base}/${r.id}` : previewBase ? `${base}/${r.id}/${previewBase}` : base}>{r.title}</Link>{r.featured && <span className="ml-2 text-xs text-muted">Featured</span>}</td>
                  <td className="p-3"><span className={`rounded-full px-3 py-1 text-xs ${PILL[r.status] ?? ""}`}>{STATUS_LABEL[r.status] ?? r.status}</span></td>
                  <td className="p-3">{r.category ?? r.kind ?? r.type ?? "-"}</td><td className="p-3">{formatDate(r.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title={`No ${title.toLowerCase()} found`} text={canWrite ? "Create the first one, or change the filters." : "Nothing matches these filters."} />}
      {!sp.q && <Pagination base={base} params={{ status, q: sp.q }} page={page} hasMore={hasMore} />}
    </div>
  );
}
