"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { newsletterSchema, type NewsletterInput } from "@/lib/validation/forms";

export function NewsletterForm({ consentText = "I agree to receive museum updates by email and can unsubscribe at any time." }: { consentText?: string }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  async function onSubmit(values: NewsletterInput) {
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not subscribe.");
      toast.success("You are subscribed.");
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not subscribe.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2 text-sm">
      <div className="hidden" aria-hidden="true"><input tabIndex={-1} autoComplete="off" {...register("website")} /></div>
      <label htmlFor="nl-email" className="block">Email address</label>
      <div className="flex gap-2">
        <input id="nl-email" type="email" autoComplete="email" className="min-w-0 flex-1 rounded border border-cream/30 bg-forest px-3 py-2 text-cream" {...register("email")} />
        <button type="submit" disabled={isSubmitting} className="rounded bg-gold px-4 py-2 font-medium text-forest-deep hover:bg-cream disabled:opacity-60">Subscribe</button>
      </div>
      <p className="text-red-300">{errors.email?.message}</p>
      <label className="flex items-start gap-2 text-cream/70">
        <input type="checkbox" className="mt-1" {...register("consent")} />
        <span>{consentText}</span>
      </label>
      <p className="text-red-300">{errors.consent?.message}</p>
    </form>
  );
}
