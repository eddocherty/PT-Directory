import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { SITE_NAME } from "@/lib/site";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// The shop's "Buy" form posts here. We create a Stripe Checkout session and send the buyer to it.
export async function POST(req: Request) {
  const form = await req.formData();
  const slug = String(form.get("slug") ?? "");
  const product = getProduct(slug);
  const origin = new URL(req.url).origin;
  const back = (error: string) => NextResponse.redirect(`${origin}/shop/${encodeURIComponent(slug)}?error=${error}`, 303);

  if (!product) return NextResponse.redirect(`${origin}/shop`, 303);
  if (form.get("consent") !== "yes") return back("consent");
  if (form.get("uk") !== "yes") return back("uk");
  const stripe = getStripe();
  if (!stripe) return back("not-ready");

  // A random order id, kept in Stripe metadata. It goes in the receipt email so buyers can download again later.
  const order = randomUUID();
  const downloadUrl = `${origin}/api/download?order=${order}`;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: product.price,
          product_data: {
            name: `${product.name} (PDF)`,
            description: product.description,
            images: origin.startsWith("https://") ? [`${origin}/shop/${product.slug}-cover.jpg`] : undefined,
          },
        },
      }],
      metadata: { product: product.slug, order },
      payment_intent_data: { metadata: { product: product.slug, order } },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Thanks for buying ${product.name} from ${SITE_NAME}. Download your PDF here: ${downloadUrl}`,
          metadata: { product: product.slug, order },
        },
      },
      // UK only: we check the billing country after payment and refund anything outside the UK.
      billing_address_collection: "required",
      allow_promotion_codes: true,
      custom_text: {
        submit: { message: "UK customers only. Your PDF download starts straight after payment, and we email you a link." },
      },
      success_url: `${origin}/shop/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/${product.slug}`,
    });
    return NextResponse.redirect(session.url!, 303);
  } catch (e) {
    console.error("Stripe checkout failed", e);
    return back("stripe");
  }
}
