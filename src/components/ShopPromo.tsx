import Link from "next/link";
import { Arrow } from "./Arrow";
import { PlanCover } from "./PlanCover";
import { FROM_PRICE, PRODUCTS, formatPrice, pickPlan } from "@/lib/products";

/** Big home-page section: the shop as a low-cost first step before a PT. */
export function ShopBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="relative overflow-hidden bg-zap p-6 sm:p-10 lg:p-12">
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
          <div>
            <h2 className="display text-4xl sm:text-5xl">Not ready for a PT?<br />Start with a plan from {FROM_PRICE}.</h2>
            <p className="mt-4 max-w-md text-muted">
              Five printable plans, from your first eight weeks in the gym to a first half marathon. Use one on your own for a while, and come back for a trainer when you want someone in your corner.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="btn">See the plans</Link>
              <span className="self-center text-sm text-muted">Instant PDF download</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {PRODUCTS.map((p, i) => (
              <Link key={p.slug} href={`/shop/${p.slug}`} className={`group min-w-0 ${i > 2 ? "hidden sm:block" : ""}`}>
                <PlanCover p={p} className="transition group-hover:-translate-y-1" />
                <p className="mt-2 truncate text-xs font-semibold">{p.short}</p>
                <p className="text-xs text-muted">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Full-width card that sits inside search results, matched to the filters picked. */
export function ShopResultsCard({ goals, styles }: { goals?: string[]; styles?: string[] }) {
  const p = pickPlan(goals, styles);
  return (
    <Link
      href={`/shop/${p.slug}`}
      className="group col-span-full flex items-center gap-4 bg-zap p-4 transition hover:bg-[#d8e4fa] sm:gap-6 sm:p-6"
    >
      <div className="w-16 shrink-0 sm:w-20"><PlanCover p={p} className="" sizes="80px" /></div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-accent">Not ready to book a trainer?</p>
        <p className="display mt-1 text-xl sm:text-2xl">Try our {p.short.toLowerCase()} first, for just {formatPrice(p.price)}</p>
        <p className="mt-1 hidden text-sm text-muted sm:block">A printable plan to follow on your own first. Instant PDF download.</p>
      </div>
      <span className="hidden shrink-0 text-sm font-semibold text-accent sm:inline"><Arrow className="h-4 w-4" /></span>
    </Link>
  );
}

/** Small card on a trainer profile, matched to their specialisms. */
export function ShopProfileCard({ goals, styles }: { goals?: string[]; styles?: string[] }) {
  const p = pickPlan(goals, styles);
  return (
    <Link href={`/shop/${p.slug}`} className="group mt-4 flex items-center gap-4 border border-line p-4 transition hover:border-ink">
      <div className="w-14 shrink-0"><PlanCover p={p} className="" sizes="56px" /></div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-accent">Not ready to commit yet?</p>
        <p className="mt-0.5 text-sm font-semibold">Or start on your own with our {p.short.toLowerCase()}, {formatPrice(p.price)}</p>
        <p className="mt-0.5 text-xs text-muted">Instant PDF. Plans from {FROM_PRICE}.</p>
      </div>
    </Link>
  );
}
