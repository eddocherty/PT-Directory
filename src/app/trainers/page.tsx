import type { Metadata } from "next";
import { SearchLayout } from "@/components/SearchLayout";
import { parseFilters, type RawParams } from "@/lib/filters";
import { geocodeUk } from "@/lib/geocode";
import { searchTrainers } from "@/lib/trainers";

type Props = { searchParams: Promise<RawParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: "Find an independent personal trainer",
    description: "Search independent personal trainers, Pilates instructors and small studios across the UK by postcode, specialism and goal.",
    alternates: { canonical: "/trainers" },
    // Search results change with every filter, so only the plain page is indexed. Town and specialism pages cover the rest.
    robots: Object.keys(sp).length ? { index: false, follow: true } : undefined,
  };
}

export default async function TrainersPage({ searchParams }: Props) {
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
