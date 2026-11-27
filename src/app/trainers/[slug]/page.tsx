import type { Metadata } from "next";
import { Arrow } from "@/components/Arrow";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquiryForm } from "@/components/EnquiryForm";
import { JsonLd } from "@/components/JsonLd";
import { ReviewForm } from "@/components/ReviewForm";
import { ShopProfileCard } from "@/components/ShopPromo";
import { Stars } from "@/components/Stars";
import { Avatar } from "@/components/Avatar";
import { HeartButton, RecentlyViewed, RememberViewed } from "@/components/Saved";
import { ArticleCard } from "@/components/NextUp";
import { articlesForTopics } from "@/lib/articles";
import { FITNESS_GOALS, SPORTS, TRAINING_STYLES, nameFor } from "@/lib/taxonomy";
import { abs } from "@/lib/site";
import { allTownStats, countySlug, townFor } from "@/lib/stats";
import { MIN_TRAINERS, TOWN_RADIUS } from "@/lib/topics";
import { cachedSearch, getTrainer, isThin, type Trainer } from "@/lib/trainers";
import { CITIES } from "@/lib/taxonomy";

/**
 * Heading size for a trainer's name, stepped down by its longest word, so one long word
 * ("Macclesfield", "Bodytransformation") fits the column whole instead of splitting mid-word
 * on phones and tablets, where the name sits beside the photo in a narrow column.
 */
function nameSize(name: string) {
  const longest = Math.max(...name.split(/[\s-]+/).map((w) => w.length));
  if (longest >= 16) return "text-2xl min-[400px]:text-3xl lg:text-4xl xl:text-5xl";
  if (longest >= 13) return "text-3xl min-[400px]:text-4xl sm:text-3xl lg:text-5xl xl:text-6xl";
  if (longest >= 11) return "text-4xl min-[400px]:text-5xl lg:text-6xl";
  return "text-4xl min-[400px]:text-5xl sm:text-6xl";
}

// years_experience was recorded in 2026; show a start year so it never goes stale.
const EXPERIENCE_BASE_YEAR = 2026;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTrainer((await params).slug);
  if (!t) return {};
  return {
    title: `${t.name}, personal trainer${t.city ? ` in ${t.city}` : ""}`,
    description: describe(t),
    alternates: { canonical: `/trainers/${t.slug}` },
    // Profiles with too little detail stay out of Google; town pages cover them.
    robots: isThin(t) ? { index: false, follow: true } : undefined,
  };
}

