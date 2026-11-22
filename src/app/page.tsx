import Link from "next/link";
import { CITIES, FITNESS_GOALS, TRAINING_STYLES } from "@/lib/taxonomy";

export default function Home() {
  return (
    <>
      <section className="bg-surface border-b border-line">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find a personal trainer <span className="text-brand">near you</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted">
            Search trainers across England, Scotland, Wales and Northern Ireland by location, training style and goal.
          </p>
          <form action="/trainers" className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row">
            <input name="location" placeholder="Postcode or town, e.g. SW11 or Glasgow" className="input flex-1 py-3 text-base" />
            <select name="goal" className="input sm:w-48 py-3 text-base" defaultValue="">
              <option value="">Any goal</option>
              {FITNESS_GOALS.map((g) => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
            <button className="btn py-3 text-base">Search</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-4 text-xl font-semibold">Browse by training style</h2>
        <div className="flex flex-wrap gap-2">
          {TRAINING_STYLES.map((s) => (
            <Link key={s.slug} href={`/trainers?style=${s.slug}`} className="rounded-full border border-line bg-surface px-4 py-2 text-sm hover:border-brand">
              {s.name}
            </Link>
          ))}
        </div>

        <h2 className="mb-4 mt-10 text-xl font-semibold">Popular locations</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {CITIES.map((c) => (
            <Link key={c.slug} href={`/locations/${c.slug}`} className="rounded-lg border border-line bg-surface px-3 py-3 text-sm hover:border-brand">
              <span className="font-medium">{c.name}</span>
              <span className="block text-xs text-muted">{c.region}</span>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-line bg-brand-soft p-6">
          <h2 className="text-lg font-semibold">Are you a personal trainer?</h2>
          <p className="mt-1 text-sm">Claim your free listing to update your details, or ask us to remove it.</p>
          <Link href="/for-trainers" className="btn mt-4">Claim your profile</Link>
        </div>
      </section>
    </>
  );
}
