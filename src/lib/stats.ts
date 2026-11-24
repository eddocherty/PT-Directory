import { unstable_cache } from "next/cache";
import { CITIES, type City } from "./taxonomy";
import { TOPICS, MIN_TRAINERS, TOWN_RADIUS, type Topic } from "./topics";
import { searchTrainers } from "./trainers";
import { milesBetween } from "./geocode";
import { AREAS, AREA_RADIUS, type Area } from "./areas";

/** Real numbers for one town, used for page copy, links and deciding which pages exist. */
export type TownStats = {
  slug: string;
  /** Trainers within the town radius (what the town page lists). */
  total: number;
  /** Trainers whose nearest covered town is this one. Towns close together share most of their
   *  radius, so this decides which pages Google sees: a town without its own trainers would only repeat a neighbour. */
  own: number;
  /** Own trainers per specialism slug. */
  ownTopics: Record<string, number>;
  online: number;
  homeVisits: number;
  /** Trainers per specialism slug within the town radius. */
  topics: Record<string, number>;
};

const DAY = 60 * 60 * 24;

type Near = { id: string; distance: number; tags: string[]; online: boolean; home: boolean };

async function nearTown(city: City): Promise<Near[]> {
  const { trainers } = await searchTrainers({ lat: city.lat, lng: city.lng, radius: TOWN_RADIUS }, 2000);
  return trainers.map((t) => ({
    id: t.id,
    distance: t.distance_miles ?? TOWN_RADIUS,
    tags: [...t.styles, ...t.goals, ...(t.home_visits ? [HOME_VISITS] : [])],
    online: t.online,
    home: t.home_visits,
  }));
}

/** Pseudo-specialism for trainers who come to you, so home-visit pages share the specialism page logic. */
export const HOME_VISITS = "home-visits";

const empty = (slug: string): TownStats => ({ slug, total: 0, own: 0, ownTopics: {}, online: 0, homeVisits: 0, topics: {} });

function count(list: Near[]) {
  const topics: Record<string, number> = {};
  for (const t of list) for (const s of t.tags) topics[s] = (topics[s] ?? 0) + 1;
  return topics;
}

/** Stats for every town. Cached for six hours so the sitemap and hub pages don't hit the database each time. */
export const allTownStats = unstable_cache(
  async (): Promise<Record<string, TownStats>> => {
    const near: Record<string, Near[]> = {};
    for (let i = 0; i < CITIES.length; i += 8) {
      const batch = CITIES.slice(i, i + 8);
      const done = await Promise.all(
        batch.map((c) =>
          nearTown(c).catch((e) => {
            console.error("town stats", c.slug, e);
            return [] as Near[];
          }),
        ),
      );
      batch.forEach((c, j) => (near[c.slug] = done[j]));
    }
    // Each trainer belongs to the one town they are nearest to.
    const home: Record<string, { town: string; d: number }> = {};
    for (const [town, list] of Object.entries(near))
      for (const t of list) if (!home[t.id] || t.distance < home[t.id].d) home[t.id] = { town, d: t.distance };
    const out: Record<string, TownStats> = {};
    for (const c of CITIES) {
      const list = near[c.slug] ?? [];
      const own = list.filter((t) => home[t.id]?.town === c.slug);
      out[c.slug] = list.length
        ? {
            slug: c.slug,
            total: list.length,
            own: own.length,
            ownTopics: count(own),
            online: list.filter((t) => t.online).length,
            homeVisits: list.filter((t) => t.home).length,
            topics: count(list),
          }
        : empty(c.slug);
    }
    return out;
  },
  ["all-town-stats-v2"],
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

/** A town page goes in the sitemap and is indexed only with enough trainers of its own. */
export const townIndexable = (s: TownStats | undefined) => (s?.own ?? 0) >= MIN_TRAINERS;

/** The same rule for a town's specialism page. */
export const townTopicIndexable = (s: TownStats | undefined, topic: string) => (s?.ownTopics[topic] ?? 0) >= MIN_TRAINERS;

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
  const parts = [`${plural(s.total, "independent trainer is", "independent trainers are")} listed within ${TOWN_RADIUS} miles of ${name}${s.own && s.own < s.total ? `, ${s.own} of them closer to ${name} than to any other town we cover` : ""}.`];
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
      ...TOPICS.map((t) => count(t.kind === "style" ? { styles: [t.slug] } : t.kind === "goal" ? { goals: [t.slug] } : { homeVisits: true })),
    ]);
    return { total, online, topics: Object.fromEntries(TOPICS.map((t, i) => [t.slug, each[i]])) };
  },
  ["uk-counts-v2"],
  { revalidate: DAY / 4 },
);

export type AreaStats = { total: number; own: number; online: number; topics: Record<string, number> };

/** Trainer counts for every city neighbourhood. Like towns, each trainer belongs to their nearest area, and only
 *  areas with enough trainers of their own are indexed, so Clapham and Battersea don't compete with the same list. */
export const allAreaStats = unstable_cache(
  async (): Promise<Record<string, AreaStats>> => {
    const near: Near[][] = [];
    for (let i = 0; i < AREAS.length; i += 8) {
      near.push(...(await Promise.all(AREAS.slice(i, i + 8).map((a) =>
        searchTrainers({ lat: a.lat, lng: a.lng, radius: AREA_RADIUS }, 2000)
          .then((r) => r.trainers.map((t) => ({ id: t.id, distance: t.distance_miles ?? AREA_RADIUS, tags: [...t.styles, ...t.goals, ...(t.home_visits ? [HOME_VISITS] : [])], online: t.online, home: t.home_visits })))
          .catch((e) => {
            console.error("area stats", a.slug, e);
            return [] as Near[];
          }),
      ))));
    }
    const home: Record<string, { key: string; d: number }> = {};
    AREAS.forEach((a, i) => {
      for (const t of near[i]) if (!home[t.id] || t.distance < home[t.id].d) home[t.id] = { key: areaKey(a), d: t.distance };
    });
    const out: Record<string, AreaStats> = {};
    AREAS.forEach((a, i) => {
      const list = near[i];
      out[areaKey(a)] = {
        total: list.length,
        own: list.filter((t) => home[t.id]?.key === areaKey(a)).length,
        online: list.filter((t) => t.online).length,
        topics: count(list),
      };
    });
    return out;
  },
  ["all-area-stats-v1"],
  { revalidate: DAY / 4 },
);

export const areaKey = (a: Area) => `${a.city}/${a.slug}`;

/** An area page is listed for visitors with any trainers, and indexed only with enough of its own. */
export const areaIndexable = (s: AreaStats | undefined) => (s?.own ?? 0) >= MIN_TRAINERS;
