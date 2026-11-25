import Link from "next/link";
import type { TrainerSummary } from "@/lib/trainers";
import { Arrow } from "./Arrow";
import { StarIcon } from "./Stars";
import { FITNESS_GOALS, TRAINING_STYLES, nameFor } from "@/lib/taxonomy";
import { Avatar } from "./Avatar";
import { HeartButton } from "./Saved";

export { Avatar, initials } from "./Avatar";

export function milesAway(d: number) {
  if (d < 1) return "Under 1 mile away";
  const n = d < 10 ? Math.round(d * 10) / 10 : Math.round(d);
  return `${n} ${n === 1 ? "mile" : "miles"} away`;
}

export function TrainerCard({ t }: { t: TrainerSummary }) {
  const specialisms = [...t.styles.map((s) => nameFor(TRAINING_STYLES, s)), ...t.goals.map((g) => nameFor(FITNESS_GOALS, g))];
  return (
    <div className="group/card relative h-full">
    <Link href={`/trainers/${t.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Avatar t={t} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 top-0 flex flex-wrap gap-1.5 p-2 sm:p-3">

          {t.review_count > 0 && t.rating_avg != null && (
            <span className="rounded-full bg-paper/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              <StarIcon className="mr-0.5 inline h-3 w-3 -translate-y-px text-star" />{t.rating_avg.toFixed(1)} <span className="font-normal text-muted">({t.review_count})</span>
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent p-3 pt-16 text-paper sm:p-4">
          <h3 className="display text-lg sm:text-2xl">{t.name}</h3>
          <p className="mt-1 text-xs font-medium text-paper/85 sm:text-sm">
            {t.city ?? "UK"}
          </p>
          {t.distance_miles != null && (
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[11px] font-semibold text-ink sm:text-xs">
              <svg viewBox="0 0 16 16" className="h-3 w-3 text-accent" fill="currentColor" aria-hidden>
                <path d="M8 1a5 5 0 0 0-5 5c0 3.6 5 9 5 9s5-5.4 5-9a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
              </svg>
              {milesAway(t.distance_miles)}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {specialisms.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-soft px-2.5 py-1 text-xs font-medium">{s}</span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-end gap-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted group-hover:text-ink">View profile <Arrow className="h-3 w-3" /></span>
        </div>
        {t.is_sample && <span className="text-[11px] italic text-muted">Example listing</span>}
      </div>
    </Link>
    <HeartButton
      t={{ slug: t.slug, name: t.name, city: t.city, styles: t.styles, goals: t.goals }}
      className="absolute right-2 top-2 z-10 transition group-hover/card:-translate-y-1 sm:right-3 sm:top-3"
    />
    </div>
  );
}
