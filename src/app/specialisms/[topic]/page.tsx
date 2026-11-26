import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, itemList } from "@/components/JsonLd";
import { LinkList, LinkSections } from "@/components/LinkList";
import { SearchLayout } from "@/components/SearchLayout";
import { parseFilters, type RawParams } from "@/lib/filters";
import { abs } from "@/lib/site";
import { allTownStats, ukCounts } from "@/lib/stats";
import { CITIES } from "@/lib/taxonomy";
import { MIN_TRAINERS, TOPICS, TOPIC_INTROS, lowerFirst, topicBySlug, topicParam } from "@/lib/topics";
import { cachedSearch } from "@/lib/trainers";
import { GUIDES } from "@/lib/guides";

type Props = { params: Promise<{ topic: string }>; searchParams: Promise<RawParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const topic = topicBySlug((await params).topic);
  if (!topic) return {};
  const [sp, uk] = await Promise.all([searchParams, ukCounts()]);
  // A UK page with fewer than three trainers would be thin, so it stays out of Google until the specialism fills up.
  const thin = (uk.topics[topic.slug] ?? 0) < MIN_TRAINERS;
  return {
    title: `${topic.people} across the UK`,
    description: TOPIC_INTROS[topic.slug]?.split(". ").slice(0, 2).join(". ").replace(/\.?$/, ".") ?? `Find independent ${lowerFirst(topic.people)} near you. Browse by town, compare specialisms, then contact trainers directly.`,
    alternates: { canonical: `/specialisms/${topic.slug}` },
    robots: Object.keys(sp).length || thin ? { index: false, follow: true } : undefined,
  };
}

export default async function SpecialismPage({ params, searchParams }: Props) {
  const topic = topicBySlug((await params).topic);
  if (!topic) notFound();
  const sp = await searchParams;
  const [key, value] = topicParam(topic);
  const forced: RawParams = { ...sp, [key]: value };
  const f = parseFilters(forced);
  const [{ trainers, total }, stats] = await Promise.all([cachedSearch(f), allTownStats()]);
  const towns = CITIES.map((c) => ({ c, n: stats[c.slug]?.topics[topic.slug] ?? 0 }))
    .filter((x) => x.n >= MIN_TRAINERS)
    .sort((a, b) => a.c.name.localeCompare(b.c.name));

  return (
    <>
      <SearchLayout
        crumbs={[{ name: "Specialisms", href: "/specialisms" }, { name: topic.name, href: `/specialisms/${topic.slug}` }]}
        title={`${topic.people} across the UK`}
        subtitle={`${total} independent trainers list ${topic.name.toLowerCase()} as a specialism.`}
        intro={TOPIC_INTROS[topic.slug] && <p>{TOPIC_INTROS[topic.slug]}</p>}
        aboutTitle={`About ${!/[A-Z]/.test(topic.name.slice(1)) && topic.name !== "Pilates" ? topic.name.toLowerCase() : topic.name}`}
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
              title="Before you book"
              items={GUIDES.filter((g) => g.related.some((r) => r.href === `/specialisms/${topic.slug}`) || g.slug.startsWith("how-to-check") || g.slug.startsWith("questions"))
                .map((g) => ({ href: `/guides/${g.slug}`, label: g.title }))}
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
