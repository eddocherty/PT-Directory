import type { Metadata } from "next";
import { FilterForm } from "@/components/FilterForm";
import { Results } from "@/components/Results";
import { parseFilters, type RawParams } from "@/lib/filters";
import { geocodeUk } from "@/lib/geocode";
import { searchTrainers } from "@/lib/trainers";

export const metadata: Metadata = { title: "Find a personal trainer" };

export default async function TrainersPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const params = await searchParams;
  const f = parseFilters(params);
  const geo = f.location ? await geocodeUk(f.location) : null;
  const { trainers, total } = await searchTrainers({ ...f, lat: geo?.lat, lng: geo?.lng });

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
      <aside><FilterForm values={f} /></aside>
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Personal trainers{geo ? ` within ${f.radius} miles of ${geo.label}` : " in the UK"}
          </h1>
          <p className="text-sm text-muted">
            {total} {total === 1 ? "trainer" : "trainers"} found
            {f.location && !geo && ` · we couldn't find "${f.location}", so we're showing everywhere`}
          </p>
        </div>
        <Results trainers={trainers} total={total} page={f.page ?? 1} params={params} basePath="/trainers" />
      </section>
    </div>
  );
}
