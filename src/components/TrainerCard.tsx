import Link from "next/link";
import type { TrainerSummary } from "@/lib/trainers";
import { FITNESS_GOALS, TRAINING_STYLES, nameFor } from "@/lib/taxonomy";

export function initials(name: string) {
  return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function price(t: { price_from: number | null; price_to: number | null }) {
  if (t.price_from == null) return "Price on request";
  return t.price_to && t.price_to !== t.price_from ? `£${t.price_from}–£${t.price_to}` : `From £${t.price_from}`;
}

export function TrainerCard({ t }: { t: TrainerSummary }) {
  return (
    <Link
      href={`/trainers/${t.slug}`}
      className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 transition hover:border-brand"
    >
      <div className="flex items-start gap-3">
        {t.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.image_url} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold text-brand">
            {initials(t.name)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{t.name}</h3>
          {t.business_name && <p className="truncate text-sm text-muted">{t.business_name}</p>}
          <p className="text-sm text-muted">
            {[t.postcode_district, t.city].filter(Boolean).join(", ")}
            {t.distance_miles != null && ` · ${t.distance_miles.toFixed(1)} mi`}
          </p>
        </div>
      </div>
      {t.headline && <p className="line-clamp-2 text-sm">{t.headline}</p>}
      <div className="flex flex-wrap gap-1.5">
        {t.styles.slice(0, 3).map((s) => (
          <span key={s} className="chip">{nameFor(TRAINING_STYLES, s)}</span>
        ))}
        {t.goals.slice(0, 2).map((g) => (
          <span key={g} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
            {nameFor(FITNESS_GOALS, g)}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between text-sm">
        <span className="font-semibold">{price(t)}</span>
        <span className="text-muted">
          {[t.in_person && "In person", t.online && "Online", t.home_visits && "Home visits"].filter(Boolean).join(" · ")}
        </span>
      </div>
      {t.is_sample && <span className="text-xs text-muted italic">Example listing</span>}
    </Link>
  );
}
