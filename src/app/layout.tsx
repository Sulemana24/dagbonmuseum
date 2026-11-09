import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { getSiteSettings } from "@/lib/services/content";
import { siteConfig } from "@/lib/site-config";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: s.name, template: `%s | ${s.name}` },
    description: s.seoDescription ?? s.description,
    icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined,
    openGraph: { siteName: s.name, type: "website", images: s.ogImageUrl ? [s.ogImageUrl] : undefined },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">{children}<Toaster richColors position="top-center" /></body>
    </html>
  );
}
