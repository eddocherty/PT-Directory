import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides to choosing a personal trainer",
  description: "Short, practical guides: checking a trainer is qualified, pre and postnatal training, online or in person, and what to ask before you book.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
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
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
