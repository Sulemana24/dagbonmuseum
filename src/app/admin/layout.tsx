export const metadata = { title: { default: "Admin", template: "%s | Museum Admin" }, robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
