"use client";

import { useEffect, useState } from "react";
import { MediaPicker } from "@/components/admin/media-picker";
import { EMPTY_IMAGE, type ImageInput } from "@/lib/validation/common";

export const inputCls = "mt-1 w-full rounded border border-line bg-white px-3 py-2";

export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

type ImgErr = { url?: { message?: string }; alt?: { message?: string } } | undefined;

export function ImageEditor({ id, label, value, onChange, error, onRemove }: { id: string; label: string; value: ImageInput; onChange: (v: ImageInput) => void; error?: ImgErr; onRemove?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <fieldset className="space-y-3 rounded border border-line bg-white p-4">
      <legend className="px-1">{label}</legend>
      {value.url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={value.url} alt="" className="h-28 rounded border border-line object-cover" />}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen(true)} className="rounded border border-forest px-3 py-2 text-sm text-forest hover:bg-forest hover:text-cream">{value.url ? "Change image" : "Choose from media library"}</button>
        {value.url && <button type="button" onClick={() => onChange(EMPTY_IMAGE)} className="rounded border border-line px-3 py-2 text-sm hover:bg-line">Clear</button>}
        {onRemove && <button type="button" onClick={onRemove} className="rounded border border-line px-3 py-2 text-sm hover:bg-line">Remove this image</button>}
      </div>
      {error?.url?.message && <p className="text-sm text-red-700">{error.url.message}</p>}
      {value.url && (
        <>
          <Field id={`${id}-alt`} label="Alternative text" error={error?.alt?.message}><input id={`${id}-alt`} className={inputCls} value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id={`${id}-cap`} label="Caption"><input id={`${id}-cap`} className={inputCls} value={value.caption} onChange={(e) => onChange({ ...value, caption: e.target.value })} /></Field>
            <Field id={`${id}-cr`} label="Credit"><input id={`${id}-cr`} className={inputCls} value={value.credit} onChange={(e) => onChange({ ...value, credit: e.target.value })} /></Field>
          </div>
        </>
      )}
      {open && <MediaPicker kind="image" onClose={() => setOpen(false)} onPick={(m) => onChange({ url: m.url, alt: m.alt ?? "", caption: m.caption ?? "", credit: m.credit ?? "" })} />}
    </fieldset>
  );
}

export function ImageListEditor({ id, label, value, onChange, errors, max }: { id: string; label: string; value: ImageInput[]; onChange: (v: ImageInput[]) => void; errors?: Partial<Record<number, ImgErr>>; max: number }) {
  return (
    <div className="space-y-3">
      <p className="font-medium">{label}</p>
      {value.map((img, i) => (
        <ImageEditor key={i} id={`${id}-${i}`} label={`Image ${i + 1}`} value={img} error={errors?.[i]}
          onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} onRemove={() => onChange(value.filter((_, k) => k !== i))} />
      ))}
      {value.length < max && <button type="button" onClick={() => onChange([...value, EMPTY_IMAGE])} className="rounded border border-line px-3 py-2 text-sm hover:bg-line">Add an image</button>}
    </div>
  );
}

export function ReferencesEditor({ value, onChange, errors }: { value: { label: string; url: string }[]; onChange: (v: { label: string; url: string }[]) => void; errors?: Partial<Record<number, { label?: { message?: string }; url?: { message?: string } } | undefined>> }) {
  return (
    <fieldset className="space-y-3 rounded border border-line bg-white p-4">
      <legend className="px-1">References and sources</legend>
      {value.map((r, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <div><label className="sr-only" htmlFor={`ref-l-${i}`}>Source name</label><input id={`ref-l-${i}`} placeholder="Source name" className={inputCls} value={r.label} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} />{errors?.[i]?.label?.message && <p className="text-sm text-red-700">{errors[i]?.label?.message}</p>}</div>
          <div><label className="sr-only" htmlFor={`ref-u-${i}`}>Link (optional)</label><input id={`ref-u-${i}`} placeholder="https:// link (optional)" className={inputCls} value={r.url} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)))} />{errors?.[i]?.url?.message && <p className="text-sm text-red-700">{errors[i]?.url?.message}</p>}</div>
          <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="mt-1 rounded border border-line px-3 text-sm hover:bg-line">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { label: "", url: "" }])} className="rounded border border-line px-3 py-2 text-sm hover:bg-line">Add a source</button>
    </fieldset>
  );
}

export function ArtifactPicker({ label, value, onChange, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ id: string; title: string; status: string }[]>([]);
  const [known, setKnown] = useState<Record<string, string>>({});
  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/lookup?type=artifacts&q=${encodeURIComponent(q)}`).catch(() => null);
      if (!res?.ok) return;
      const items: { id: string; title: string; status: string }[] = (await res.json()).items;
      setResults(items); setKnown((k) => ({ ...k, ...Object.fromEntries(items.map((i) => [i.id, i.title])) }));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <fieldset className="space-y-3 rounded border border-line bg-white p-4">
      <legend className="px-1">{label}</legend>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {value.length > 0 && <ul className="flex flex-wrap gap-2">{value.map((id) => (
        <li key={id} className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm">{known[id] ?? id}
          <button type="button" aria-label={`Remove ${known[id] ?? id}`} onClick={() => onChange(value.filter((x) => x !== id))}>x</button></li>
      ))}</ul>}
      <label htmlFor={`ap-${label}`} className="sr-only">Search artifacts</label>
      <input id={`ap-${label}`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search artifacts by name or collection ID" className={inputCls} />
      <ul className="max-h-48 divide-y divide-line overflow-auto rounded border border-line text-sm">
        {results.filter((r) => !value.includes(r.id)).map((r) => (
          <li key={r.id}><button type="button" onClick={() => onChange([...value, r.id])} className="flex w-full justify-between gap-3 px-3 py-2 text-left hover:bg-line"><span>{r.title}</span><span className="text-muted">{r.status}</span></button></li>
        ))}
      </ul>
    </fieldset>
  );
}
