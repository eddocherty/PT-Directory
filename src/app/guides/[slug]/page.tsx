import type { Metadata } from "next";
import { Arrow } from "@/components/Arrow";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { GUIDES, guideBy, readingMinutes } from "@/lib/guides";
import { GuideNextUp } from "@/components/NextUp";
import { SITE_NAME, abs } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = guideBy((await params).slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.summary,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { type: "article", title: g.title, description: g.summary },
  };
}

const dateLabel = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function GuidePage({ params }: Props) {
  const g = guideBy((await params).slug);
  if (!g) notFound();
  const others = GUIDES.filter((x) => x.slug !== g.slug);
  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: g.title, href: `/guides/${g.slug}` }]} className="mb-6" />
        <h1 className="display text-3xl sm:text-4xl">{g.title}</h1>
        <p className="mt-3 text-lg text-muted">{g.summary}</p>
        <p className="mt-2 text-sm text-muted">Updated {dateLabel(g.updated)} · {readingMinutes(g)} min read</p>
        <div className="mt-8 space-y-8 leading-relaxed">
          {g.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold">{s.heading}</h2>
              {s.body.map((p, i) => <p key={i} className="mt-3">{p}</p>)}
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
          General guidance, not medical advice. If you have a health condition, are pregnant or have recently given birth, check with your GP or midwife before starting a new kind of exercise.
        </p>
        <div className="mt-8 grid gap-x-8 sm:grid-cols-2">
          {g.related.map((r) => (
            <Link key={r.href} href={r.href} className="group flex items-center justify-between border-b border-line py-3 font-semibold hover:border-accent hover:text-accent">{r.label}<Arrow className="h-3.5 w-3.5 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" /></Link>
          ))}
        </div>
        <h2 className="mt-12 text-lg font-semibold">More guides</h2>
        <ul className="mt-3 space-y-2">
          {others.map((o) => (
            <li key={o.slug}><Link href={`/guides/${o.slug}`} className="text-accent hover:underline">{o.title}</Link></li>
          ))}
        </ul>
      </article>
      <GuideNextUp g={g} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.summary,
          dateModified: g.updated,
          mainEntityOfPage: abs(`/guides/${g.slug}`),
          publisher: { "@type": "Organization", name: SITE_NAME, url: abs("/") },
        }}
      />
    </>
  );
}
