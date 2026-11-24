import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, itemList } from "@/components/JsonLd";
import { LinkList, LinkSections } from "@/components/LinkList";
import { SearchLayout } from "@/components/SearchLayout";
import { parseFilters, type RawParams } from "@/lib/filters";
import { abs } from "@/lib/site";
import { allTownStats, countySlug, liveTopics, nearbyTowns } from "@/lib/stats";
import { CITIES } from "@/lib/taxonomy";
import { MIN_TRAINERS, TOWN_RADIUS, lowerFirst, topicBySlug } from "@/lib/topics";
import { searchTrainers } from "@/lib/trainers";

type Props = { params: Promise<{ city: string; topic: string }>; searchParams: Promise<RawParams> };

async function load(citySlug: string, topicSlug: string) {
  const city = CITIES.find((c) => c.slug === citySlug);
  const topic = topicBySlug(topicSlug);
  if (!city || !topic) return null;
  const stats = await allTownStats();
  const count = stats[city.slug]?.topics[topic.slug] ?? 0;
  // Only towns with enough real trainers get a page for a specialism.
  if (count < MIN_TRAINERS) return null;
  return { city, topic, stats, count };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, topic } = await params;
  const d = await load(city, topic);
  if (!d) return {};
  return {
    title: `${d.count} ${lowerFirst(d.topic.people)} in ${d.city.name}`,
    description: `${d.count} independent trainers within ${TOWN_RADIUS} miles of ${d.city.name} list ${d.topic.name.toLowerCase()} as a specialism. Compare them and get in touch directly.`,
    alternates: { canonical: `/locations/${d.city.slug}/${d.topic.slug}` },
  };
}

export default async function TownTopicPage({ params, searchParams }: Props) {
  const p = await params;
  const d = await load(p.city, p.topic);
  if (!d) notFound();
  const { city, topic, stats, count } = d;
  const sp = await searchParams;
  // The specialism is fixed by the URL. Filters and paging carry on from the town page.
  const forced: RawParams = { ...sp, [topic.kind]: topic.slug };
  const f = parseFilters(forced);
  const { trainers, total } = await searchTrainers({ ...f, lat: city.lat, lng: city.lng });
  const others = liveTopics(stats[city.slug]).filter((x) => x.topic.slug !== topic.slug);
  const nearby = nearbyTowns(city, stats, 6, topic.slug);
  const online = trainers.filter((t) => t.online).length;

  return (
    <>
      <SearchLayout
        crumbs={[
          { name: city.county, href: `/counties/${countySlug(city.county)}` },
          { name: city.name, href: `/locations/${city.slug}` },
          { name: topic.name, href: `/locations/${city.slug}/${topic.slug}` },
        ]}
        title={`${topic.people} in ${city.name}`}
        subtitle={`${count} independent trainers within ${TOWN_RADIUS} miles of ${city.name} list ${topic.name.toLowerCase()} as a specialism${online ? `, and ${online} of those on this page also coach online` : ""}. Nearest first.`}
        filters={f}
        action={`/locations/${city.slug}`}
        hideLocation
        trainers={trainers}
        total={total}
        params={forced}
        origin={city.name}
        footer={
          <LinkSections>
            <LinkList
              title={`${topic.name} in nearby towns`}
              items={nearby.map((c) => ({ href: `/locations/${c.slug}/${topic.slug}`, label: c.name, count: stats[c.slug]?.topics[topic.slug] }))}
            />
            <LinkList
              title={`More specialisms in ${city.name}`}
              items={others.map((x) => ({ href: `/locations/${city.slug}/${x.topic.slug}`, label: x.topic.people, count: x.count }))}
            />
            <LinkList title="Across the UK" items={[{ href: `/specialisms/${topic.slug}`, label: `${topic.people} in every town` }]} />
          </LinkSections>
        }
      />
      <JsonLd data={itemList(trainers.map((t) => ({ url: abs(`/trainers/${t.slug}`), name: t.name })))} />
    </>
  );
}
