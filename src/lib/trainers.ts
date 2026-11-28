import { unstable_cache } from "next/cache";
import { getSupabase } from "./supabase";

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
  sports: string[];
  free_consultation: boolean;
  rating_avg: number | null;
  review_count: number;
  distance_miles: number | null;
};

export type Review = { id: string; author_name: string; rating: number; body: string | null; created_at: string };

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
  source_licence: string | null;
  last_verified_at: string | null;
  photos: string[];
  reviews: Review[];
  /** Paying £10 a month: their page shows the extras ed has added. */
  is_paid: boolean;
  status: string;
};

export type SearchFilters = {
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  styles?: string[];
  goals?: string[];
  sports?: string[];
  online?: boolean;
  homeVisits?: boolean;
  gender?: string;
  q?: string;
  page?: number;
};

export const PAGE_SIZE = 24;

export async function searchTrainers(f: SearchFilters, limit = PAGE_SIZE): Promise<{ trainers: TrainerSummary[]; total: number }> {
  const db = getSupabase();
  if (!db) return { trainers: [], total: 0 };

  const page = Math.max(1, f.page ?? 1);
  const { data, error } = await db.rpc("search_trainers", {
    p_lat: f.lat ?? null,
    p_lng: f.lng ?? null,
    p_radius_miles: f.radius ?? 25,
    p_city: f.city ?? null,
    p_styles: f.styles?.length ? f.styles : null,
    p_goals: f.goals?.length ? f.goals : null,
    p_sports: f.sports?.length ? f.sports : null,
    p_online: f.online ?? null,
    p_home_visits: f.homeVisits ?? null,
    p_max_price: null, // price filtering removed: trainers change prices without telling us
    p_gender: f.gender ?? null,
    p_query: f.q || null,
    p_limit: limit,
    p_offset: (page - 1) * limit,
  });
  if (error) throw new Error(`search_trainers failed: ${error.message}`);
  const rows = (data ?? []) as (TrainerSummary & { total_count: number })[];
  return { trainers: rows, total: rows[0]?.total_count ?? 0 };
}

/**
 * One trainer's full profile. includeHidden is only ever true for ed logged in to /admin: it lets him
 * look at hidden listings (such as the demo paid profile) exactly as visitors would see them.
 */
export async function getTrainer(slug: string, includeHidden = false): Promise<Trainer | null> {
  let db = getSupabase();
  if (includeHidden) {
    const { getAdminDb } = await import("./admin-db");
    db = getAdminDb() ?? db;
  }
  if (!db) return null;
  const { data, error } = await db
    .from("trainers")
    .select("*, trainer_styles(style_slug), trainer_goals(goal_slug)")
    .eq("slug", slug)
    .in("status", includeHidden ? ["published", "hidden"] : ["published"])
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const { data: reviews } = await db
    .from("reviews")
    .select("id, author_name, rating, body, created_at")
    .eq("trainer_id", data.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);
  const list = (reviews ?? []) as Review[];
  return {
    ...data,
    sports: data.sports ?? [],
    photos: data.photos ?? [],
    free_consultation: data.free_consultation ?? false,
    is_paid: data.is_paid === true,
    reviews: list,
    review_count: list.length,
    rating_avg: list.length ? Math.round((list.reduce((a, v) => a + v.rating, 0) / list.length) * 10) / 10 : null,
    claimed: data.claimed_by != null,
    styles: (data.trainer_styles ?? []).map((s: { style_slug: string }) => s.style_slug),
    goals: (data.trainer_goals ?? []).map((g: { goal_slug: string }) => g.goal_slug),
    distance_miles: null,
  } as Trainer;
}

export async function submitListingRequest(req: {
  trainer_slug?: string;
  kind: "removal" | "correction";
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

export async function featuredTrainers(limit = 4): Promise<TrainerSummary[]> {
  let trainers: TrainerSummary[] = [];
  try {
    ({ trainers } = await searchTrainers({}, 2000));
  } catch (e) {
    // Never let the home page fail (or a build break) because the database is unreachable.
    console.error("featuredTrainers:", e);
  }
  return [...trainers]
    .filter((t) => t.review_count > 0 && t.rating_avg != null)
    .sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0) || b.review_count - a.review_count)
    .slice(0, limit);
}

async function trainerId(slug: string) {
  // The server's own client also finds hidden listings (the demo profile ed tests enquiries on).
  const { getAdminDb } = await import("./admin-db");
  const db = getAdminDb() ?? getSupabase();
  if (!db) return null;
  const { data } = await db.from("trainers").select("id").eq("slug", slug).neq("status", "removed").maybeSingle();
  return (data?.id as string) ?? null;
}

