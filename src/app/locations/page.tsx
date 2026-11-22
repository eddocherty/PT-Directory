import type { Metadata } from "next";
import Link from "next/link";
import { CITIES } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Personal trainers by location" };

export default function LocationsPage() {
  const regions = [...new Set(CITIES.map((c) => c.region))];
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="display mb-8 text-4xl sm:text-6xl">Personal trainers by location</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {regions.map((r) => (
          <div key={r}>
            <h2 className="eyebrow mb-2 text-accent">{r}</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {CITIES.filter((c) => c.region === r).map((c) => (
                <li key={c.slug}>
                  <Link href={`/locations/${c.slug}`} className="font-semibold hover:text-accent">Personal trainers in {c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
