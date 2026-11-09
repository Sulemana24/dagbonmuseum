"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Field, ImageEditor, inputCls } from "@/components/admin/form-bits";
import { MediaPicker } from "@/components/admin/media-picker";
import { settingsSchema, type SettingsInput } from "@/lib/validation/settings";

function UrlPicker({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <p>{label}</p>
      {value && /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="h-16 rounded border border-line" />}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(true)} className="rounded border border-forest px-3 py-2 text-sm text-forest hover:bg-forest hover:text-cream">{value ? "Change" : "Choose from media library"}</button>
        {value && <button type="button" onClick={() => onChange("")} className="rounded border border-line px-3 py-2 text-sm hover:bg-line">Clear</button>}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {open && <MediaPicker kind="image" onClose={() => setOpen(false)} onPick={(m) => onChange(m.url)} />}
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { register, control, handleSubmit, formState: { errors } } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema), defaultValues: initial });
  const social = useFieldArray({ control, name: "social" });
  const text = (name: keyof SettingsInput, label: string, hint?: string) => (
    <Field id={name} label={label} hint={hint} error={errors[name]?.message as string | undefined}><input id={name} className={inputCls} {...register(name as "name")} /></Field>
  );
  const area = (name: keyof SettingsInput, label: string, rows = 3, hint?: string) => (
    <Field id={name} label={label} hint={hint} error={errors[name]?.message as string | undefined}><textarea id={name} rows={rows} className={inputCls} {...register(name as "name")} /></Field>
  );
  const box = "space-y-4 rounded border border-line bg-white p-4";

  async function onSubmit(values: SettingsInput) {
    setBusy(true);
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    setBusy(false);
    if (!res.ok) return toast.error((await res.json().catch(() => ({}))).error ?? "Could not save settings.");
    toast.success("Settings saved. Public pages update within a minute."); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, () => toast.error("Please fix the highlighted fields."))} noValidate className="max-w-3xl space-y-6">
      <fieldset className={box}><legend className="px-1">Museum details</legend>
        {text("name", "Museum name")}{area("description", "Site description", 2)}
        {text("address", "Official address", "Leave empty until verified; visitors see \"To be confirmed\".")}
        <div className="grid gap-4 sm:grid-cols-2">{text("email", "Contact email")}{text("phone", "Phone number")}</div>
        {area("openingHours", "Opening hours", 3)}{area("admissionInfo", "Admission information", 3)}
        {text("mapEmbedUrl", "Map embed link", "Google Maps: Share > Embed a map > copy the src link. OpenStreetMap embeds also work.")}
      </fieldset>
      <fieldset className={box}><legend className="px-1">Homepage</legend>
        {text("hero.heading" as keyof SettingsInput, "Hero heading")}
        <Field id="hero.text" label="Hero text"><textarea id="hero.text" rows={2} className={inputCls} {...register("hero.text")} /></Field>
        <Controller control={control} name="hero.image" render={({ field }) => <ImageEditor id="hero" label="Hero photograph" value={field.value} onChange={field.onChange} error={errors.hero?.image} />} />
        {area("intro", "Introduction", 4)}{area("mission", "Mission", 4)}{area("vision", "Vision", 4)}
      </fieldset>
      <fieldset className={box}><legend className="px-1">Branding and SEO</legend>
        <Controller control={control} name="logo" render={({ field }) => <ImageEditor id="logo" label="Logo" value={field.value} onChange={field.onChange} error={errors.logo} />} />
        <Controller control={control} name="faviconUrl" render={({ field }) => <UrlPicker label="Favicon" value={field.value} onChange={field.onChange} error={errors.faviconUrl?.message} />} />
        <Controller control={control} name="ogImageUrl" render={({ field }) => <UrlPicker label="Default social sharing image" value={field.value} onChange={field.onChange} error={errors.ogImageUrl?.message} />} />
        {area("seoDescription", "Default SEO description", 2)}
      </fieldset>
      <fieldset className={box}><legend className="px-1">Footer and social links</legend>
        {text("footerNote", "Footer note")}
        {social.fields.map((f, i) => (
          <div key={f.id} className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
            <div><label className="sr-only" htmlFor={`sl${i}`}>Name</label><input id={`sl${i}`} placeholder="Name" className={inputCls} {...register(`social.${i}.label`)} />{errors.social?.[i]?.label && <p className="text-sm text-red-700">{errors.social[i]?.label?.message}</p>}</div>
            <div><label className="sr-only" htmlFor={`su${i}`}>Link</label><input id={`su${i}`} placeholder="https:// verified link" className={inputCls} {...register(`social.${i}.href`)} />{errors.social?.[i]?.href && <p className="text-sm text-red-700">{errors.social[i]?.href?.message}</p>}</div>
            <button type="button" onClick={() => social.remove(i)} className="mt-1 rounded border border-line px-3 text-sm hover:bg-line">Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => social.append({ label: "", href: "" })} className="rounded border border-line px-3 py-2 text-sm hover:bg-line">Add a social link</button>
      </fieldset>
      <fieldset className={box}><legend className="px-1">Newsletter</legend>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("newsletterEnabled")} /> Accept new subscriptions</label>
        {area("newsletterConsent", "Consent wording shown beside the checkbox", 2)}
        <p className="text-xs text-muted">Collecting subscribers only. Sending newsletters needs an email service, which is not connected.</p>
      </fieldset>
      <div className="sticky bottom-0 border-t border-line bg-cream/95 py-4"><button disabled={busy} className="rounded bg-forest px-6 py-3 text-cream hover:bg-forest-deep disabled:opacity-60">{busy ? "Saving..." : "Save settings"}</button></div>
    </form>
  );
}
