#!/usr/bin/env node
// Fetch UK personal-training businesses from OpenStreetMap (Overpass API) and write them as
// importer-ready JSON. Data is © OpenStreetMap contributors, licensed under ODbL.
// Usage: node scripts/fetch-osm.mjs data/osm-trainers.json
import { writeFile } from "node:fs/promises";

const out = process.argv[2] ?? "data/osm-trainers.json";
const NAME_RE = "personal.?train|\\bPT\\b|PT studio|fitness coach|strength (and|&) conditioning|training studio|bootcamp|boxing fitness|pilates|yoga studio";

const query = `
[out:json][timeout:300];
area["ISO3166-1"="GB"][admin_level=2]->.uk;
(
  nwr["leisure"="fitness_centre"]["name"~"${NAME_RE}",i](area.uk);
  nwr["sport"="fitness"]["name"~"personal.?train|\\bPT\\b",i](area.uk);
  nwr["office"]["name"~"personal.?train",i](area.uk);
  nwr["craft"]["name"~"personal.?train",i](area.uk);
);
out center tags;
`;

const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "pt-directory-importer/0.1" },
  body: "data=" + encodeURIComponent(query),
});
if (!res.ok) throw new Error(`Overpass ${res.status}: ${await res.text()}`);
const { elements } = await res.json();

const STYLE_HINTS = [
  [/boxing|kickbox|mma|martial/i, "boxing"],
  [/yoga/i, "yoga"],
  [/pilates/i, "pilates"],
  [/crossfit/i, "crossfit"],
  [/kettlebell/i, "kettlebells"],
  [/calisthenics/i, "calisthenics"],
  [/bootcamp|boot camp/i, "bootcamp"],
  [/strength|barbell|powerlift/i, "strength"],
  [/hiit|circuit/i, "hiit"],
  [/run/i, "running"],
];

const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const clean = (u) => (u && /^https?:\/\//.test(u) ? u : u ? `https://${u}` : null);

const rows = [];
for (const el of elements) {
  const t = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!t.name || lat == null) continue;
  const text = [t.name, t.sport, t.description].filter(Boolean).join(" ");
  const styles = [...new Set(STYLE_HINTS.filter(([re]) => re.test(text)).map(([, s]) => s))];
  if (!styles.length) styles.push("functional");
  const city = t["addr:city"] ?? t["addr:town"] ?? null;
  const outcode = t["addr:postcode"]?.toUpperCase().trim().split(/\s+/)[0] ?? null;
  rows.push({
    slug: `${slugify(t.name)}-${slugify(city ?? outcode ?? "uk")}-${el.type[0]}${el.id}`,
    name: t.name,
    business_name: t.name,
    headline: t.description?.slice(0, 160) ?? null,
    city,
    postcode_district: outcode,
    lat,
    lng,
    in_person: true,
    online: false,
    home_visits: false,
    website: clean(t.website ?? t["contact:website"]),
    // Business contact details only (published by the business on OSM)
    phone: t.phone ?? t["contact:phone"] ?? null,
    email: t.email ?? t["contact:email"] ?? null,
    instagram: t["contact:instagram"] ?? null,
    styles,
    goals: ["general-fitness"],
    source: "osm",
    source_url: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    source_licence: "ODbL, © OpenStreetMap contributors",
  });
}

await writeFile(out, JSON.stringify(rows, null, 2));
console.log(`Wrote ${rows.length} listings to ${out}`);
