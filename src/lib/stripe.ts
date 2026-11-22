import Stripe from "stripe";

// Server-only. The secret key lives in Vercel env vars, never in the browser or the repo.
let client: Stripe | null = null;
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

export const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
export const ORDER_ID = /^[a-f0-9-]{36}$/;

export type OrderCheck =
  | { status: "ok"; slug: string; email?: string | null }
  | { status: "non-uk"; email?: string | null }
  | { status: "not-found" };

/**
 * Checks a paid order. Sales are UK only (avoids EU VAT on digital goods), so a paid order
 * with a non-UK billing address is refunded in full, once, and no download is given.
 */
export async function checkOrder(stripe: Stripe, ref: { sessionId?: string; order?: string }): Promise<OrderCheck> {
  let pi: Stripe.PaymentIntent | null = null;
  let country: string | null | undefined;
  let email: string | null | undefined;
  let slug: string | undefined;

  if (ref.sessionId && SESSION_ID.test(ref.sessionId)) {
    const s = await stripe.checkout.sessions.retrieve(ref.sessionId, { expand: ["payment_intent.latest_charge"] });
    if (s.payment_status !== "paid") return { status: "not-found" };
    pi = s.payment_intent as Stripe.PaymentIntent | null;
    country = s.customer_details?.address?.country;
    email = s.customer_details?.email;
    slug = s.metadata?.product;
  } else if (ref.order && ORDER_ID.test(ref.order)) {
    const res = await stripe.paymentIntents.search({ query: `metadata['order']:'${ref.order}' AND status:'succeeded'`, limit: 1 });
    if (!res.data[0]) return { status: "not-found" };
    pi = await stripe.paymentIntents.retrieve(res.data[0].id, { expand: ["latest_charge"] });
    const charge = pi.latest_charge as Stripe.Charge | null;
    country = charge?.billing_details?.address?.country;
    email = charge?.billing_details?.email;
    slug = pi.metadata?.product;
  } else {
    return { status: "not-found" };
  }

  const charge = pi?.latest_charge as Stripe.Charge | null | undefined;
  if (!pi || !slug || charge?.refunded) return country && country !== "GB" ? { status: "non-uk", email } : { status: "not-found" };

  if (country !== "GB") {
    // Idempotency key means a refresh or a second click never refunds twice.
    await stripe.refunds.create({ payment_intent: pi.id, reason: "requested_by_customer" }, { idempotencyKey: `uk-only-${pi.id}` });
    return { status: "non-uk", email };
  }
  return { status: "ok", slug, email };
}
