export function PageHero({ title, intro }: { title: string; intro?: string }) {
  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <h1 className="max-w-3xl text-4xl md:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>}
      </div>
    </section>
  );
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-5 py-12 ${className}`}>{children}</div>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded border border-dashed border-line bg-white px-6 py-14 text-center">
      <p className="font-serif text-xl text-forest">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{text}</p>
    </div>
  );
}
