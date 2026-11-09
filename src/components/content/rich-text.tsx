import { sanitize } from "@/lib/sanitize";

export function RichText({ html }: { html: string }) {
  return (
    <div
      className="space-y-4 text-lg leading-8 [&_a]:text-forest [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-10 [&_h2]:text-2xl [&_h3]:mt-8 [&_h3]:text-xl [&_img]:rounded [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  );
}

export function References({ items }: { items?: { label: string; url?: string }[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-12 border-t border-line pt-6">
      <h2 className="text-xl">References and sources</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
        {items.map((r) => (
          <li key={r.label}>
            {r.url?.startsWith("https://") ? <a className="text-forest underline" href={r.url} rel="noopener noreferrer">{r.label}</a> : r.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
