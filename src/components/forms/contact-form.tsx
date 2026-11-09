"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { contactSchema, type ContactInput } from "@/lib/validation/forms";

const field = "mt-1 w-full rounded border border-line bg-white px-3 py-2 text-ink";

export function ContactForm({ kind = "contact" }: { kind?: "contact" | "visit" }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema), defaultValues: { kind },
  });

  async function onSubmit(values: ContactInput) {
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not send your message.");
      toast.success("Message sent. We will reply by email.");
      reset({ kind });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send your message.");
    }
  }

  const err = (k: keyof ContactInput) => errors[k]?.message as string | undefined;
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <input type="hidden" {...register("kind")} />
      <div className="hidden" aria-hidden="true">
        <label>Leave this empty<input tabIndex={-1} autoComplete="off" {...register("website")} /></label>
      </div>
      <div>
        <label htmlFor="name">Full name</label>
        <input id="name" autoComplete="name" className={field} aria-invalid={!!err("name")} aria-describedby="name-e" {...register("name")} />
        <p id="name-e" className="mt-1 text-sm text-red-700">{err("name")}</p>
      </div>
      <div>
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email" className={field} aria-invalid={!!err("email")} aria-describedby="email-e" {...register("email")} />
        <p id="email-e" className="mt-1 text-sm text-red-700">{err("email")}</p>
      </div>
      <div>
        <label htmlFor="organization">Organization (optional)</label>
        <input id="organization" autoComplete="organization" className={field} {...register("organization")} />
      </div>
      <div>
        <label htmlFor="subject">Subject</label>
        <input id="subject" className={field} aria-invalid={!!err("subject")} aria-describedby="subject-e" {...register("subject")} />
        <p id="subject-e" className="mt-1 text-sm text-red-700">{err("subject")}</p>
      </div>
      <div>
        <label htmlFor="message">Message</label>
        <textarea id="message" rows={6} className={field} aria-invalid={!!err("message")} aria-describedby="message-e" {...register("message")} />
        <p id="message-e" className="mt-1 text-sm text-red-700">{err("message")}</p>
      </div>
      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" {...register("consent")} />
          <span>I agree that the museum may store my details to reply to this message.</span>
        </label>
        <p className="mt-1 text-sm text-red-700">{err("consent")}</p>
      </div>
      <button type="submit" disabled={isSubmitting} className="rounded bg-forest px-6 py-3 font-medium text-cream hover:bg-forest-deep disabled:opacity-60">
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
