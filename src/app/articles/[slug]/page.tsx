import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { Arrow } from "@/components/Arrow";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ArticleNextUp } from "@/components/NextUp";
import { ARTICLES, articleBy, articlesIn, dateLabel, readingMinutes, sectionName } from "@/lib/articles";
import { formatPrice, getProduct } from "@/lib/products";
import { SITE_NAME, abs } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => ARTICLES.map((g) => ({ slug: g.slug }));
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = articleBy((await params).slug);
  if (!g) return {};
  const image = { url: `/articles/${g.slug}.jpg`, width: 1800, height: 1125, alt: g.photo.alt };
  return {
    title: g.title,
    description: g.summary,
    alternates: { canonical: `/articles/${g.slug}` },
    openGraph: { type: "article", title: g.headline, description: g.summary, images: [image], publishedTime: g.published, modifiedTime: g.updated },
    twitter: { card: "summary_large_image", title: g.headline, description: g.summary, images: [image.url] },
    ...(g.status === "draft" ? { robots: { index: false, follow: false } } : {}),
  };
}

const pad = (n: number) => String(n + 1).padStart(2, "0");

export default async function ArticlePage({ params }: Props) {
  const g = articleBy((await params).slug);
  if (!g) notFound();
  const plan = g.shop ? getProduct(g.shop) : undefined;
  const more = articlesIn(g.section).filter((x) => x.slug !== g.slug).slice(0, 4);
  const shopAfter = Math.min(2, g.sections.length - 1);

  return (
    <>
      <article>
        <header className="mx-auto max-w-5xl px-4 pt-8 sm:pt-10">
          <Breadcrumbs items={[{ name: "Articles", href: "/articles" }, { name: sectionName(g.section), href: `/articles#${g.section}` }]} className="mb-6" />
          {g.status === "draft" && (
            <p className="mb-5 border-l-4 border-accent bg-zap px-4 py-2 text-sm font-semibold">Draft. Only visible on preview links, not on the live site.</p>
          )}
          <Link href={`/articles#${g.section}`} className="chip">{sectionName(g.section)}</Link>
          <h1 className="display mt-4 max-w-4xl text-4xl sm:text-6xl">{g.headline}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted sm:text-xl">{g.summary}</p>
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 border-y border-line py-3 text-sm text-muted tabular-nums">
            <span className="font-semibold text-ink">By the {SITE_NAME} team</span>
            <span>{dateLabel(g.published)}</span>
            {g.updated !== g.published && <span>Updated {dateLabel(g.updated)}</span>}
            <span>{readingMinutes(g)} min read</span>
          </p>
        </header>

        <figure className="mx-auto mt-8 max-w-6xl sm:px-4">
          <div className="relative aspect-[16/10] overflow-hidden bg-soft sm:aspect-[2/1]">
            <Image src={`/articles/${g.slug}.jpg`} alt={g.photo.alt} fill priority sizes="(min-width: 1152px) 1120px, 100vw" className="object-cover" />
          </div>
          <figcaption className="mt-2 px-4 text-xs text-muted sm:px-0">
            Photo: <a href={g.photo.source} rel="nofollow noopener" target="_blank" className="underline hover:text-ink">{g.photo.credit} on Unsplash</a>
          </figcaption>
        </figure>

        <div className="mx-auto mt-10 grid max-w-5xl gap-x-14 px-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="min-w-0 max-w-[68ch]">
            {/* The short version: three takeaways for skimmers, each one already said in the piece. */}
            <section aria-label="The short version" className="border-t-4 border-ink pt-4">
              <p className="eyebrow">The short version</p>
              <ol className="mt-2">
                {g.quick.map((q, i) => (
                  <li key={i} className="flex gap-4 border-b border-line py-3 font-semibold leading-snug">
                    <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-accent">{pad(i)}</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </section>

            <div className="mt-10 space-y-10 text-[17px] leading-[1.75]">
              {g.sections.map((s, i) => (
                <Fragment key={s.heading}>
                  <section id={`part-${i + 1}`} className="scroll-mt-20">
                    <h2 className="display text-2xl sm:text-[1.75rem]">{s.heading}</h2>
                    {s.body.map((p, j) => (
                      <p key={j} className={`mt-4 ${i === 0 && j === 0 ? "first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-[4.2rem] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-accent" : ""}`}>{p}</p>
                    ))}
                  </section>
                  {g.callout && g.callout.at === i && (
                    <aside className="grid items-end gap-x-6 gap-y-2 border-y-2 border-ink py-6 sm:grid-cols-[auto_minmax(0,1fr)]">
                      <p className="display text-7xl text-accent sm:text-8xl">{g.callout.big}</p>
                      <p className="pb-2 text-lg font-semibold leading-snug">{g.callout.text}</p>
                    </aside>
                  )}
                  {plan && i === shopAfter && (
                    <aside className="border-l-4 border-accent bg-soft px-5 py-4">
                      <p className="eyebrow text-accent">From the shop</p>
                      <p className="mt-1.5 font-semibold leading-snug">Want something structured to follow? Our {plan.short.toLowerCase()}, “{plan.name}”, is {formatPrice(plan.price)}.</p>
                      <Link href={`/shop/${plan.slug}`} className="btn mt-2">See the plan</Link>
                    </aside>
                  )}
                </Fragment>
              ))}
            </div>

            <p className="mt-12 border-t border-line pt-5 text-sm text-muted">
              General guidance, not medical advice. If you have a health condition, are pregnant or have recently given birth, check with your GP or midwife before starting a new kind of exercise.
            </p>
          </div>

          {/* Side rail on wide screens: the parts of the piece, then where to go next. */}
          <aside className="mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-20">
              <p className="eyebrow border-b border-ink pb-3">In this piece</p>
              <ol className="hidden lg:block">
                {g.sections.map((s, i) => (
                  <li key={s.heading}>
                    <a href={`#part-${i + 1}`} className="flex gap-3 border-b border-line py-2.5 text-sm font-medium hover:text-accent">
                      <span className="w-5 shrink-0 font-bold tabular-nums text-accent">{pad(i)}</span>{s.heading}
                    </a>
                  </li>
                ))}
              </ol>
              <p className="eyebrow mt-8 border-b border-ink pb-3 lg:mt-10">Find someone</p>
              {g.related.map((r) => (
                <Link key={r.href} href={r.href} className="group flex items-center justify-between gap-3 border-b border-line py-3 text-sm font-semibold hover:border-accent hover:text-accent">
                  {r.label}<Arrow className="h-3.5 w-3.5 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              ))}
            </div>
          </aside>
        </div>

        {more.length > 0 && (
          <section className="mx-auto mt-16 max-w-5xl px-4">
            <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
              <h2 className="display text-2xl">More in {sectionName(g.section)}</h2>
              <Link href="/articles" className="btn-ghost text-sm">All articles</Link>
            </div>
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {more.map((m) => (
                <li key={m.slug}>
                  <Link href={`/articles/${m.slug}`} className="group flex gap-4 border-b border-line py-4">
                    <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-soft">
                      <Image src={`/articles/${m.slug}.jpg`} alt="" fill sizes="96px" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                    </div>
                    <span className="font-bold leading-snug group-hover:text-accent">{m.headline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
      <div className="mt-16"><ArticleNextUp g={g} /></div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.headline,
          description: g.summary,
          image: abs(`/articles/${g.slug}.jpg`),
          datePublished: g.published,
          dateModified: g.updated,
          articleSection: sectionName(g.section),
          mainEntityOfPage: abs(`/articles/${g.slug}`),
          author: { "@type": "Organization", name: SITE_NAME, url: abs("/") },
          publisher: { "@type": "Organization", name: SITE_NAME, url: abs("/") },
        }}
      />
    </>
  );
}
