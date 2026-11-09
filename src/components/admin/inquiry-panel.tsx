"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { inputCls } from "@/components/admin/form-bits";
import { INQUIRY_LABEL, INQUIRY_STATUSES } from "@/lib/inquiry-constants";

export function InquiryPanel({ id, status, assignedTo, staff, canWrite }: { id: string; status: string; assignedTo: string | null; staff: { uid: string; email: string }[]; canWrite: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  async function patch(body: Record<string, unknown>, done: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/inquiries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) return toast.error((await res.json().catch(() => ({}))).error ?? "Could not update.");
    toast.success(done); setNote(""); router.refresh();
  }
  if (!canWrite) return <p className="text-sm text-muted">You can read this inquiry but not change it.</p>;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="st">Status</label>
          <select id="st" value={status} disabled={busy} onChange={(e) => patch({ status: e.target.value }, "Status updated.")} className={inputCls}>
            {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{INQUIRY_LABEL[s]}</option>)}</select></div>
        <div><label htmlFor="as">Assigned to</label>
          <select id="as" value={assignedTo ?? ""} disabled={busy} onChange={(e) => patch({ assignedTo: e.target.value || null }, "Assignment updated.")} className={inputCls}>
            <option value="">Unassigned</option>{staff.map((u) => <option key={u.uid} value={u.uid}>{u.email}</option>)}</select></div>
      </div>
      {status !== "archived" && <button type="button" disabled={busy} onClick={() => patch({ status: "archived" }, "Archived.")} className="rounded border border-line px-4 py-2 text-sm hover:bg-line">Archive</button>}
      <div><label htmlFor="note">Add an internal note (never shown publicly)</label>
        <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
        <button type="button" disabled={busy || !note.trim()} onClick={() => patch({ note }, "Note added.")} className="mt-2 rounded bg-forest px-4 py-2 text-sm text-cream disabled:opacity-60">Add note</button></div>
    </div>
  );
}
