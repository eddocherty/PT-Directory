"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/admin-db";
import { MEDIA_BUCKET, type PaidProfile } from "@/lib/paid";
import { DEMO_SLUG } from "@/lib/media";
import { getStripe } from "@/lib/stripe";
import { refreshPaidFlag, syncSubscription } from "@/lib/subscriptions";

const txt = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const url = (v: unknown) => {
  const s = txt(v, 500);
  return /^https?:\/\/\S+$/i.test(s) ? s : "";
};
const date = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "")) ? String(v) : null);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const today = () => new Date().toISOString().slice(0, 10);

export type SaveResult = { ok: boolean; error?: string; savedAt?: string };

/** Saves everything on a paying trainer's page. Only ed (logged in to /admin) can call it. */
export async function savePaidProfile(trainerId: string, p: Omit<PaidProfile, "trainer_id" | "updated_at">): Promise<SaveResult> {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) return { ok: false, error: "Database not connected." };
  const { data: t } = await db.from("trainers").select("slug").eq("id", trainerId).maybeSingle();
  if (!t) return { ok: false, error: "Trainer not found." };
  const { data: before } = await db.from("paid_profiles").select("prices, taking_clients").eq("trainer_id", trainerId).maybeSingle();

  const media = `${supabaseUrl()}/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const row = {
    trainer_id: trainerId,
    about: txt(p.about, 6000) || null,
    gallery: (p.gallery ?? []).filter((g) => typeof g === "string" && g.startsWith(media)).slice(0, 30),
    videos: (p.videos ?? []).map((v) => ({ url: url(v.url), title: txt(v.title, 120) })).filter((v) => v.url).slice(0, 10),
    prices: (p.prices ?? []).map((x) => ({ label: txt(x.label, 120), price: txt(x.price, 40), note: txt(x.note, 300) })).filter((x) => x.label || x.price).slice(0, 30),
    workouts: (p.workouts ?? []).map((w) => ({ title: txt(w.title, 140), body: txt(w.body, 6000), link: url(w.link) })).filter((w) => w.title).slice(0, 30),
    sections: (p.sections ?? []).map((s) => ({ heading: txt(s.heading, 120), body: txt(s.body, 6000) })).filter((s) => s.heading && s.body).slice(0, 15),
    reviews: (p.reviews ?? []).map((r) => ({
      author: txt(r.author, 80), body: txt(r.body, 3000),
      rating: r.rating != null && Number(r.rating) >= 1 && Number(r.rating) <= 5 ? Math.round(Number(r.rating)) : null,
      source: txt(r.source, 80), date: date(r.date) ?? "",
    })).filter((r) => r.body).slice(0, 100),
    taking_clients: (["yes", "waitlist", "no"] as const).find((x) => x === p.taking_clients) ?? null,
    enquiry_email: EMAIL.test(txt(p.enquiry_email, 200)) ? txt(p.enquiry_email, 200) : null,
    whatsapp: txt(p.whatsapp, 30) || null,
    prices_updated_at: date(p.prices_updated_at),
    taking_clients_updated_at: date(p.taking_clients_updated_at),
    updated_at: new Date().toISOString(),
  };
  // Dates shown on the page move on by themselves whenever the prices or availability change.
  if (JSON.stringify(before?.prices ?? []) !== JSON.stringify(row.prices) && row.prices.length) row.prices_updated_at = today();
  if ((before?.taking_clients ?? null) !== row.taking_clients) row.taking_clients_updated_at = row.taking_clients ? today() : null;

  const { error } = await db.from("paid_profiles").upsert(row);
  if (error) return { ok: false, error: `Couldn’t save: ${error.message}. Has the paid-profiles SQL been run in Supabase?` };
  await refreshPaidFlag(trainerId); // main photo onto their search cards
  revalidatePath(`/trainers/${t.slug}`);
  return { ok: true, savedAt: row.updated_at };
}

export type UploadTarget = { path: string; token: string; publicUrl: string };

/** Short-lived links that let ed's browser upload photos straight to storage (big files never pass through Vercel). */
export async function createUploadTargets(trainerId: string, kinds: string[]): Promise<{ targets?: UploadTarget[]; error?: string }> {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) return { error: "Database not connected." };
  const ext: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const targets: UploadTarget[] = [];
  for (const k of kinds.slice(0, 30)) {
    const e = ext[k];
    if (!e) return { error: "Only JPG, PNG and WebP photos can be uploaded." };
    const path = `gallery/${trainerId}/${randomUUID()}.${e}`;
    const { data, error } = await db.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
    if (error || !data) return { error: `Storage isn’t ready: ${error?.message ?? "unknown"}. Has the paid-profiles SQL been run?` };
    targets.push({ path, token: data.token, publicUrl: `${supabaseUrl()}/storage/v1/object/public/${MEDIA_BUCKET}/${path}` });
  }
  return { targets };
}

/** Switch a trainer's paid page on or off by hand, e.g. if they paid another way. */
export async function setManualPaid(trainerId: string, on: boolean): Promise<void> {
  await requireAdmin();
  const db = getAdminDb()!;
  const paid = await refreshPaidFlag(trainerId, on);
  const { data: t } = await db.from("trainers").select("slug").eq("id", trainerId).maybeSingle();
  if (t) revalidatePath(`/trainers/${t.slug}`);
  redirect(`/admin/paid/${t?.slug}?saved=${paid ? "on" : "off"}`);
}

/** For a payment made through the general /join link: say which listing it belongs to. */
export async function linkSubscription(subId: string, form: FormData): Promise<void> {
  await requireAdmin();
  const db = getAdminDb()!;
  const raw = txt(form.get("listing"), 300);
  const slug = raw.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/?trainers\//, "").replace(/[/?#].*$/, "");
  const { data: t } = await db.from("trainers").select("id, slug").eq("slug", slug).maybeSingle();
  if (!t) redirect(`/admin?tab=paid&msg=${encodeURIComponent(`No listing found for “${raw}”. Paste their profile address.`)}`);
  await db.from("subscriptions").update({ trainer_id: t!.id }).eq("id", subId);
  await refreshPaidFlag(t!.id);
  revalidatePath(`/trainers/${t!.slug}`);
  redirect(`/admin/paid/${t!.slug}`);
}

/** Reads every subscription from Stripe and brings our records up to date (a safety net for the webhook). */
export async function checkStripeAction(): Promise<void> {
  await requireAdmin();
  const stripe = getStripe();
  let msg = "Stripe isn’t connected (STRIPE_SECRET_KEY missing).";
  if (stripe) {
    try {
      let n = 0;
      for await (const sub of stripe.subscriptions.list({ status: "all", limit: 100, expand: ["data.customer"] })) {
        await syncSubscription(sub);
        if (++n >= 3000) break;
      }
      msg = `Checked ${n} subscription${n === 1 ? "" : "s"} with Stripe. Everything is up to date.`;
    } catch (e) {
      msg = `Stripe check failed: ${(e as Error).message}`.slice(0, 300);
    }
  }
  redirect(`/admin?tab=paid&msg=${encodeURIComponent(msg)}`);
}



/**
 * A hidden, clearly labelled test trainer so ed can see a paid page from both sides.
 * status "hidden": never in search, town pages, the sitemap or Google. Only ed (logged in) can open it.
 */
export async function createDemoAction(): Promise<void> {
  await requireAdmin();
  const db = getAdminDb()!;
  const { data: existing } = await db.from("trainers").select("id").eq("slug", DEMO_SLUG).maybeSingle();
  let id = existing?.id as string | undefined;
  if (!id) {
    const { data, error } = await db.from("trainers").insert({
      slug: DEMO_SLUG,
      name: "Demo Trainer (test only)",
      business_name: "Demo Trainer (test only)",
      headline: "A pretend trainer for testing paid profiles. Not a real person.",
      bio: "This is a hidden test listing. Only you can see it while you're logged in to admin.",
      city: "Kendal",
      region: "Cumbria",
      in_person: true,
      online: true,
      home_visits: true,
      years_experience: 6,
      qualifications: ["Level 3 Personal Trainer (example)"],
      source: "demo",
      is_sample: true,
      status: "hidden",
    }).select("id").single();
    if (error) redirect(`/admin?tab=paid&msg=${encodeURIComponent(`Couldn’t make the demo: ${error.message}`)}`);
    id = data!.id as string;
    await db.from("trainer_styles").insert([{ trainer_id: id, style_slug: "strength" }, { trainer_id: id, style_slug: "pilates" }]);
    await db.from("trainer_goals").insert([{ trainer_id: id, goal_slug: "general-fitness" }, { trainer_id: id, goal_slug: "pre-post-natal" }]);
  }
  await db.from("paid_profiles").upsert({
    trainer_id: id,
    about: "TEST PROFILE. This is where a paying trainer's own words go: who they are, how they train and who they love working with.\n\nEverything on this page was added from your admin editor. Try changing it, uploading a photo or two, and sending yourself an enquiry.",
    prices: [
      { label: "1-to-1 session, 60 minutes (example)", price: "£40", note: "Block of 10 for £360" },
      { label: "Small group, up to 4 (example)", price: "£15", note: "" },
    ],
    prices_updated_at: new Date().toISOString().slice(0, 10),
    workouts: [{ title: "20-minute starter workout (example)", body: "3 rounds:\n10 goblet squats\n10 press-ups (knees are fine)\n20-second plank\nRest 60 seconds between rounds.", link: "" }],
    sections: [],
    reviews: [{ author: "Example client", body: "This is an example review, only on the test profile. Real reviews come word for word from real clients.", rating: 5, source: "Example", date: new Date().toISOString().slice(0, 10) }],
    taking_clients: "yes",
    taking_clients_updated_at: new Date().toISOString().slice(0, 10),
    enquiry_email: process.env.ADMIN_NOTIFY_EMAIL ?? null,
    updated_at: new Date().toISOString(),
  });
  await refreshPaidFlag(id, true);
  redirect(`/admin/paid/${DEMO_SLUG}`);
}

/** Deletes the demo trainer and everything attached to it. Refuses to touch any real listing. */
export async function deleteDemoAction(): Promise<void> {
  await requireAdmin();
  const db = getAdminDb()!;
  const { data: t } = await db.from("trainers").select("id, source, status").eq("slug", DEMO_SLUG).maybeSingle();
  if (t && t.source === "demo" && t.status === "hidden") {
    const { data: files } = await db.storage.from(MEDIA_BUCKET).list(`gallery/${t.id}`);
    if (files?.length) await db.storage.from(MEDIA_BUCKET).remove(files.map((f) => `gallery/${t.id}/${f.name}`));
    await db.from("subscriptions").delete().eq("trainer_id", t.id);
    await db.from("trainers").delete().eq("id", t.id); // paid page, enquiries and styles go with it
  }
  redirect(`/admin?tab=paid&msg=${encodeURIComponent("Demo profile deleted.")}`);
}
