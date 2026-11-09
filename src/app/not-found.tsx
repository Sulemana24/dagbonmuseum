import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-4xl">Page not found</h1>
      <p className="mt-4 text-muted">This page does not exist yet, or it has moved.</p>
      <Link href="/" className="mt-8 inline-block rounded bg-forest px-6 py-3 text-cream hover:bg-forest-deep">
        Back to home
      </Link>
    </div>
  );
}
