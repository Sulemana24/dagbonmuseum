"use client";

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, Italic, Link as LinkIcon, List, ListOrdered, Quote } from "lucide-react";
import { useState } from "react";

export function RichTextEditor({ value, onChange, label }: { value: string; onChange: (html: string) => void; label: string }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("https://");
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } })],
    content: value, immediatelyRender: false,
    editorProps: { attributes: { class: "min-h-64 rounded-b border border-line bg-white p-4 text-base leading-7 focus:outline-none [&_h2]:mt-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h3]:mt-3 [&_h3]:font-serif [&_h3]:text-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-3 [&_a]:text-forest [&_a]:underline", role: "textbox", "aria-multiline": "true", "aria-label": label } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });
  if (!editor) return <div className="h-64 rounded border border-line bg-white" aria-busy="true" />;

  const btn = (active: boolean) => `grid size-9 place-items-center rounded border ${active ? "border-forest bg-forest text-cream" : "border-line bg-white hover:bg-line"}`;
  const tools = [
    { l: "Heading", i: Heading2, a: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { l: "Subheading", i: Heading3, a: editor.isActive("heading", { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { l: "Bold", i: Bold, a: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { l: "Italic", i: Italic, a: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { l: "Bulleted list", i: List, a: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { l: "Numbered list", i: ListOrdered, a: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { l: "Quotation", i: Quote, a: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
  ];
  const applyLink = () => {
    if (/^https:\/\//.test(url)) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkOpen(false);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-t border border-b-0 border-line bg-cream p-2" role="toolbar" aria-label="Formatting">
        {tools.map(({ l, i: Icon, a, run }) => <button key={l} type="button" aria-label={l} title={l} aria-pressed={a} onClick={run} className={btn(a)}><Icon className="size-4" /></button>)}
        <button type="button" aria-label="Link" title="Link" aria-pressed={editor.isActive("link")} onClick={() => setLinkOpen((v) => !v)} className={btn(editor.isActive("link"))}><LinkIcon className="size-4" /></button>
      </div>
      {linkOpen && (
        <div className="flex flex-wrap items-center gap-2 border border-b-0 border-line bg-white p-2">
          <label htmlFor="link-url" className="text-sm">Link address</label>
          <input id="link-url" value={url} onChange={(e) => setUrl(e.target.value)} className="min-w-0 flex-1 rounded border border-line px-2 py-1 text-sm" />
          <button type="button" onClick={applyLink} className="rounded bg-forest px-3 py-1 text-sm text-cream">Apply</button>
          <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }} className="rounded border border-line px-3 py-1 text-sm">Remove</button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
