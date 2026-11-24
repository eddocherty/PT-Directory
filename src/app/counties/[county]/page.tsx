import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Arrow";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LinkList } from "@/components/LinkList";
import { COUNTIES, allTownStats, countyBySlug, liveTopics } from "@/lib/stats";

type Props = { params: Promise<{ county: string }> };

export const revalidate = 21600;

export function generateStaticParams() {
  return COUNTIES.map((c) => ({ county: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const county = countyBySlug((await params).county);
  if (!county) return {};
  const stats = await allTownStats();
  const towns = county.towns.map((t) => t.name);
  const listed = county.towns.some((t) => (stats[t.slug]?.total ?? 0) > 0);
  return {
    title: `Personal trainers in ${county.name}`,
    description: `Independent personal trainers across ${county.name}: ${towns.slice(0, 6).join(", ")}${towns.length > 6 ? " and more" : ""}. Pick a town to compare trainers near you.`,
    alternates: { canonical: `/counties/${county.slug}` },
    robots: listed ? undefined : { index: false, follow: true },
  };
}

export default async function CountyPage({ params }: Props) {
  const county = countyBySlug((await params).county);
  if (!county) notFound();
  const stats = await allTownStats();
  const towns = [...county.towns].sort((a, b) => (stats[b.slug]?.total ?? 0) - (stats[a.slug]?.total ?? 0) || a.name.localeCompare(b.name));
  const neighbours = COUNTIES.filter((c) => c.nation === county.nation && c.slug !== county.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Locations", href: "/locations" }, { name: county.name, href: `/counties/${county.slug}` }]} />
      <h1 className="display mt-5 text-4xl sm:text-6xl">Personal trainers in {county.name}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        {county.towns.length === 1 ? `We cover ${county.towns[0].name} in ${county.name}.` : `We cover ${county.towns.length} towns and cities in ${county.name}.`} Each town page lists independent trainers within 25 miles, nearest first.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {towns.map((t) => {
          const s = stats[t.slug];
          const top = s ? liveTopics(s).slice(0, 3) : [];
          return (
            <div key={t.slug} className="flex flex-col rounded-2xl border border-line p-5">
              <Link href={`/locations/${t.slug}`} className="group flex items-baseline justify-between gap-3">
                <span className="display text-2xl group-hover:text-accent">{t.name}</span>
                <Arrow className="h-4 w-4 text-muted group-hover:text-accent" />
              </Link>
              <p className="mt-1 text-sm text-muted">{s?.total ? `${s.total} trainers within 25 miles` : "No trainers listed yet"}</p>
              {top.length > 0 && (
                <ul className="mt-4 flex flex-col gap-1 text-sm">
                  {top.map((x) => (
                    <li key={x.topic.slug}>
                      <Link href={`/locations/${t.slug}/${x.topic.slug}`} className="hover:text-accent hover:underline">{x.topic.people}</Link>
                      <span className="text-muted"> ({x.count})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <LinkList className="mt-14" title={`Other counties in ${county.nation}`} items={neighbours.map((c) => ({ href: `/counties/${c.slug}`, label: c.name }))} />
    </div>
  );
}
