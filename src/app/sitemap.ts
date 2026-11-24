import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { abs } from "@/lib/site";
import { AREAS } from "@/lib/areas";
import { GUIDES } from "@/lib/guides";
import { COUNTIES, allAreaStats, allTownStats, areaIndexable, areaKey, liveTopics, townIndexable, townTopicIndexable } from "@/lib/stats";
import { CITIES } from "@/lib/taxonomy";
import { TOPICS } from "@/lib/topics";
import { publishedTrainerSlugs } from "@/lib/trainers";

export const revalidate = 21600;

/** Every page worth indexing. Towns with no trainers and specialism pages under three trainers are left out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stats, areaStats, trainers] = await Promise.all([
    allTownStats(),
    allAreaStats(),
    publishedTrainerSlugs().catch((e) => {
      console.error("sitemap trainers", e);
      return [];
    }),
  ]);
  const page = (path: string, priority: number, lastModified?: string | null): MetadataRoute.Sitemap[number] => ({
    url: abs(path),
    priority,
    ...(lastModified ? { lastModified } : {}),
  });

  return [
    page("/", 1),
    page("/trainers", 0.8),
    page("/online", 0.8),
    page("/locations", 0.8),
    page("/specialisms", 0.7),
    ...TOPICS.map((t) => page(`/specialisms/${t.slug}`, 0.7)),
    ...COUNTIES.filter((c) => c.towns.some((t) => townIndexable(stats[t.slug]))).map((c) => page(`/counties/${c.slug}`, 0.6)),
    ...CITIES.filter((c) => townIndexable(stats[c.slug])).flatMap((c) => [
      page(`/locations/${c.slug}`, 0.9),
      ...liveTopics(stats[c.slug])
        .filter((x) => townTopicIndexable(stats[c.slug], x.topic.slug))
        .map((x) => page(`/locations/${c.slug}/${x.topic.slug}`, 0.7)),
    ]),
    ...AREAS.filter((a) => areaIndexable(areaStats[areaKey(a)])).map((a) => page(`/locations/${a.city}/${a.slug}`, 0.7)),
    ...trainers.map((t) => page(`/trainers/${t.slug}`, 0.5, t.updated_at)),
    page("/guides", 0.6),
    ...GUIDES.map((g) => page(`/guides/${g.slug}`, 0.6, g.updated)),
    page("/shop", 0.6),
    ...PRODUCTS.map((p) => page(`/shop/${p.slug}`, 0.5)),
    page("/privacy", 0.1),
    page("/shop/terms", 0.1),
  ];
}
