import Link from "next/link";

type Params = Record<string, string | undefined>;
export function hrefWith(base: string, params: Params, patch: Params) {
  const q = new URLSearchParams();
  Object.entries({ ...params, ...patch }).forEach(([k, v]) => v && q.set(k, v));
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export function Pagination({ base, params, page, hasMore }: { base: string; params: Params; page: number; hasMore: boolean }) {
  if (page <= 1 && !hasMore) return null;
  const cls = "rounded border border-line bg-white px-4 py-2 text-sm hover:bg-line";
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between">
      {page > 1 ? <Link className={cls} href={hrefWith(base, params, { page: String(page - 1) })}>Previous</Link> : <span />}
      <span className="text-sm text-muted">Page {page}</span>
      {hasMore ? <Link className={cls} href={hrefWith(base, params, { page: String(page + 1) })}>Next</Link> : <span />}
    </nav>
  );
}

export function FilterChips({ base, params, name, options, allLabel = "All" }: {
  base: string; params: Params; name: string; options: { value: string; label: string }[]; allLabel?: string;
}) {
  const chip = (active: boolean) => `rounded-full border px-4 py-1.5 text-sm ${active ? "border-forest bg-forest text-cream" : "border-line bg-white hover:bg-line"}`;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Filters">
      <li><Link className={chip(!params[name])} aria-current={!params[name]} href={hrefWith(base, params, { [name]: undefined, page: undefined })}>{allLabel}</Link></li>
      {options.map((o) => (
        <li key={o.value}><Link className={chip(params[name] === o.value)} aria-current={params[name] === o.value} href={hrefWith(base, params, { [name]: o.value, page: undefined })}>{o.label}</Link></li>
      ))}
    </ul>
  );
}

export function SearchBox({ placeholder }: { placeholder: string }) {
  return (
    <form action="/search" role="search" className="flex max-w-md gap-2">
      <label htmlFor="q" className="sr-only">Search</label>
      <input id="q" name="q" placeholder={placeholder} className="min-w-0 flex-1 rounded border border-line bg-white px-3 py-2" />
      <button className="rounded bg-forest px-4 py-2 text-cream hover:bg-forest-deep">Search</button>
    </form>
  );
}
