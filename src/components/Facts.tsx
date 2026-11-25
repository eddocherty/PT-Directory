import { FactCarousel } from "./FactCarousel";
import { weeklyPick, type Fact } from "@/lib/facts";

/** "Did you know" strip: real numbers from the listings, sliding along every few seconds. */
export function FactStrip({ facts, salt = 0 }: { facts: Fact[]; salt?: number }) {
  if (!facts.length) return null;
  // Start somewhere different each week, then show every fact in turn.
  const first = weeklyPick(facts, 1, salt)[0];
  const start = Math.max(0, facts.indexOf(first));
  const ordered = [...facts.slice(start), ...facts.slice(0, start)];
  return (
    <section className="border-y border-line">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <FactCarousel facts={ordered} />
      </div>
    </section>
  );
}
