import Image from "next/image";
import Link from "next/link";
import type { ImageRef } from "@/types/content";

interface Props { href: string; title: string; description?: string; image?: ImageRef; meta?: string; layout?: "grid" | "list" }

export function ContentCard({ href, title, description, image, meta, layout = "grid" }: Props) {
  const list = layout === "list";
  return (
    <article className={`group relative overflow-hidden rounded border border-line bg-white ${list ? "flex flex-col sm:flex-row" : ""}`}>
      <div className={`relative bg-line ${list ? "aspect-[4/3] sm:aspect-auto sm:w-56 sm:shrink-0" : "aspect-[4/3]"}`}>
        {image ? (
          <Image src={image.url} alt={image.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted">Image to be added</div>
        )}
      </div>
      <div className="p-5">
        {meta && <p className="text-sm text-muted">{meta}</p>}
        <h3 className="mt-1 text-xl leading-snug">
          <Link href={href} className="after:absolute after:inset-0 hover:underline">{title}</Link>
        </h3>
        {description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/80">{description}</p>}
      </div>
    </article>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
