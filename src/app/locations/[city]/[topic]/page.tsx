import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, itemList } from "@/components/JsonLd";
import { LinkList, LinkSections } from "@/components/LinkList";
import { SearchLayout } from "@/components/SearchLayout";
import { parseFilters, type RawParams } from "@/lib/filters";
import { abs } from "@/lib/site";
import { AREA_RADIUS, areaBy, areasIn, type Area } from "@/lib/areas";
import { allAreaStats, allTownStats, areaIndexable, areaKey, countySlug, liveTopics, nearbyTowns, townTopicIndexable, type AreaStats } from "@/lib/stats";
import type { City } from "@/lib/taxonomy";
import { CITIES } from "@/lib/taxonomy";
import { MIN_TRAINERS, TOWN_RADIUS, lowerFirst, topicBySlug, topicParam } from "@/lib/topics";
import { cachedSearch } from "@/lib/trainers";

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

/** A neighbourhood inside a big city (Clapham, Didsbury, Edgbaston) shares this route with specialisms. Slugs never overlap. */
async function loadArea(citySlug: string, slug: string) {
  const city = CITIES.find((c) => c.slug === citySlug);
  const area = areaBy(citySlug, slug);
  if (!city || !area) return null;
  const stats = await allAreaStats();
  const s = stats[areaKey(area)];
  if (!s?.total) return null;
  return { city, area, s, stats };
}

function describeArea(area: Area, city: City, s: AreaStats) {
  const top = Object.entries(s.topics)
    .map(([slug, n]) => ({ t: topicBySlug(slug), n }))
    .filter((x) => x.t && x.n >= MIN_TRAINERS)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
    .map((x) => `${x.t!.name.toLowerCase()} (${x.n})`);
  const parts = [`${s.total} independent ${s.total === 1 ? "trainer is" : "trainers are"} listed within ${AREA_RADIUS} miles of ${area.name}.`];
  if (top.length) parts.push(`Most common specialisms nearby: ${top.join(", ")}.`);
  if (s.online) parts.push(`${s.online} also coach online.`);
  parts.push(`For the whole of ${city.name}, see every trainer within ${TOWN_RADIUS} miles.`);
  return parts.join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, topic } = await params;
  const a = await loadArea(city, topic);
  if (a)
    return {
      title: `Personal trainers in ${a.area.name}, ${a.city.name}`,
      description: `${a.s.total} independent personal trainers and coaches within ${AREA_RADIUS} miles of ${a.area.name}. Compare specialisms, then contact them directly.`,
      alternates: { canonical: `/locations/${a.city.slug}/${a.area.slug}` },
      robots: areaIndexable(a.s) ? undefined : { index: false, follow: true },
    };
  const d = await load(city, topic);
  if (!d) return {};
  return {
    title: `${d.count} ${lowerFirst(d.topic.people)} in ${d.city.name}`,
    description: `${d.count} independent trainers within ${TOWN_RADIUS} miles of ${d.city.name} ${d.topic.kind === "home" ? "will train you at home" : `list ${d.topic.name.toLowerCase()} as a specialism`}. Compare them and get in touch directly.`,
    alternates: { canonical: `/locations/${d.city.slug}/${d.topic.slug}` },
    // Shown to visitors, but only indexed when enough of these trainers are based in this town rather than a neighbour.
    robots: townTopicIndexable(d.stats[d.city.slug], d.topic.slug) ? undefined : { index: false, follow: true },
  };
}

export default async function TownTopicPage({ params, searchParams }: Props) {
  const p = await params;
  const a = await loadArea(p.city, p.topic);
  if (a) return <AreaPage {...a} sp={await searchParams} />;
  const d = await load(p.city, p.topic);
  if (!d) notFound();
  const { city, topic, stats, count } = d;
  const sp = await searchParams;
  // The specialism is fixed by the URL. Filters and paging carry on from the town page.
  const [key, value] = topicParam(topic);
  const forced: RawParams = { ...sp, [key]: value };
  const f = parseFilters(forced);
  const { trainers, total } = await cachedSearch({ ...f, lat: city.lat, lng: city.lng });
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
        subtitle={`${count} independent trainers within ${TOWN_RADIUS} miles of ${city.name} ${topic.kind === "home" ? "will come to your home, or train you in a local park" : `list ${topic.name.toLowerCase()} as a specialism`}${online ? `, and ${online} of those on this page also coach online` : ""}.`}
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

async function AreaPage({ city, area, s, stats, sp }: NonNullable<Awaited<ReturnType<typeof loadArea>>> & { sp: RawParams }) {
  const f = { ...parseFilters(sp), radius: sp.radius ? parseFilters(sp).radius : AREA_RADIUS };
  const { trainers, total } = await cachedSearch({ ...f, lat: area.lat, lng: area.lng });
  const others = areasIn(city.slug)
    .filter((x) => x.slug !== area.slug && (stats[areaKey(x)]?.total ?? 0) > 0)
    .map((x) => ({ x, d: Math.hypot(x.lat - area.lat, (x.lng - area.lng) * 0.62) }))
    .sort((p, q) => p.d - q.d)
    .slice(0, 10)
    .map(({ x }) => x);
  return (
    <>
      <SearchLayout
        crumbs={[
          { name: city.county, href: `/counties/${countySlug(city.county)}` },
          { name: city.name, href: `/locations/${city.slug}` },
          { name: area.name, href: `/locations/${city.slug}/${area.slug}` },
        ]}
        title={`Personal trainers in ${area.name}`}
        subtitle={describeArea(area, city, s)}
        filters={f}
        action={`/locations/${city.slug}/${area.slug}`}
        hideLocation
        trainers={trainers}
        total={total}
        params={sp}
        origin={area.name}
        footer={
          <LinkSections>
            <LinkList
              title={`Nearby in ${city.name}`}
              items={others.map((x) => ({ href: `/locations/${city.slug}/${x.slug}`, label: x.name, count: stats[areaKey(x)]?.total }))}
            />
            <LinkList title={`All of ${city.name}`} items={[{ href: `/locations/${city.slug}`, label: `Every trainer in ${city.name}` }]} />
          </LinkSections>
        }
      />
      <JsonLd data={itemList(trainers.map((t) => ({ url: abs(`/trainers/${t.slug}`), name: t.name })))} />
    </>
  );
}
