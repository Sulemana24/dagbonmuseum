"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ActionBar, useContentSave } from "@/components/admin/content-actions";
import { Field, ImageEditor, inputCls } from "@/components/admin/form-bits";
import { MediaPicker } from "@/components/admin/media-picker";
import { slugify } from "@/lib/validation/article";
import type { ContentIntent } from "@/lib/validation/common";
import { resourceInputSchema, type ResourceInput } from "@/lib/validation/resource";

interface Props { id?: string; status?: string; initial: ResourceInput; canPublish: boolean; canDelete: boolean }

export function ResourceForm({ id, status = "draft", initial, canPublish, canDelete }: Props) {
  const { busy, send, remove } = useContentSave("resources", "/admin/resources", id);
  const [picker, setPicker] = useState(false);
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ResourceInput>({ resolver: zodResolver(resourceInputSchema), defaultValues: initial });
  const locked = status === "published" && !canPublish;
  const run = (intent: ContentIntent) => handleSubmit((v) => send(intent, v), () => toast.error("Please fix the highlighted fields."))();
  const file = watch("fileUrl");
  return (
    <form onSubmit={(e) => { e.preventDefault(); run("save"); }} noValidate className="max-w-3xl space-y-6">
      {locked && <p role="status" className="rounded border border-gold bg-white p-3 text-sm">This resource is published. Only a content manager can edit it.</p>}
      <Field id="title" label="Title" error={errors.title?.message}><input id="title" className={inputCls} {...register("title")} /></Field>
      <Field id="slug" label="Web address (slug)" error={errors.slug?.message} hint="Leave blank to generate from the title."><input id="slug" className={inputCls} placeholder={slugify(watch("title") || "resource")} {...register("slug")} /></Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="type" label="Resource type"><select id="type" className={inputCls} {...register("type")}><option value="article">Article</option><option value="video">Video</option><option value="document">Document or download</option><option value="timeline">Timeline</option><option value="language">Dagbani language</option></select></Field>
        <Field id="category" label="Category" error={errors.category?.message}><input id="category" className={inputCls} {...register("category")} /></Field>
      </div>
      <Field id="excerpt" label="Short summary" error={errors.excerpt?.message}><textarea id="excerpt" rows={2} className={inputCls} {...register("excerpt")} /></Field>
      <Field id="description" label="Description" error={errors.description?.message}><textarea id="description" rows={8} className={inputCls} {...register("description")} /></Field>
      <Controller control={control} name="cover" render={({ field }) => <ImageEditor id="cover" label="Thumbnail" value={field.value} onChange={field.onChange} error={errors.cover} />} />
      <fieldset className="space-y-3 rounded border border-line bg-white p-4">
        <legend className="px-1">File and video</legend>
        <p className="text-sm">{file ? "A file is attached." : "No file attached."}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPicker(true)} className="rounded border border-forest px-3 py-2 text-sm text-forest hover:bg-forest hover:text-cream">{file ? "Change file" : "Choose a PDF from the media library"}</button>
          {file && <button type="button" onClick={() => { setValue("fileUrl", ""); setValue("publicDownload", false); }} className="rounded border border-line px-3 py-2 text-sm hover:bg-line">Remove file</button>}
        </div>
        {errors.fileUrl && <p className="text-sm text-red-700">{errors.fileUrl.message}</p>}
        <input type="hidden" {...register("fileUrl")} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("publicDownload")} /> Visitors may download this file (otherwise it is not offered publicly)</label>
        {errors.publicDownload && <p className="text-sm text-red-700">{errors.publicDownload.message}</p>}
        <Field id="videoUrl" label="Video link (https)" error={errors.videoUrl?.message}><input id="videoUrl" className={inputCls} {...register("videoUrl")} /></Field>
        {picker && <MediaPicker kind="document" onClose={() => setPicker(false)} onPick={(m) => setValue("fileUrl", m.url, { shouldValidate: true })} />}
      </fieldset>
      <fieldset className="space-y-4 rounded border border-line bg-white p-4">
        <legend className="px-1">Search and sharing</legend>
        <Field id="seoTitle" label="SEO title" error={errors.seoTitle?.message}><input id="seoTitle" className={inputCls} {...register("seoTitle")} /></Field>
        <Field id="seoDescription" label="SEO description" error={errors.seoDescription?.message}><textarea id="seoDescription" rows={2} className={inputCls} {...register("seoDescription")} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("featured")} /> Feature this resource</label>
      </fieldset>
      <ActionBar busy={busy} id={id} status={status} canPublish={canPublish} canDelete={canDelete} locked={locked} run={run} remove={remove} noun="resource" />
    </form>
  );
}
