import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, itemList } from "@/components/JsonLd";
import { LinkList, LinkSections } from "@/components/LinkList";
import { SearchLayout } from "@/components/SearchLayout";
import { parseFilters, type RawParams } from "@/lib/filters";
import { abs } from "@/lib/site";
import { allTownStats } from "@/lib/stats";
import { CITIES } from "@/lib/taxonomy";
import { MIN_TRAINERS, TOPICS, lowerFirst, topicBySlug } from "@/lib/topics";
import { searchTrainers } from "@/lib/trainers";

type Props = { params: Promise<{ topic: string }>; searchParams: Promise<RawParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const topic = topicBySlug((await params).topic);
  if (!topic) return {};
  const sp = await searchParams;
  return {
    title: `${topic.people} across the UK`,
    description: `Find independent ${lowerFirst(topic.people)} near you. Browse by town, compare specialisms and reviews, then contact trainers directly.`,
    alternates: { canonical: `/specialisms/${topic.slug}` },
    robots: Object.keys(sp).length ? { index: false, follow: true } : undefined,
  };
}

export default async function SpecialismPage({ params, searchParams }: Props) {
  const topic = topicBySlug((await params).topic);
  if (!topic) notFound();
  const sp = await searchParams;
  const forced: RawParams = { ...sp, [topic.kind]: topic.slug };
  const f = parseFilters(forced);
  const [{ trainers, total }, stats] = await Promise.all([searchTrainers(f), allTownStats()]);
  const towns = CITIES.map((c) => ({ c, n: stats[c.slug]?.topics[topic.slug] ?? 0 }))
    .filter((x) => x.n >= MIN_TRAINERS)
    .sort((a, b) => a.c.name.localeCompare(b.c.name));

  return (
    <>
      <SearchLayout
        crumbs={[{ name: "Specialisms", href: "/specialisms" }, { name: topic.name, href: `/specialisms/${topic.slug}` }]}
        title={`${topic.people} across the UK`}
        subtitle={`${total} independent trainers list ${topic.name.toLowerCase()} as a specialism. Add your postcode to see who is closest.`}
        filters={f}
        action="/trainers"
        trainers={trainers}
        total={total}
        params={forced}
        footer={
          <LinkSections>
            <LinkList
              title={`${topic.name} by town`}
              items={towns.map((x) => ({ href: `/locations/${x.c.slug}/${topic.slug}`, label: x.c.name, count: x.n }))}
            />
            <LinkList
              title="Other specialisms"
              items={TOPICS.filter((t) => t.slug !== topic.slug).map((t) => ({ href: `/specialisms/${t.slug}`, label: t.people }))}
            />
          </LinkSections>
        }
      />
      <JsonLd data={itemList(trainers.map((t) => ({ url: abs(`/trainers/${t.slug}`), name: t.name })))} />
    </>
  );
}
