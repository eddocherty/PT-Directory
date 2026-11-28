import { readTile } from "./mvt";

/**
 * Street map of a town centre, drawn by us as a light line drawing for the background of paid profiles.
 * Map data is OpenStreetMap (ODbL), read from OpenFreeMap's free vector tiles once a month per town and cached,
 * so visitors never load anything from a third party. Centred on the town centre, never on a trainer's address.
 */

export const MAP_W = 3000;
export const MAP_H = 1860;
const HALF_W_METRES = 4200; // the drawing covers about 8.4 km across
export const PX_PER_METRE = MAP_W / (HALF_W_METRES * 2);
export const PX_PER_MILE = PX_PER_METRE * 1609.34;
const ZOOM = 13;
const UA = "LocalPT area maps (+https://localpt.co.uk)";

export type Layer = "water" | "park" | "river" | "minor" | "mid" | "major" | "rail";
export type Place = { name: string; x: number; y: number; miles: number; dir: string };
/** Kinds of fitness place we pick out of OpenStreetMap, in the order the page lists them. */
export const SPOT_KINDS = {
  gym: "Gyms & studios",
  pool: "Swimming",
  sport: "Leisure centres & sports clubs",
  outdoor: "Parks to train in",
  shop: "Kit, bikes & health food",
} as const;
export type SpotKind = keyof typeof SPOT_KINDS;
/** A fitness place near the town centre. Room for a paid "featured" spot later (sponsorship), never shown unless real. */
export type Spot = Place & { kind: SpotKind };
export type AreaMap = { paths: Partial<Record<Layer, string>>; places: Place[]; spots: Spot[] };

const ROAD_CLASS: Record<string, Layer> = {
  motorway: "major", trunk: "major", primary: "major",
  secondary: "mid", tertiary: "mid",
  minor: "minor",
  rail: "rail",
};
const PLACE_CLASSES = new Set(["town", "village", "suburb", "quarter", "neighbourhood", "hamlet"]);
const COMPASS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];

const tileX = (lng: number, z = ZOOM) => ((lng + 180) / 360) * 2 ** z;
const tileY = (lat: number, z = ZOOM) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
};

// Points of interest are only all there at zoom 14; we look within about 2.5 miles of the centre.
const POI_ZOOM = 14;
const SPOT_MILES = 2.5;
/** Which kind of fitness place an OpenStreetMap point is (OpenMapTiles "poi" class/subclass and its name), or null. */
function spotKind(cls: string, sub: string, name: string): SpotKind | null {
  if (/parkrun/i.test(name)) return "outdoor";
  if (/swimming|water_park/.test(sub) || /\b(pool|lido|baths)\b/i.test(name)) return "pool";
  if (/fitness_centre|fitness_station|dance|yoga|martial_arts/.test(sub) || /gym|fitness|pilates|crossfit|yoga|boxing|dojo|bootcamp|martial/i.test(name)) return "gym";
  if (sub === "sports_centre" || sub === "stadium" || sub === "track" || sub === "ice_rink" || /climbing/i.test(name)) return "sport";
  if (cls === "shop" && /^(health_food|nutrition_supplements|sports|outdoor)$/.test(sub)) return "shop";
  if (cls === "bicycle" && sub === "bicycle") return "shop";
  if (sub === "park" && !/school|playing field|cemetery|churchyard|\b(square|court|close|place|walk|pos)\b/i.test(name)) return "outdoor";
  return null;
}

/** Douglas-Peucker: drop points that bend the line by less than eps pixels. */
function simplify(pts: [number, number][], eps: number): [number, number][] {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  let max = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    // A closed ring starts and ends on the same point: measure from that point instead of a line.
    const d = len ? Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len : Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1]);
    if (d > max) { max = d; at = i; }
  }
  if (max <= eps) return [a, b];
  return [...simplify(pts.slice(0, at + 1), eps).slice(0, -1), ...simplify(pts.slice(at), eps)];
}

