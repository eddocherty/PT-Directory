import type { Metadata } from "next";
import Link from "next/link";
import { PlanCover } from "@/components/PlanCover";
import { PRODUCTS, formatPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Training plans and guides",
  description: "Simple, downloadable training plans from Train Local: beginner gym, postnatal return, dumbbell only, first half marathon and high-protein eating.",
};

export default function Shop() {
  return (
    <>
      <section className="relative overflow-hidden bg-soft">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-zap blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <p className="eyebrow text-accent">Train Local shop</p>
          <h1 className="display mt-4 text-5xl sm:text-7xl">
            Start strong.<br /><span className="text-accent">Then go further.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Simple, printable plans to get you moving with confidence. When you’re ready for the next level, a local personal trainer can take it from there.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-line bg-paper px-3 py-1">Instant PDF download</span>
            <span className="rounded-full border border-line bg-paper px-3 py-1">Secure checkout with Stripe</span>
            <span className="rounded-full border border-line bg-paper px-3 py-1">Print it or use it on your phone</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <Link key={p.slug} href={`/shop/${p.slug}`} className="group flex min-w-0 flex-col">
              <div className="overflow-hidden rounded-2xl bg-soft p-6 transition group-hover:bg-zap">
                <PlanCover p={p} className="mx-auto max-w-[15rem] transition group-hover:-translate-y-1" />
              </div>
              <p className="eyebrow mt-4 text-muted">{p.level} · {p.pages} pages</p>
              <h2 className="display mt-1 text-2xl">{p.name}</h2>
              <p className="mt-1 text-sm text-muted">{p.description}</p>
              <p className="mt-3 flex items-center justify-between">
                <span className="text-lg font-semibold">{formatPrice(p.price)}</span>
                <span className="text-sm font-semibold text-accent">See what’s inside →</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-accent p-8 text-paper sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="display text-3xl sm:text-4xl">Want a plan made just for you?</h2>
            <p className="mt-2 max-w-xl text-paper/80">Independent personal trainers near you can build a programme around your goals, schedule and any niggles.</p>
          </div>
          <Link href="/trainers" className="btn-light shrink-0">Find a local PT</Link>
        </div>
        <p className="mt-6 text-xs text-muted">
          Our plans give general fitness and healthy-eating information only. They are not medical advice. See our <Link href="/shop/terms" className="underline">shop terms</Link>.
        </p>
      </section>
    </>
  );
}
