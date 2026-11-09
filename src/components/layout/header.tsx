"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Header({ name, logo }: { name: string; logo?: { url: string; alt: string } }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const wrapRef = useRef<HTMLElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header ref={wrapRef} className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {logo ? <Image src={logo.url} alt={logo.alt || ""} width={36} height={36} className="size-9 object-contain" /> : <span aria-hidden className="grid size-9 place-items-center rounded-full bg-forest font-serif text-gold">{name.charAt(0)}</span>}
          <span className="font-serif text-lg leading-tight text-forest">{name === siteConfig.name ? siteConfig.shortName : name}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-5 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn("text-sm text-ink/80 hover:text-forest", isActive(item.href) && "border-b-2 border-gold text-forest")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/search" aria-label="Search the site" className="grid size-10 place-items-center rounded hover:bg-line">
            <Search className="size-5" />
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded hover:bg-line lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-cream lg:hidden">
          <ul className="mx-auto max-w-6xl px-5 py-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn("block border-b border-line py-3 text-ink", isActive(item.href) && "font-medium text-forest")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
