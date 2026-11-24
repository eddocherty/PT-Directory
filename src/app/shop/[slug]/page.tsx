import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/Arrow";
import { notFound } from "next/navigation";
import { PlanCover } from "@/components/PlanCover";
import { PRODUCTS, formatPrice, getProduct } from "@/lib/products";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: `${p.name}: ${p.short}`, description: p.description, alternates: { canonical: `/shop/${p.slug}` } } : {};
}

const ERRORS: Record<string, string> = {
  uk: "Sorry, our plans are only available to UK customers.",
  consent: "Please tick the box to confirm you’d like your download straight away.",
  "not-ready": "Checkout isn’t switched on just yet. Please check back soon.",
  stripe: "Sorry, we couldn’t start checkout. Please try again in a moment.",
};

export default async function ProductPage({ params, searchParams }: Props) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const { error } = await searchParams;
  const others = PRODUCTS.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <Link href="/shop" className="text-sm font-medium text-muted hover:text-ink"><Arrow dir="left" className="mr-1 h-3.5 w-3.5" />All plans</Link>
        <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className="rounded-3xl bg-soft p-8">
            <PlanCover p={p} className="mx-auto max-w-sm" sizes="384px" eager />
          </div>
          <div>
            <p className="eyebrow text-accent">{p.short} · PDF</p>
            <h1 className="display mt-3 text-4xl sm:text-5xl">{p.name}</h1>
            <p className="mt-4 text-lg text-muted">{p.description}</p>
            <div className="mt-6 rounded-3xl border border-line p-6">
              <p className="eyebrow text-muted">What’s inside</p>
              <ul className="mt-3 space-y-2">
                {p.inside.map((i) => (
                  <li key={i} className="flex gap-3"><span className="text-accent">✓</span><span>{i}</span></li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">{p.pages} pages · {p.level} · Printable A4 PDF</p>
            </div>

            <form action="/api/checkout" method="post" className="mt-6 rounded-3xl bg-soft p-6">
              <input type="hidden" name="slug" value={p.slug} />
              <p className="display text-4xl">{formatPrice(p.price)}</p>
              <label className="mt-4 flex items-start gap-3 text-sm">
                <input type="checkbox" name="consent" value="yes" required className="mt-1 h-4 w-4 accent-[var(--accent)]" />
                <span>
                  I’d like my download straight away. I understand that once the download is available I lose my 14-day right to cancel.{" "}
                  <Link href="/shop/terms" className="underline">Shop terms</Link>
                </span>
              </label>
              <label className="mt-3 flex items-start gap-3 text-sm">
                <input type="checkbox" name="uk" value="yes" required className="mt-1 h-4 w-4 accent-[var(--accent)]" />
                <span>I’m buying from the UK. Plans are for UK customers only.</span>
              </label>
              {error && ERRORS[error] && <p className="mt-3 text-sm font-semibold text-red-700">{ERRORS[error]}</p>}
              <button className="btn mt-5 w-full text-base sm:w-auto">Buy now with secure checkout</button>
              <p className="mt-3 text-xs text-muted">Payments are handled by Stripe. You’ll get your download straight after paying, plus a receipt email with a link to download it again.</p>
            </form>

            <div className="mt-6 rounded-3xl bg-accent p-6 text-paper">
              <p className="display text-2xl">Want a plan built around you?</p>
              <p className="mt-1 text-paper/80">Use this plan to build the habit, then find a local personal trainer to take you further.</p>
              <Link href={p.goal ? `/specialisms/${p.goal}` : "/trainers"} className="btn-light mt-4">Find a local PT</Link>
            </div>
            <p className="mt-4 text-xs text-muted">General fitness information only, not medical advice. Check with your GP before starting a new exercise programme if you have a health condition, are pregnant or have recently given birth.</p>
          </div>
        </div>
      </div>

      <section className="border-t border-line bg-soft">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="display text-3xl">More plans</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {others.map((o) => (
              <Link key={o.slug} href={`/shop/${o.slug}`} className="group flex items-center gap-4 rounded-2xl bg-paper p-4 transition hover:-translate-y-0.5">
                <div className="w-20 shrink-0"><PlanCover p={o} className="rounded-lg" sizes="80px" /></div>
                <div className="min-w-0">
                  <p className="font-semibold group-hover:text-accent">{o.name}</p>
                  <p className="text-sm text-muted">{formatPrice(o.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
