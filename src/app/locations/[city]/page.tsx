import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, itemList } from "@/components/JsonLd";
import { LinkList, LinkSections } from "@/components/LinkList";
import { SearchLayout } from "@/components/SearchLayout";
import { parseFilters, type RawParams } from "@/lib/filters";
import { abs } from "@/lib/site";
import { areasIn } from "@/lib/areas";
import { allAreaStats, allTownStats, areaKey, countySlug, describeTown, liveTopics, nearbyTowns, townIndexable } from "@/lib/stats";
import { CITIES } from "@/lib/taxonomy";
import { cachedSearch } from "@/lib/trainers";

type Props = { params: Promise<{ city: string }>; searchParams: Promise<RawParams> };

const hasFilters = (sp: RawParams) => Object.values(sp).some((v) => (Array.isArray(v) ? v.length : v));

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return {};
  const s = (await allTownStats())[slug];
  const n = s?.total ?? 0;
  const top = s ? liveTopics(s).slice(0, 3).map((x) => x.topic.name.toLowerCase()) : [];
  return {
    title: n >= 3 ? `${n} personal trainers in ${city.name}` : `Personal trainers in ${city.name}`,
    description: n
      ? `Compare ${n} independent personal trainers near ${city.name}, ${city.county}${top.length ? `, including ${top.join(", ")}` : ""}. See specialisms and reviews, then contact them directly.`
      : `Independent personal trainers near ${city.name}, ${city.county}, plus UK online coaches.`,
    alternates: { canonical: `/locations/${city.slug}` },
    // Filtered views and empty towns are for visitors, not for Google.
    robots: hasFilters(await searchParams) || !townIndexable(s) ? { index: false, follow: true } : undefined,
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { city: slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) notFound();
  const sp = await searchParams;
  const f = parseFilters(sp);
  const [{ trainers, total }, stats] = await Promise.all([
    cachedSearch({ ...f, lat: city.lat, lng: city.lng }),
    allTownStats(),
  ]);
  const s = stats[city.slug];
  const topics = s ? liveTopics(s) : [];
  const nearby = nearbyTowns(city, stats);
  const cityAreas = areasIn(city.slug);
  const areaStats = cityAreas.length ? await allAreaStats() : {};
  const areas = cityAreas.filter((x) => (areaStats[areaKey(x)]?.total ?? 0) > 0);

  return (
    <>
      <SearchLayout
        crumbs={[
          { name: city.county, href: `/counties/${countySlug(city.county)}` },
          { name: city.name, href: `/locations/${city.slug}` },
        ]}
        title={`Personal trainers in ${city.name}`}
        subtitle={s && !hasFilters(sp) ? describeTown(city.name, s) : `Independent trainers within ${f.radius} miles of ${city.name}, nearest first.`}
        filters={f}
        action={`/locations/${city.slug}`}
        hideLocation
        trainers={trainers}
        total={total}
        params={sp}
        origin={city.name}
        footer={
          <LinkSections>
            {areas.length > 0 && (
              <LinkList
                title={`Areas of ${city.name}`}
                items={areas.map((x) => ({ href: `/locations/${city.slug}/${x.slug}`, label: x.name, count: areaStats[areaKey(x)]?.total }))}
              />
            )}
            <LinkList
              title={`Specialisms in ${city.name}`}
              items={topics.map((x) => ({ href: `/locations/${city.slug}/${x.topic.slug}`, label: x.topic.people, count: x.count }))}
            />
            <LinkList
              title={`Towns near ${city.name}`}
              items={nearby.map((c) => ({ href: `/locations/${c.slug}`, label: c.name, count: stats[c.slug]?.total }))}
            />
          </LinkSections>
        }
      />
      <JsonLd data={itemList(trainers.map((t) => ({ url: abs(`/trainers/${t.slug}`), name: t.name })))} />
    </>
  );
}
