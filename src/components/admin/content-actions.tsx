"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { ContentIntent } from "@/lib/validation/common";

const DONE: Record<ContentIntent, string> = { save: "Saved.", submit: "Submitted for review.", publish: "Published.", unpublish: "Unpublished.", archive: "Archived.", restore: "Restored as draft." };

/** type = articles | exhibitions | artifacts | resources; listHref = the admin list page to return to after delete */
export function useContentSave(type: string, listHref: string, id?: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function send(intent: ContentIntent, input: unknown) {
    setBusy(true);
    try {
      const res = await fetch(id ? `/api/admin/content/${type}/${id}` : `/api/admin/content/${type}`, { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intent, input }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      toast.success(DONE[intent]);
      if (!id) router.replace(`${listHref}/${data.id}`); else router.refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save."); } finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/admin/content/${type}/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted."); router.replace(listHref); router.refresh(); }
    else { setBusy(false); toast.error((await res.json().catch(() => ({}))).error ?? "Could not delete."); }
  }
  return { busy, send, remove };
}

const btn = "rounded px-5 py-2.5 text-sm font-medium disabled:opacity-60";
export function ActionBar({ busy, id, status, canPublish, canDelete, locked, previewHref, run, remove, noun }: {
  busy: boolean; id?: string; status: string; canPublish: boolean; canDelete: boolean; locked?: boolean; previewHref?: string;
  run: (i: ContentIntent) => void; remove: () => Promise<void>; noun: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const plain = `${btn} border border-line bg-white hover:bg-line`;
  return (
    <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-3 border-t border-line bg-cream/95 px-1 py-4 backdrop-blur">
      <button type="submit" disabled={busy || locked} className={`${btn} bg-forest text-cream hover:bg-forest-deep`}>{busy ? "Working..." : "Save"}</button>
      {!canPublish && status !== "published" && <button type="button" disabled={busy} onClick={() => run("submit")} className={`${btn} border border-forest text-forest hover:bg-forest hover:text-cream`}>Submit for review</button>}
      {canPublish && status !== "published" && status !== "archived" && <button type="button" disabled={busy} onClick={() => run("publish")} className={`${btn} bg-gold text-forest-deep hover:bg-cream`}>Publish</button>}
      {canPublish && status === "published" && <button type="button" disabled={busy} onClick={() => run("unpublish")} className={plain}>Unpublish</button>}
      {canPublish && id && status !== "archived" && <button type="button" disabled={busy} onClick={() => run("archive")} className={plain}>Archive</button>}
      {canPublish && status === "archived" && <button type="button" disabled={busy} onClick={() => run("restore")} className={plain}>Restore as draft</button>}
      {previewHref && <Link href={previewHref} target="_blank" className={plain}>Preview</Link>}
      {id && canDelete && <button type="button" onClick={() => setConfirm(true)} className={`${btn} ml-auto border border-red-700 text-red-700 hover:bg-red-50`}>Delete</button>}
      <ConfirmDialog open={confirm} busy={busy} title={`Delete this ${noun}?`} body="This permanently removes it and its web address. This cannot be undone." confirmLabel="Delete" onConfirm={remove} onCancel={() => setConfirm(false)} />
    </div>
  );
}
