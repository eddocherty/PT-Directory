import "server-only";
import { NextResponse } from "next/server";
import { getStripe, profilePriceId } from "./stripe";

/** Sends a trainer to Stripe to start their £10 a month profile. */
export async function startCheckout(req: Request, trainer: { id: string; slug: string; name: string } | null) {
  const origin = new URL(req.url).origin;
  const stripe = getStripe();
  if (!stripe) return NextResponse.redirect(`${origin}/join/thanks?error=not-ready`, 303);
  const meta: Record<string, string> = trainer ? { trainer_id: trainer.id, trainer_slug: trainer.slug } : {};
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: await profilePriceId(stripe), quantity: 1 }],
      metadata: meta,
      subscription_data: { metadata: meta, description: trainer ? `LocalPT profile: ${trainer.name}` : "LocalPT profile" },
      client_reference_id: trainer?.id,
      allow_promotion_codes: false,
      custom_text: {
        submit: { message: trainer ? `£10 a month for ${trainer.name}’s LocalPT profile. Cancel any time.` : "£10 a month for your LocalPT profile. Cancel any time." },
      },
      success_url: `${origin}/join/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: trainer ? `${origin}/trainers/${trainer.slug}` : origin,
    });
    return NextResponse.redirect(session.url!, 303);
  } catch (e) {
    console.error("Stripe subscription checkout failed", e);
    return NextResponse.redirect(`${origin}/join/thanks?error=stripe`, 303);
  }
}
