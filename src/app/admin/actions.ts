"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, MINE_COOKIE, adminConfigured, makeMineValue, mineCookieOptions, checkCredentials, checkPassword, hashPassword, makeSessionValue, requireAdmin, sessionCookieOptions } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/admin-db";

export type LoginState = { error?: string; username?: string };

// Best-effort brute-force brake (per server instance): 5 failed tries per IP per 15 minutes.
const failures = new Map<string, { count: number; until: number }>();

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  if (!adminConfigured()) return { error: "Admin login isn’t set up yet. Add the ADMIN_ env vars in Vercel, then redeploy." };
  const ip = ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const f = failures.get(ip);
  if (f && f.until > now && f.count >= 5) return { error: "Too many attempts. Try again in 15 minutes.", username: String(form.get("username") ?? "").slice(0, 100) };

  const username = String(form.get("username") ?? "").slice(0, 100);
  const ok = await checkCredentials(username, String(form.get("password") ?? ""));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 700));
    const cur = f && f.until > now ? f : { count: 0, until: now + 15 * 60_000 };
    failures.set(ip, { count: cur.count + 1, until: cur.until });
    return { error: "That admin ID or password isn’t right.", username };
  }
  failures.delete(ip);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, makeSessionValue(), sessionCookieOptions);
  // Any browser ed logs in on is his, so its page views stop counting as real visitors.
  jar.set(MINE_COOKIE, makeMineValue(), mineCookieOptions);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/" });
  redirect("/admin/login");
}

/** The "This device is mine, don't count it" switch on the Traffic tab. */
export async function setMyDeviceAction(form: FormData): Promise<void> {
  await requireAdmin();
  const jar = await cookies();
  if (form.get("mine") === "1") jar.set(MINE_COOKIE, makeMineValue(), mineCookieOptions);
  else jar.delete({ name: MINE_COOKIE, path: "/" });
  redirect(`/admin?tab=overview&device=${form.get("mine") === "1" ? "on" : "off"}`);
}

export type OutreachUpdate = { status: string; notes: string; last_contacted: string | null };

function clean(u: OutreachUpdate) {
  return {
    status: String(u.status ?? "Not contacted").slice(0, 40),
    notes: String(u.notes ?? "").slice(0, 4000) || null,
    last_contacted: u.last_contacted && /^\d{4}-\d{2}-\d{2}$/.test(u.last_contacted) ? u.last_contacted : null,
    updated_at: new Date().toISOString(),
  };
}

export async function saveTrainerOutreach(trainerId: string, u: OutreachUpdate): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) return { ok: false, error: "Database not connected." };
  const { error } = await db.from("trainer_outreach").upsert({ trainer_id: trainerId, ...clean(u) });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function saveLeadOutreach(leadId: number, u: OutreachUpdate): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) return { ok: false, error: "Database not connected." };
  const { error } = await db.from("outreach_leads").update(clean(u)).eq("id", leadId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function setRequestStatus(id: string, status: "open" | "done" | "rejected"): Promise<void> {
  await requireAdmin();
  await getAdminDb()?.from("listing_requests").update({ status }).eq("id", id);
}

export type PasswordState = { ok?: boolean; error?: string };

export async function changePasswordAction(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) return { error: "Database not connected." };
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (!(await checkPassword(current))) {
    await new Promise((r) => setTimeout(r, 700));
    return { error: "Your current password isn’t right." };
  }
  if (next.length < 10) return { error: "Make the new password at least 10 characters. A short phrase works well." };
  if (next.length > 200) return { error: "That’s too long. Keep it under 200 characters." };
  if (next !== confirm) return { error: "The two new passwords don’t match." };
  if (next === current) return { error: "That’s the same as your current password." };
  const { error } = await db.from("admin_credentials").upsert({ id: 1, password_hash: hashPassword(next), updated_at: new Date().toISOString() });
  if (error) return { error: `Couldn’t save it: ${error.message}. Has the password SQL been run in Supabase?` };
  return { ok: true };
}

/** Admin button: tell Bing and other IndexNow engines about every page in the sitemap. */
export async function pingIndexNowAction(): Promise<void> {
  await requireAdmin();
  const { submitSitemapToIndexNow } = await import("@/lib/indexnow");
  const r = await submitSitemapToIndexNow();
  redirect(`/admin?indexnow=${encodeURIComponent(r.message)}`);
}
