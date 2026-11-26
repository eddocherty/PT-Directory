#!/usr/bin/env node
// Upsert trainers from a JSON file into Supabase.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-trainers.mjs data/<file>.json
//
// Each record: { slug, name, business_name?, headline?, bio?, gender?, city?, region?, postcode_district?,
//   lat?, lng?, in_person?, online?, home_visits?, price_from?, price_to?, qualifications?, years_experience?,
//   website?, email?, phone?, instagram?, image_url?, styles: [], goals: [], source, source_url?, source_licence?, is_sample? }
// Records whose slug matches a removed listing are skipped, so opted-out trainers are never re-added.
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const file = process.argv[2];
if (!url || !key || !file) {
  console.error("Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and a JSON file path.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const rows = JSON.parse(await readFile(file, "utf8"));

const { data: removed } = await db.from("trainers").select("slug").eq("status", "removed");
const blocked = new Set((removed ?? []).map((r) => r.slug));

let ok = 0, skipped = 0, failed = 0;
for (const r of rows) {
  if (blocked.has(r.slug)) { skipped++; continue; }
  const { styles = [], goals = [], lat, lng, ...rest } = r;
  const { reviews, ...fields } = rest; void reviews;
  const record = {
    ...fields,
    location: lat != null && lng != null ? `SRID=4326;POINT(${lng} ${lat})` : null,
    last_verified_at: new Date().toISOString(),
  };
  const { data, error } = await db.from("trainers").upsert(record, { onConflict: "slug" }).select("id").single();
  if (error) { failed++; console.error(r.slug, error.message); continue; }
  await db.from("trainer_styles").delete().eq("trainer_id", data.id);
  await db.from("trainer_goals").delete().eq("trainer_id", data.id);
  if (styles.length) await db.from("trainer_styles").insert(styles.map((s) => ({ trainer_id: data.id, style_slug: s })));
  if (goals.length) await db.from("trainer_goals").insert(goals.map((g) => ({ trainer_id: data.id, goal_slug: g })));
  ok++;
}
console.log(`Imported ${ok}, skipped ${skipped} removed listings, ${failed} failed.`);
