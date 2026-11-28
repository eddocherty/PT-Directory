import "server-only";
import type Stripe from "stripe";
import { getAdminDb } from "./admin-db";
import { PAID_STATUSES } from "./stripe";

/**
 * Copies one Stripe subscription into our database and switches the trainer's profile on or off.
 * Called by the Stripe webhook, by the thank-you page and by the "Check Stripe" button in /admin,
 * so it is safe to run any number of times.
 */
export async function syncSubscription(sub: Stripe.Subscription): Promise<{ trainerId: string | null; paid: boolean }> {
  const db = getAdminDb();
  if (!db) throw new Error("SUPABASE_SERVICE_ROLE_KEY isn’t set.");
  const customer = typeof sub.customer === "string" ? null : (sub.customer as Stripe.Customer | Stripe.DeletedCustomer);
  const email = customer && !customer.deleted ? customer.email : null;
  const name = customer && !customer.deleted ? customer.name : null;
  const periodEnd = sub.items?.data?.[0]?.current_period_end;

  // Which trainer: the one in the link they paid through, or whoever ed has linked it to since.
  const { data: existing } = await db.from("subscriptions").select("trainer_id").eq("stripe_subscription_id", sub.id).maybeSingle();
  let trainerId: string | null = (existing?.trainer_id as string | null) ?? null;
  if (!trainerId && sub.metadata?.trainer_id) {
    const { data: t } = await db.from("trainers").select("id").eq("id", sub.metadata.trainer_id).maybeSingle();
    trainerId = (t?.id as string | null) ?? null;
  }

  const row = {
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    trainer_id: trainerId,
    status: sub.status,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
    ...(email ? { email } : {}),
    ...(name ? { name } : {}),
  };
  const { error } = await db.from("subscriptions").upsert(row, { onConflict: "stripe_subscription_id" });
  if (error) throw new Error(`Saving the subscription failed: ${error.message}`);

  const paid = PAID_STATUSES.has(sub.status);
  if (trainerId) await refreshPaidFlag(trainerId);
  return { trainerId, paid };
}

/**
 * A trainer is paid while any of their subscriptions is live, or while ed has switched them on by hand
 * (paid_manual, e.g. paid by bank transfer). Their main photo shows on cards only while paid.
 */
export async function refreshPaidFlag(trainerId: string, manual?: boolean): Promise<boolean> {
  const db = getAdminDb()!;
  const [{ data: subs }, { data: t }, { data: p }] = await Promise.all([
    db.from("subscriptions").select("status").eq("trainer_id", trainerId),
    db.from("trainers").select("is_paid, paid_since, paid_manual").eq("id", trainerId).maybeSingle(),
    db.from("paid_profiles").select("gallery").eq("trainer_id", trainerId).maybeSingle(),
  ]);
  if (!t) return false;
  const isManual = manual ?? (t.paid_manual === true);
  const paid = isManual || (subs ?? []).some((s) => PAID_STATUSES.has(s.status as string));
  const photo = paid ? ((p?.gallery as string[] | undefined)?.[0] ?? null) : null;
  await db.from("trainers").update({
    is_paid: paid,
    paid_manual: isManual,
    paid_since: paid ? (t.paid_since ?? new Date().toISOString()) : null,
    image_url: photo,
  }).eq("id", trainerId);
  return paid;
}
