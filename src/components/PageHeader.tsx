export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {eyebrow && <p className="eyebrow text-paper/50">{eyebrow}</p>}
        <h1 className="display mt-2 text-4xl sm:text-5xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-paper/75">{children}</div>}
      </div>
    </section>
  );
}
