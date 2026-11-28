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
export type AreaMap = { paths: Partial<Record<Layer, string>>; places: Place[] };

const ROAD_CLASS: Record<string, Layer> = {
  motorway: "major", trunk: "major", primary: "major",
  secondary: "mid", tertiary: "mid",
  minor: "minor", service: "minor",
  rail: "rail",
};
const PLACE_CLASSES = new Set(["town", "village", "suburb", "quarter", "neighbourhood", "hamlet"]);
const COMPASS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];

const tileX = (lng: number) => ((lng + 180) / 360) * 2 ** ZOOM;
const tileY = (lat: number) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** ZOOM;
};

/** Douglas-Peucker: drop points that bend the line by less than eps pixels. */
function simplify(pts: [number, number][], eps: number): [number, number][] {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  let max = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > max) { max = d; at = i; }
  }
  if (max <= eps) return [a, b];
  return [...simplify(pts.slice(0, at + 1), eps).slice(0, -1), ...simplify(pts.slice(at), eps)];
}

const PAD = 40;
const inside = ([x, y]: [number, number]) => x > -PAD && x < MAP_W + PAD && y > -PAD && y < MAP_H + PAD;
const fmt = (pts: [number, number][]) => "M" + pts.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join("L");

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
        let run: [number, number][] = [];
        const flush = () => {
          if (run.length > 1) lines[layer].push(fmt(simplify(run, 1.4)));
          run = [];
        };
        for (const p of ring.map(px)) {
          if (inside(p)) run.push(p);
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
        } else if (name === "park" && f.type === 3) {
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
  return { paths, places: [...places.values()].sort((a, b) => a.miles - b.miles).slice(0, 14) };
}

