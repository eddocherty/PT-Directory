import "server-only";
import { BRAND } from "@/brand";

/**
 * Sends email through Resend (resend.com). Two env vars in Vercel:
 *   RESEND_API_KEY   the API key
 *   EMAIL_FROM       e.g. "LocalPT <enquiries@localpt.co.uk>" (the domain must be verified in Resend)
 * Without them nothing is sent, and enquiries simply wait in /admin as before.
 */
export const emailConfigured = () => !!process.env.RESEND_API_KEY;

export async function sendEmail(m: { to: string; subject: string; text: string; replyTo?: string }): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "Email isn’t set up yet (RESEND_API_KEY missing)." };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? `${BRAND.name} <enquiries@${BRAND.domain}>`,
        to: [m.to],
        subject: m.subject,
        text: m.text,
        ...(m.replyTo ? { reply_to: m.replyTo } : {}),
      }),
    });
    if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
