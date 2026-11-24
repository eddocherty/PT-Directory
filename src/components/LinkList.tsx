import Link from "next/link";

export type LinkItem = { href: string; label: string; count?: number };

/** A titled group of plain text links, used for "nearby towns" and "more in this town". */
export function LinkList({ title, items, className = "" }: { title: string; items: LinkItem[]; className?: string }) {
  if (!items.length) return null;
  return (
    <div className={className}>
      <h2 className="display text-2xl">{title}</h2>
      <ul className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 text-sm font-medium hover:border-accent hover:text-accent">
              <span>{l.label}</span>
              {l.count != null && <span className="tabular-nums text-muted">{l.count}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LinkSections({ children }: { children: React.ReactNode }) {
  return (
    <section className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-14">{children}</div>
    </section>
  );
}
