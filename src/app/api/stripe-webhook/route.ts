import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { syncSubscription } from "@/lib/subscriptions";
import { notifyEd } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe tells us when a trainer subscribes, changes or cancels. Needs STRIPE_WEBHOOK_SECRET in Vercel.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  try {
    let subId: string | null = null;
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.mode === "subscription" && s.subscription) subId = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
    } else if (event.type.startsWith("customer.subscription.")) {
      subId = (event.data.object as Stripe.Subscription).id;
    }
    if (subId) {
      // Always read the latest copy, so events arriving out of order can't undo each other.
      const sub = await stripe.subscriptions.retrieve(subId, { expand: ["customer"] });
      const r = await syncSubscription(sub);
      if (event.type === "checkout.session.completed") await notifyEd.newSubscriber(sub, r.trainerId);
      if (event.type === "customer.subscription.deleted") await notifyEd.cancelled(sub, r.trainerId);
    }
  } catch (e) {
    console.error("stripe webhook", event.type, e);
    return NextResponse.json({ error: "sync failed" }, { status: 500 }); // Stripe retries
  }
  return NextResponse.json({ received: true });
}