export async function sendEnquiry(e: {
  slug: string; name: string; email: string; phone?: string; goal?: string; message?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabase();
  if (!db) return { ok: false, error: "The database isn’t connected yet." };
  const id = await trainerId(e.slug);
  if (!id) return { ok: false, error: "We couldn’t find that trainer." };
  const row = { trainer_id: id, name: e.name, email: e.email, phone: e.phone || null, goal: e.goal || null, message: e.message || null };
  // The server's own client returns the new row's id, so we can note whether it was passed on.
  const { getAdminDb } = await import("./admin-db");
  const admin = getAdminDb();
  if (!admin) {
    const { error } = await db.from("enquiries").insert(row);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  const { data, error } = await admin.from("enquiries").insert(row).select("id").single();
  if (error) return { ok: false, error: error.message };
  await forwardEnquiry(data.id as string, id, e).catch((err) => console.error("forward enquiry", err));
  return { ok: true };
}

/** Paying trainers get each enquiry by email, with Reply going straight to the client. */
async function forwardEnquiry(enquiryId: string, trainerIdValue: string, e: { name: string; email: string; phone?: string; goal?: string; message?: string }) {
  const { getAdminDb } = await import("./admin-db");
  const { sendEmail } = await import("./email");
  const { BRAND } = await import("@/brand");
  const admin = getAdminDb()!;
  const [{ data: t }, { data: p }] = await Promise.all([
    admin.from("trainers").select("name, email, is_paid").eq("id", trainerIdValue).maybeSingle(),
    admin.from("paid_profiles").select("enquiry_email").eq("trainer_id", trainerIdValue).maybeSingle(),
  ]);
  if (!t?.is_paid) return;
  const to = (p?.enquiry_email as string | null) || (t.email as string | null);
  if (!to) {
    await admin.from("enquiries").update({ forward_error: "No enquiry email saved for this trainer" }).eq("id", enquiryId);
    return;
  }
  const text = [
    `Hi ${t.name},`,
    ``,
    `${e.name} sent you an enquiry through your ${BRAND.name} profile.`,
    ``,
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    e.phone ? `Phone: ${e.phone}` : null,
    e.goal ? `Main goal: ${e.goal}` : null,
    ``,
    e.message || "(No message)",
    ``,
    `Just press Reply to answer ${e.name} directly.`,
    ``,
    `${BRAND.name}, ${BRAND.domain}`,
  ].filter((l) => l !== null).join("\n");
  const r = await sendEmail({ to, subject: `New enquiry from ${e.name} via ${BRAND.name}`, text, replyTo: e.email });
  await admin.from("enquiries").update(r.ok ? { forwarded_at: new Date().toISOString(), forward_error: null } : { forward_error: r.error }).eq("id", enquiryId);
}

export async function submitReview(r: {
  slug: string; author_name: string; author_email: string; rating: number; body?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabase();
  if (!db) return { ok: false, error: "The database isn’t connected yet." };
  const id = await trainerId(r.slug);
  if (!id) return { ok: false, error: "We couldn’t find that trainer." };
  const { error } = await db.from("reviews").insert({
    trainer_id: id, author_name: r.author_name, author_email: r.author_email, rating: r.rating, body: r.body || null,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Too little written about a trainer for the profile to be worth a place in Google on its own. */
export const isThin = (t: { bio: string | null }) => (t.bio?.trim().length ?? 0) < 80;

/**
 * Every published, real trainer's slug, for the sitemap. Thin profiles are left out.
 * Supabase returns at most 1,000 rows per request, so this reads the table in pages of 1,000.
 */
export async function publishedTrainerSlugs(): Promise<{ slug: string; updated_at: string | null }[]> {
  const db = getSupabase();
  if (!db) return [];
  type Row = { slug: string; updated_at: string | null; bio: string | null };
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("trainers")
      .select("slug, updated_at, bio")
      .eq("status", "published")
      .eq("is_sample", false)
      .order("slug")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < 1000) break;
  }
  return rows
    .filter((t) => !isThin(t))
    .map(({ slug, updated_at }) => ({ slug, updated_at }));
}

/** Landing-page searches, cached for an hour so town and specialism pages load fast. Keyed by the filters. */
export const cachedSearch = unstable_cache(
  (f: SearchFilters) => searchTrainers(f),
  ["landing-search-v1"],
  { revalidate: 3600 },
);
