import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso?: string) {
  if (!iso) return undefined;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(iso));
}
