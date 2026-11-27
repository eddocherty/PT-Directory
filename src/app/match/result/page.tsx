import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard, PlanCard } from "@/components/NextUp";
import { TrainerCard } from "@/components/TrainerCard";
import { Arrow } from "@/components/Arrow";
import { geocodeUk } from "@/lib/geocode";
import { articleBy } from "@/lib/articles";
import { matchFor, parseAnswers } from "@/lib/match";
import { getProduct } from "@/lib/products";
import { searchTrainers, type SearchFilters, type TrainerSummary } from "@/lib/trainers";

export const metadata: Metadata = {
  title: "Your training match",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Nearest first: tight radius with the match's specialisms, then wider, then any trainer nearby. */
async function findTrainers(base: SearchFilters, styles: string[], goals: string[], local: boolean) {
  const attempts: SearchFilters[] = [];
  const spec = { styles: styles.length ? styles : undefined, goals: goals.length ? goals : undefined };
  if (local) {
    attempts.push({ ...base, ...spec, radius: 10 }, { ...base, ...spec, radius: 25 });
    if (spec.styles && spec.goals) attempts.push({ ...base, goals: spec.goals, radius: 25 }, { ...base, styles: spec.styles, radius: 25 });
    attempts.push({ ...base, radius: 25 });
  } else {
    attempts.push({ ...base, ...spec });
    if (spec.styles && spec.goals) attempts.push({ ...base, goals: spec.goals }, { ...base, styles: spec.styles });
    attempts.push(base);
  }
  let best: { trainers: TrainerSummary[]; total: number; filters: SearchFilters } | null = null;
  for (const f of attempts) {
    try {
      const r = await searchTrainers(f, 6);
      if (r.trainers.length >= 3) return { ...r, filters: f };
      if (r.trainers.length && !best) best = { ...r, filters: f };
    } catch (e) {
      console.error("match search", e);
    }
  }
  return best ?? { trainers: [] as TrainerSummary[], total: 0, filters: base };
}

export default async function MatchResult({ searchParams }: Props) {
  const a = parseAnswers(await searchParams);
  const m = matchFor(a);
  const geo = a.loc ? await geocodeUk(a.loc) : null;
  const online = a.where === "online";
  const base: SearchFilters = online && !geo ? { online: true } : geo ? { lat: geo.lat, lng: geo.lng, ...(a.where === "home" ? { homeVisits: true } : {}), ...(online ? { online: true } : {}) } : {};
  let found = await findTrainers(base, m.styles, m.goals, !!geo);
  // Home visits are rarer: fall back to anyone nearby rather than an empty page.
  if (!found.trainers.length && base.homeVisits) found = await findTrainers({ ...base, homeVisits: undefined }, m.styles, m.goals, !!geo);
  const { trainers, total, filters } = found;
  const guide = articleBy(m.guide)!;
  const plan = getProduct(m.plan)!;

  const where = geo ? `within ${filters.radius ?? 25} miles of ${geo.label}` : online ? "who coach online" : "across the UK";
  const seeAll = new URLSearchParams();
  if (geo && a.loc) seeAll.set("location", a.loc);
  if (filters.radius) seeAll.set("radius", String(filters.radius));
  filters.styles?.forEach((s) => seeAll.append("style", s));
  filters.goals?.forEach((g) => seeAll.append("goal", g));
  if (filters.online) seeAll.set("online", "1");
  if (filters.homeVisits) seeAll.set("home", "1");

  return (
    <>
      <section className="bg-soft">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <p className="eyebrow text-accent">Your training match</p>
          <h1 className="display mt-3 text-5xl sm:text-7xl">{m.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{m.why}</p>
          {a.loc && !geo && <p className="mt-3 text-sm font-semibold text-red-700">We couldn’t find “{a.loc}”, so these are from across the UK. Try a full postcode or a nearby town.</p>}
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="bg-paper p-6">
              <p className="font-semibold">What to look for in a trainer</p>
              <ul className="mt-3 space-y-2">
                {m.lookFor.map((x) => <li key={x} className="flex gap-3"><span className="text-accent">✓</span><span>{x}</span></li>)}
              </ul>
            </div>
            <div className="flex flex-col justify-center bg-accent p-6 text-paper">
              {total > 0 ? (
                <>
                  <p className="display text-6xl tabular-nums">{total}</p>
                  <p className="mt-2 text-paper/85">{total === 1 ? "trainer matches" : "trainers match"} {where}.</p>
                  <Link href={`/trainers?${seeAll}`} className="btn-light mt-5 self-start">See them all <Arrow /></Link>
                </>
              ) : (
                <>
                  <p className="display text-2xl">We don’t list a match {where} yet.</p>
                  <Link href="/online" className="btn-light mt-5 self-start">Try an online coach <Arrow /></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {trainers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="display text-3xl sm:text-4xl">Start with these</h2>
            <p className="text-sm text-muted">Tap the heart to save any to your shortlist.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {trainers.slice(0, 6).map((t) => <TrainerCard key={t.id} t={t} />)}
          </div>
        </section>
      )}

      <section className="border-t border-line bg-soft">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 lg:grid-cols-2">
          <PlanCard p={plan} eyebrow="Not ready to book? Start with this plan" />
          <ArticleCard g={guide} />
        </div>
        <p className="pb-12 text-center text-sm">
          <Link href="/match" className="font-semibold text-muted underline hover:text-ink">Take the quiz again</Link>
        </p>
      </section>
    </>
  );
}
