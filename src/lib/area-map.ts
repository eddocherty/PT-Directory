import "server-only";
import { unstable_cache } from "next/cache";
import type { City } from "./taxonomy";
import { MAP_H, MAP_W, buildAreaMap, type AreaMap } from "./area-map-build";

export { MAP_H, MAP_W, PX_PER_MILE, SPOT_KINDS, type AreaMap, type Place, type Spot, type SpotKind } from "./area-map-build";

const cachedBuild = unstable_cache(buildAreaMap, ["area-map-v2"], { revalidate: 60 * 60 * 24 * 30 });

/** The town's map, or null when the tiles can't be reached (the page then shows its plain background). Failures aren't cached. */
export async function getAreaMap(town: Pick<City, "lat" | "lng" | "name">): Promise<AreaMap | null> {
  try {
    return await cachedBuild(town.lat, town.lng, town.name);
  } catch (e) {
    console.error("area map", town.name, e instanceof Error ? e.message : e);
    return null;
  }
}

/** The drawing as a standalone SVG file (served from /area-map/<town>.svg, so it never weighs down the page's HTML). */
export function areaMapSvg(m: AreaMap): string {
  const p = m.paths;
  const path = (d: string | undefined, attrs: string) => (d ? `<path d="${d}" ${attrs}/>` : "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_W} ${MAP_H}" width="${MAP_W}" height="${MAP_H}">` +
    path(p.park, `fill="#2457c5" fill-opacity="0.05"`) +
    path(p.water, `fill="#2457c5" fill-opacity="0.12"`) +
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    path(p.river, `stroke="#2457c5" stroke-opacity="0.35" stroke-width="5"`) +
    path(p.minor, `stroke="#111214" stroke-opacity="0.11" stroke-width="2"`) +
    path(p.mid, `stroke="#2457c5" stroke-opacity="0.28" stroke-width="3.5"`) +
    path(p.major, `stroke="#2457c5" stroke-opacity="0.5" stroke-width="5.5"`) +
    path(p.rail, `stroke="#111214" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="10 7"`) +
    `</g></svg>`;
}
