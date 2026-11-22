import { FilterForm } from "./FilterForm";
import { Results } from "./Results";
import type { RawParams } from "@/lib/filters";
import type { SearchFilters, TrainerSummary } from "@/lib/trainers";

export function SearchLayout({
  eyebrow, title, subtitle, filters, action, hideLocation, trainers, total, params,
}: {
  eyebrow: string; title: string; subtitle: string; filters: SearchFilters & { location?: string };
  action: string; hideLocation?: boolean; trainers: TrainerSummary[]; total: number; params: RawParams;
}) {
  const active = (filters.styles?.length ?? 0) + (filters.goals?.length ?? 0) + (filters.sports?.length ?? 0) +
    (filters.online ? 1 : 0) + (filters.homeVisits ? 1 : 0) + (filters.maxPrice ? 1 : 0) + (filters.gender ? 1 : 0);
  return (
    <>
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <p className="eyebrow text-paper/50">{eyebrow}</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-3 text-paper/70">{subtitle}</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[300px_1fr]">
        <aside>
          {/* Mobile: collapsible. Desktop: always open (details forced open via lg:block on content). */}
          <details className="group rounded-3xl border border-line p-4 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              Filters {active > 0 && <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-paper">{active}</span>}
              <span className="text-xl transition group-open:rotate-45">+</span>
            </summary>
            <div className="mt-4"><FilterForm action={action} values={filters} hideLocation={hideLocation} /></div>
          </details>
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <FilterForm action={action} values={filters} hideLocation={hideLocation} />
          </div>
        </aside>
        <section>
          <Results trainers={trainers} total={total} page={filters.page ?? 1} params={params} basePath={action} />
        </section>
      </div>
    </>
  );
}
