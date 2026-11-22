import Link from "next/link";
import { TrainerCard } from "@/components/TrainerCard";
import { CITIES, FITNESS_GOALS, TRAINING_STYLES } from "@/lib/taxonomy";
import { featuredTrainers } from "@/lib/trainers";

// Refresh featured trainers every 5 minutes rather than freezing them at build time.
export const revalidate = 300;

const STYLE_TILES = [
  { slug: "strength", line: "Get strong" },
  { slug: "hiit", line: "Sweat it out" },
  { slug: "boxing", line: "Throw hands" },
  { slug: "yoga", line: "Find your flow" },
  { slug: "running", line: "Go further" },
  { slug: "pilates", line: "Core power" },
];

export default async function Home() {
  const featured = await featuredTrainers(4);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-soft text-ink">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-zap blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:pb-24 sm:pt-20">
          <p className="eyebrow text-accent">The UK’s personal trainer directory</p>
          <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-8xl">
            Find your<br /><span className="text-accent">trainer.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Real coaches near you, whatever you’re training for. Compare specialisms, reviews and prices, then message them for free.
          </p>
          <form action="/trainers" className="mt-8 flex max-w-3xl flex-col gap-2 rounded-3xl border border-line bg-paper p-2 text-ink shadow-sm sm:flex-row sm:rounded-full">
            <input name="location" placeholder="Postcode or town" aria-label="Postcode or town" className="flex-1 rounded-full px-5 py-3 text-base outline-none" />
            <select name="goal" defaultValue="" aria-label="Goal" className="rounded-full bg-soft px-5 py-3 text-base outline-none sm:w-56">
              <option value="">Any goal</option>
              {FITNESS_GOALS.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
            </select>
            <button className="btn px-7 text-base">Search</button>
          </form>
          <Link href="/trainers?online=1" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-paper hover:opacity-90">
            Or train online with a UK coach, wherever you live →
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="text-muted">Popular:</span>
            <Link href="/trainers?style=pilates" className="rounded-full border border-line bg-paper px-3 py-1 hover:border-ink">Pilates</Link>
            <Link href="/trainers?style=bootcamp" className="rounded-full border border-line bg-paper px-3 py-1 hover:border-ink">Bootcamps</Link>
            {["weight-loss", "muscle-gain", "pre-post-natal", "rehab"].map((g) => (
              <Link key={g} href={`/trainers?goal=${g}`} className="rounded-full border border-line bg-paper px-3 py-1 hover:border-ink">
                {FITNESS_GOALS.find((x) => x.slug === g)?.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Styles */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-4xl sm:text-5xl">Train your way</h2>
          <Link href="/trainers" className="btn-ghost">All styles</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {STYLE_TILES.map((s, i) => (
            <Link
              key={s.slug}
              href={`/trainers?style=${s.slug}`}
              className={`group flex aspect-[4/3] md:aspect-[16/9] flex-col justify-between rounded-3xl p-5 transition hover:-translate-y-1 ${
                ["bg-accent text-paper", "bg-soft", "bg-zap", "bg-soft", "bg-zap", "bg-soft"][i]
              }`}
            >
              <span className="eyebrow opacity-70">{TRAINING_STYLES.find((x) => x.slug === s.slug)?.name}</span>
              <span className="display text-2xl sm:text-4xl">{s.line} <span className="inline-block transition group-hover:translate-x-2">→</span></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="bg-soft">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-accent">Top rated</p>
                <h2 className="display mt-1 text-4xl sm:text-5xl">Trainers people love</h2>
              </div>
              <Link href="/trainers" className="btn-dark">See all trainers</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {featured.map((t) => <TrainerCard key={t.id} t={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="display text-4xl sm:text-5xl">Three steps. Zero faff.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["01", "Search", "Pop in your postcode and what you want to work on."],
            ["02", "Compare", "Check specialisms, reviews, prices and what they do for fun."],
            ["03", "Message", "Contact trainers for free. Loads offer a free first session."],
          ].map(([n, h, p]) => (
            <div key={n} className="rounded-3xl border border-line p-6">
              <p className="text-sm font-semibold text-muted">{n}</p>
              <p className="display mt-3 text-2xl">{h}</p>
              <p className="mt-2 text-muted">{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cities */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="display mb-6 text-3xl sm:text-4xl">Trainers near you</h2>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Link key={c.slug} href={`/locations/${c.slug}`} className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-ink">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Trainer CTA */}
      <section className="bg-accent text-paper">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="display text-4xl sm:text-5xl">Are you a PT?</h2>
            <p className="mt-2 max-w-lg text-lg text-paper/85">Claim your free profile, add your photos and specialisms, and start getting enquiries.</p>
          </div>
          <Link href="/for-trainers" className="btn-light text-base">Claim your profile</Link>
        </div>
      </section>
    </>
  );
}
