"use client";

import { useState } from "react";
import { toast } from "sonner";

export function UnsubscribeButton({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const res = await fetch("/api/newsletter/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    setBusy(false);
    if (res.ok) setDone(true); else toast.error((await res.json().catch(() => ({}))).error ?? "Could not unsubscribe.");
  }
  if (done) return <p className="text-lg">You have been unsubscribed.</p>;
  return <button onClick={go} disabled={busy} className="rounded bg-forest px-6 py-3 text-cream hover:bg-forest-deep disabled:opacity-60">{busy ? "Working..." : "Confirm unsubscribe"}</button>;
}
