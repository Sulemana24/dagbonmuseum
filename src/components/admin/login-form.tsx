"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { inMemoryPersistence, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { getClientAuth, isFirebaseConfigured } from "@/lib/firebase/client";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address."), password: z.string().min(1, "Enter your password.") });
type Values = z.infer<typeof schema>;

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes or reset your password.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, getValues, trigger, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  const field = "mt-1 w-full rounded border border-line bg-white px-3 py-2";

  async function onSubmit({ email, password }: Values) {
    if (!isFirebaseConfigured) return toast.error("Firebase is not configured. See .env.example.");
    const auth = getClientAuth();
    try {
      await setPersistence(auth, inMemoryPersistence); // the server cookie is the only lasting session
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const res = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await cred.user.getIdToken() }) });
      await signOut(auth);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Sign-in failed.");
      router.replace(next);
      router.refresh();
    } catch (e) {
      const code = (e as { code?: string }).code;
      toast.error(code ? AUTH_ERRORS[code] ?? "Sign-in failed. Please try again." : e instanceof Error ? e.message : "Sign-in failed.");
    }
  }

  async function forgot() {
    if (!(await trigger("email"))) return;
    try { await sendPasswordResetEmail(getClientAuth(), getValues("email")); } catch { /* same message either way */ }
    toast.success("If an account exists for that email, a reset link is on its way.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="username" className={field} aria-invalid={!!errors.email} aria-describedby="email-e" {...register("email")} />
        <p id="email-e" className="mt-1 text-sm text-red-700">{errors.email?.message}</p>
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <div className="relative">
          <input id="password" type={show ? "text" : "password"} autoComplete="current-password" className={`${field} pr-11`} aria-invalid={!!errors.password} aria-describedby="pw-e" {...register("password")} />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
            className="absolute right-1 top-2 grid size-9 place-items-center rounded hover:bg-line">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
        </div>
        <p id="pw-e" className="mt-1 text-sm text-red-700">{errors.password?.message}</p>
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full rounded bg-forest px-6 py-3 font-medium text-cream hover:bg-forest-deep disabled:opacity-60">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      <button type="button" onClick={forgot} className="text-sm text-forest underline">Forgot password?</button>
    </form>
  );
}
