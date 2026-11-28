import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Arrow";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SECTIONS, articles, articlesIn, isScheduled, publishedArticles, dateLabel, readingMinutes, sectionName, type Article } from "@/lib/articles";
import { TOOLS } from "@/lib/tools";
import { FROM_PRICE } from "@/lib/products";
import { FactStrip } from "@/components/Facts";
import { buildFacts } from "@/lib/facts";
import { allTownStats, ukCounts } from "@/lib/stats";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Articles: training, running, Pilates and choosing a personal trainer",
  description: `Features and practical pieces from ${SITE_NAME}: training through the seasons, running, Pilates, life stages, and how to choose a personal trainer you can trust.`,
  alternates: { canonical: "/articles", types: { "application/rss+xml": "/articles/feed.xml" } },
};

const pad = (n: number) => String(n).padStart(2, "0");

/** One ruled "timetable" row: title and standfirst on the left, date and reading time lined up on the right. */
function Row({ a, n }: { a: Article; n?: number }) {
  return (
    <li>
      <Link href={`/articles/${a.slug}`} className="group grid gap-x-6 gap-y-1 border-b border-line py-5 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
        <div className="flex gap-4">
          {n != null && <span className="w-7 shrink-0 pt-0.5 text-sm font-bold tabular-nums text-accent">{pad(n)}</span>}
          {n == null && (
            <div className="relative hidden aspect-[4/3] w-28 shrink-0 overflow-hidden bg-soft sm:block">
              <Image src={`/articles/${a.slug}.jpg`} alt="" fill sizes="112px" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-snug group-hover:text-accent sm:text-xl">{a.headline}</h3>
            <p className="mt-1.5 line-clamp-2 text-[15px] text-muted">{a.summary}</p>
          </div>
        </div>
        <p className={`flex gap-3 text-xs font-semibold text-muted tabular-nums sm:flex-col sm:items-end sm:gap-1 sm:pt-1 sm:text-right ${n != null ? "pl-11 sm:pl-0" : ""}`}>
          <span>{dateLabel(a.published, true)}</span>
          <span>{readingMinutes(a)} min read</span>
          {a.status === "draft" && <span className="text-accent">Draft</span>}
          {isScheduled(a) && <span className="text-accent">Scheduled</span>}
        </p>
      </Link>
    </li>
  );
}

export default async function ArticlesPage() {
  const [uk, stats] = await Promise.all([ukCounts(), allTownStats()]);
  const ARTICLES = articles();
  const PUBLISHED_ARTICLES = publishedArticles();
  const [lead, ...rest] = ARTICLES;
  const latest = rest.slice(0, 4);
  const sections = SECTIONS.map((s) => ({ ...s, items: articlesIn(s.slug) })).filter((s) => s.items.length);
  const lastUpdated = (PUBLISHED_ARTICLES.length ? PUBLISHED_ARTICLES : ARTICLES).map((a) => a.updated).sort().at(-1)!;

  return (
    <>
      {/* Masthead: the name set big, with a ruled index of sections underneath, like the contents line of a magazine. */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:pt-10">
          <Breadcrumbs items={[{ name: "Articles", href: "/articles" }]} className="mb-6" />
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b-4 border-ink pb-5">
            <h1 className="display text-6xl sm:text-8xl">Articles</h1>
            <p className="max-w-xs text-sm text-muted sm:text-right">
              Training, running, Pilates, and how to pick a trainer worth paying. Fresh pieces every fortnight.
              <span className="mt-1 block text-xs font-semibold tabular-nums text-ink">Updated {dateLabel(lastUpdated)}</span>
            </p>
          </div>
          <nav aria-label="Sections" className="flex flex-wrap gap-x-7 gap-y-2 py-4 text-sm font-semibold">
            {sections.map((s) => (
              <a key={s.slug} href={`#${s.slug}`} className="group inline-flex items-baseline gap-1.5 hover:text-accent">
                {s.name}<sup className="text-[10px] font-bold tabular-nums text-accent">{s.items.length}</sup>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Lead story and the next four, newest first */}
      <section className="mx-auto grid max-w-7xl gap-x-14 gap-y-10 px-4 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Link href={`/articles/${lead.slug}`} className="group block">
          <div className="relative mb-6 aspect-[16/10] overflow-hidden bg-soft">
            <Image src={`/articles/${lead.slug}.jpg`} alt={lead.photo.alt} fill priority sizes="(min-width: 1024px) 760px, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.02]" />
          </div>
          <span className="chip">{sectionName(lead.section)}</span>
          <h2 className="display mt-4 text-4xl group-hover:text-accent sm:text-5xl">{lead.headline}</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{lead.summary}</p>
          <p className="mt-5 text-sm font-semibold tabular-nums text-muted">
            {dateLabel(lead.published)} · {readingMinutes(lead)} min read{lead.status === "draft" && <span className="text-accent"> · Draft</span>}
          </p>
          <span className="btn mt-6">Read it</span>
        </Link>
        <div>
          <p className="eyebrow border-b border-ink pb-3">Latest</p>
          <ol>{latest.map((a, i) => <Row key={a.slug} a={a} n={i + 2} />)}</ol>
        </div>
      </section>

      {/* Everything, by section */}
      <div className="mx-auto max-w-7xl px-4 pb-6">
        {sections.map((s) => (
          <section key={s.slug} id={s.slug} className="scroll-mt-20 border-t-2 border-ink pt-5 pb-10 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-14">
            <div className="mb-2 flex items-baseline justify-between gap-4 lg:block">
              <h2 className="display text-2xl sm:text-3xl">{s.name}</h2>
              <p className="text-sm font-semibold tabular-nums text-muted lg:mt-2">{s.items.length} {s.items.length === 1 ? "piece" : "pieces"}</p>
            </div>
            <ul className="lg:-mt-5">{s.items.map((a) => <Row key={a.slug} a={a} />)}</ul>
          </section>
        ))}
      </div>

      {/* Not plans: the plans are in the shop. Quick tools for short questions. */}
      <section className="border-t border-line bg-soft">
        <div className="mx-auto grid max-w-7xl gap-x-14 gap-y-10 px-4 py-12 lg:grid-cols-2">
          <div>
            <h2 className="display text-2xl sm:text-3xl">Want a plan to follow?</h2>
            <p className="mt-3 max-w-md text-muted">
              Articles are for reading. If you want week-by-week sessions to follow on your own, our printable plans are in the shop, from {FROM_PRICE}.
            </p>
            <Link href="/shop" className="btn mt-5">See the plans</Link>
          </div>
          <div>
            <h2 className="display text-2xl sm:text-3xl">Prefer a quick answer?</h2>
            <ul className="mt-3">
              {TOOLS.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="group flex items-baseline justify-between gap-4 border-b border-line py-3 font-semibold hover:border-accent hover:text-accent">
                    <span>{t.title}</span>
                    <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted tabular-nums">{t.time}<Arrow className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:text-accent" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <FactStrip facts={buildFacts(uk, stats)} salt={1} />
    </>
  );
}
