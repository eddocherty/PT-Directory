import { areaMapSvg, getAreaMap } from "@/lib/area-map";
import { CITIES } from "@/lib/taxonomy";

/**
 * /area-map/kendal.svg: the street drawing behind a paid trainer's photo. A separate file, so the page's HTML stays
 * light and browsers and Vercel's edge keep a copy. Built from OpenStreetMap data, refreshed monthly.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ town: string }> }) {
  const slug = (await params).town.replace(/\.svg$/, "");
  const town = CITIES.find((c) => c.slug === slug);
  const map = town ? await getAreaMap(town) : null;
  if (!map) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  return new Response(areaMapSvg(map), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
    },
  });
}
