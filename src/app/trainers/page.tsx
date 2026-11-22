import type { Metadata } from "next";
import { SearchLayout } from "@/components/SearchLayout";
import { parseFilters, type RawParams } from "@/lib/filters";
import { geocodeUk } from "@/lib/geocode";
import { searchTrainers } from "@/lib/trainers";

export const metadata: Metadata = { title: "Find a personal trainer" };

export default async function TrainersPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const params = await searchParams;
  const f = parseFilters(params);
  const geo = f.location ? await geocodeUk(f.location) : null;
  const { trainers, total } = await searchTrainers({ ...f, lat: geo?.lat, lng: geo?.lng });
  const subtitle = geo
    ? `Independent trainers within ${f.radius} miles of ${geo.label}${f.online ? ", plus online coaches anywhere" : ""}, nearest first.`
    : f.location
      ? `We couldn’t find “${f.location}”. Try a full postcode or a nearby town. Showing trainers everywhere for now.`
      : "Enter your postcode or town to see the trainers nearest you first.";

  return (
    <SearchLayout
      eyebrow="Find your trainer"
      title={geo ? `Trainers near ${geo.label}` : "Trainers across the UK"}
      subtitle={subtitle}
      filters={f}
      action="/trainers"
      trainers={trainers}
      total={total}
      params={params}
      origin={geo?.label}
    />
  );
}
