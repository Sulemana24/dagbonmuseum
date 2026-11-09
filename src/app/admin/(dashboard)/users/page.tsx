import { UsersManager } from "@/components/admin/users-manager";
import { requirePermission } from "@/lib/auth/session";
import { listStaff } from "@/lib/services/users-admin";

export const metadata = { title: "Users and roles" };

export default async function UsersPage() {
  const s = await requirePermission("users:manage");
  const users = await listStaff();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Users and roles</h1>
      <p className="max-w-2xl text-sm text-muted">Role changes sign the person out so they must sign in again. You cannot change or disable your own account here.</p>
      <UsersManager users={users} selfUid={s.uid} />
    </div>
  );
}
