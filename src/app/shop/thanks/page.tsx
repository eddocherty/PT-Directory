import type { Metadata } from "next";
import Link from "next/link";
import { getProduct } from "@/lib/products";
import { CONTACT_EMAIL } from "@/lib/site";
import { checkOrder, getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Thanks({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id = "" } = await searchParams;
  const stripe = getStripe();
  let product;
  let email: string | null | undefined;
  let nonUk = false;
  if (stripe && session_id) {
    try {
      const res = await checkOrder(stripe, { sessionId: session_id });
      if (res.status === "ok") product = getProduct(res.slug);
      nonUk = res.status === "non-uk";
      if (res.status !== "not-found") email = res.email;
    } catch (e) {
      console.error("Stripe lookup failed", e);
    }
  }

  if (nonUk) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="display text-4xl">Sorry, UK customers only</h1>
        <p className="mt-4 text-muted">
          Our plans are only available to buyers with a UK billing address, so we’ve refunded your payment in full.
          It usually shows on your statement within 5 to 10 working days.
          Questions? Email <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
        <Link href="/online" className="btn mt-8">Find an online coach instead</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="display text-4xl">We couldn’t find that order</h1>
        <p className="mt-4 text-muted">
          If you’ve just paid, give it a moment and refresh this page. Your receipt email also has a download link.
          Still stuck? Email <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we’ll sort it.
        </p>
        <Link href="/shop" className="btn mt-8">Back to the shop</Link>
      </div>
    );
  }

  return (
    <>
      <section className="bg-soft">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="eyebrow text-accent">Payment received</p>
          <h1 className="display mt-3 text-4xl sm:text-6xl">You’re all set.</h1>
          <p className="mt-4 text-lg text-muted">Thanks for buying <strong className="text-ink">{product.name}</strong>. Your PDF is ready.</p>
          <a href={`/api/download?session_id=${encodeURIComponent(session_id)}`} className="btn mt-8 text-lg">Download your PDF</a>
          <p className="mt-4 text-sm text-muted">
            {email ? <>We’ve also emailed a receipt to {email} with a link to download it again.</> : <>Your receipt email also has a link to download it again.</>}
            {" "}Please keep it for your personal use.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl bg-accent p-8 text-paper">
          <h2 className="display text-3xl">Want someone in your corner?</h2>
          <p className="mt-2 text-paper/80">Work through your plan, then find a local personal trainer to build on it with a programme made just for you.</p>
          <Link href={product.goal ? `/specialisms/${product.goal}` : "/trainers"} className="btn-light mt-5">Find a local PT</Link>
        </div>
      </section>
    </>
  );
}
