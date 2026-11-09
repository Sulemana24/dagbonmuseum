"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function out() {
    setBusy(true);
    const res = await fetch("/api/admin/session", { method: "DELETE" });
    if (!res.ok) { setBusy(false); return toast.error("Could not sign out. Try again."); }
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <button onClick={out} disabled={busy} className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm hover:bg-line disabled:opacity-60">
      <LogOut className="size-4" /> {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}
