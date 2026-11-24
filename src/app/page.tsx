import Link from "next/link";
import { AllFilters } from "@/components/AllFilters";
import { ShopBanner } from "@/components/ShopPromo";
import { FROM_PRICE } from "@/lib/products";
import { TrainerCard } from "@/components/TrainerCard";
import { CITIES, FITNESS_GOALS, TRAINING_STYLES } from "@/lib/taxonomy";
import { featuredTrainers } from "@/lib/trainers";
import { Arrow } from "@/components/Arrow";
import { JsonLd } from "@/components/JsonLd";
import { UkTownMap } from "@/components/UkTownMap";
import { SITE_NAME, TAGLINE, abs } from "@/lib/site";
import { allTownStats, ukCounts } from "@/lib/stats";
import { topicBySlug } from "@/lib/topics";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Refresh featured trainers every 5 minutes rather than freezing them at build time.
export const revalidate = 300;

const STYLE_TILES = ["strength", "pilates", "boxing", "yoga", "running", "bootcamp"];
const GOAL_LIST = ["weight-loss", "muscle-gain", "pre-post-natal", "rehab", "older-adults", "confidence", "sports-performance", "general-fitness"];

export default async function Home() {
  const [featured, stats, uk] = await Promise.all([featuredTrainers(4), allTownStats(), ukCounts()]);
  return (
    <>
      {/* Hero */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": abs("/#org"), name: SITE_NAME, url: abs("/"), logo: abs("/icon.svg"), slogan: TAGLINE },
            { "@type": "WebSite", "@id": abs("/#site"), name: SITE_NAME, url: abs("/"), publisher: { "@id": abs("/#org") }, inLanguage: "en-GB" },
          ],
        }}
      />
      <section className="relative overflow-hidden bg-soft text-ink">
        <UkTownMap stats={stats} className="absolute top-8 hidden h-[calc(100%-4rem)] lg:right-[3%] lg:block xl:right-[7%]" />
        <div className="pointer-events-none relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:pb-24 sm:pt-20 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_form]:pointer-events-auto">
          <h1 className="display text-5xl sm:text-7xl lg:text-8xl">
            Personal training,<br />built <span className="text-accent">around you.</span>
          </h1>
          <form action="/trainers" className="mt-8 flex max-w-3xl flex-col gap-2 rounded-3xl border border-line bg-paper p-2 text-ink shadow-sm sm:flex-row sm:rounded-full">
            <input name="location" placeholder="Postcode or town" aria-label="Postcode or town" className="flex-1 rounded-full px-5 py-3 text-base outline-none" />
            <select name="goal" defaultValue="" aria-label="Goal" className="rounded-full bg-soft px-5 py-3 text-base outline-none sm:w-56">
              <option value="">Any goal</option>
              {FITNESS_GOALS.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
            </select>
            <button className="btn px-7 text-base">Search</button>
          </form>
          <Link href="/online" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-paper hover:opacity-90">
            Or train online with a UK coach, wherever you live <Arrow />
          </Link>
          <Link href="/shop" className="ml-0 mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent sm:ml-4">
            Not ready for a PT? Start with a plan from {FROM_PRICE}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="text-muted">Popular:</span>
            <Link href="/specialisms/pilates" className="rounded-full border border-line bg-paper px-3 py-1 hover:border-ink">Pilates</Link>
            <Link href="/specialisms/bootcamp" className="rounded-full border border-line bg-paper px-3 py-1 hover:border-ink">Bootcamps</Link>
            {["weight-loss", "muscle-gain", "pre-post-natal", "rehab"].map((g) => (
              <Link key={g} href={`/specialisms/${g}`} className="rounded-full border border-line bg-paper px-3 py-1 hover:border-ink">
                {FITNESS_GOALS.find((x) => x.slug === g)?.name}
              </Link>
            ))}
          </div>
          <AllFilters />
        </div>
      </section>

      {/* Styles */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-4xl sm:text-5xl">How do you like to train?</h2>
          <Link href="/specialisms" className="btn-ghost">All specialisms</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {STYLE_TILES.map((slug, i) => {
            const topic = topicBySlug(slug)!;
            const n = uk.topics[slug] ?? 0;
            return (
              <Link
                key={slug}
                href={`/specialisms/${slug}`}
                className={`group flex aspect-[4/3] md:aspect-[16/9] flex-col justify-between rounded-3xl p-5 transition hover:-translate-y-1 ${
                  i === 0 ? "bg-accent text-paper" : i % 2 ? "bg-soft" : "bg-zap"
                }`}
              >
                <span className="text-sm font-medium opacity-70">{n > 0 ? `${n} trainers` : ""}</span>
                <span className="flex items-end justify-between gap-3">
                  <span className="display text-2xl sm:text-4xl">{TRAINING_STYLES.find((x) => x.slug === slug)?.name ?? topic.name}</span>
                  <Arrow className="mb-1 h-5 w-5 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <ShopBanner />

      {/* Featured */}
      {/* Only shown once enough trainers have real reviews, so the heading is always true. */}
      {featured.length >= 4 && (
        <section className="bg-soft">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="display text-4xl sm:text-5xl">Highest rated</h2>
              </div>
              <Link href="/trainers" className="btn-dark">See all trainers</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {featured.map((t) => <TrainerCard key={t.id} t={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* Goals */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
          <div>
            <h2 className="display text-4xl sm:text-5xl">What do you want to work on?</h2>
            <p className="mt-4 max-w-sm text-muted">Every trainer lists the goals they help with. Pick yours to see who specialises in it.</p>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {GOAL_LIST.map((slug) => {
              const topic = topicBySlug(slug)!;
              return (
                <li key={slug}>
                  <Link href={`/specialisms/${slug}`} className="group flex items-baseline justify-between gap-4 border-b border-line py-4 hover:border-accent">
                    <span className="text-lg font-semibold group-hover:text-accent">{topic.name}</span>
                    <span className="text-sm tabular-nums text-muted">{uk.topics[slug] || ""}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Cities */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="display mb-6 text-3xl sm:text-4xl">Trainers near you</h2>
        <div className="flex flex-wrap gap-2">
          {CITIES.filter((c) => c.popular).map((c) => (
            <Link key={c.slug} href={`/locations/${c.slug}`} className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-ink">
              {c.name}
              {stats[c.slug]?.total ? <span className="ml-2 tabular-nums text-muted">{stats[c.slug].total}</span> : null}
            </Link>
          ))}
          <Link href="/locations" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-accent">
            All {CITIES.length} towns by county
          </Link>
        </div>
      </section>

    </>
  );
}
