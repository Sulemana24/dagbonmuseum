import { SettingsForm } from "@/components/admin/settings-form";
import { requirePermission } from "@/lib/auth/session";
import { getSettingsInput } from "@/lib/services/settings-admin";

export const metadata = { title: "Website settings" };

export default async function SettingsPage() {
  await requirePermission("settings:write");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Website settings</h1>
      <p className="max-w-2xl text-sm text-muted">Only enter details the museum has confirmed. Empty fields show as &quot;To be confirmed&quot; on the public site.</p>
      <SettingsForm initial={await getSettingsInput()} />
    </div>
  );
}
