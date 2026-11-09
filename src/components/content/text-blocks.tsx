export function TextBlocks({ data, fields }: { data: Record<string, unknown> | null; fields: [string, string][] }) {
  if (!data) return null;
  return (
    <>
      {fields.map(([key, label]) => {
        const v = data[key];
        if (typeof v === "string" && v.trim()) {
          return (
            <section key={key} className="max-w-3xl">
              <h2 className="text-2xl">{label}</h2>
              <p className="mt-3 whitespace-pre-line text-lg leading-8">{v}</p>
            </section>
          );
        }
        if (Array.isArray(v) && v.length && v.every((i) => typeof i === "string")) {
          return (
            <section key={key} className="max-w-3xl">
              <h2 className="text-2xl">{label}</h2>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-lg">{(v as string[]).map((i) => <li key={i}>{i}</li>)}</ul>
            </section>
          );
        }
        return null;
      })}
    </>
  );
}
