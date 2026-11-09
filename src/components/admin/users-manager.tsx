"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { inputCls } from "@/components/admin/form-bits";
import { AREAS, ROLES } from "@/lib/auth/roles";
import type { StaffUser } from "@/lib/services/users-admin";
import { formatDate } from "@/lib/utils";

const send = (url: string, method: string, body: unknown) => fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const err = async (r: Response) => (await r.json().catch(() => ({}))).error ?? "Something went wrong.";

export function UsersManager({ users, selfUid }: { users: StaffUser[]; selfUid: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [draft, setDraft] = useState<Record<string, { role: string; areas: string[] }>>({});
  const [form, setForm] = useState({ email: "", role: "content_editor", areas: [] as string[] });
  const [link, setLink] = useState("");
  const toggle = (arr: string[], a: string) => (arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a]);

  async function changeRole(u: StaffUser) {
    const d = draft[u.uid]; if (!d) return;
    setBusy(u.uid);
    const r = await send("/api/admin/users/role", "POST", { uid: u.uid, role: d.role, areas: d.role === "content_manager" ? d.areas : [] });
    setBusy("");
    if (!r.ok) return toast.error(await err(r));
    toast.success("Role updated. They must sign in again."); setDraft((d0) => Object.fromEntries(Object.entries(d0).filter(([k]) => k !== u.uid))); router.refresh();
  }
  async function disable(u: StaffUser) {
    setBusy(u.uid);
    const r = await send(`/api/admin/users/${u.uid}`, "PATCH", { disabled: !u.disabled });
    setBusy("");
    if (!r.ok) return toast.error(await err(r));
    toast.success(u.disabled ? "Account enabled." : "Account disabled."); router.refresh();
  }
  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy("new"); setLink("");
    const r = await send("/api/admin/users", "POST", { ...form, areas: form.role === "content_manager" ? form.areas : [] });
    setBusy("");
    if (!r.ok) return toast.error(await err(r));
    setLink((await r.json()).setupLink); setForm({ email: "", role: "content_editor", areas: [] }); toast.success("Account created."); router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted"><tr><th className="p-3 font-medium">Email</th><th className="p-3 font-medium">Role</th><th className="p-3 font-medium">Last sign-in</th><th className="p-3 font-medium">Actions</th></tr></thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const d = draft[u.uid] ?? { role: u.role, areas: u.areas };
              const self = u.uid === selfUid;
              return (
                <tr key={u.uid} className={u.disabled ? "opacity-60" : ""}>
                  <td className="p-3">{u.email}{self && <span className="ml-2 text-xs text-muted">(you)</span>}{u.disabled && <span className="ml-2 text-xs text-red-700">Disabled</span>}</td>
                  <td className="p-3">
                    <label className="sr-only" htmlFor={`r-${u.uid}`}>Role for {u.email}</label>
                    <select id={`r-${u.uid}`} disabled={self} value={d.role} onChange={(e) => setDraft({ ...draft, [u.uid]: { ...d, role: e.target.value } })} className="rounded border border-line px-2 py-1">{ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}</select>
                    {d.role === "content_manager" && <div className="mt-2 flex flex-wrap gap-2 text-xs">{AREAS.map((a) => <label key={a} className="flex items-center gap-1"><input type="checkbox" disabled={self} checked={d.areas.includes(a)} onChange={() => setDraft({ ...draft, [u.uid]: { ...d, areas: toggle(d.areas, a) } })} />{a}</label>)}</div>}
                  </td>
                  <td className="p-3">{formatDate(u.lastSignIn) ?? "Never"}</td>
                  <td className="p-3"><div className="flex flex-wrap gap-2">
                    {draft[u.uid] && <button disabled={busy === u.uid} onClick={() => changeRole(u)} className="rounded bg-forest px-3 py-1 text-xs text-cream">Apply role</button>}
                    {!self && <button disabled={busy === u.uid} onClick={() => disable(u)} className="rounded border border-line px-3 py-1 text-xs hover:bg-line">{u.disabled ? "Enable" : "Disable"}</button>}
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <form onSubmit={create} className="max-w-xl space-y-4 rounded border border-line bg-white p-5">
        <h2 className="text-xl">Add a staff member</h2>
        <div><label htmlFor="ne">Email</label><input id="ne" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></div>
        <div><label htmlFor="nr">Role</label><select id="nr" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>{ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}</select></div>
        {form.role === "content_manager" && <fieldset className="flex flex-wrap gap-3 text-sm"><legend className="mb-1">Assigned areas</legend>{AREAS.map((a) => <label key={a} className="flex items-center gap-1"><input type="checkbox" checked={form.areas.includes(a)} onChange={() => setForm({ ...form, areas: toggle(form.areas, a) })} />{a}</label>)}</fieldset>}
        <button disabled={busy === "new"} className="rounded bg-forest px-5 py-2.5 text-cream disabled:opacity-60">{busy === "new" ? "Creating..." : "Create account"}</button>
        {link && <div role="status" className="rounded border border-gold p-3 text-sm"><p className="font-medium">One-time password setup link</p><p className="mt-1 break-all">{link}</p><p className="mt-2 text-xs text-muted">Send this privately to the new staff member. It is shown only now. No email is sent automatically.</p></div>}
      </form>
    </div>
  );
}
