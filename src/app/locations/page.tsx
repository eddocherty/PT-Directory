import type { Metadata } from "next";
import Link from "next/link";
import { CITIES } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Personal trainers by location" };

export default function LocationsPage() {
  const regions = [...new Set(CITIES.map((c) => c.region))];
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Personal trainers by location</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {regions.map((r) => (
          <div key={r}>
            <h2 className="mb-2 font-semibold">{r}</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {CITIES.filter((c) => c.region === r).map((c) => (
                <li key={c.slug}>
                  <Link href={`/locations/${c.slug}`} className="text-brand hover:underline">Personal trainers in {c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
