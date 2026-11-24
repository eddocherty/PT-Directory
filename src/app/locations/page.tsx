import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { allTownStats, countySlug } from "@/lib/stats";
import { CITIES, NATIONS } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Find a personal trainer by county",
  description: "Pick your county, then your town or city, to find independent personal trainers near you.",
  alternates: { canonical: "/locations" },
};

export const revalidate = 21600;

export default async function LocationsPage() {
  const stats = await allTownStats();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Locations", href: "/locations" }]} />
      <h1 className="display mt-5 text-4xl sm:text-6xl">Find trainers near you</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">Pick your county, then choose your town or city.</p>

      <nav aria-label="Jump to nation" className="mt-8 flex flex-wrap gap-2">
        {NATIONS.map((n) => (
          <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, "-")}`} className="chip hover:bg-zap">{n}</a>
        ))}
      </nav>

      {NATIONS.map((nation) => {
        const places = CITIES.filter((c) => c.nation === nation);
        const counties = [...new Set(places.map((c) => c.county))].sort();
        return (
          <section key={nation} id={nation.toLowerCase().replace(/\s+/g, "-")} className="mt-12 scroll-mt-24">
            <h2 className="display mb-4 text-3xl">{nation}</h2>
            <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {counties.map((county) => {
                const towns = places.filter((c) => c.county === county).sort((a, b) => a.name.localeCompare(b.name));
                return (
                  <details key={county} className="group rounded-2xl border border-line bg-paper open:border-accent open:shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                      <span>
                        <span className="block font-semibold">{county}</span>
                        <span className="text-xs text-muted">{towns.length === 1 ? "1 town or city" : `${towns.length} towns and cities`}</span>
                      </span>
                      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-accent transition group-open:rotate-180 group-open:bg-accent group-open:text-paper">
                        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="m5 8 5 5 5-5" /></svg>
                      </span>
                    </summary>
                    <ul className="flex flex-col border-t border-line px-2 py-2">
                      {towns.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/locations/${c.slug}`} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium hover:bg-zap hover:text-accent">
                            {c.name}
                            <span className="text-xs tabular-nums text-muted">{stats[c.slug]?.total || ""}</span>
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href={`/counties/${countySlug(county)}`} className="block rounded-xl px-3 py-2 text-sm font-semibold text-accent hover:bg-zap">
                          All of {county}
                        </Link>
                      </li>
                    </ul>
                  </details>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="mt-12 text-sm text-muted">
        Can’t see your town? <Link href="/trainers" className="text-accent underline">Search by postcode</Link> to find trainers within a few miles, or{" "}
        <Link href="/online" className="text-accent underline">train online</Link>.
      </p>
    </div>
  );
}
