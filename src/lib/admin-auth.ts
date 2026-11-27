import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminDb } from "./admin-db";

/**
 * Admin login. Three env vars (set in Vercel, never in the repo):
 *   ADMIN_USERNAME        the admin ID
 *   ADMIN_PASSWORD_HASH   "scrypt:<salt hex>:<hash hex>", made with scripts/hash-admin-password.mjs.
 *                         Once ed changes his password in /admin/password, the hash in the
 *                         admin_credentials table is used instead and this is only a fallback.
 *   ADMIN_SESSION_SECRET  long random string used to sign the session cookie
 * The session is a signed, httpOnly, secure cookie that lasts 7 days.
 */
export const ADMIN_COOKIE = "tl_admin";
const SESSION_DAYS = 7;

export function adminConfigured(): boolean {
  return !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH && (process.env.ADMIN_SESSION_SECRET ?? "").length >= 32);
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The password hash in use: the one ed set in the admin area, else the env var. */
async function currentPasswordHash(): Promise<string> {
  const db = getAdminDb();
  if (db) {
    const { data, error } = await db.from("admin_credentials").select("password_hash").eq("id", 1).maybeSingle();
    if (!error && data?.password_hash) return data.password_hash as string;
  }
  return process.env.ADMIN_PASSWORD_HASH ?? "";
}

function passwordMatches(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  return safeEqual(scryptSync(password, Buffer.from(saltHex, "hex"), expected.length), expected);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 32).toString("hex")}`;
}

export async function checkPassword(password: string): Promise<boolean> {
  return adminConfigured() && passwordMatches(password, await currentPasswordHash());
}

export async function checkCredentials(username: string, password: string): Promise<boolean> {
  if (!adminConfigured()) return false;
  const pwOk = passwordMatches(password, await currentPasswordHash());
  // Check both, always, so timing doesn't reveal which one was wrong.
  const userOk = safeEqual(
    createHmac("sha256", "u").update(username.trim().toLowerCase()).digest(),
    createHmac("sha256", "u").update(process.env.ADMIN_USERNAME!.trim().toLowerCase()).digest(),
  );
  return pwOk && userOk;
}

function sign(payload: string): string {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(payload).digest("base64url");
}

export function makeSessionValue(): string {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  const payload = `${exp}.${process.env.ADMIN_USERNAME}`;
  return `${exp}.${sign(payload)}`;
}

export function isValidSession(value: string | undefined): boolean {
  if (!value || !adminConfigured()) return false;
  const [expStr, sig] = value.split(".");
  const exp = Number(expStr);
  if (!exp || exp < Date.now() || !sig) return false;
  return safeEqual(Buffer.from(sig), Buffer.from(sign(`${exp}.${process.env.ADMIN_USERNAME}`)));
}

export async function isAdmin(): Promise<boolean> {
  return isValidSession((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Call at the top of every admin page and admin server action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/**
 * "This device is mine": a signed, long-lived cookie that only ed's own browsers get (on admin login,
 * or from the switch on /admin). Page views from a browser that has it are counted as internal,
 * not as real visitors. Members of the public never get this cookie.
 */
export const MINE_COOKIE = "lpt_mine";
const MINE_DAYS = 400; // the longest browsers allow

export function makeMineValue(): string {
  const exp = Date.now() + MINE_DAYS * 86400_000;
  return `${exp}.${sign(`mine.${exp}`)}`;
}

export function isMineValue(value: string | undefined): boolean {
  if (!value || !adminConfigured()) return false;
  const [expStr, sig] = value.split(".");
  const exp = Number(expStr);
  if (!exp || exp < Date.now() || !sig) return false;
  return safeEqual(Buffer.from(sig), Buffer.from(sign(`mine.${exp}`)));
}

export const mineCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MINE_DAYS * 86400,
};

export async function isMyDevice(): Promise<boolean> {
  return isMineValue((await cookies()).get(MINE_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_DAYS * 86400,
};
