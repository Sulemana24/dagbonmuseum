import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/admin/overview");
  const raw = (await searchParams).next ?? "";
  const next = raw.startsWith("/admin") && !raw.startsWith("//") ? raw : "/admin/overview"; // no open redirects
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-5">
      <div className="w-full rounded border border-line bg-white p-8">
        <h1 className="text-3xl">Staff sign in</h1>
        <p className="mb-6 mt-2 text-sm text-muted">Dagbon and Ghana Civilization Museum. Authorized staff only.</p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
