import Link from "next/link";
import type { TrainerSummary } from "@/lib/trainers";
import { FITNESS_GOALS, TRAINING_STYLES, nameFor } from "@/lib/taxonomy";

export function initials(name: string) {
  return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function price(t: { price_from: number | null; price_to: number | null }) {
  if (t.price_from == null) return "Price on request";
  return `From £${t.price_from}`;
}

export function Avatar({ t, className = "" }: { t: { name: string; image_url: string | null }; className?: string }) {
  return t.image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={t.image_url} alt={t.name} className={`object-cover ${className}`} loading="lazy" />
  ) : (
    <div className={`flex items-center justify-center bg-zap display text-5xl text-accent ${className}`}>{initials(t.name)}</div>
  );
}

export function TrainerCard({ t }: { t: TrainerSummary }) {
  const specialisms = [...t.styles.map((s) => nameFor(TRAINING_STYLES, s)), ...t.goals.map((g) => nameFor(FITNESS_GOALS, g))];
  return (
    <Link href={`/trainers/${t.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-paper transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Avatar t={t} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 top-0 flex flex-wrap gap-1.5 p-2 sm:p-3">
          {t.review_count > 0 && t.rating_avg != null && (
            <span className="rounded-full bg-paper/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              <span className="text-star">★</span> {t.rating_avg.toFixed(1)} <span className="font-normal text-muted">({t.review_count})</span>
            </span>
          )}
          {t.free_consultation && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-paper">Free consult</span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent p-3 pt-16 text-paper sm:p-4">
          <h3 className="display text-lg sm:text-2xl">{t.name}</h3>
          <p className="mt-1 text-xs font-medium text-paper/85 sm:text-sm">
            {t.city ?? "UK"}
            {t.distance_miles != null && ` · ${t.distance_miles.toFixed(1)} mi away`}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {specialisms.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-soft px-2.5 py-1 text-xs font-medium">{s}</span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-1">
          <span className="text-sm font-semibold">{price(t)}</span>
          <span className="hidden text-xs font-semibold text-muted group-hover:text-ink sm:inline">View profile →</span>
        </div>
        {t.is_sample && <span className="text-[11px] italic text-muted">Example listing</span>}
      </div>
    </Link>
  );
}
