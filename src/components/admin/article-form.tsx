"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ActionBar, useContentSave } from "@/components/admin/content-actions";
import { Field, inputCls } from "@/components/admin/form-bits";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { heritageCategories } from "@/lib/site-config";
import { articleInputSchema, slugify, type ArticleInput } from "@/lib/validation/article";
import type { ContentIntent } from "@/lib/validation/common";

export const EMPTY_ARTICLE: ArticleInput = {
  title: "", slug: "", excerpt: "", content: "", categorySlug: "", tags: "", author: "", evidenceType: "", coverUrl: "", coverAlt: "",
  coverCaption: "", coverCredit: "", references: [], seoTitle: "", seoDescription: "", featured: false,
};

interface Props { id?: string; status?: string; initial: ArticleInput; canPublish: boolean; canDelete: boolean }

export function ArticleForm({ id, status = "draft", initial, canPublish, canDelete }: Props) {
  const { busy, send, remove } = useContentSave("articles", "/admin/articles", id);
  const [picker, setPicker] = useState(false);
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ArticleInput>({ resolver: zodResolver(articleInputSchema), defaultValues: initial });
  const refs = useFieldArray({ control, name: "references" });
  const locked = status === "published" && !canPublish;
  const run = (intent: ContentIntent) => handleSubmit((v) => send(intent, v), () => toast.error("Please fix the highlighted fields."))();
  const cover = watch("coverUrl");

  return (
    <form onSubmit={(e) => { e.preventDefault(); run("save"); }} noValidate className="max-w-3xl space-y-6">
      {locked && <p role="status" className="rounded border border-gold bg-white p-3 text-sm">This article is published. Only a content manager can edit it.</p>}
      <Field id="title" label="Title" error={errors.title?.message}><input id="title" className={inputCls} {...register("title")} /></Field>
      <Field id="slug" label="Web address (slug)" error={errors.slug?.message} hint="Leave blank to generate from the title. Changing it later changes the public link.">
        <input id="slug" className={inputCls} placeholder={slugify(watch("title") || "article-title")} {...register("slug")} />
      </Field>
      <Field id="excerpt" label="Introduction" error={errors.excerpt?.message}><textarea id="excerpt" rows={3} className={inputCls} {...register("excerpt")} /></Field>
      <div><p className="mb-1">Main content</p>
        <Controller control={control} name="content" render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} label="Main content" />} /></div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="categorySlug" label="Category"><select id="categorySlug" className={inputCls} {...register("categorySlug")}><option value="">None</option>{heritageCategories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></Field>
        <Field id="evidenceType" label="Type of source material"><select id="evidenceType" className={inputCls} {...register("evidenceType")}>
          <option value="">Not specified</option><option value="documented">Documented evidence</option><option value="oral-tradition">Oral tradition</option><option value="interpretation">Contemporary interpretation</option></select></Field>
        <Field id="author" label="Author or contributor"><input id="author" className={inputCls} {...register("author")} /></Field>
        <Field id="tags" label="Tags (comma separated)" error={errors.tags?.message}><input id="tags" className={inputCls} {...register("tags")} /></Field>
      </div>
      <fieldset className="space-y-4 rounded border border-line bg-white p-4">
        <legend className="px-1">Cover image</legend>
        {cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={cover} alt="" className="h-28 rounded border border-line object-cover" />}
        <div className="flex gap-2">
          <button type="button" onClick={() => setPicker(true)} className="rounded border border-forest px-3 py-2 text-sm text-forest hover:bg-forest hover:text-cream">{cover ? "Change image" : "Choose from media library"}</button>
          {cover && <button type="button" onClick={() => { setValue("coverUrl", ""); setValue("coverAlt", ""); setValue("coverCaption", ""); setValue("coverCredit", ""); }} className="rounded border border-line px-3 py-2 text-sm hover:bg-line">Clear</button>}
        </div>
        {errors.coverUrl && <p className="text-sm text-red-700">{errors.coverUrl.message}</p>}
        <input type="hidden" {...register("coverUrl")} />
        <Field id="coverAlt" label="Alternative text" error={errors.coverAlt?.message}><input id="coverAlt" className={inputCls} {...register("coverAlt")} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="coverCaption" label="Caption"><input id="coverCaption" className={inputCls} {...register("coverCaption")} /></Field>
          <Field id="coverCredit" label="Credit"><input id="coverCredit" className={inputCls} {...register("coverCredit")} /></Field>
        </div>
        {picker && <MediaPicker kind="image" onClose={() => setPicker(false)} onPick={(m) => { setValue("coverUrl", m.url, { shouldValidate: true }); setValue("coverAlt", m.alt ?? ""); setValue("coverCaption", m.caption ?? ""); setValue("coverCredit", m.credit ?? ""); }} />}
      </fieldset>
      <fieldset className="space-y-3 rounded border border-line bg-white p-4">
        <legend className="px-1">References and sources</legend>
        {refs.fields.map((f, i) => (
          <div key={f.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <div><label className="sr-only" htmlFor={`rl${i}`}>Source name</label><input id={`rl${i}`} placeholder="Source name" className={inputCls} {...register(`references.${i}.label`)} />{errors.references?.[i]?.label && <p className="text-sm text-red-700">{errors.references[i]?.label?.message}</p>}</div>
            <div><label className="sr-only" htmlFor={`ru${i}`}>Link (optional)</label><input id={`ru${i}`} placeholder="https:// link (optional)" className={inputCls} {...register(`references.${i}.url`)} />{errors.references?.[i]?.url && <p className="text-sm text-red-700">{errors.references[i]?.url?.message}</p>}</div>
            <button type="button" onClick={() => refs.remove(i)} className="mt-1 rounded border border-line px-3 text-sm hover:bg-line">Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => refs.append({ label: "", url: "" })} className="rounded border border-line px-3 py-2 text-sm hover:bg-line">Add a source</button>
      </fieldset>
      <fieldset className="space-y-4 rounded border border-line bg-white p-4">
        <legend className="px-1">Search and sharing</legend>
        <Field id="seoTitle" label="SEO title" error={errors.seoTitle?.message}><input id="seoTitle" className={inputCls} {...register("seoTitle")} /></Field>
        <Field id="seoDescription" label="SEO description" error={errors.seoDescription?.message}><textarea id="seoDescription" rows={2} className={inputCls} {...register("seoDescription")} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("featured")} /> Feature this article</label>
      </fieldset>
      <ActionBar busy={busy} id={id} status={status} canPublish={canPublish} canDelete={canDelete} locked={locked} run={run} remove={remove} noun="article" previewHref={id ? `/admin/articles/${id}/preview` : undefined} />
    </form>
  );
}
