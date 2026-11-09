"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { MediaItem } from "@/lib/services/media-admin";

export function MediaPicker({ kind, onPick, onClose }: { kind: "image" | "document"; onPick: (m: MediaItem) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { ref.current?.showModal(); }, []);
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/media?kind=${kind}&q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error();
        setItems((await res.json()).items); setError("");
      } catch { setError("Could not load the media library."); }
    }, 250);
    return () => clearTimeout(t);
  }, [q, kind]);

  return (
    <dialog ref={ref} onClose={onClose} aria-label="Media library" className="m-auto h-[80vh] w-[min(94vw,52rem)] rounded border border-line bg-white p-5 backdrop:bg-black/50">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl">Choose from the media library</h2>
        <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="grid size-9 place-items-center rounded hover:bg-line"><X className="size-5" /></button>
      </div>
      <label htmlFor="mp-q" className="sr-only">Search files</label>
      <input id="mp-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or description" className="mt-3 w-full rounded border border-line px-3 py-2" />
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {items === null && !error && <p className="mt-4 text-sm text-muted">Loading...</p>}
      {items?.length === 0 && <p className="mt-4 text-sm text-muted">No files found. Upload files in the Media Library first.</p>}
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items?.map((m) => (
          <li key={m.id}>
            <button type="button" onClick={() => { onPick(m); ref.current?.close(); }} className="block w-full rounded border border-line p-2 text-left hover:border-gold">
              <span className="relative block aspect-square overflow-hidden rounded bg-line">
                {m.kind === "image" ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.url} alt="" className="size-full object-cover" /> : <span className="grid size-full place-items-center text-xs">PDF</span>}
              </span>
              <span className="mt-1 block truncate text-xs">{m.title || m.filename}</span>
            </button>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
