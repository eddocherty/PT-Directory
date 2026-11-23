import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Admin login. Three env vars (set in Vercel, never in the repo):
 *   ADMIN_USERNAME        the admin ID
 *   ADMIN_PASSWORD_HASH   "scrypt:<salt hex>:<hash hex>", made with scripts/hash-admin-password.mjs
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

export function checkCredentials(username: string, password: string): boolean {
  if (!adminConfigured()) return false;
  const [scheme, saltHex, hashHex] = (process.env.ADMIN_PASSWORD_HASH ?? "").split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  // Check both, always, so timing doesn't reveal which one was wrong.
  const userOk = safeEqual(
    createHmac("sha256", "u").update(username.trim().toLowerCase()).digest(),
    createHmac("sha256", "u").update(process.env.ADMIN_USERNAME!.trim().toLowerCase()).digest(),
  );
  return safeEqual(actual, expected) && userOk;
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

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_DAYS * 86400,
};
