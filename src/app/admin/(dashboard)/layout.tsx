import { AdminMobileNav, AdminSidebar, type NavItem } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { hasPermission } from "@/lib/auth/roles";
import { requireStaff } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff(); // verified server-side on every request
  // Only modules that exist are listed. More are added as they are built.
  const items: NavItem[] = [{ label: "Overview", href: "/admin/overview", icon: "overview" }];
  if (hasPermission(session.role, "content:read")) {
    items.push(
      { label: "Articles", href: "/admin/articles", icon: "articles" },
      { label: "Exhibitions", href: "/admin/exhibitions", icon: "exhibitions" },
      { label: "Collections and artifacts", href: "/admin/collections", icon: "collections" },
      { label: "Educational resources", href: "/admin/resources", icon: "resources" },
      { label: "Media library", href: "/admin/media", icon: "media" },
    );
  }
  const extra: [Parameters<typeof hasPermission>[1], NavItem][] = [
    ["content:publish", { label: "Pages", href: "/admin/pages", icon: "pages" }],
    ["inquiries:read", { label: "Visitor inquiries", href: "/admin/inquiries", icon: "inquiries" }],
    ["subscribers:read", { label: "Newsletter subscribers", href: "/admin/subscribers", icon: "subscribers" }],
    ["users:manage", { label: "Users and roles", href: "/admin/users", icon: "users" }],
    ["settings:write", { label: "Website settings", href: "/admin/settings", icon: "settings" }],
    ["logs:read", { label: "Activity logs", href: "/admin/logs", icon: "logs" }],
  ];
  extra.forEach(([p, item]) => hasPermission(session.role, p) && items.push(item));
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-2"><AdminMobileNav items={items} /><p className="font-serif text-lg text-forest">Museum admin</p></div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline">{session.email} ({session.role.replace("_", " ")})</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-57px)]">
        <AdminSidebar items={items} />
        <main className="min-w-0 flex-1 px-5 py-10 lg:px-10">{children}</main>
      </div>
    </>
  );
}
