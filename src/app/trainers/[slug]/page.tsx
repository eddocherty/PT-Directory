import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquiryForm } from "@/components/EnquiryForm";
import { JsonLd } from "@/components/JsonLd";
import { ReviewForm } from "@/components/ReviewForm";
import { ShopProfileCard } from "@/components/ShopPromo";
import { Stars } from "@/components/Stars";
import { Avatar } from "@/components/TrainerCard";
import { FITNESS_GOALS, SPORTS, TRAINING_STYLES, nameFor } from "@/lib/taxonomy";
import { abs } from "@/lib/site";
import { allTownStats, countySlug, townFor } from "@/lib/stats";
import { MIN_TRAINERS } from "@/lib/topics";
import { getTrainer, isThin, type Trainer } from "@/lib/trainers";
import { CITIES } from "@/lib/taxonomy";

// years_experience was recorded in 2026; show a start year so it never goes stale.
const EXPERIENCE_BASE_YEAR = 2026;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTrainer((await params).slug);
  if (!t) return {};
  return {
    title: `${t.name}, personal trainer${t.city ? ` in ${t.city}` : ""}`,
    description:
      t.headline ??
      `${t.name} is an independent trainer${t.city ? ` in ${t.city}` : ""}${t.styles.length ? ` specialising in ${t.styles.slice(0, 3).map((s) => nameFor(TRAINING_STYLES, s).toLowerCase()).join(", ")}` : ""}. See their specialisms and get in touch directly.`,
    alternates: { canonical: `/trainers/${t.slug}` },
    // Sample listings and profiles with too little detail stay out of Google; town pages cover them.
    robots: t.is_sample || isThin(t) ? { index: false, follow: true } : undefined,
  };
}

/** LocalBusiness data for Google: only facts shown on the page, and reviews only when real ones exist. */
function businessData(t: Trainer) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": abs(`/trainers/${t.slug}#business`),
    name: t.business_name || t.name,
    url: abs(`/trainers/${t.slug}`),
    ...(t.headline ? { description: t.headline } : {}),
    address: {
      "@type": "PostalAddress",
      ...(t.city ? { addressLocality: t.city } : {}),
      ...(t.region ? { addressRegion: t.region } : {}),
      addressCountry: "GB",
    },
    ...(t.online ? { areaServed: { "@type": "Country", name: "United Kingdom" } } : t.city ? { areaServed: t.city } : {}),
    ...(t.phone ? { telephone: t.phone } : {}),
    ...(t.website ? { sameAs: [t.website] } : {}),
    knowsAbout: [...t.styles.map((s) => nameFor(TRAINING_STYLES, s)), ...t.goals.map((g) => nameFor(FITNESS_GOALS, g))],
    ...(t.review_count > 0 && t.rating_avg != null
      ? {
          aggregateRating: { "@type": "AggregateRating", ratingValue: t.rating_avg, reviewCount: t.review_count, bestRating: 5, worstRating: 1 },
          review: t.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author_name },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            ...(r.body ? { reviewBody: r.body } : {}),
            datePublished: r.created_at.slice(0, 10),
          })),
        }
      : {}),
  };
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="display mb-4 text-3xl">{children}</h2>;
}

