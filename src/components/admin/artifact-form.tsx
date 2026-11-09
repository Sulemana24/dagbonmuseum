"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ActionBar, useContentSave } from "@/components/admin/content-actions";
import { ArtifactPicker, Field, ImageListEditor, ReferencesEditor, inputCls } from "@/components/admin/form-bits";
import { artifactInputSchema, type ArtifactInput } from "@/lib/validation/artifact";
import { slugify } from "@/lib/validation/article";
import type { ContentIntent } from "@/lib/validation/common";

interface Props { id?: string; status?: string; collectionId?: string; initial: ArtifactInput; canPublish: boolean; canDelete: boolean }

export function ArtifactForm({ id, status = "draft", collectionId, initial, canPublish, canDelete }: Props) {
  const { busy, send, remove } = useContentSave("artifacts", "/admin/collections", id);
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ArtifactInput>({ resolver: zodResolver(artifactInputSchema), defaultValues: initial });
  const locked = status === "published" && !canPublish;
  const run = (intent: ContentIntent) => handleSubmit((v) => send(intent, v), () => toast.error("Please fix the highlighted fields."))();
  const text = (name: keyof ArtifactInput, label: string, hint?: string) => (
    <Field id={name} label={label} hint={hint} error={errors[name]?.message as string | undefined}><input id={name} className={inputCls} {...register(name as "title")} /></Field>
  );
  const area = (name: keyof ArtifactInput, label: string, rows = 5) => (
    <Field id={name} label={label} error={errors[name]?.message as string | undefined}><textarea id={name} rows={rows} className={inputCls} {...register(name as "title")} /></Field>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); run("save"); }} noValidate className="max-w-3xl space-y-6">
      {locked && <p role="status" className="rounded border border-gold bg-white p-3 text-sm">This record is published. Only a content manager can edit it.</p>}
      <p className="rounded border border-line bg-white p-3 text-sm">Collection ID: <strong>{collectionId ?? "Generated automatically when you first save"}</strong></p>
      {text("title", "Artifact name")}
      <Field id="slug" label="Web address (slug)" error={errors.slug?.message} hint="Leave blank to generate from the name."><input id="slug" className={inputCls} placeholder={slugify(watch("title") || "artifact")} {...register("slug")} /></Field>
      {area("excerpt", "Short summary", 2)}
      {area("description", "Description", 6)}
      {area("significance", "Cultural significance", 5)}
      <p className="text-sm text-muted">Fill in only what is documented. Empty fields are not shown to visitors.</p>
      <div className="grid gap-6 sm:grid-cols-2">
        {text("category", "Category")}{text("period", "Historical period (only if established)")}{text("materials", "Materials")}{text("origin", "Place of origin (if documented)")}
        {text("attribution", "Creator or cultural attribution")}{text("displayLocation", "Where it is displayed", "Public. Never enter storage or security locations.")}
      </div>
      {area("provenance", "Provenance and acquisition (only what is approved for publication)", 4)}
      {area("researchNotes", "Research notes", 4)}
      <Controller control={control} name="images" render={({ field }) => <ImageListEditor id="images" label="Photographs (the first is the main image)" max={20} value={field.value} onChange={field.onChange} errors={errors.images} />} />
      {text("imageCredits", "Image credits (overall)")}
      <Controller control={control} name="references" render={({ field }) => <ReferencesEditor value={field.value} onChange={field.onChange} errors={errors.references} />} />
      <Controller control={control} name="relatedIds" render={({ field }) => <ArtifactPicker label="Related artifacts" value={field.value} onChange={field.onChange} />} />
      <fieldset className="space-y-4 rounded border border-line bg-white p-4">
        <legend className="px-1">Search and sharing</legend>
        {text("seoTitle", "SEO title")}{area("seoDescription", "SEO description", 2)}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("featured")} /> Feature on the homepage</label>
      </fieldset>
      <ActionBar busy={busy} id={id} status={status} canPublish={canPublish} canDelete={canDelete} locked={locked} run={run} remove={remove} noun="artifact" />
    </form>
  );
}
