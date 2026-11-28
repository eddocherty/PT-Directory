import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/brand";
import { CONTACT_EMAIL } from "@/lib/site";
import { SESSION_ID, getStripe } from "@/lib/stripe";
import { syncSubscription } from "@/lib/subscriptions";
import { getAdminDb } from "@/lib/admin-db";

export const metadata: Metadata = { title: "Welcome", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Where Stripe sends a trainer after they subscribe. Switches their profile on straight away
// (the webhook does the same, this just means it never waits for it).
export default async function JoinThanks({ searchParams }: { searchParams: Promise<{ session_id?: string; error?: string }> }) {
  const { session_id = "", error } = await searchParams;
  const stripe = getStripe();
  let ok = false;
  let trainer = null as { name: string; slug: string } | null;
  if (stripe && SESSION_ID.test(session_id)) {
    try {
      const s = await stripe.checkout.sessions.retrieve(session_id, { expand: ["subscription.customer"] });
      if (s.mode === "subscription" && s.status === "complete" && s.subscription && typeof s.subscription !== "string") {
        const r = await syncSubscription(s.subscription);
        ok = true;
        if (r.trainerId) {
          const { data } = await getAdminDb()!.from("trainers").select("name, slug").eq("id", r.trainerId).maybeSingle();
          trainer = data as typeof trainer;
        }
      }
    } catch (e) {
      console.error("join thanks", e);
    }
  }

  if (!ok) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="display text-4xl">{error ? "That didn’t go through" : "Nothing to show here"}</h1>
        <p className="mt-4 text-muted">
          {error ? "Payments aren’t working right now, and you haven’t been charged. " : ""}
          Email <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we’ll sort it out.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <p className="eyebrow text-accent">{BRAND.name} profile</p>
      <h1 className="display mt-2 text-5xl">You’re in. Thank you.</h1>
      <p className="mt-6 text-lg">
        We’ll be in touch very soon to ask what you’d like on your page: photos, videos, client reviews, prices,
        workouts, anything you like. Then we’ll build it for you and keep it fresh.
      </p>
      <p className="mt-4">
        Can’t wait? Email <a className="font-semibold underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with
        whatever you have to hand.
      </p>
      <p className="mt-4 text-sm text-muted">Stripe has emailed you a receipt. It’s £10 a month and you can cancel any time.</p>
      {trainer && <Link href={`/trainers/${trainer.slug}`} className="btn mt-8">See your page</Link>}
    </div>
  );
}
