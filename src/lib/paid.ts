import "server-only";
import { getAdminDb } from "./admin-db";

/**
 * Paid profiles (£10 a month). ed adds everything by hand from /admin, so trainers never log in.
 * The table is private (service role only): pages read it on the server.
 */
export type PaidVideo = { url: string; title: string };
export type PaidPrice = { label: string; price: string; note: string };
export type PaidWorkout = { title: string; body: string; link: string };
export type PaidSection = { heading: string; body: string };
export type PaidReview = { author: string; body: string; rating: number | null; source: string; date: string };

export type PaidProfile = {
  trainer_id: string;
  about: string | null;
  gallery: string[];
  videos: PaidVideo[];
  prices: PaidPrice[];
  prices_updated_at: string | null;
  workouts: PaidWorkout[];
  sections: PaidSection[];
  reviews: PaidReview[];
  taking_clients: "yes" | "waitlist" | "no" | null;
  taking_clients_updated_at: string | null;
  enquiry_email: string | null;
  whatsapp: string | null;
  updated_at: string | null;
};

export const emptyProfile = (trainer_id: string): PaidProfile => ({
  trainer_id, about: null, gallery: [], videos: [], prices: [], prices_updated_at: null, workouts: [], sections: [],
  reviews: [], taking_clients: null, taking_clients_updated_at: null, enquiry_email: null, whatsapp: null, updated_at: null,
});

export { MEDIA_BUCKET } from "./media";

export async function getPaidProfile(trainerId: string): Promise<PaidProfile | null> {
  const db = getAdminDb();
  if (!db) return null;
  const { data, error } = await db.from("paid_profiles").select("*").eq("trainer_id", trainerId).maybeSingle();
  if (error) {
    // Before the paid-profiles SQL is run the table doesn't exist: show the free listing.
    console.error("paid profile", error.message);
    return null;
  }
  return data ? { ...emptyProfile(trainerId), ...data } as PaidProfile : null;
}

/** A YouTube or Vimeo link turned into a privacy-friendly embed address, or null for anything else. */
export function videoEmbed(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com") id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] ?? null;
    if (id && /^[\w-]{6,20}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const v = u.pathname.match(/(\d{6,12})/)?.[1];
      if (v) return `https://player.vimeo.com/video/${v}?dnt=1`;
    }
  } catch {}
  return null;
}

/** "07700 900123" or "+44 7700 900123" as a wa.me number, or null. */
export function whatsappNumber(raw: string | null): string | null {
  if (!raw) return null;
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = `44${d.slice(1)}`;
  return /^\d{10,15}$/.test(d) ? d : null;
}
