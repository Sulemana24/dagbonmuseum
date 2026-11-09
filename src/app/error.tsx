"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted">We could not load this page. Please try again.</p>
      <button onClick={reset} className="mt-8 rounded bg-forest px-6 py-3 text-cream hover:bg-forest-deep">Try again</button>
    </div>
  );
}
