import "server-only";
import { getAdminDb } from "./admin-db";
import { CITIES } from "./taxonomy";

export const OUTREACH_STATUSES = ["Not contacted", "Messaged", "Replied", "Interested", "Signed up", "Not interested", "Do not contact"];

export type Dashboard = {
  pageviews: number;
  visitors: number;
  profile_views: number;
  contacts: number;
  daily: { day: string; pageviews: number; visitors: number }[];
  top_pages: { path: string; views: number; visitors: number }[];
  referrers: { source: string; views: number }[];
  countries: { country: string; views: number }[];
  devices: { device: string; views: number }[];
  trainer_stats: { trainer_id: string; views: number; contacts: number }[];
};

export type AdminTrainer = {
  id: string;
  slug: string;
  name: string;
  business_name: string | null;
  city: string | null;
  county: string;
  postcode_district: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  status: string;
  online: boolean;
  is_sample: boolean;
  claimed: boolean;
  styles: string[];
  views: number;
  contacts: number;
  outreach_status: string;
  notes: string;
  last_contacted: string | null;
};

export type Lead = {
  id: number;
  list_city: string;
  name: string;
  area: string | null;
  area_confirmed: string | null;
  specialism: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  website: string | null;
  contact_route: string | null;
  status: string;
  notes: string | null;
  last_contacted: string | null;
};

const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/\(.*?\)/g, "").replace(/[^a-z]+/g, " ").trim();
const COUNTY = new Map(CITIES.map((c) => [norm(c.name), c.county]));

/** Supabase returns at most 1,000 rows per request, so page through. */
async function all<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build(from, from + 999);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < 1000) return out;
  }
}

export async function loadDashboard(days: number): Promise<Dashboard> {
  const db = getAdminDb()!;
  const { data, error } = await db.rpc("admin_dashboard", { p_days: days });
  if (error) throw new Error(error.message);
  return data as Dashboard;
}

type TrainerRow = {
  id: string; slug: string; name: string; business_name: string | null; city: string | null; region: string | null;
  postcode_district: string | null; website: string | null; email: string | null; phone: string | null; instagram: string | null;
  status: string; online: boolean; is_sample: boolean; claimed_by: string | null; trainer_styles: { style_slug: string }[];
};
type OutreachRow = { trainer_id: string; status: string; notes: string | null; last_contacted: string | null };

export async function loadTrainers(stats: Dashboard["trainer_stats"]): Promise<AdminTrainer[]> {
  const db = getAdminDb()!;
  const [rows, outreach] = await Promise.all([
    all<TrainerRow>((a, b) =>
      db.from("trainers")
        .select("id, slug, name, business_name, city, region, postcode_district, website, email, phone, instagram, status, online, is_sample, claimed_by, trainer_styles(style_slug)")
        .order("name").range(a, b)),
    all<OutreachRow>((a, b) => db.from("trainer_outreach").select("trainer_id, status, notes, last_contacted").range(a, b)),
  ]);
  const s = new Map(stats.map((x) => [x.trainer_id, x]));
  const o = new Map(outreach.map((x) => [x.trainer_id, x]));
  return rows.map((t) => ({
    id: t.id, slug: t.slug, name: t.name, business_name: t.business_name, city: t.city,
    county: (t.city && COUNTY.get(norm(t.city))) || t.region || "",
    postcode_district: t.postcode_district, website: t.website, email: t.email, phone: t.phone, instagram: t.instagram,
    status: t.status, online: t.online, is_sample: t.is_sample, claimed: t.claimed_by != null,
    styles: (t.trainer_styles ?? []).map((x) => x.style_slug),
    views: Number(s.get(t.id)?.views ?? 0), contacts: Number(s.get(t.id)?.contacts ?? 0),
    outreach_status: o.get(t.id)?.status ?? "Not contacted", notes: o.get(t.id)?.notes ?? "", last_contacted: o.get(t.id)?.last_contacted ?? null,
  }));
}

export async function loadLeads(): Promise<Lead[]> {
  const db = getAdminDb()!;
  return all<Lead>((a, b) =>
    db.from("outreach_leads")
      .select("id, list_city, name, area, area_confirmed, specialism, facebook_url, instagram_url, website, contact_route, status, notes, last_contacted")
      .order("list_city").order("id").range(a, b));
}

export type ListingRequest = { id: string; kind: string; requester_name: string | null; requester_email: string; message: string | null; status: string; created_at: string; trainers: { name: string; slug: string } | null };
export type Enquiry = { id: string; name: string; email: string; goal: string | null; message: string | null; created_at: string; trainers: { name: string; slug: string } | null };

export async function loadInbox(): Promise<{ requests: ListingRequest[]; enquiries: Enquiry[]; pendingReviews: number }> {
  const db = getAdminDb()!;
  const [r, e, p] = await Promise.all([
    db.from("listing_requests").select("id, kind, requester_name, requester_email, message, status, created_at, trainers(name, slug)").order("created_at", { ascending: false }).limit(200),
    db.from("enquiries").select("id, name, email, goal, message, created_at, trainers(name, slug)").order("created_at", { ascending: false }).limit(100),
    db.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return {
    requests: (r.data ?? []) as unknown as ListingRequest[],
    enquiries: (e.data ?? []) as unknown as Enquiry[],
    pendingReviews: p.count ?? 0,
  };
}
