import { CITIES } from "./taxonomy";
import { TOPICS, TOWN_RADIUS, topicBySlug } from "./topics";
import type { TownStats } from "./stats";

/**
 * "Did you know" lines, worked out from the live listings each time the stats refresh.
 * Every line is a count of what is actually listed, so nothing here can go stale or be made up.
 */
export type Fact = { big: string; text: string; href: string; cta: string };

type Uk = { total: number; online: number; topics: Record<string, number> };

const pct = (n: number, d: number) => Math.round((n / d) * 100);

/** "about 1 in 5" style ratio, only used when it is close to the true share. */
function oneIn(n: number, d: number): string | null {
  if (!n || !d) return null;
  const k = Math.round(d / n);
  return k >= 2 && Math.abs(1 / k - n / d) < 0.02 ? `1 in ${k}` : null;
}

export function buildFacts(uk: Uk, stats: Record<string, TownStats>): Fact[] {
  const facts: Fact[] = [];
  if (!uk.total) return facts;
  const towns = CITIES.filter((c) => (stats[c.slug]?.total ?? 0) > 0);

  facts.push({
    big: String(uk.total),
    text: `independent trainers, Pilates instructors and small studios listed, across ${towns.length} UK towns and cities. No big gym chains.`,
    href: "/locations",
    cta: "Find yours",
  });

  if (uk.online) {
    const ratio = oneIn(uk.online, uk.total);
    facts.push({
      big: ratio ?? `${pct(uk.online, uk.total)}%`,
      text: `of the trainers we list also coach online, so where you live doesn’t limit who you can work with.`,
      href: "/online",
      cta: "See online coaches",
    });
  }

  const home = uk.topics["home-visits"] ?? 0;
  if (home) facts.push({ big: String(home), text: "trainers will come to you, at home or in your local park.", href: "/specialisms/home-visits", cta: "Trainers who visit" });

  // Most common specialism UK-wide.
  const top = TOPICS.filter((t) => t.kind !== "home").map((t) => ({ t, n: uk.topics[t.slug] ?? 0 })).sort((a, b) => b.n - a.n)[0];
  if (top?.n) facts.push({ big: String(top.n), text: `trainers list ${top.t.name.toLowerCase()}, the most common specialism on the site.`, href: `/specialisms/${top.t.slug}`, cta: `See ${top.t.name.toLowerCase()}` });

  // A few headline counts for specialisms people often look for, so the rotating strip has plenty to show.
  for (const slug of ["pilates", "pre-post-natal", "bootcamp", "rehab", "older-adults"]) {
    const t = topicBySlug(slug);
    const n = uk.topics[slug] ?? 0;
    if (!t || n < 5 || slug === top?.t.slug) continue;
    facts.push({ big: String(n), text: `${t.people.toLowerCase()} listed across the UK.`, href: `/specialisms/${slug}`, cta: `See ${t.name.toLowerCase()}` });
  }

  // How many towns have real choice.
  const choice = towns.filter((c) => (stats[c.slug]?.total ?? 0) >= 10).length;
  if (choice >= 5) facts.push({ big: String(choice), text: `towns and cities have ten or more trainers to choose from within ${TOWN_RADIUS} miles.`, href: "/locations", cta: "Browse towns" });

  // Town with the most of a few specialisms people search for.
  for (const slug of ["pilates", "bootcamp", "pre-post-natal", "older-adults", "running"]) {
    const [best, second] = towns.map((c) => ({ c, n: stats[c.slug]?.ownTopics[slug] ?? 0 })).sort((a, b) => b.n - a.n);
    const topic = topicBySlug(slug);
    // Only when there is a clear winner, so the claim is true.
    if (!best || best.n < 3 || (second && second.n >= best.n) || !topic) continue;
    facts.push({
      big: best.c.name,
      text: `has more ${topic.people.toLowerCase()} on LocalPT than any other town (${best.n} based there).`,
      href: `/locations/${best.c.slug}/${slug}`,
      cta: `See them`,
    });
  }

  // The town with the most choice.
  const [busiest, next] = towns.map((c) => ({ c, n: stats[c.slug].total })).sort((a, b) => b.n - a.n);
  if (busiest && (!next || next.n < busiest.n)) facts.push({ big: String(busiest.n), text: `trainers listed within ${TOWN_RADIUS} miles of ${busiest.c.name}, more than any other town we cover.`, href: `/locations/${busiest.c.slug}`, cta: `Trainers in ${busiest.c.name}` });

  return facts;
}

/** Changes once a week, so returning visitors see something new without it jumping about on every page load. */
export function weeklyPick<T>(list: T[], n: number, salt = 0): T[] {
  if (list.length <= n) return list;
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) + salt;
  return Array.from({ length: n }, (_, i) => list[(week * n + i) % list.length]);
}
