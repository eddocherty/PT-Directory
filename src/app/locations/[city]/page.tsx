import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilterForm } from "@/components/FilterForm";
import { Results } from "@/components/Results";
import { parseFilters, type RawParams } from "@/lib/filters";
import { CITIES } from "@/lib/taxonomy";
import { searchTrainers } from "@/lib/trainers";

type Props = { params: Promise<{ city: string }>; searchParams: Promise<RawParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Personal trainers in ${city.name}`,
    description: `Compare personal trainers in ${city.name}: training styles, goals, prices and online or in-person sessions.`,
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { city: slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) notFound();
  const sp = await searchParams;
  const f = parseFilters(sp);
  const { trainers, total } = await searchTrainers({ ...f, lat: city.lat, lng: city.lng, radius: f.radius ?? 15 });

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
      <aside><FilterForm action={`/locations/${city.slug}`} values={{ ...f, location: undefined }} /></aside>
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Personal trainers in {city.name}</h1>
          <p className="text-sm text-muted">{total} {total === 1 ? "trainer" : "trainers"} within {f.radius} miles</p>
        </div>
        <Results trainers={trainers} total={total} page={f.page ?? 1} params={sp} basePath={`/locations/${city.slug}`} />
      </section>
    </div>
  );
}
