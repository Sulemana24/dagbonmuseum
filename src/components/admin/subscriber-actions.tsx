"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function SubscriberActions({ id, email, status }: { id: string; email: string; status: string }) {
  const router = useRouter();
  const [action, setAction] = useState<"suppress" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    setBusy(false); setAction(null);
    if (!res.ok) return toast.error((await res.json().catch(() => ({}))).error ?? "Could not update.");
    toast.success(action === "delete" ? "Subscriber removed." : "Subscriber suppressed."); router.refresh();
  }
  return (
    <>
      <div className="flex gap-2">
        {status === "subscribed" && <button onClick={() => setAction("suppress")} className="rounded border border-line px-3 py-1 text-xs hover:bg-line">Suppress</button>}
        <button onClick={() => setAction("delete")} className="rounded border border-red-700 px-3 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button>
      </div>
      <ConfirmDialog open={!!action} busy={busy} onCancel={() => setAction(null)} onConfirm={run}
        title={action === "delete" ? "Delete this subscriber?" : "Suppress this subscriber?"} confirmLabel={action === "delete" ? "Delete" : "Suppress"}
        body={action === "delete" ? `${email} is removed permanently. They could subscribe again later.` : `${email} stays on record but will not be exported or contacted.`} />
    </>
  );
}
