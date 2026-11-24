import { unstable_cache } from "next/cache";
import { CITIES, type City } from "./taxonomy";
import { TOPICS, MIN_TRAINERS, TOWN_RADIUS, type Topic } from "./topics";
import { searchTrainers } from "./trainers";
import { milesBetween } from "./geocode";

/** Real numbers for one town, used for page copy, links and deciding which pages exist. */
export type TownStats = {
  slug: string;
  total: number;
  online: number;
  homeVisits: number;
  /** Trainers per specialism slug within the town radius. */
  topics: Record<string, number>;
};

const DAY = 60 * 60 * 24;

async function computeTown(city: City): Promise<TownStats> {
  const { trainers } = await searchTrainers({ lat: city.lat, lng: city.lng, radius: TOWN_RADIUS }, 2000);
  const topics: Record<string, number> = {};
  for (const t of trainers) for (const s of [...t.styles, ...t.goals]) topics[s] = (topics[s] ?? 0) + 1;
  return {
    slug: city.slug,
    total: trainers.length,
    online: trainers.filter((t) => t.online).length,
    homeVisits: trainers.filter((t) => t.home_visits).length,
    topics,
  };
}

const empty = (slug: string): TownStats => ({ slug, total: 0, online: 0, homeVisits: 0, topics: {} });

/** Stats for every town. Cached for six hours so the sitemap and hub pages don't hit the database each time. */
export const allTownStats = unstable_cache(
  async (): Promise<Record<string, TownStats>> => {
    const out: Record<string, TownStats> = {};
    for (let i = 0; i < CITIES.length; i += 8) {
      const batch = CITIES.slice(i, i + 8);
      const done = await Promise.all(
        batch.map((c) =>
          computeTown(c).catch((e) => {
            console.error("town stats", c.slug, e);
            return empty(c.slug);
          }),
        ),
      );
      for (const s of done) out[s.slug] = s;
    }
    return out;
  },
  ["all-town-stats-v1"],
  { revalidate: DAY / 4 },
);

export async function townStats(slug: string): Promise<TownStats> {
  return (await allTownStats())[slug] ?? empty(slug);
}

/** Specialisms in a town with enough trainers for their own page, biggest first. */
export function liveTopics(s: TownStats): { topic: Topic; count: number }[] {
  return TOPICS.map((topic) => ({ topic, count: s.topics[topic.slug] ?? 0 }))
    .filter((x) => x.count >= MIN_TRAINERS)
    .sort((a, b) => b.count - a.count || a.topic.name.localeCompare(b.topic.name));
}

/** Other towns closest to this one that have trainers listed. */
export function nearbyTowns(city: City, stats: Record<string, TownStats>, n = 6, topic?: string): City[] {
  return CITIES.filter((c) => c.slug !== city.slug)
    .filter((c) => (topic ? (stats[c.slug]?.topics[topic] ?? 0) >= MIN_TRAINERS : (stats[c.slug]?.total ?? 0) > 0))
    .map((c) => ({ c, d: milesBetween(city, c) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.c);
}

export const countySlug = (county: string) =>
  county.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const COUNTIES = [...new Set(CITIES.map((c) => c.county))]
  .sort()
  .map((name) => ({ name, slug: countySlug(name), towns: CITIES.filter((c) => c.county === name), nation: CITIES.find((c) => c.county === name)!.nation }));

export const countyBySlug = (slug: string) => COUNTIES.find((c) => c.slug === slug);

/** The town a trainer's listing belongs to, matched on the town name they gave. */
export function townFor(city: string | null | undefined): City | undefined {
  if (!city) return undefined;
  const q = city.trim().toLowerCase();
  return CITIES.find((c) => c.name.toLowerCase() === q || c.slug === q || c.name.toLowerCase().startsWith(`${q} (`));
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** One or two plain sentences about a town, built only from what is listed. */
export function describeTown(name: string, s: TownStats): string {
  if (!s.total) return `We don’t list any independent trainers within ${TOWN_RADIUS} miles of ${name} yet. Online coaches can work with you from anywhere in the UK.`;
  const top = liveTopics(s).slice(0, 3).map((x) => `${x.topic.name.toLowerCase()} (${x.count})`);
  const parts = [`${plural(s.total, "independent trainer is", "independent trainers are")} listed within ${TOWN_RADIUS} miles of ${name}.`];
  if (top.length) parts.push(`The most common specialisms are ${top.length > 1 ? `${top.slice(0, -1).join(", ")} and ${top.at(-1)}` : top[0]}.`);
  if (s.online) parts.push(`${s.online} also ${s.online === 1 ? "coaches" : "coach"} online.`);
  return parts.join(" ");
}

/** UK-wide trainer counts: overall, online, and per specialism. Cached for six hours. */
export const ukCounts = unstable_cache(
  async (): Promise<{ total: number; online: number; topics: Record<string, number> }> => {
    const count = (f: Parameters<typeof searchTrainers>[0]) => searchTrainers(f, 1).then((r) => r.total).catch(() => 0);
    const [total, online, ...each] = await Promise.all([
      count({}),
      count({ online: true }),
      ...TOPICS.map((t) => count(t.kind === "style" ? { styles: [t.slug] } : { goals: [t.slug] })),
    ]);
    return { total, online, topics: Object.fromEntries(TOPICS.map((t, i) => [t.slug, each[i]])) };
  },
  ["uk-counts-v1"],
  { revalidate: DAY / 4 },
);