export default async function TrainerPage({ params }: Props) {
  const t = await getTrainer((await params).slug);
  if (!t) {
    // A removed listing: send old links to its town page rather than an error. Slugs end with the town, e.g. "-leeds".
    const slug = (await params).slug;
    const town = [...CITIES].sort((a, b) => b.slug.length - a.slug.length).find((c) => slug.endsWith(`-${c.slug}`));
    if (town) permanentRedirect(`/locations/${town.slug}`);
    notFound();
  }
  const town = townFor(t.city);
  const stats = town ? await allTownStats() : null;
  // Specialism links go to this trainer's town page for it when that page exists, otherwise the UK-wide page.
  const topicHref = (slug: string) =>
    town && (stats?.[town.slug]?.topics[slug] ?? 0) >= MIN_TRAINERS ? `/locations/${town.slug}/${slug}` : `/specialisms/${slug}`;
  // Sole traders read "Contact Nate"; studios and gyms keep their full name ("Contact Gym 72").
  const isPerson = !!t.business_name && t.business_name !== t.name && !/^the\s/i.test(t.name);
  const first = isPerson ? t.name.split(" ")[0] : t.name;
  // Real listings nobody has claimed yet: enquiries would have no one to read them, so send people to the trainer directly.
  const direct = !t.claimed && !t.is_sample;
  const checked = t.last_verified_at ? new Date(t.last_verified_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : null;
  const sourceLabel = t.source === "osm" ? "OpenStreetMap and their own website" : t.source === "website" ? "their own website" : null;
  const where = [t.city, t.region && t.region !== t.city ? t.region : null].filter(Boolean).join(", ");
  const links = [
    t.website && !direct && { label: "Website", href: t.website, track: "website" },
    t.instagram && { label: "Instagram", href: `https://instagram.com/${t.instagram.replace(/^@/, "")}`, track: "instagram" },
    t.phone && { label: "Call", href: `tel:${t.phone}`, track: "phone" },
  ].filter(Boolean) as { label: string; href: string; track: string }[];

  return (
    <>
      {/* Hero */}
      <section className="bg-soft text-ink">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[minmax(0,420px)_1fr] md:items-end md:py-14">
          <div className="relative">
            <Avatar t={t} size="hero" className="aspect-square w-full rounded-3xl md:aspect-[4/5]" />
          </div>
          <div className="flex flex-col gap-5">
            <Breadcrumbs
              items={[
                ...(town
                  ? [
                      { name: town.county, href: `/counties/${countySlug(town.county)}` },
                      { name: town.name, href: `/locations/${town.slug}` },
                    ]
                  : [{ name: "Trainers", href: "/trainers" }]),
                { name: t.name, href: `/trainers/${t.slug}` },
              ]}
            />
            <div>
              <h1 className="display text-5xl sm:text-6xl">{t.name}</h1>
              <p className="mt-3 text-lg text-muted">{where || "UK"}{t.online && " · Online coaching UK-wide"}</p>
            </div>
            {t.review_count > 0 && t.rating_avg != null && (
              <a href="#reviews" className="flex items-center gap-2 text-sm">
                <Stars value={t.rating_avg} size="text-xl" />
                <span className="font-bold">{t.rating_avg.toFixed(1)}</span>
                <span className="text-muted underline">{t.review_count} reviews</span>
              </a>
            )}
            {t.headline && <p className="max-w-xl text-xl font-semibold">{t.headline}</p>}
            <div className="flex flex-wrap gap-2">
              {t.styles.map((s) => <span key={s} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold">{nameFor(TRAINING_STYLES, s)}</span>)}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#contact" data-track="contact_button" className="btn">Contact {first}</a>
            </div>
            {t.is_sample && <p className="text-xs italic text-muted">Example listing, not a real trainer.</p>}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-12">
          {t.bio && (
            <section>
              <H2>About {first}</H2>
              <p className="whitespace-pre-line text-base leading-relaxed">{t.bio}</p>
            </section>
          )}

          <section>
            <H2>Specialisms</H2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-2 text-muted">Training styles</p>
                <div className="flex flex-wrap gap-2">
                  {t.styles.map((s) => <Link key={s} href={topicHref(s)} className="chip-ink hover:bg-accent">{nameFor(TRAINING_STYLES, s)}</Link>)}
                </div>
              </div>
              <div>
                <p className="eyebrow mb-2 text-muted">Helps you with</p>
                <div className="flex flex-wrap gap-2">
                  {t.goals.map((g) => <Link key={g} href={topicHref(g)} className="chip hover:bg-line">{nameFor(FITNESS_GOALS, g)}</Link>)}
                </div>
              </div>
            </div>
          </section>

          {t.sports.length > 0 && (
            <section>
              <H2>Sports &amp; hobbies</H2>
              <div className="flex flex-wrap gap-3">
                {t.sports.map((s) => (
                  <Link key={s} href={`/trainers?sport=${s}`} className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium hover:border-ink">
                    {nameFor(SPORTS, s)}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <H2>How they train</H2>
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {([
                ["In person", t.in_person],
                ["Online", t.online],
                ["Home visits", t.home_visits],
              ] as const).map(([label, on]) => (
                <div key={label} className="bg-paper p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
                  <dd className={`mt-1 font-semibold ${on ? "text-ink" : "text-muted"}`}>{on ? "Yes" : "No"}</dd>
                </div>
              ))}
            </dl>
          </section>

          {(t.qualifications.length > 0 || t.years_experience != null) && (
            <section>
              <H2>Qualifications</H2>
              <ul className="flex flex-col gap-2">
                {t.years_experience != null && <li className="border-l-2 border-accent pl-3 font-semibold">Training clients since {EXPERIENCE_BASE_YEAR - t.years_experience}</li>}
                {t.qualifications.map((q) => <li key={q} className="border-l-2 border-line pl-3">{q}</li>)}
              </ul>
            </section>
          )}

          <section id="reviews" className="scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <H2>Reviews</H2>
              {t.rating_avg != null && (
                <p className="mb-4 flex items-center gap-2"><Stars value={t.rating_avg} size="text-lg" /> <strong>{t.rating_avg.toFixed(1)}</strong> from {t.review_count}</p>
              )}
            </div>
            {t.reviews.length === 0 && <p className="text-muted">No reviews yet. If you’ve trained with {first}, you can write one below.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              {t.reviews.map((r) => (
                <figure key={r.id} className="rounded-2xl bg-soft p-5">
                  <Stars value={r.rating} />
                  {r.body && <blockquote className="mt-2 text-sm leading-relaxed">“{r.body}”</blockquote>}
                  <figcaption className="mt-3 text-xs font-semibold text-muted">{r.author_name}</figcaption>
                </figure>
              ))}
            </div>
            <details className="mt-6 rounded-2xl border border-line p-5">
              <summary className="cursor-pointer font-semibold">Write a review</summary>
              <div className="mt-4"><ReviewForm slug={t.slug} firstName={first} /></div>
            </details>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" id="contact">
          <div className="scroll-mt-24 rounded-3xl bg-soft p-6">
            <p className="display text-3xl">Contact {first}</p>
            <p className="mb-4 mt-2 text-sm text-muted">
              Ask {first} about prices and availability.
            </p>
            {direct ? (
              <>
                <p className="mb-4 text-sm">Get in touch with {first} directly through their website.</p>
                {t.website && <a href={t.website} target="_blank" rel="nofollow noopener" data-track="website" className="btn w-full justify-center">Visit {first}’s website</a>}
              </>
            ) : (
              <EnquiryForm slug={t.slug} firstName={first} />
            )}
            {links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {links.map((l) => <a key={l.label} href={l.href} target="_blank" rel="nofollow noopener" data-track={l.track} className="btn-ghost px-4 py-2 text-xs">{l.label}</a>)}
              </div>
            )}
          </div>
          <ShopProfileCard goals={t.goals} styles={t.styles} />
          {direct && sourceLabel && (
            <p className="mt-4 px-2 text-xs text-muted">
              Details from {sourceLabel}{t.source === "osm" && " (© OpenStreetMap contributors, ODbL)"}{checked && `, checked ${checked}`}.
            </p>
          )}
          <p className="mt-4 px-2 text-xs text-muted">
            Is this your listing?{" "}
            <Link href={`/remove?listing=${t.slug}`} className="underline hover:text-ink">Request removal or a correction</Link>.
          </p>
        </aside>
      </div>

      {town && (
        <section className="border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10">
            <p className="display text-2xl">More independent trainers near {town.name}</p>
            <Link href={`/locations/${town.slug}`} className="btn-ghost">See trainers in {town.name}</Link>
          </div>
        </section>
      )}
      {!t.is_sample && <JsonLd data={businessData(t)} />}

      {/* Mobile sticky contact bar */}
      <div className="sticky bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="text-sm font-semibold">{t.name}</span>
        <a href="#contact" data-track="contact_button" className="btn py-2.5">Contact {first}</a>
      </div>
    </>
  );
}
