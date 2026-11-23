import "server-only";
import { createHash, createHmac } from "node:crypto";
import { getAdminDb } from "./admin-db";

/**
 * Privacy-friendly, first-party analytics. No cookies, no IP addresses stored.
 * A visitor is identified only within one day, by hashing IP + browser with a salt
 * that changes daily (the same approach Plausible and Fathom use).
 */

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|axios|node-fetch|facebookexternalhit|embedly|vercel-screenshot/i;

export type TrackInput = {
  kind: "pageview" | "contact";
  path: string;
  referrer?: string | null;
  trainerSlug?: string | null;
  detail?: string | null;
  headers: Headers;
};

function device(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|kindle|silk|playbook/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function visitorHash(ip: string, ua: string): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !ip) return null;
  const day = new Date().toISOString().slice(0, 10);
  const salt = createHmac("sha256", secret).update(`visitor-salt:${day}`).digest("hex");
  return createHash("sha256").update(`${salt}|${ip}|${ua}`).digest("hex").slice(0, 20);
}

function referrerHost(referrer: string | null | undefined, ownHost: string | null): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host || (ownHost && host === ownHost.replace(/^www\./, "").split(":")[0])) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

const trainerIds = new Map<string, string | null>();
async function trainerIdFor(slug: string): Promise<string | null> {
  if (trainerIds.has(slug)) return trainerIds.get(slug)!;
  const db = getAdminDb();
  if (!db) return null;
  const { data } = await db.from("trainers").select("id").eq("slug", slug).maybeSingle();
  const id = data?.id ?? null;
  if (trainerIds.size > 5000) trainerIds.clear();
  trainerIds.set(slug, id);
  return id;
}

export async function recordEvent(e: TrackInput): Promise<void> {
  const db = getAdminDb();
  if (!db) return;
  const ua = e.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return;
  if (e.headers.get("purpose") === "prefetch" || e.headers.get("x-purpose") === "preview") return;

  const path = (e.path.split(/[?#]/)[0] || "/").slice(0, 300);
  if (path.startsWith("/admin") || path.startsWith("/api")) return;

  const slug = e.trainerSlug ?? path.match(/^\/trainers\/([^/]+)$/)?.[1] ?? null;
  const trainer_id = slug ? await trainerIdFor(decodeURIComponent(slug)) : null;
  const ip = (e.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || e.headers.get("x-real-ip") || "";

  const { error } = await db.from("analytics_events").insert({
    kind: e.kind,
    path,
    referrer_host: e.kind === "pageview" ? referrerHost(e.referrer, e.headers.get("host")) : null,
    trainer_id,
    detail: e.detail ? e.detail.slice(0, 40) : null,
    visitor_hash: visitorHash(ip, ua),
    country: e.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null,
    device: device(ua),
  });
  if (error) console.error("analytics insert:", error.message);
}
