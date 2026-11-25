import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/Arrow";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Free fitness tools",
  description: "Quick, free tools: find the kind of training that suits you, work out how many sessions with a trainer you need, and plan your half marathon training.",
  alternates: { canonical: "/tools" },
};


export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Tools", href: "/tools" }]} className="mb-6" />
      <h1 className="display text-4xl sm:text-6xl">Free tools</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Quick answers before you spend a penny.</p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="group flex items-center justify-between gap-6 py-6">
              <div>
                <p className="display text-2xl group-hover:text-accent sm:text-3xl">{t.title}</p>
                <p className="mt-2 max-w-xl text-muted">{t.text}</p>
              </div>
              <span className="flex shrink-0 items-center gap-3 text-sm font-semibold text-muted"><span className="hidden sm:inline">{t.time}</span><Arrow className="h-5 w-5 text-ink transition group-hover:translate-x-1" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
