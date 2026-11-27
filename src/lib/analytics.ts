import "server-only";
import { createHash, createHmac } from "node:crypto";
import { getAdminDb } from "./admin-db";
import { ADMIN_COOKIE, MINE_COOKIE, isMineValue, isValidSession } from "./admin-auth";
import { BRAND } from "@/brand";

/**
 * Privacy-friendly, first-party analytics. No cookies, no IP addresses stored.
 * A visitor is identified only within one day, by hashing IP + browser with a salt
 * that changes daily (the same approach Plausible and Fathom use).
 *
 * Every row is tagged real / internal / bot, so the dashboard can show real visitors on their own:
 *   internal = ed's own browsers (logged in to /admin, or marked "this device is mine"),
 *              Claude's built-in browser, and any address other than the live domain (previews, localhost)
 *   bot      = crawlers and automated or headless browsers (including Claude's own test runs)
 */

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|axios|node-fetch|facebookexternalhit|embedly|vercel-screenshot/i;

export type TrackInput = {
  kind: "pageview" | "contact";
  path: string;
  referrer?: string | null;
  trainerSlug?: string | null;
  detail?: string | null;
  headers: Headers;
  /** The page reported navigator.webdriver (Playwright, Selenium and similar always set it). */
  automated?: boolean;
};

export type Traffic = { traffic: "real" | "internal" | "bot"; reason: string | null };

function cookie(headers: Headers, name: string): string | undefined {
  for (const part of (headers.get("cookie") ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

export function classify(headers: Headers, automated = false): Traffic {
  const ua = headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return { traffic: "bot", reason: "bot" };
  if (automated) return { traffic: "bot", reason: "automated" };
  if (isValidSession(cookie(headers, ADMIN_COOKIE))) return { traffic: "internal", reason: "admin" };
  if (isMineValue(cookie(headers, MINE_COOKIE))) return { traffic: "internal", reason: "my-device" };
  // Claude's built-in browser (in the Claude desktop app) says "Claude/<version>" in its user agent.
  if (/\bClaude\/\d/.test(ua)) return { traffic: "internal", reason: "claude-browser" };
  const host = (headers.get("x-forwarded-host") ?? headers.get("host") ?? "").split(":")[0].replace(/^www\./, "");
  if (host && host !== BRAND.domain) return { traffic: "internal", reason: "preview" };
  return { traffic: "real", reason: null };
}


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
  const { traffic, reason } = classify(e.headers, e.automated);
  // Requests with no browser at all aren't worth a row.
  if (!ua) return;
  if (e.headers.get("purpose") === "prefetch" || e.headers.get("x-purpose") === "preview") return;

  const path = (e.path.split(/[?#]/)[0] || "/").slice(0, 300);
  if (path.startsWith("/admin") || path.startsWith("/api")) return;

  const slug = e.trainerSlug ?? path.match(/^\/trainers\/([^/]+)$/)?.[1] ?? null;
  const trainer_id = slug ? await trainerIdFor(decodeURIComponent(slug)) : null;
  const ip = (e.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || e.headers.get("x-real-ip") || "";

  const row = {
    kind: e.kind,
    path,
    referrer_host: e.kind === "pageview" ? referrerHost(e.referrer, e.headers.get("host")) : null,
    trainer_id,
    detail: e.detail ? e.detail.slice(0, 40) : null,
    visitor_hash: visitorHash(ip, ua),
    country: e.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null,
    device: device(ua),
  };
  let { error } = await db.from("analytics_events").insert({ ...row, traffic, reason });
  // Until the traffic columns exist in Supabase, keep the old behaviour: store real visits only.
  if (error && /traffic|reason/.test(error.message)) {
    if (traffic !== "real") return;
    ({ error } = await db.from("analytics_events").insert(row));
  }
  if (error) console.error("analytics insert:", error.message);
}