const PAD = 40;
const inside = ([x, y]: [number, number]) => x > -PAD && x < MAP_W + PAD && y > -PAD && y < MAP_H + PAD;
const MINOR_RADIUS = 1.9 * 1609.34 * PX_PER_METRE;
const nearCentre = ([x, y]: [number, number]) => Math.hypot(x - MAP_W / 2, y - MAP_H / 2) < MINOR_RADIUS;
/** Whole pixels, then each point as a short step from the one before ("M10 20l3-1 4 2"), about 40% smaller than absolute points. */
const fmt = (pts: [number, number][]) => {
  const r = pts.map(([x, y]) => [Math.round(x), Math.round(y)]);
  let d = `M${r[0][0]} ${r[0][1]}l`;
  for (let i = 1; i < r.length; i++) {
    const dx = r[i][0] - r[i - 1][0], dy = r[i][1] - r[i - 1][1];
    d += `${i > 1 && dx >= 0 ? " " : ""}${dx}${dy >= 0 ? " " : ""}${dy}`;
  }
  return d;
};

export async function buildAreaMap(lat: number, lng: number, townName: string): Promise<AreaMap> {
  const meta = await fetch("https://tiles.openfreemap.org/planet", { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (!meta.ok) throw new Error(`tilejson ${meta.status}`);
  const template = ((await meta.json()) as { tiles: string[] }).tiles[0];

  const cx = tileX(lng), cy = tileY(lat);
  // Metres across one tile at this latitude, then pixels in our drawing per tile.
  const tilePx = ((40075016.7 * Math.cos((lat * Math.PI) / 180)) / 2 ** ZOOM) * PX_PER_METRE;
  const halfX = MAP_W / 2 / tilePx, halfY = MAP_H / 2 / tilePx;
  const tiles: [number, number][] = [];
  for (let x = Math.floor(cx - halfX); x <= Math.floor(cx + halfX); x++)
    for (let y = Math.floor(cy - halfY); y <= Math.floor(cy + halfY); y++) tiles.push([x, y]);

  const lines: Record<Layer, string[]> = { water: [], park: [], river: [], minor: [], mid: [], major: [], rail: [] };
  const places = new Map<string, Place>();

  const compass = (dx: number, dy: number) => COMPASS[Math.round(((((Math.atan2(dx, -dy) * 180) / Math.PI) + 360) % 360) / 45) % 8];

  // Fitness places: a separate pass over zoom-14 tiles near the centre, reading only their points of interest.
  const spots = new Map<string, Spot>();
  const pcx = tileX(lng, POI_ZOOM), pcy = tileY(lat, POI_ZOOM), poiPx = tilePx / 2;
  const poiHalf = (SPOT_MILES * PX_PER_MILE) / poiPx;
  const poiTiles: [number, number][] = [];
  for (let x = Math.floor(pcx - poiHalf); x <= Math.floor(pcx + poiHalf); x++)
    for (let y = Math.floor(pcy - poiHalf); y <= Math.floor(pcy + poiHalf); y++) poiTiles.push([x, y]);
  const poiPass = Promise.all(poiTiles.map(async ([tx, ty]) => {
    const url = template.replace("{z}", String(POI_ZOOM)).replace("{x}", String(tx)).replace("{y}", String(ty));
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000), cache: "no-store" });
    if (!res.ok) return; // points are a bonus: a missing tile just means fewer of them
    for (const { name, extent, features } of readTile(new Uint8Array(await res.arrayBuffer()))) {
      if (name !== "poi") continue;
      for (const f of features) {
        const label = String(f.props.name_en ?? f.props.name ?? "").trim();
        const pt = f.geom[0]?.[0];
        if (!label || !pt || spots.has(label)) continue;
        const kind = spotKind(String(f.props.class ?? ""), String(f.props.subclass ?? ""), label);
        if (!kind) continue;
        const x = (tx + pt.x / extent - pcx) * poiPx + MAP_W / 2, y = (ty + pt.y / extent - pcy) * poiPx + MAP_H / 2;
        const dx = x - MAP_W / 2, dy = y - MAP_H / 2, miles = Math.hypot(dx, dy) / PX_PER_MILE;
        if (miles > SPOT_MILES) continue;
        spots.set(label, { name: label, kind, x: Math.round(x), y: Math.round(y), miles: Math.round(miles * 10) / 10, dir: compass(dx, dy) });
      }
    }
  })).catch(() => undefined);

  await Promise.all(tiles.map(async ([tx, ty]) => {
    const url = template.replace("{z}", String(ZOOM)).replace("{x}", String(tx)).replace("{y}", String(ty));
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000), cache: "no-store" });
    if (res.status === 204 || res.status === 404) return; // empty sea tile
    if (!res.ok) throw new Error(`tile ${res.status}`);
    const layers = readTile(new Uint8Array(await res.arrayBuffer()));
    type P = { x: number; y: number };
    const project = (extent: number) => (p: P): [number, number] => [
      (tx + p.x / extent - cx) * tilePx + MAP_W / 2,
      (ty + p.y / extent - cy) * tilePx + MAP_H / 2,
    ];
    type Px = ReturnType<typeof project>;

    const addLines = (layer: Layer, geom: P[][], px: Px) => {
      for (const ring of geom) {
        // Keep only the stretches inside the drawing, split where a line leaves it.
        // Side streets only near the centre (they'd fade out under the page's mask anyway), simplified harder,
        // which keeps a big city's drawing light.
        const minor = layer === "minor";
        const keep = minor ? nearCentre : inside;
        let run: [number, number][] = [];
        const flush = () => {
          if (run.length > 1) lines[layer].push(fmt(simplify(run, minor ? 2.2 : 1.4)));
          run = [];
        };
        for (const p of ring.map(px)) {
          if (keep(p)) run.push(p);
          else { if (run.length) run.push(p); flush(); }
        }
        flush();
      }
    };
    const addAreas = (layer: Layer, geom: P[][], px: Px) => {
      for (const ring of geom) {
        const pts = ring.map(px);
        if (pts.length < 4 || !pts.some(inside)) continue;
        lines[layer].push(fmt(simplify(pts, 1.4)) + "Z");
      }
    };

    for (const { name, extent, features } of layers) {
      const px = project(extent);
      for (const f of features) {
        const cls = String(f.props.class ?? "");
        if (name === "transportation") {
          const l = ROAD_CLASS[cls];
          if (l && f.type === 2) addLines(l, f.geom, px);
        } else if (name === "waterway" && (cls === "river" || cls === "canal") && f.type === 2) {
          addLines("river", f.geom, px);
        } else if (name === "water" && f.type === 3) {
          addAreas("water", f.geom, px);
        } else if (name === "landcover" && f.props.subclass === "park" && f.type === 3) {
          // Town parks only ("park" layer is national parks, far too big to draw)
          addAreas("park", f.geom, px);
        } else if (name === "place" && PLACE_CLASSES.has(cls) && f.type === 1 && f.geom[0]?.[0]) {
          const label = String(f.props["name:en"] ?? f.props.name ?? "").trim();
          const p = px(f.geom[0][0]);
          if (!label || !inside(p) || label.toLowerCase() === townName.toLowerCase() || places.has(label)) continue;
          const dx = p[0] - MAP_W / 2, dy = p[1] - MAP_H / 2;
          const miles = Math.hypot(dx, dy) / PX_PER_MILE;
          if (miles < 0.25) continue;
          const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
          places.set(label, { name: label, x: Math.round(p[0]), y: Math.round(p[1]), miles: Math.round(miles * 10) / 10, dir: COMPASS[Math.round(((deg + 360) % 360) / 45) % 8] });
        }
      }
    }
  }));

  const paths: AreaMap["paths"] = {};
  for (const [k, v] of Object.entries(lines)) if (v.length) paths[k as Layer] = v.join("");
  if (!paths.minor && !paths.mid && !paths.major) throw new Error("no roads");
  await poiPass;
  // Up to five nearest of each kind.
  const byKind = new Map<SpotKind, Spot[]>();
  // Leisure centres matter most to people training, so they go ahead of clubs in their list.
  const rank = (sp: Spot) => (/leisure centre/i.test(sp.name) ? 0 : 1);
  for (const sp of [...spots.values()].sort((a, b) => rank(a) - rank(b) || a.miles - b.miles)) {
    const list = byKind.get(sp.kind) ?? [];
    if (list.length < 5) byKind.set(sp.kind, [...list, sp]);
  }
  return { paths, places: [...places.values()].sort((a, b) => a.miles - b.miles).slice(0, 14), spots: [...byKind.values()].flat() };
}

