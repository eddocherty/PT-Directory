import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GUIDES, readingMinutes } from "@/lib/guides";
import { TOOLS } from "@/lib/tools";
import { FactStrip } from "@/components/Facts";
import { buildFacts } from "@/lib/facts";
import { allTownStats, ukCounts } from "@/lib/stats";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Guides to choosing a personal trainer",
  description: "Short, practical guides: checking a trainer is qualified, pre and postnatal training, online or in person, and what to ask before you book.",
  alternates: { canonical: "/guides" },
};

export default async function GuidesPage() {
  const [uk, stats] = await Promise.all([ukCounts(), allTownStats()]);
  return (
    <>
      <section className="border-b border-line bg-soft text-ink">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
          <Breadcrumbs items={[{ name: "Guides", href: "/guides" }]} className="mb-4" />
          <h1 className="display text-3xl sm:text-5xl">Choosing a trainer</h1>
          <p className="mt-3 max-w-2xl text-muted">The things worth knowing before you pay anyone to train you.</p>
        </div>
      </section>
      <ul className="mx-auto max-w-4xl divide-y divide-line px-4 py-6">
        {GUIDES.map((g) => (
          <li key={g.slug} className="py-5">
            <Link href={`/guides/${g.slug}`} className="group block">
              <h2 className="text-xl font-semibold group-hover:text-accent group-hover:underline">{g.title}</h2>
              <p className="mt-1 text-muted">{g.summary}</p>
              <p className="mt-1 text-xs font-semibold text-accent">{readingMinutes(g)} min read</p>
            </Link>
          </li>
        ))}
      </ul>
      <section className="mx-auto max-w-4xl px-4 pb-12">
        <div className="bg-soft p-6 sm:p-8">
          <p className="display text-2xl">Prefer a quick answer?</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {TOOLS.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="block h-full bg-paper p-4 hover:ring-2 hover:ring-ink">
                  <span className="font-semibold">{t.title}</span>
                  <span className="mt-1 block text-xs text-muted">{t.time}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FactStrip facts={buildFacts(uk, stats)} salt={1} />
    </>
  );
}
