"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ActionBar, useContentSave } from "@/components/admin/content-actions";
import { ArtifactPicker, Field, ImageEditor, ImageListEditor, inputCls } from "@/components/admin/form-bits";
import type { ContentIntent } from "@/lib/validation/common";
import { exhibitionInputSchema, type ExhibitionInput } from "@/lib/validation/exhibition";
import { slugify } from "@/lib/validation/article";

interface Props { id?: string; status?: string; initial: ExhibitionInput; canPublish: boolean; canDelete: boolean }

export function ExhibitionForm({ id, status = "draft", initial, canPublish, canDelete }: Props) {
  const { busy, send, remove } = useContentSave("exhibitions", "/admin/exhibitions", id);
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ExhibitionInput>({ resolver: zodResolver(exhibitionInputSchema), defaultValues: initial });
  const locked = status === "published" && !canPublish;
  const run = (intent: ContentIntent) => handleSubmit((v) => send(intent, v), () => toast.error("Please fix the highlighted fields."))();
  return (
    <form onSubmit={(e) => { e.preventDefault(); run("save"); }} noValidate className="max-w-3xl space-y-6">
      {locked && <p role="status" className="rounded border border-gold bg-white p-3 text-sm">This exhibition is published. Only a content manager can edit it.</p>}
      <Field id="title" label="Title" error={errors.title?.message}><input id="title" className={inputCls} {...register("title")} /></Field>
      <Field id="slug" label="Web address (slug)" error={errors.slug?.message} hint="Leave blank to generate from the title."><input id="slug" className={inputCls} placeholder={slugify(watch("title") || "exhibition")} {...register("slug")} /></Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="kind" label="Exhibition type"><select id="kind" className={inputCls} {...register("kind")}><option value="permanent">Permanent</option><option value="temporary">Temporary</option><option value="digital">Digital</option><option value="past">Past</option></select></Field>
        <Field id="category" label="Category (optional)" error={errors.category?.message}><input id="category" className={inputCls} {...register("category")} /></Field>
        <Field id="startDate" label="Start date" error={errors.startDate?.message}><input id="startDate" type="date" className={inputCls} {...register("startDate")} /></Field>
        <Field id="endDate" label="End date" error={errors.endDate?.message}><input id="endDate" type="date" className={inputCls} {...register("endDate")} /></Field>
        <Field id="period" label="Period (free text, optional)"><input id="period" className={inputCls} {...register("period")} /></Field>
        <Field id="location" label="Location"><input id="location" className={inputCls} {...register("location")} /></Field>
      </div>
      <Field id="excerpt" label="Short summary" error={errors.excerpt?.message}><textarea id="excerpt" rows={2} className={inputCls} {...register("excerpt")} /></Field>
      <Field id="description" label="Description and supporting information" error={errors.description?.message}><textarea id="description" rows={8} className={inputCls} {...register("description")} /></Field>
      <Controller control={control} name="cover" render={({ field }) => <ImageEditor id="cover" label="Cover image" value={field.value} onChange={field.onChange} error={errors.cover} />} />
      <Controller control={control} name="gallery" render={({ field }) => <ImageListEditor id="gallery" label="Gallery" max={30} value={field.value} onChange={field.onChange} errors={errors.gallery} />} />
      <Controller control={control} name="artifactIds" render={({ field }) => <ArtifactPicker label="Artifacts in this exhibition" value={field.value} onChange={field.onChange} />} />
      <fieldset className="space-y-4 rounded border border-line bg-white p-4">
        <legend className="px-1">Search and sharing</legend>
        <Field id="seoTitle" label="SEO title" error={errors.seoTitle?.message}><input id="seoTitle" className={inputCls} {...register("seoTitle")} /></Field>
        <Field id="seoDescription" label="SEO description" error={errors.seoDescription?.message}><textarea id="seoDescription" rows={2} className={inputCls} {...register("seoDescription")} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("featured")} /> Feature on the homepage</label>
      </fieldset>
      <ActionBar busy={busy} id={id} status={status} canPublish={canPublish} canDelete={canDelete} locked={locked} run={run} remove={remove} noun="exhibition" />
    </form>
  );
}
