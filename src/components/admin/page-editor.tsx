"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { inputCls } from "@/components/admin/form-bits";
import type { FieldDef } from "@/lib/page-config";

type Value = string | boolean | string[] | Record<string, string>[];

export function PageEditor({ id, fields, initial }: { id: string; fields: FieldDef[]; initial: Record<string, unknown> }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [v, setV] = useState<Record<string, Value>>(() => Object.fromEntries(fields.map((f) => {
    const x = initial[f.key];
    return [f.key, f.type === "boolean" ? x === true : f.type === "lines" ? (Array.isArray(x) ? (x as string[]) : []) : f.type === "list" ? (Array.isArray(x) ? (x as Record<string, string>[]) : []) : typeof x === "string" ? x : ""];
  })));
  const set = (k: string, val: Value) => setV((s) => ({ ...s, [k]: val }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const body = { ...v, ...Object.fromEntries(fields.filter((f) => f.type === "lines").map((f) => [f.key, (v[f.key] as string[]).filter((l) => l.trim())])) };
    const res = await fetch(`/api/admin/pages/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) return toast.error((await res.json().catch(() => ({}))).error ?? "Could not save.");
    toast.success("Saved and published."); router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      {fields.map((f) => (
        <div key={f.key}>
          {f.type === "boolean" ? (
            <label className="flex items-center gap-2"><input type="checkbox" checked={v[f.key] as boolean} onChange={(e) => set(f.key, e.target.checked)} /> {f.label}</label>
          ) : f.type === "list" ? (
            <fieldset className="space-y-3 rounded border border-line bg-white p-4"><legend className="px-1">{f.label}</legend>
              {(v[f.key] as Record<string, string>[]).map((item, i) => (
                <div key={i} className="space-y-2 rounded border border-line p-3">
                  {f.itemFields.map((ff) => (
                    <div key={ff.key}><label htmlFor={`${f.key}-${i}-${ff.key}`}>{ff.label}</label>
                      {ff.textarea ? <textarea id={`${f.key}-${i}-${ff.key}`} rows={3} className={inputCls} value={item[ff.key] ?? ""} onChange={(e) => set(f.key, (v[f.key] as Record<string, string>[]).map((x, k) => (k === i ? { ...x, [ff.key]: e.target.value } : x)))} />
                        : <input id={`${f.key}-${i}-${ff.key}`} className={inputCls} value={item[ff.key] ?? ""} onChange={(e) => set(f.key, (v[f.key] as Record<string, string>[]).map((x, k) => (k === i ? { ...x, [ff.key]: e.target.value } : x)))} />}
                    </div>
                  ))}
                  <button type="button" onClick={() => set(f.key, (v[f.key] as Record<string, string>[]).filter((_, k) => k !== i))} className="rounded border border-line px-3 py-1 text-sm hover:bg-line">Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => set(f.key, [...(v[f.key] as Record<string, string>[]), Object.fromEntries(f.itemFields.map((ff) => [ff.key, ""]))])} className="rounded border border-line px-3 py-2 text-sm hover:bg-line">Add</button>
            </fieldset>
          ) : (
            <>
              <label htmlFor={f.key}>{f.label}</label>
              {f.type === "textarea" ? <textarea id={f.key} rows={6} className={inputCls} value={v[f.key] as string} onChange={(e) => set(f.key, e.target.value)} />
                : f.type === "lines" ? <textarea id={f.key} rows={5} className={inputCls} value={(v[f.key] as string[]).join("\n")} onChange={(e) => set(f.key, e.target.value.split("\n"))} />
                : <input id={f.key} className={inputCls} value={v[f.key] as string} onChange={(e) => set(f.key, e.target.value)} />}
              {f.hint && <p className="mt-1 text-xs text-muted">{f.hint}</p>}
            </>
          )}
        </div>
      ))}
      <div className="sticky bottom-0 border-t border-line bg-cream/95 py-4"><button disabled={busy} className="rounded bg-forest px-6 py-3 text-cream hover:bg-forest-deep disabled:opacity-60">{busy ? "Saving..." : "Save and publish"}</button></div>
    </form>
  );
}
