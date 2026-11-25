import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { FilterDrawer } from "./FilterDrawer";
import { FilterForm } from "./FilterForm";
import { Results } from "./Results";
import { RADII } from "@/lib/taxonomy";
import type { RawParams } from "@/lib/filters";
import type { SearchFilters, TrainerSummary } from "@/lib/trainers";

const KEEP_OUT = new Set(["location", "radius", "page"]);

export function SearchLayout({
  eyebrow, crumbs, title, subtitle, intro, footer, filters, action, hideLocation, trainers, total, params, origin,
}: {
  eyebrow?: string; crumbs?: Crumb[]; title: string; subtitle: string;
  /** Extra copy under the subtitle, such as real numbers for the town. */
  intro?: React.ReactNode;
  /** Sections after the results, such as links to nearby towns. */
  footer?: React.ReactNode; filters: SearchFilters & { location?: string };
  action: string; hideLocation?: boolean; trainers: TrainerSummary[]; total: number; params: RawParams;
  /** Place the results are measured from. When set, results are sorted nearest first. */
  origin?: string;
}) {
  const active = (filters.styles?.length ?? 0) + (filters.goals?.length ?? 0) + (filters.sports?.length ?? 0) +
    (filters.online ? 1 : 0) + (filters.homeVisits ? 1 : 0) + (filters.gender ? 1 : 0) + (filters.q ? 1 : 0);
  const form = <FilterForm action={action} values={filters} hideLocation={hideLocation} />;
  return (
    <>
      <section className="border-b border-line bg-soft text-ink">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          {crumbs && <Breadcrumbs items={crumbs} className="mb-4" />}
          {eyebrow && <p className="eyebrow text-accent">{eyebrow}</p>}
          <h1 className={`display text-3xl sm:text-5xl ${eyebrow ? "mt-3" : ""}`}>{title}</h1>
          <p className="mt-3 max-w-2xl text-muted">{subtitle}</p>
          {intro}

          {/* Quick where + how far bar, keeps any other filters already chosen */}
          <form action={action} className="mt-6 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            {Object.entries(params).flatMap(([k, v]) =>
              KEEP_OUT.has(k) ? [] : (Array.isArray(v) ? v : v ? [v] : []).map((item, i) => (
                <input key={`${k}-${i}`} type="hidden" name={k} value={item} />
              )),
            )}
            {!hideLocation && (
              <input
                name="location"
                defaultValue={filters.location}
                placeholder="Your postcode or town"
                aria-label="Your postcode or town"
                className="flex-1 border-b-2 border-ink bg-transparent py-2 text-lg outline-none placeholder:text-muted/70 focus:border-accent"
              />
            )}
            <div className="flex items-end gap-6">
              <select name="radius" defaultValue={String(filters.radius ?? 25)} className="flex-1 border-b-2 border-ink bg-transparent py-2 text-lg outline-none focus:border-accent sm:w-auto" aria-label="Distance">
                {RADII.map((r) => <option key={r} value={r}>Within {r} miles</option>)}
              </select>
              <button type="submit" className="btn shrink-0">{hideLocation ? "Update" : "Search"}</button>
            </div>
          </form>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:py-8 lg:grid-cols-[280px_1fr] lg:gap-10">
        <aside>
          <div className="lg:hidden"><FilterDrawer active={active}>{form}</FilterDrawer></div>
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <p className="eyebrow pb-3">Filter results</p>
            {form}
          </div>
        </aside>
        <section>
          <Results
            trainers={trainers}
            total={total}
            filters={filters}
            params={params}
            basePath={action}
            origin={origin}
          />
        </section>
      </div>
      {footer}
    </>
  );
}
