"use client";

import { Archive, FileText, GraduationCap, Image as ImageIcon, Landmark, LayoutDashboard, LayoutTemplate, Mail, Menu, ScrollText, Settings, ShieldCheck, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ICONS = { overview: LayoutDashboard, articles: FileText, exhibitions: Landmark, collections: Archive, resources: GraduationCap, media: ImageIcon, pages: LayoutTemplate, inquiries: Mail, subscribers: Users, users: ShieldCheck, settings: Settings, logs: ScrollText } as const;
export interface NavItem { label: string; href: string; icon: keyof typeof ICONS }

function List({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <ul className="space-y-1">
      {items.map((i) => {
        const Icon = ICONS[i.icon];
        const active = path === i.href || path.startsWith(`${i.href}/`);
        return (
          <li key={i.href}>
            <Link href={i.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
              className={cn("flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-line", active && "bg-forest text-cream hover:bg-forest")}>
              <Icon className="size-4" /> {i.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminSidebar({ items }: { items: NavItem[] }) {
  return <nav aria-label="Admin" className="hidden w-56 shrink-0 border-r border-line bg-white p-4 lg:block"><List items={items} /></nav>;
}

export function AdminMobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" aria-expanded={open} className="grid size-10 place-items-center rounded hover:bg-line"><Menu className="size-5" /></button>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <nav aria-label="Admin" className="relative h-full w-64 bg-white p-4">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close admin menu" className="mb-3 grid size-9 place-items-center rounded hover:bg-line"><X className="size-5" /></button>
            <List items={items} onNavigate={() => setOpen(false)} />
          </nav>
        </div>
      )}
    </div>
  );
}
