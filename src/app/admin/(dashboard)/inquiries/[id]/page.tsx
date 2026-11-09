import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryPanel } from "@/components/admin/inquiry-panel";
import { hasPermission } from "@/lib/auth/roles";
import { requirePermission } from "@/lib/auth/session";
import { getInquiry } from "@/lib/services/inquiries-admin";
import { listStaff } from "@/lib/services/users-admin";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Inquiry" };

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requirePermission("inquiries:read");
  const q = await getInquiry((await params).id);
  if (!q) notFound();
  const canWrite = hasPermission(s.role, "inquiries:write");
  const staff = canWrite ? (await listStaff().catch(() => [])).filter((u) => !u.disabled).map((u) => ({ uid: u.uid, email: u.email })) : [];
  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/inquiries" className="text-sm text-forest underline">Back to inquiries</Link>
      <h1 className="text-3xl">{q.subject}</h1>
      <p className="text-sm text-muted">{q.name} ({q.email}){q.organization ? `, ${q.organization}` : ""} | {q.kind === "visit" ? "Visit question" : "Contact"} | {formatDate(q.createdAt)}</p>
      <p className="whitespace-pre-wrap rounded border border-line bg-white p-5 leading-7">{q.message}</p>
      <InquiryPanel id={q.id} status={q.status} assignedTo={q.assignedTo ?? null} staff={staff} canWrite={canWrite} />
      <section><h2 className="text-xl">Internal notes</h2>
        {q.notes.length ? <ul className="mt-3 space-y-3">{q.notes.map((n, i) => <li key={i} className="rounded border border-line bg-white p-3 text-sm"><p className="whitespace-pre-wrap">{n.text}</p><p className="mt-1 text-xs text-muted">{n.authorEmail}, {formatDate(n.at)}</p></li>)}</ul> : <p className="mt-2 text-sm text-muted">No notes yet. Notes are visible to staff only.</p>}
      </section>
    </div>
  );
}
