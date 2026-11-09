"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Field, inputCls } from "@/components/admin/form-bits";
import type { MediaItem } from "@/lib/services/media-admin";
import { formatDate } from "@/lib/utils";
import { isMime, MEDIA_TYPES } from "@/lib/validation/media";

interface Upload { name: string; pct: number; error?: string; done?: boolean }

function putFile(url: string, file: File, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("PUT", url);
    x.setRequestHeader("Content-Type", file.type);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    x.onload = () => (x.status >= 200 && x.status < 300 ? resolve() : reject(new Error("Upload failed.")));
    x.onerror = () => reject(new Error("Network error during upload. Check the storage CORS settings."));
    x.send(file);
  });
}

export function MediaLibrary({ initial, canWrite, canDelete }: { initial: MediaItem[]; canWrite: boolean; canDelete: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initial);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => setItems(initial), [initial]);

  const patch = (i: number, p: Partial<Upload>) => setUploads((u) => u.map((x, k) => (k === i ? { ...x, ...p } : x)));

  async function upload(files: FileList) {
    const list = [...files];
    setUploads(list.map((f) => ({ name: f.name, pct: 0 })));
    await Promise.all(list.map(async (f, i) => {
      try {
        if (!isMime(f.type)) throw new Error("Only JPEG, PNG, WebP, GIF and PDF files are allowed.");
        if (f.size > MEDIA_TYPES[f.type].maxBytes) throw new Error("File is too large (images 8 MB, PDFs 20 MB).");
        const init = await fetch("/api/admin/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: f.name, contentType: f.type, size: f.size }) });
        const d = await init.json();
        if (!init.ok) throw new Error(d.error ?? "Could not start the upload.");
        await putFile(d.uploadUrl, f, (pct) => patch(i, { pct }));
        const fin = await fetch(`/api/admin/media/${d.id}/finalize`, { method: "POST" });
        if (!fin.ok) throw new Error((await fin.json().catch(() => ({}))).error ?? "The file was rejected.");
        patch(i, { pct: 100, done: true });
      } catch (e) { patch(i, { error: e instanceof Error ? e.message : "Upload failed." }); }
    }));
    router.refresh();
    if (input.current) input.current.value = "";
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sel) return;
    const f = new FormData(e.currentTarget);
    const body = { title: String(f.get("title") ?? ""), alt: String(f.get("alt") ?? ""), caption: String(f.get("caption") ?? ""), credit: String(f.get("credit") ?? "") };
    setBusy(true);
    const res = await fetch(`/api/admin/media/${sel.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) return toast.error((await res.json().catch(() => ({}))).error ?? "Could not save.");
    toast.success("Saved."); setSel({ ...sel, ...body }); router.refresh();
  }

  async function del() {
    if (!sel) return;
    setBusy(true);
    const res = await fetch(`/api/admin/media/${sel.id}`, { method: "DELETE" });
    setBusy(false); setConfirm(false);
    if (!res.ok) return toast.error((await res.json().catch(() => ({}))).error ?? "Could not delete.");
    toast.success("File deleted."); setSel(null); router.refresh();
  }

  const shown = items.filter((m) => !q || `${m.filename} ${m.title ?? ""} ${m.alt ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      {canWrite && (
        <div className="rounded border border-line bg-white p-5">
          <label htmlFor="files" className="font-medium">Upload files</label>
          <p className="text-xs text-muted">JPEG, PNG, WebP, GIF (up to 8 MB) or PDF (up to 20 MB). Files are checked again on the server.</p>
          <input ref={input} id="files" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" onChange={(e) => e.target.files?.length && upload(e.target.files)} className="mt-2 block text-sm" />
          {uploads.length > 0 && <ul className="mt-3 space-y-2 text-sm" aria-live="polite">{uploads.map((u, i) => (
            <li key={i}>{u.name}: {u.error ? <span className="text-red-700">{u.error}</span> : u.done ? "Uploaded" : `${u.pct}%`}
              {!u.error && !u.done && <progress value={u.pct} max={100} className="ml-2 h-2 w-32 align-middle" />}</li>))}</ul>}
        </div>
      )}
      <div><label htmlFor="mq" className="sr-only">Search files</label><input id="mq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or description" className="w-full max-w-md rounded border border-line bg-white px-3 py-2" /></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {shown.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {shown.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => setSel(m)} aria-pressed={sel?.id === m.id} className={`block w-full rounded border bg-white p-2 text-left ${sel?.id === m.id ? "border-gold" : "border-line"}`}>
                  <span className="block aspect-square overflow-hidden rounded bg-line">{m.kind === "image" ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.url} alt="" className="size-full object-cover" /> : <span className="grid size-full place-items-center text-sm">PDF</span>}</span>
                  <span className="mt-1 block truncate text-xs">{m.title || m.filename}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="rounded border border-dashed border-line bg-white p-8 text-center text-sm text-muted">No files yet.</p>}
        {sel && (
          <aside aria-label="File details" className="h-fit space-y-3 rounded border border-line bg-white p-4 text-sm">
            {sel.kind === "image" && /* eslint-disable-next-line @next/next/no-img-element */ <img src={sel.url} alt={sel.alt || ""} className="w-full rounded" />}
            <dl className="space-y-1 text-xs text-muted"><div>File: {sel.filename}</div><div>Type: {sel.contentType}</div><div>Size: {(sel.size / 1024).toFixed(0)} KB</div><div>Added: {formatDate(sel.createdAt)}</div></dl>
            {canWrite ? (
              <form key={sel.id} onSubmit={save} className="space-y-3">
                <Field id="m-title" label="Title"><input id="m-title" name="title" defaultValue={sel.title ?? ""} className={inputCls} /></Field>
                <Field id="m-alt" label="Alternative text"><input id="m-alt" name="alt" defaultValue={sel.alt ?? ""} className={inputCls} /></Field>
                <Field id="m-cap" label="Caption"><input id="m-cap" name="caption" defaultValue={sel.caption ?? ""} className={inputCls} /></Field>
                <Field id="m-cr" label="Credit"><input id="m-cr" name="credit" defaultValue={sel.credit ?? ""} className={inputCls} /></Field>
                <div className="flex gap-2"><button disabled={busy} className="rounded bg-forest px-4 py-2 text-cream disabled:opacity-60">Save</button>
                  {canDelete && <button type="button" onClick={() => setConfirm(true)} className="rounded border border-red-700 px-4 py-2 text-red-700 hover:bg-red-50">Delete</button>}</div>
              </form>
            ) : <p>{sel.alt}</p>}
          </aside>
        )}
      </div>
      <ConfirmDialog open={confirm} busy={busy} title="Delete this file?" body="It will be removed permanently. Files still used by content cannot be deleted." confirmLabel="Delete file" onConfirm={del} onCancel={() => setConfirm(false)} />
    </div>
  );
}
