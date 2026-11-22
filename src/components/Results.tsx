import Link from "next/link";
import { TrainerCard } from "./TrainerCard";
import { PAGE_SIZE, type SearchFilters, type TrainerSummary } from "@/lib/trainers";
import { toQuery, type RawParams } from "@/lib/filters";
import { FITNESS_GOALS, GENDERS, RADII, SPORTS, TRAINING_STYLES, type Option } from "@/lib/taxonomy";

type Chip = { label: string; href: string };

const nameOf = (opts: Option[], slug: string) => opts.find((o) => o.slug === slug)?.name ?? slug;

/** One removable chip per active filter, so people can see (and undo) what they picked. */
function activeChips(f: SearchFilters, params: RawParams, base: string): Chip[] {
  const without = (key: string, value?: string) => {
    const next: RawParams = { ...params, page: undefined };
    if (value == null) next[key] = undefined;
    else {
      const cur = params[key];
      const list = (Array.isArray(cur) ? cur : cur ? [cur] : []).flatMap((s) => s.split(","));
      next[key] = list.filter((v) => v !== value);
    }
    const qs = toQuery(next, {});
    return qs ? `${base}?${qs}` : base;
  };
  return [
    ...(f.styles ?? []).map((s) => ({ label: nameOf(TRAINING_STYLES, s), href: without("style", s) })),
    ...(f.goals ?? []).map((s) => ({ label: nameOf(FITNESS_GOALS, s), href: without("goal", s) })),
    ...(f.sports ?? []).map((s) => ({ label: nameOf(SPORTS, s), href: without("sport", s) })),
    ...(f.online ? [{ label: "Online coaching", href: without("online") }] : []),
    ...(f.homeVisits ? [{ label: "Home visits", href: without("home") }] : []),
    ...(f.maxPrice ? [{ label: `Up to £${f.maxPrice}`, href: without("maxPrice") }] : []),
    ...(f.gender ? [{ label: nameOf(GENDERS, f.gender), href: without("gender") }] : []),
    ...(f.q ? [{ label: `“${f.q}”`, href: without("q") }] : []),
  ];
}

/** Same page, same place and radius, no other filters. */
function keepWhere(base: string, params: RawParams) {
  const qs = toQuery({ location: params.location, radius: params.radius }, {});
  return qs ? `${base}?${qs}` : base;
}

export function Results({
  trainers, total, filters, params, basePath, origin,
}: {
  trainers: TrainerSummary[]; total: number; filters: SearchFilters & { location?: string };
  params: RawParams; basePath: string; origin?: string;
}) {
  const page = filters.page ?? 1;
  const radius = filters.radius ?? 25;
  const pages = Math.ceil(total / PAGE_SIZE);
  const chips = activeChips(filters, params, basePath);
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);

  const toolbar = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-lg font-semibold">
          {total} {total === 1 ? "trainer" : "trainers"}
          {pages > 1 && <span className="ml-2 text-sm font-normal text-muted">showing {from} to {to}</span>}
        </p>
        {origin ? (
          <p className="text-sm text-muted">
            Sorted by distance, <span className="font-semibold text-ink">nearest to {origin} first</span>
          </p>
        ) : (
          <p className="text-sm text-muted">Add your postcode above to sort by distance</p>
        )}
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <Link key={c.label} href={c.href} className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper hover:bg-accent">
              {c.label} <span aria-hidden className="opacity-70 group-hover:opacity-100">×</span>
              <span className="sr-only">remove filter</span>
            </Link>
          ))}
          {chips.length > 1 && (
            <Link href={keepWhere(basePath, params)} className="px-2 text-xs font-semibold text-muted underline hover:text-ink">
              Clear all
            </Link>
          )}
        </div>
      )}
    </div>
  );

  if (!trainers.length) {
    const wider = RADII.find((r) => r > radius);
    return (
      <div className="flex flex-col gap-6">
        {toolbar}
        <div className="rounded-3xl bg-soft p-8 text-center sm:p-12">
          <p className="display text-3xl">No trainers match yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {origin ? `Nobody within ${radius} miles of ${origin} fits all of that. ` : "Nobody fits all of that. "}
            Here are a few ways to widen the net.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {origin && wider && (
              <Link href={`${basePath}?${toQuery(params, { radius: String(wider), page: undefined })}`} className="btn">
                Search within {wider} miles
              </Link>
            )}
            {chips.length > 0 && (
              <Link href={keepWhere(basePath, params)} className="btn-dark">
                Clear filters
              </Link>
            )}
            {!filters.online && (
              <Link href={`${basePath}?${toQuery(params, { online: "1", page: undefined })}`} className="btn-ghost">
                Show online coaches
              </Link>
            )}
            <Link href="/locations" className="btn-ghost">Browse by county</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {toolbar}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
        {trainers.map((t) => <TrainerCard key={t.id} t={t} />)}
      </div>
      {pages > 1 && (
        <nav className="flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link className="btn-ghost" href={`${basePath}?${toQuery(params, { page: String(page - 1) })}`}>{origin ? "← Closer" : "← Prev"}</Link>}
          <span className="font-bold">Page {page} of {pages}</span>
          {page < pages && <Link className="btn-ghost" href={`${basePath}?${toQuery(params, { page: String(page + 1) })}`}>{origin ? "Further away →" : "Next →"}</Link>}
        </nav>
      )}
    </div>
  );
}
