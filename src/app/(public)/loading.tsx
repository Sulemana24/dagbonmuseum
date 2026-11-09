export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-5 py-16" role="status" aria-label="Loading">
      <div className="h-10 w-2/3 rounded bg-line" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] rounded bg-line" />)}</div>
    </div>
  );
}
