import sample from "../../data/sample-trainers.json";
import { getSupabase } from "./supabase";
import { milesBetween } from "./geocode";

export type TrainerSummary = {
  id: string;
  slug: string;
  name: string;
  business_name: string | null;
  headline: string | null;
  city: string | null;
  region: string | null;
  postcode_district: string | null;
  in_person: boolean;
  online: boolean;
  home_visits: boolean;
  price_from: number | null;
  price_to: number | null;
  gender: string | null;
  image_url: string | null;
  is_sample: boolean;
  claimed: boolean;
  styles: string[];
  goals: string[];
  distance_miles: number | null;
};

export type Trainer = TrainerSummary & {
  bio: string | null;
  qualifications: string[];
  years_experience: number | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  source: string;
  source_url: string | null;
};

export type SearchFilters = {
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  styles?: string[];
  goals?: string[];
  online?: boolean;
  homeVisits?: boolean;
  maxPrice?: number;
  gender?: string;
  q?: string;
  page?: number;
};

export const PAGE_SIZE = 24;

type SampleRow = (typeof sample)[number];

function fromSample(r: SampleRow, distance: number | null = null): Trainer {
  return {
    id: r.slug,
    slug: r.slug,
    name: r.name,
    business_name: r.business_name,
    headline: r.headline,
    bio: r.bio,
    city: r.city,
    region: r.region,
    postcode_district: r.postcode_district,
    in_person: r.in_person,
    online: r.online,
    home_visits: r.home_visits,
    price_from: r.price_from,
    price_to: r.price_to,
    gender: r.gender,
    image_url: null,
    is_sample: true,
    claimed: false,
    styles: r.styles,
    goals: r.goals,
    qualifications: r.qualifications,
    years_experience: r.years_experience,
    website: null,
    email: null,
    phone: null,
    instagram: null,
    source: r.source,
    source_url: null,
    distance_miles: distance,
  };
}

function searchSample(f: SearchFilters): { trainers: TrainerSummary[]; total: number } {
  const origin = f.lat != null && f.lng != null ? { lat: f.lat, lng: f.lng } : null;
  const radius = f.radius ?? 25;
  let rows = sample
    .map((r) => fromSample(r, origin ? milesBetween(origin, r) : null))
    .filter((t) => {
      if (origin && !(t.distance_miles! <= radius || (f.online && t.online))) return false;
      if (f.city && t.city?.toLowerCase() !== f.city.toLowerCase()) return false;
      if (f.online != null && t.online !== f.online) return false;
      if (f.homeVisits != null && t.home_visits !== f.homeVisits) return false;
      if (f.maxPrice != null && (t.price_from ?? 0) > f.maxPrice) return false;
      if (f.gender && t.gender !== f.gender) return false;
      if (f.styles?.length && !t.styles.some((s) => f.styles!.includes(s))) return false;
      if (f.goals?.length && !t.goals.some((g) => f.goals!.includes(g))) return false;
      if (f.q) {
        const q = f.q.toLowerCase();
        if (![t.name, t.business_name, t.headline].some((v) => v?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  rows = rows.sort(
    (a, b) => (a.distance_miles ?? Infinity) - (b.distance_miles ?? Infinity) || a.name.localeCompare(b.name),
  );
  const page = Math.max(1, f.page ?? 1);
  return { trainers: rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: rows.length };
}

export async function searchTrainers(f: SearchFilters): Promise<{ trainers: TrainerSummary[]; total: number }> {
  const db = getSupabase();
  if (!db) return searchSample(f);

  const page = Math.max(1, f.page ?? 1);
  const { data, error } = await db.rpc("search_trainers", {
    p_lat: f.lat ?? null,
    p_lng: f.lng ?? null,
    p_radius_miles: f.radius ?? 25,
    p_city: f.city ?? null,
    p_styles: f.styles?.length ? f.styles : null,
    p_goals: f.goals?.length ? f.goals : null,
    p_online: f.online ?? null,
    p_home_visits: f.homeVisits ?? null,
    p_max_price: f.maxPrice ?? null,
    p_gender: f.gender ?? null,
    p_query: f.q || null,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });
  if (error) throw new Error(`search_trainers failed: ${error.message}`);
  const rows = (data ?? []) as (TrainerSummary & { total_count: number })[];
  return { trainers: rows, total: rows[0]?.total_count ?? 0 };
}

export async function getTrainer(slug: string): Promise<Trainer | null> {
  const db = getSupabase();
  if (!db) {
    const r = sample.find((s) => s.slug === slug);
    return r ? fromSample(r) : null;
  }
  const { data, error } = await db
    .from("trainers")
    .select("*, trainer_styles(style_slug), trainer_goals(goal_slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    ...data,
    claimed: data.claimed_by != null,
    styles: (data.trainer_styles ?? []).map((s: { style_slug: string }) => s.style_slug),
    goals: (data.trainer_goals ?? []).map((g: { goal_slug: string }) => g.goal_slug),
    distance_miles: null,
  } as Trainer;
}

export async function submitListingRequest(req: {
  trainer_slug?: string;
  kind: "claim" | "removal" | "correction";
  requester_name?: string;
  requester_email: string;
  message?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabase();
  if (!db) return { ok: false, error: "The database isn't connected yet, so requests can't be saved." };
  let trainer_id: string | null = null;
  if (req.trainer_slug) {
    const { data } = await db.from("trainers").select("id").eq("slug", req.trainer_slug).maybeSingle();
    trainer_id = data?.id ?? null;
  }
  const { error } = await db.from("listing_requests").insert({
    trainer_id,
    kind: req.kind,
    requester_name: req.requester_name || null,
    requester_email: req.requester_email,
    message: [req.trainer_slug && !trainer_id ? `Listing: ${req.trainer_slug}` : null, req.message]
      .filter(Boolean)
      .join("\n") || null,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}
