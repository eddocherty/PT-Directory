import "server-only";
import { unstable_cache } from "next/cache";
import { getAdminDb } from "./admin-db";

/**
 * The most read articles over the last 30 days, by distinct visitors, from our own cookie-free analytics.
 * Returns slugs, most read first. Empty until there is enough traffic to call anything "most read".
 */
export const mostReadArticleSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const db = getAdminDb();
    if (!db) return [];
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const query = (realOnly: boolean) => {
      let q = db
        .from("analytics_events")
        .select("path, visitor_hash")
        .eq("kind", "pageview")
        .or("path.like./articles/%,path.like./guides/%")
        .gte("created_at", since);
      if (realOnly) q = q.eq("traffic", "real"); // leave out our own visits and bots
      return q.limit(20000);
    };
    let { data, error } = await query(true);
    if (error && /traffic/.test(error.message)) ({ data, error } = await query(false));
    if (error || !data) return [];
    const visitors = new Map<string, Set<string>>();
    for (const r of data as { path: string; visitor_hash: string | null }[]) {
      const slug = r.path.match(/^\/(?:articles|guides)\/([^/]+)$/)?.[1];
      if (!slug || slug === "feed.xml") continue;
      if (!visitors.has(slug)) visitors.set(slug, new Set());
      visitors.get(slug)!.add(r.visitor_hash ?? Math.random().toString());
    }
    const ranked = [...visitors].map(([slug, v]) => ({ slug, n: v.size })).sort((a, b) => b.n - a.n);
    // Only call it "most read" once a few pieces have a real readership.
    return ranked.filter((r) => r.n >= 5).length >= 3 ? ranked.map((r) => r.slug) : [];
  },
  ["most-read-articles"],
  { revalidate: 21600 },
);
