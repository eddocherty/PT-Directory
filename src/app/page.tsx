import Link from "next/link";
import { AllFilters } from "@/components/AllFilters";
import { ShopBanner } from "@/components/ShopPromo";
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
import { FactStrip } from "@/components/Facts";
import { RecentlyViewed } from "@/components/Saved";
import { buildFacts } from "@/lib/facts";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Refresh featured trainers every 5 minutes rather than freezing them at build time.
export const revalidate = 300;

const STYLE_TILES = ["strength", "pilates", "boxing", "yoga", "running", "bootcamp"];
const GOAL_LIST = ["weight-loss", "muscle-gain", "pre-post-natal", "rehab", "older-adults", "confidence", "sports-performance", "general-fitness"];

export default async function Home() {
  const [featured, stats, uk] = await Promise.all([featuredTrainers(4), allTownStats(), ukCounts()]);
  const facts = buildFacts(uk, stats);
  return (
    <>
      {/* Hero */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": abs("/#org"), name: SITE_NAME, url: abs("/"), logo: abs("/apple-icon.png"), slogan: TAGLINE },
            { "@type": "WebSite", "@id": abs("/#site"), name: SITE_NAME, url: abs("/"), publisher: { "@id": abs("/#org") }, inLanguage: "en-GB" },
          ],
        }}
      />
      <section className="relative overflow-hidden bg-soft text-ink">
        <UkTownMap stats={stats} className="absolute top-8 hidden h-[calc(100%-4rem)] lg:right-[3%] lg:block xl:right-[7%]" />
        <div className="pointer-events-none relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:pb-24 sm:pt-20 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_form]:pointer-events-auto">
          <h1 className="display text-5xl sm:text-7xl lg:text-8xl">
            Your local PT,<br /><span className="text-accent">found in seconds.</span>
          </h1>
          <form action="/trainers" className="mt-10 flex max-w-3xl flex-col gap-4 text-ink sm:flex-row sm:items-end sm:gap-6">
            <label className="flex-1">
              <span className="eyebrow text-muted">Where</span>
              <input name="location" placeholder="Postcode or town" className="mt-1 block w-full border-b-2 border-ink bg-transparent py-2 text-xl outline-none placeholder:text-muted/70 focus:border-accent" />
            </label>
            <label className="sm:w-56">
              <span className="eyebrow text-muted">Goal</span>
              <select name="goal" defaultValue="" className="mt-1 block w-full border-b-2 border-ink bg-transparent py-2 text-xl outline-none focus:border-accent">
                <option value="">Any goal</option>
                {FITNESS_GOALS.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
              </select>
            </label>
            <button className="btn self-start text-lg sm:self-auto">Search</button>
          </form>
          <Link href="/match" className="group mt-8 flex max-w-xl items-center justify-between gap-4 border-y border-ink py-3.5 font-semibold hover:text-accent">
            <span>Not sure what you need? Find your training match</span>
            <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted group-hover:text-accent">1 min <Arrow className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
          </Link>
          <p className="mt-5 flex max-w-xl flex-wrap items-baseline gap-x-4 gap-y-2">
            <span className="text-xs font-medium text-muted">Popular</span>
            <Link href="/specialisms/pilates" className="chip">Pilates</Link>
            <Link href="/specialisms/bootcamp" className="chip">Bootcamps</Link>
            {["weight-loss", "pre-post-natal", "rehab"].map((g) => (
              <Link key={g} href={`/specialisms/${g}`} className="chip">
                {FITNESS_GOALS.find((x) => x.slug === g)?.name}
              </Link>
            ))}
          </p>
          <AllFilters />
        </div>
      </section>

      <FactStrip facts={facts} />
      <RecentlyViewed />

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
                className={`group flex aspect-[4/3] md:aspect-[16/9] flex-col justify-between p-5 transition hover:-translate-y-1 ${
                  i === 0 ? "bg-accent text-paper" : i % 2 ? "bg-soft" : "bg-zap"
                }`}
              >
                <span className="text-sm font-medium opacity-90">{n > 0 ? `${n} trainers` : ""}</span>
                <span className="flex items-end justify-between gap-3">
                  <span className="display text-2xl sm:text-4xl">{TRAINING_STYLES.find((x) => x.slug === slug)?.name ?? topic.name}</span>
                  <Arrow className="mb-1 h-5 w-5 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Online coaching gets its own band, so the hero stays simple */}
      <section className="border-y border-line bg-zap">
        <Link href="/online" className="group mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <span className="flex items-baseline gap-5">
            {uk.online > 0 && <span className="display text-5xl tabular-nums text-accent sm:text-6xl">{uk.online}</span>}
            <span>
              <span className="display block text-2xl sm:text-3xl">Train online with a UK coach</span>
              <span className="mt-1 block text-muted">UK coaches listed here who also train clients online, so where you live doesn’t matter.</span>
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-2.5 self-start border-b-4 border-accent pb-1.5 pt-2 text-[15px] font-bold group-hover:text-accent sm:self-auto">
            See online coaches <Arrow className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
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

      {/* Tools */}
      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-center">
          <div>
            <h2 className="display text-4xl sm:text-5xl">Not sure where to start?</h2>
            <p className="mt-4 max-w-sm text-paper/70">Free tools that give you a straight answer in under a minute. No sign-up.</p>
          </div>
          <ul className="divide-y divide-paper/15 border-y border-paper/15">
            {TOOLS.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="group flex items-center justify-between gap-4 py-5">
                  <span>
                    <span className="display block text-2xl group-hover:text-[#9db8f2]">{t.title}</span>
                    <span className="mt-1 block text-sm text-paper/65">{t.text}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-paper/70 group-hover:text-paper">{t.time} <Arrow className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cities */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="display mb-6 text-3xl sm:text-4xl">Trainers near you</h2>
        <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {CITIES.filter((c) => c.popular).map((c) => (
            <li key={c.slug}>
              <Link href={`/locations/${c.slug}`} className="group flex items-baseline justify-between gap-3 border-b border-line py-3 font-semibold hover:border-accent hover:text-accent">
                {c.name}
                {stats[c.slug]?.total ? <span className="text-sm font-medium tabular-nums text-muted">{stats[c.slug].total} trainers</span> : null}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/locations" className="group flex items-center justify-between gap-3 border-b-2 border-accent py-3 font-semibold text-accent hover:text-ink">
              All {CITIES.length} towns by county <Arrow className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </li>
        </ul>
      </section>

    </>
  );
}
