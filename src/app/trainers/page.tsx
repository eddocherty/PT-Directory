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
  const subtitle = [
    `${total} ${total === 1 ? "trainer" : "trainers"}`,
    geo && `within ${f.radius} miles`,
    geo && f.online && "plus online coaches anywhere",
    f.location && !geo && `we couldn’t find “${f.location}”, so showing everywhere`,
  ].filter(Boolean).join(" · ");

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
    />
  );
}
