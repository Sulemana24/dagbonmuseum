"use client";

import { useEffect, useRef } from "react";

export function ConfirmDialog({ open, title, body, confirmLabel, busy, onConfirm, onCancel }: {
  open: boolean; title: string; body: string; confirmLabel: string; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onCancel(); }} aria-labelledby="cd-title" className="m-auto w-[min(92vw,26rem)] rounded border border-line bg-white p-6 backdrop:bg-black/50">
      <h2 id="cd-title" className="text-xl">{title}</h2>
      <p className="mt-2 text-sm">{body}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded border border-line px-4 py-2 text-sm hover:bg-line">Cancel</button>
        <button type="button" onClick={onConfirm} disabled={busy} className="rounded bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800 disabled:opacity-60">{busy ? "Working..." : confirmLabel}</button>
      </div>
    </dialog>
  );
}
