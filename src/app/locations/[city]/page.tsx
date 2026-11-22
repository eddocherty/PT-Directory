import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchLayout } from "@/components/SearchLayout";
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
    description: `Compare personal trainers in ${city.name}: reviews, specialisms and online or in-person sessions.`,
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { city: slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) notFound();
  const sp = await searchParams;
  const f = parseFilters(sp);
  const { trainers, total } = await searchTrainers({ ...f, lat: city.lat, lng: city.lng });

  return (
    <SearchLayout
      eyebrow={`${city.county}, ${city.nation}`}
      title={`Personal trainers in ${city.name}`}
      subtitle={`Independent trainers within ${f.radius} miles of ${city.name}, nearest first.`}
      filters={f}
      action={`/locations/${city.slug}`}
      hideLocation
      trainers={trainers}
      total={total}
      params={sp}
      origin={city.name}
    />
  );
}