/** Meta description from facts on the page: the headline, then how and where they train, kept near 155 characters. */
function describe(t: Trainer) {
  const styles = t.styles.slice(0, 3).map((s) => nameFor(TRAINING_STYLES, s).toLowerCase());
  const lead = t.headline?.replace(/\.?$/, ".") ??
    `${t.business_name && t.business_name !== t.name ? t.business_name : t.name}: independent trainer${t.city ? ` in ${t.city}` : ""}${styles.length ? ` for ${styles.join(", ")}` : ""}.`;
  const modes = [t.in_person && t.city && `in person in ${t.city}`, t.home_visits && "home visits", t.online && "online coaching"].filter(Boolean) as string[];
  const extra = modes.length ? ` Offers ${modes.join(", ").replace(/, ([^,]*)$/, " and $1")}.` : "";
  const tail = " See specialisms and contact them directly.";
  return [lead, extra, tail].reduce((acc, part) => (acc.length + part.length <= 160 ? acc + part : acc), "");
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
  return <h2 className="display mb-4 text-3xl [overflow-wrap:anywhere]">{children}</h2>;
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
  const [stats, near] = town
    ? await Promise.all([allTownStats(), cachedSearch({ lat: town.lat, lng: town.lng, radius: TOWN_RADIUS })])
    : [null, null];
  // Up to six other trainers near the same town, ones sharing a style first, for people comparing options.
  const shared = (o: { styles: string[] }) => o.styles.filter((s) => t.styles.includes(s)).length;
  const nearby = (near?.trainers ?? [])
    .filter((o) => o.slug !== t.slug)
    .map((o, i) => ({ o, i }))
    .sort((a, b) => shared(b.o) - shared(a.o) || a.i - b.i)
    .slice(0, 6)
    .map(({ o }) => o);
  // Specialism links go to this trainer's town page for it when that page exists, otherwise the UK-wide page.
  const topicHref = (slug: string) =>
    town && (stats?.[town.slug]?.topics[slug] ?? 0) >= MIN_TRAINERS ? `/locations/${town.slug}/${slug}` : `/specialisms/${slug}`;
  // Sole traders read "Contact Nate"; studios and gyms keep their full name ("Contact Gym 72").
  const isPerson = !!t.business_name && t.business_name !== t.name && !/^the\s/i.test(t.name);
  const first = isPerson ? t.name.split(" ")[0] : t.name;
  // Real listings nobody has claimed yet: enquiries would have no one to read them, so send people to the trainer directly.
  const direct = !t.claimed;
  const checked = t.last_verified_at ? new Date(t.last_verified_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : null;
  const sourceLabel = t.source === "osm" ? "OpenStreetMap and their own website" : t.source === "website" ? "their own website" : null;
  const where = [t.city, t.region && t.region !== t.city ? t.region : null].filter(Boolean).join(", ");
  const links = [
    t.website && !direct && { label: "Website", href: t.website, track: "website" },
    t.instagram && { label: "Instagram", href: `https://instagram.com/${t.instagram.replace(/^@/, "")}`, track: "instagram" },
    t.phone && { label: "Call", href: `tel:${t.phone}`, track: "phone" },
  ].filter(Boolean) as { label: string; href: string; track: string }[];

  const saved = { slug: t.slug, name: t.name, city: t.city, styles: t.styles, goals: t.goals };
  const reading = articlesForTopics([...t.styles, ...t.goals, ...(t.home_visits ? ["home-visits"] : []), ...(t.online ? ["online"] : [])], 2);

  return (
    <>
      <RememberViewed t={saved} />
      {/* Hero */}
      <section className="bg-soft text-ink">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:items-end md:py-14">
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
              <h1 className={`display [overflow-wrap:anywhere] ${nameSize(t.name)}`}>{t.name}</h1>
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
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {t.styles.map((s) => <span key={s} className="chip-ink">{nameFor(TRAINING_STYLES, s)}</span>)}
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <a href="#contact" data-track="contact_button" className="btn">Contact {first}</a>
              <HeartButton t={saved} variant="pill" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-12">
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
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {t.styles.map((s) => <Link key={s} href={topicHref(s)} className="chip-ink">{nameFor(TRAINING_STYLES, s)}</Link>)}
                </div>
              </div>
              <div>
                <p className="eyebrow mb-2 text-muted">Helps you with</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {t.goals.map((g) => <Link key={g} href={topicHref(g)} className="chip text-muted">{nameFor(FITNESS_GOALS, g)}</Link>)}
                </div>
              </div>
            </div>
          </section>

          {t.sports.length > 0 && (
            <section>
              <H2>Sports &amp; hobbies</H2>
              <div className="grid gap-x-8 sm:grid-cols-2">
                {t.sports.map((s) => (
                  <Link key={s} href={`/trainers?sport=${s}`} className="group flex items-center justify-between border-b border-line py-3 font-semibold hover:border-accent hover:text-accent">
                    {nameFor(SPORTS, s)}
                    <Arrow className="h-3.5 w-3.5 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <H2>How they train</H2>
            <dl className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
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

          {t.reviews.length > 0 ? (
            <section id="reviews" className="scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <H2>Reviews</H2>
                {t.rating_avg != null && (
                  <p className="mb-4 flex items-center gap-2"><Stars value={t.rating_avg} size="text-lg" /> <strong>{t.rating_avg.toFixed(1)}</strong> from {t.review_count}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {t.reviews.map((r) => (
                  <figure key={r.id} className="bg-soft p-5">
                    <Stars value={r.rating} />
                    {r.body && <blockquote className="mt-2 text-sm leading-relaxed">“{r.body}”</blockquote>}
                    <figcaption className="mt-3 text-xs font-semibold text-muted">{r.author_name}</figcaption>
                  </figure>
                ))}
              </div>
              <details className="mt-6 border border-line p-5">
                <summary className="cursor-pointer font-semibold">Write a review</summary>
                <div className="mt-4"><ReviewForm slug={t.slug} firstName={first} /></div>
              </details>
            </section>
          ) : (
            /* No reviews yet: no empty "Reviews" section, just a quiet way to leave the first one. */
            <details id="reviews" className="scroll-mt-24 border-t border-line pt-5">
              <summary className="cursor-pointer font-semibold">Trained with {first}? Write a review</summary>
              <div className="mt-4"><ReviewForm slug={t.slug} firstName={first} /></div>
            </details>
          )}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start" id="contact">
          <div className="scroll-mt-24 bg-soft p-6">
            <p className="display text-2xl [overflow-wrap:anywhere] sm:text-3xl">Contact {first}</p>
            <p className="mb-4 mt-2 text-sm text-muted">
              Ask {first} about prices and availability.
            </p>
            {direct ? (
              <>
                <p className="mb-4 text-sm">Get in touch with {first} directly through their website.</p>
                {t.website && <a href={t.website} target="_blank" rel="nofollow noopener" data-track="website" className="btn">Visit {first}’s website</a>}
              </>
            ) : (
              <EnquiryForm slug={t.slug} firstName={first} />
            )}
            {links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {links.map((l) => <a key={l.label} href={l.href} target="_blank" rel="nofollow noopener" data-track={l.track} className="btn-ghost text-sm">{l.label}</a>)}
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
          <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="display text-2xl">Other independent trainers near {town.name}</h2>
              <Link href={`/locations/${town.slug}`} className="btn-ghost">See all trainers in {town.name}</Link>
            </div>
            {nearby.length > 0 && (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {nearby.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/trainers/${o.slug}`} className="block border border-line p-4 hover:border-ink">
                      <span className="font-semibold">{o.name}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {[o.city, o.styles.slice(0, 2).map((s) => nameFor(TRAINING_STYLES, s)).join(", ")].filter(Boolean).join(" · ")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
      <section className="border-t border-line bg-soft">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="display text-2xl">Before you get in touch</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {reading.map((g) => <ArticleCard key={g.slug} g={g} />)}
          </div>
        </div>
      </section>
      <RecentlyViewed exclude={t.slug} title="Trainers you looked at" />
      <JsonLd data={businessData(t)} />

      {/* Mobile sticky contact bar */}
      <div className="sticky bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        {/* A business's button already carries its full name, so only show the name beside a person's first name. */}
        {first !== t.name && <span className="min-w-0 truncate text-sm font-semibold">{t.name}</span>}
        <a href="#contact" data-track="contact_button" className="btn ml-auto">Contact {first}</a>
      </div>
    </>
  );
}
