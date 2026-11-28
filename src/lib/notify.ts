import "server-only";
import type Stripe from "stripe";
import { BRAND } from "@/brand";
import { getAdminDb } from "./admin-db";
import { sendEmail } from "./email";

// Emails ed when a trainer subscribes or cancels. Goes to ADMIN_NOTIFY_EMAIL (set in Vercel).
// Stripe also emails him about every payment, so this is a convenience, never the only record.
async function send(subject: string, lines: (string | null)[]) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) return;
  await sendEmail({ to, subject, text: lines.filter((l) => l !== null).join("\n") }).catch(() => {});
}

async function trainerName(id: string | null) {
  if (!id) return null;
  const { data } = await getAdminDb()!.from("trainers").select("name, slug").eq("id", id).maybeSingle();
  return data as { name: string; slug: string } | null;
}

function who(sub: Stripe.Subscription) {
  const c = typeof sub.customer === "string" ? null : (sub.customer as Stripe.Customer);
  return [c?.name, c?.email].filter(Boolean).join(", ") || "Unknown customer";
}

export const notifyEd = {
  async newSubscriber(sub: Stripe.Subscription, trainerId: string | null) {
    const t = await trainerName(trainerId);
    await send(`New £10 subscriber: ${t?.name ?? who(sub)}`, [
      `${who(sub)} just subscribed.`,
      t ? `Listing: https://${BRAND.domain}/trainers/${t.slug}` : "They paid through the general link, so link them to a listing in /admin > Paid profiles.",
      ``,
      `Get in touch to ask what they want on their page, then add it in /admin > Paid profiles.`,
    ]);
  },
  async cancelled(sub: Stripe.Subscription, trainerId: string | null) {
    const t = await trainerName(trainerId);
    await send(`Subscription cancelled: ${t?.name ?? who(sub)}`, [
      `${who(sub)} has cancelled. Their page is back to a free listing (their extras are kept in case they return).`,
      t ? `Listing: https://${BRAND.domain}/trainers/${t.slug}` : null,
    ]);
  },
};
