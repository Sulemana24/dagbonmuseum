"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { X } from "lucide-react";
import type { ImageRef } from "@/types/content";

export function ImageViewer({ images }: { images: ImageRef[] }) {
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  if (!images.length) return null;
  const current = images[active];

  return (
    <div>
      <button type="button" onClick={() => dialog.current?.showModal()} aria-label={`Enlarge image: ${current.alt}`}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded border border-line bg-line">
        <Image src={current.url} alt={current.alt} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
      </button>
      {images.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <li key={img.url}>
              <button type="button" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}: ${img.alt}`} aria-current={i === active}
                className={`relative block size-16 overflow-hidden rounded border-2 ${i === active ? "border-gold" : "border-line"}`}>
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {(current.caption || current.credit) && (
        <p className="mt-2 text-sm text-muted">{current.caption} {current.credit && <span>Credit: {current.credit}</span>}</p>
      )}
      <dialog ref={dialog} aria-label="Enlarged image" onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[92vh] max-w-[92vw] rounded bg-white p-3 backdrop:bg-black/70">
        <button type="button" onClick={() => dialog.current?.close()} aria-label="Close enlarged image"
          className="mb-2 ml-auto grid size-9 place-items-center rounded hover:bg-line"><X className="size-5" /></button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.alt} className="max-h-[78vh] max-w-full object-contain" />
      </dialog>
    </div>
  );
}
