import Link from "next/link";
import { Arrow } from "./Arrow";
import { weeklyPick, type Fact } from "@/lib/facts";

/** "Did you know" row: three real numbers from the listings, changing weekly. */
export function FactStrip({ facts, salt = 0 }: { facts: Fact[]; salt?: number }) {
  const show = weeklyPick(facts, 3, salt);
  if (!show.length) return null;
  return (
    <section className="border-y border-line">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="eyebrow text-muted">Did you know? <span className="font-medium normal-case tracking-normal">Counted from our listings, updated daily.</span></p>
        <ul className="mt-5 grid gap-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
          {show.map((f) => (
            <li key={f.big + f.text} className="md:px-6 md:first:pl-0 md:last:pr-0">
              <Link href={f.href} className="group block">
                <span className="display block text-4xl text-accent tabular-nums sm:text-5xl">{f.big}</span>
                <span className="mt-2 block text-[15px] leading-snug">{f.text}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-muted group-hover:text-ink">{f.cta} <Arrow className="h-3 w-3 transition group-hover:translate-x-0.5" /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
