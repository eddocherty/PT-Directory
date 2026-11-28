// The page a paying trainer (£10 a month) gets. Free listings use the plain page in app/trainers/[slug] and never change.
// Same house style as the rest of the site: ruled "timetable" rows, square corners, one cobalt accent, bold words
// with a thick bar for buttons. Everything shown is either a fact we hold or something the trainer supplied.
import Link from "next/link";
import { Suspense } from "react";
import { Arrow } from "@/components/Arrow";
import { Avatar } from "@/components/Avatar";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ReviewForm } from "@/components/ReviewForm";
import { HeartButton } from "@/components/Saved";
import { Stars } from "@/components/Stars";
import { MapHover } from "@/components/MapHover";
import { UK_H, UK_OUTLINE, UK_W, ukX, ukY } from "@/components/UkTownMap";
import { getAreaMap, MAP_H, MAP_W, PX_PER_MILE, type Place } from "@/lib/area-map";
import type { PaidProfile } from "@/lib/paid";
import { videoEmbed } from "@/lib/paid";
import type { City } from "@/lib/taxonomy";
import { FITNESS_GOALS, SPORTS, TRAINING_STYLES, nameFor } from "@/lib/taxonomy";
import type { Trainer } from "@/lib/trainers";
import type { SavedTrainer } from "@/lib/saved";
import { CountUp, Reveal, SectionIndex } from "./motion";

const ukDate = (d: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
  d ? new Date(d).toLocaleDateString("en-GB", opts) : null;

const TAKING = {
  yes: { label: "Taking new clients", dot: "bg-emerald-600", ping: true },
  waitlist: { label: "Waiting list for new clients", dot: "bg-amber-500", ping: false },
  no: { label: "Not taking new clients right now", dot: "bg-muted", ping: false },
} as const;

// The street drawing (3000 x 1860) is shown at 3/4 size on wide screens and half size on phones: see the box sizes in Hero.
const RINGS = [0.5, 1, 2]; // miles from the town centre

type Props = {
  t: Trainer;
  paid: PaidProfile;
  town: City | undefined;
  first: string;
  saved: SavedTrainer;
  crumbs: Crumb[];
  nameClass: string;
  sinceYear: number | null;
  links: { label: string; href: string; track: string }[];
  topicHref: (slug: string) => string;
  reading: React.ReactNode;
};

/** "54.33°N 2.75°W", the town centre (never the trainer's own address). */
const coords = (c: City) => `${Math.abs(c.lat).toFixed(2)}°${c.lat >= 0 ? "N" : "S"} ${Math.abs(c.lng).toFixed(2)}°${c.lng < 0 ? "W" : "E"}`;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

function lowestPrice(prices: PaidProfile["prices"]) {
  let best: { value: number; label: string } | null = null;
  for (const p of prices) {
    const m = p.price?.match(/£\s?(\d+(?:\.\d{1,2})?)/);
    if (m && (!best || Number(m[1]) < best.value)) best = { value: Number(m[1]), label: p.label };
  }
  return best;
}

/* ------------------------------------------------------------------ hero */

/** Streets, place names and the distance rings, centred on the photo. Waits for the drawing without holding up the page. */
async function AreaLayer({ town }: { town: City }) {
  const map = await getAreaMap(town);
  if (!map) return null;
  // Places hidden behind the photo don't take part in the label tour.
  const clear = (p: Place) => Math.abs(p.x - MAP_W / 2) > 230 || Math.abs(p.y - MAP_H / 2) > 290;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/area-map/${town.slug}.svg`} alt="" aria-hidden width={MAP_W} height={MAP_H} decoding="async" className="absolute inset-0 h-full w-full max-w-none motion-safe:animate-[map-drift_38s_ease-in-out_infinite_alternate]" />
      {map.places.map((p) => (
        <span
          key={p.name}
          data-town={p.name}
          data-has={clear(p) ? "1" : "0"}
          data-count={`${p.miles} ${p.miles === 1 ? "mile" : "miles"} ${p.dir} of the centre`}
          className="absolute -ml-[3px] -mt-[3px] h-1.5 w-1.5 bg-ink/30 [&.is-active]:bg-accent"
          style={{ left: pct(p.x, MAP_W), top: pct(p.y, MAP_H) }}
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">{p.name}</span>
        </span>
      ))}
    </>
  );
}

function Hero({ t, paid, town, first, saved, crumbs, nameClass }: Props) {
  const where = [t.city, t.region && t.region !== t.city ? t.region : null].filter(Boolean).join(", ");
  const photo = paid.gallery[0] ?? null;
  const taking = paid.taking_clients ? TAKING[paid.taking_clients] : null;
  const shared = paid.reviews.filter((r) => r.body && r.rating != null);
  const ratings = [...shared.map((r) => r.rating as number)];
  return (
    <section className="relative overflow-hidden border-b border-line bg-soft">
      {/* The map side: full bleed to the right on wide screens, a band across the top on phones. */}
      <div className="relative h-[340px] overflow-hidden md:absolute md:inset-y-0 md:left-[44%] md:right-0 md:h-auto">
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_78%)] md:[mask-image:linear-gradient(to_right,transparent,#000_22%)]"
          aria-hidden={!town}
        >
          {town && (
            <MapHover tourMinWidth={768} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative h-[930px] w-[1500px] md:h-[1395px] md:w-[2250px]">
                <Suspense fallback={null}><AreaLayer town={town} /></Suspense>
                {/* Distance rings from the town centre, with a slow pulse out from the photo */}
                {RINGS.map((mi) => (
                  <span key={mi} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-accent/35" style={{ width: pct(mi * PX_PER_MILE * 2, MAP_W), aspectRatio: "1" }}>
                    {/* Label sits on the ring, up and to the right of the photo (30° above east) */}
                    <span className="absolute hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-soft px-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent md:block" style={{ left: "93.3%", top: "25%" }}>{mi < 1 ? "½ mile" : `${mi} ${mi === 1 ? "mile" : "miles"}`}</span>
                  </span>
                ))}
                <span className="pointer-events-none absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent/40 md:h-[260px] md:w-[260px] opacity-0 motion-safe:animate-[ring-pulse_4.5s_ease-out_infinite]" />
              </div>
            </MapHover>
          )}
        </div>
        {/* The photo sits on the town centre */}
        <figure className="absolute left-1/2 top-1/2 w-[150px] -translate-x-1/2 -translate-y-1/2 md:w-[min(300px,60%)]">
          <div className="relative rounded-2xl shadow-[0_24px_60px_-24px_rgba(17,18,20,0.45)]">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={t.name} fetchPriority="high" className="aspect-[4/5] w-full rounded-2xl object-cover" />
            ) : (
              <Avatar t={{ ...t, image_url: null }} size="hero" className="aspect-[4/5] w-full rounded-2xl" />
            )}
          </div>
          {town && (
            <figcaption className="mt-3 flex items-baseline justify-between gap-3 border-t-2 border-ink pt-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
              <span>{town.name}</span>
              <span className="hidden tabular-nums text-muted md:inline">{coords(town)}</span>
            </figcaption>
          )}
        </figure>
        {town && (
          <p className="absolute bottom-1.5 right-3 bg-soft/80 px-1 text-[9px] text-muted md:text-[10px]">
            Map data © <a href="https://www.openstreetmap.org/copyright" className="underline hover:text-ink" rel="noopener" target="_blank">OpenStreetMap</a> contributors
          </p>
        )}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 md:min-h-[640px] md:py-16">
        <div className="flex flex-col gap-5 md:w-[42%]">
          <Breadcrumbs items={crumbs} />
          <div>
            <h1 className={`display [overflow-wrap:anywhere] ${nameClass}`}>{t.name}</h1>
            <p className="mt-3 text-lg text-muted">{where || "UK"}{t.online && " · Online coaching UK-wide"}</p>
            {taking && (
              <p className="mt-3 flex flex-wrap items-center gap-x-2.5 text-sm font-semibold">
                <span className="relative inline-flex h-2.5 w-2.5" aria-hidden>
                  {taking.ping && <span className={`absolute inline-flex h-full w-full rounded-full ${taking.dot} opacity-60 motion-safe:animate-ping`} />}
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${taking.dot}`} />
                </span>
                {taking.label}
                {paid.taking_clients_updated_at && <span className="font-normal text-muted">· updated {ukDate(paid.taking_clients_updated_at, { day: "numeric", month: "short" })}</span>}
              </p>
            )}
          </div>
          {(t.review_count > 0 && t.rating_avg != null) ? (
            <a href="#reviews" className="flex items-center gap-2 text-sm">
              <Stars value={t.rating_avg} size="text-xl" />
              <span className="font-bold">{t.rating_avg.toFixed(1)}</span>
              <span className="text-muted underline">{t.review_count} reviews</span>
            </a>
          ) : ratings.length > 0 && (
            <a href="#clients" className="flex items-center gap-2 text-sm">
              <Stars value={ratings.reduce((a, b) => a + b, 0) / ratings.length} size="text-xl" />
              <span className="text-muted underline">{ratings.length} client {ratings.length === 1 ? "review" : "reviews"} shared by {first}</span>
            </a>
          )}
          {t.headline && <p className="max-w-xl text-xl font-semibold leading-snug">{t.headline}</p>}
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
  );
}

/* ------------------------------------------------------------- at a glance */

function Glance({ t, paid, first, sinceYear }: Props) {
  const modes = [t.in_person && "In person", t.home_visits && "Home visits", t.online && "Online"].filter(Boolean) as string[];
  const low = lowestPrice(paid.prices);
  const reviewCount = t.review_count + paid.reviews.filter((r) => r.body).length;
  const cells: { label: string; value: React.ReactNode; sub: string }[] = [];
  if (sinceYear) cells.push({ label: "Training clients since", value: <CountUp to={sinceYear} from={sinceYear - 12} />, sub: `${new Date().getFullYear() - sinceYear} years coaching` });
  if (modes.length) cells.push({ label: "Ways to train", value: <CountUp to={modes.length} />, sub: modes.join(" · ") });
  const specialisms = t.styles.length + t.goals.length;
  if (specialisms) cells.push({ label: "Specialisms", value: <CountUp to={specialisms} />, sub: t.styles.slice(0, 3).map((s) => nameFor(TRAINING_STYLES, s)).join(" · ") });
  if (low) cells.push({ label: "Prices from", value: <CountUp to={Math.round(low.value)} prefix="£" />, sub: low.label });
  else if (reviewCount) cells.push({ label: "Client reviews", value: <CountUp to={reviewCount} />, sub: `Shared by ${first}` });
  if (!cells.length) return null;
  return (
    <section aria-label="At a glance" className="border-b border-line bg-paper">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 lg:grid-cols-4">
        {cells.slice(0, 4).map((c, i) => (
          <div key={c.label} className={`min-w-0 py-6 ${i % 2 ? "pl-4 sm:pl-6" : "pr-4 sm:pr-6"} ${i % 2 ? "border-l border-line" : ""} ${i >= 2 ? "border-t border-line lg:border-t-0" : ""} lg:px-6 ${i > 0 ? "lg:border-l lg:border-line" : "lg:pl-0"}`}>
            <dt className="eyebrow text-muted">{c.label}</dt>
            <dd className="display mt-2 text-4xl sm:text-5xl">{c.value}</dd>
            <dd className="mt-2 line-clamp-2 text-sm text-muted lg:truncate">{c.sub}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---------------------------------------------------------------- sections */

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} data-reveal className="scroll-mt-24">
      <div className="mb-6 flex items-baseline gap-4 border-b-2 border-ink pb-3">
        <span className="text-sm font-bold tabular-nums text-accent">{String(n).padStart(2, "0")}</span>
        <h2 className="display text-3xl [overflow-wrap:anywhere] sm:text-4xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function About({ text }: { text: string }) {
  const [lead, ...rest] = text.split(/\n\s*\n/);
  return (
    <>
      <p className="whitespace-pre-line text-xl font-medium leading-relaxed sm:text-2xl sm:leading-snug">{lead}</p>
      {rest.length > 0 && <div className="mt-5 flex flex-col gap-4 text-base leading-relaxed text-ink/85">{rest.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}</div>}
    </>
  );
}

function Training({ t, first, town, topicHref }: Props) {
  const modes = [
    { label: "In person", on: t.in_person, note: t.city ? `In ${t.city}` : "Face to face" },
    { label: "Home visits", on: t.home_visits, note: t.city ? `Around ${t.city}` : "At your home" },
    { label: "Online", on: t.online, note: "Anywhere in the UK" },
  ];
  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <p className="eyebrow mb-2 text-muted">Training styles</p>
          <ul className="border-t border-line">
            {t.styles.map((s, i) => (
              <li key={s}>
                <Link href={topicHref(s)} className="group flex items-center gap-4 border-b border-line py-3 hover:text-accent">
                  <span className="w-6 text-xs font-bold tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display flex-1 text-2xl sm:text-3xl">{nameFor(TRAINING_STYLES, s)}</span>
                  <Arrow className="h-4 w-4 text-muted transition group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-2 text-muted">Helps you with</p>
          <ul className="border-t border-line">
            {t.goals.map((g) => (
              <li key={g}>
                <Link href={topicHref(g)} className="group flex items-center justify-between border-b border-line py-3 font-semibold hover:text-accent">
                  {nameFor(FITNESS_GOALS, g)}
                  <Arrow className="h-3.5 w-3.5 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
          {t.sports.length > 0 && (
            <>
              <p className="eyebrow mb-2 mt-6 text-muted">Sports &amp; hobbies</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {t.sports.map((s) => <Link key={s} href={`/trainers?sport=${s}`} className="chip text-muted">{nameFor(SPORTS, s)}</Link>)}
              </div>
            </>
          )}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-2 text-muted">How {first} trains</p>
        <dl className="grid border-y border-line sm:grid-cols-3">
          {modes.map((m, i) => (
            <div key={m.label} className={`flex items-baseline justify-between gap-3 py-4 sm:block sm:px-5 ${i ? "border-t border-line sm:border-l sm:border-t-0" : "sm:pl-0"}`}>
              <dt className={`display text-2xl ${m.on ? "" : "text-muted line-through decoration-2"}`}>{m.label}</dt>
              <dd className={`text-sm sm:mt-1 ${m.on ? "font-semibold text-accent" : "text-muted"}`}>{m.on ? m.note : "Not offered"}</dd>
            </div>
          ))}
        </dl>
        {town && t.home_visits && <p className="mt-3 text-sm text-muted">Ask {first} which parts of {town.name} and nearby they cover.</p>}
      </div>
    </div>
  );
}

function Gallery({ photos, name }: { photos: string[]; name: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {photos.map((src, i) => (
        <a key={src} href={src} target="_blank" rel="noopener" className={`group block overflow-hidden bg-soft ${i === 0 && photos.length > 2 ? "col-span-2 row-span-2" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`${name}, photo ${i + 2}`} loading="lazy" className="aspect-square h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        </a>
      ))}
    </div>
  );
}

function Videos({ videos, first }: { videos: PaidProfile["videos"]; first: string }) {
  return (
    <div className="flex flex-col gap-6">
      {videos.map((v) => {
        const embed = videoEmbed(v.url);
        return (
          <figure key={v.url}>
            {embed ? (
              <div className="relative aspect-video w-full overflow-hidden bg-ink">
                <iframe src={embed} title={v.title || `Video from ${first}`} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
              </div>
            ) : (
              <a href={v.url} target="_blank" rel="nofollow noopener" className="btn-ghost">Watch the video</a>
            )}
            {v.title && <figcaption className="mt-2 text-sm font-semibold">{v.title}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}

function Prices({ paid, first }: { paid: PaidProfile; first: string }) {
  const list = paid.prices.filter((p) => p.label || p.price);
  return (
    <>
      <div className="border-t border-line">
        {list.map((p, i) => (
          <div key={i} className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 border-b border-line py-4 transition-colors hover:bg-soft/60">
            <span className="text-lg font-semibold">{p.label}</span>
            <span className="display text-right text-3xl tabular-nums text-accent sm:text-4xl">{p.price}</span>
            {p.note && <span className="col-span-2 mt-1 text-sm text-muted">{p.note}</span>}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Prices from {first}{paid.prices_updated_at ? `, last updated ${ukDate(paid.prices_updated_at)}` : ""}. Check with {first} before you book.</p>
    </>
  );
}

/** A workout as a set list: "3 rounds:" lines become headings, a leading number or time stands out in blue. */
function Workouts({ workouts }: { workouts: PaidProfile["workouts"] }) {
  const list = workouts.filter((w) => w.title);
  return (
    <>
      <div className="flex flex-col gap-8">
        {list.map((w, i) => {
          const lines = (w.body || "").split("\n").map((l) => l.trim()).filter(Boolean);
          return (
            <article key={i}>
              <h3 className="display text-2xl">{w.title}</h3>
              {lines.length > 0 && (
                <ol className="mt-3 border-t border-line">
                  {lines.map((l, k) => {
                    if (/:$/.test(l)) return <li key={k} className="eyebrow border-b border-line py-2.5 text-accent">{l.replace(/:$/, "")}</li>;
                    const m = l.match(/^(\d+(?:[-–]\w+)?(?:\s?(?:x|reps?|secs?|seconds?|mins?|minutes?|m|km))?)\s+(.*)$/i);
                    return (
                      <li key={k} className="flex items-baseline gap-4 border-b border-line py-2.5">
                        <span className="display w-24 shrink-0 text-xl tabular-nums text-accent">{m ? m[1] : "—"}</span>
                        <span className="font-semibold">{m ? m[2] : l}</span>
                      </li>
                    );
                  })}
                </ol>
              )}
              {w.link && <a href={w.link} target="_blank" rel="nofollow noopener" className="btn-ghost mt-4 text-sm">Open the full workout</a>}
            </article>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted">Check with your GP before starting a new exercise routine if you have a health condition or are pregnant.</p>
    </>
  );
}

function ClientWords({ reviews, first }: { reviews: PaidProfile["reviews"]; first: string }) {
  const list = reviews.filter((r) => r.body);
  const [top, ...rest] = list;
  const by = (r: PaidProfile["reviews"][number]) => [r.author, r.source, ukDate(r.date, { month: "long", year: "numeric" })].filter(Boolean).join(" · ");
  return (
    <>
      <figure className="relative pl-10 sm:pl-14">
        <span aria-hidden className="display absolute -top-3 left-0 text-7xl leading-none text-accent sm:text-8xl">“</span>
        {top.rating != null && <Stars value={top.rating} size="text-lg" />}
        <blockquote className="display mt-2 text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">{top.body}</blockquote>
        <figcaption className="mt-4 text-sm font-semibold text-muted">{by(top)}</figcaption>
      </figure>
      {rest.length > 0 && (
        <div className="mt-8 grid gap-x-8 border-t border-line sm:grid-cols-2">
          {rest.map((r, i) => (
            <figure key={i} className="border-b border-line py-4">
              {r.rating != null && <Stars value={r.rating} />}
              <blockquote className="mt-1 leading-relaxed">“{r.body}”</blockquote>
              <figcaption className="mt-2 text-xs font-semibold text-muted">{by(r)}</figcaption>
            </figure>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted">Shared by {first} from their clients, word for word.</p>
    </>
  );
}

/** Where the town is in the UK, and the neighbourhoods around its centre (OpenStreetMap names and distances). */
async function Around({ town, first }: { town: City; first: string }) {
  const map = await getAreaMap(town);
  const places = (map?.places ?? []).slice(0, 8);
  return (
    <div className="grid gap-8 sm:grid-cols-[150px_minmax(0,1fr)]">
      <div className="flex items-start gap-5 sm:block">
        <svg viewBox={`-1 -1 ${UK_W + 2} ${UK_H + 2}`} className="h-40 w-auto shrink-0 overflow-visible sm:h-56" role="img" aria-label={`${town.name} on a map of the UK`}>
          <path d={UK_OUTLINE} className="fill-soft stroke-accent/40" strokeWidth={0.35} strokeLinejoin="round" />
          <circle cx={ukX(town.lng)} cy={ukY(town.lat)} r={3} className="fill-accent/20 [transform-box:fill-box] [transform-origin:center] motion-safe:animate-[dot-pulse_2.8s_ease-out_infinite]" />
          <circle cx={ukX(town.lng)} cy={ukY(town.lat)} r={1.3} className="fill-accent" />
        </svg>
        <p className="mt-3 text-sm sm:max-w-none">
          <span className="block font-bold">{town.name}</span>
          <span className="block text-muted">{town.county}, {town.nation}</span>
          <span className="mt-1 block text-xs tabular-nums text-muted">{coords(town)}</span>
        </p>
      </div>
      <div className="min-w-0">
        {places.length > 0 ? (
          <>
            <p className="mb-3 text-sm text-muted">Neighbourhoods and villages near {town.name} centre, as the crow flies.</p>
            <ul className="border-t border-line">
              {places.map((p) => (
                <li key={p.name} className="grid grid-cols-[minmax(0,1fr)_auto_5.5rem] items-baseline gap-x-4 border-b border-line py-2.5">
                  <span className="truncate font-semibold">{p.name}</span>
                  <span className="text-xs text-muted">{p.dir}</span>
                  <span className="text-right tabular-nums font-semibold">{p.miles} mi</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Place names and distances from OpenStreetMap. Ask {first} where they train and which areas they cover.</p>
          </>
        ) : (
          <p className="text-muted">Ask {first} where they train and which areas they cover.</p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- page */

export function PaidLayout(props: Props) {
  const { t, paid, town, first, links, reading, sinceYear } = props;
  const about = paid.about?.trim() || t.bio;
  const photos = paid.gallery.slice(1);
  const videos = paid.videos.filter((v) => v.url);
  const hasPrices = paid.prices.some((p) => p.label || p.price);
  const hasWorkouts = paid.workouts.some((w) => w.title);
  const hasClientWords = paid.reviews.some((r) => r.body);

  const sections: { id: string; label: string; title: string; body: React.ReactNode }[] = [];
  if (about) sections.push({ id: "about", label: `About ${first}`, title: `About ${first}`, body: <About text={about} /> });
  if (videos.length) sections.push({ id: "videos", label: videos.length === 1 ? `Meet ${first}` : "Videos", title: videos.length === 1 ? `Meet ${first}` : "Videos", body: <Videos videos={videos} first={first} /> });
  if (photos.length) sections.push({ id: "photos", label: "Photos", title: "Photos", body: <Gallery photos={photos} name={t.name} /> });
  sections.push({ id: "training", label: "Training", title: `What ${first} trains`, body: <Training {...props} /> });
  if (hasPrices) sections.push({ id: "prices", label: "Prices", title: "Prices", body: <Prices paid={paid} first={first} /> });
  if (hasClientWords) sections.push({ id: "clients", label: "What clients say", title: "What clients say", body: <ClientWords reviews={paid.reviews} first={first} /> });
  if (hasWorkouts) sections.push({ id: "workouts", label: "Workouts to try", title: "Workouts to try", body: <Workouts workouts={paid.workouts} /> });
  paid.sections.filter((s) => s.heading && s.body).forEach((s, i) =>
    sections.push({ id: `more-${i + 1}`, label: s.heading, title: s.heading, body: <p className="whitespace-pre-line text-base leading-relaxed">{s.body}</p> }),
  );
  if (t.qualifications.length || sinceYear) {
    sections.push({
      id: "qualifications", label: "Qualifications", title: "Qualifications", body: (
        <ul className="border-t border-line">
          {sinceYear && <li className="flex items-baseline justify-between gap-4 border-b border-line py-3 font-semibold">Training clients since<span className="display text-2xl tabular-nums text-accent">{sinceYear}</span></li>}
          {t.qualifications.map((q) => <li key={q} className="border-b border-line py-3">{q}</li>)}
        </ul>
      ),
    });
  }
  if (town) sections.push({ id: "area", label: `Around ${town.name}`, title: `Around ${town.name}`, body: <Suspense fallback={null}><Around town={town} first={first} /></Suspense> });

  return (
    <>
      <Hero {...props} />
      <Glance {...props} />
      <Reveal />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <div className="flex min-w-0 flex-col gap-16">
          {sections.map((s, i) => <Section key={s.id} id={s.id} n={i + 1} title={s.title}>{s.body}</Section>)}

          {t.reviews.length > 0 ? (
            <section id="reviews" data-reveal className="scroll-mt-24">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-ink pb-3">
                <h2 className="display text-3xl sm:text-4xl">Reviews on LocalPT</h2>
                {t.rating_avg != null && <p className="flex items-center gap-2"><Stars value={t.rating_avg} size="text-lg" /> <strong>{t.rating_avg.toFixed(1)}</strong> from {t.review_count}</p>}
              </div>
              <div className="grid gap-x-8 border-t border-line sm:grid-cols-2">
                {t.reviews.map((r) => (
                  <figure key={r.id} className="border-b border-line py-4">
                    <Stars value={r.rating} />
                    {r.body && <blockquote className="mt-2 text-sm leading-relaxed">“{r.body}”</blockquote>}
                    <figcaption className="mt-3 text-xs font-semibold text-muted">{r.author_name}</figcaption>
                  </figure>
                ))}
              </div>
              <details className="mt-6 border-t border-line pt-5">
                <summary className="cursor-pointer font-semibold">Write a review</summary>
                <div className="mt-4"><ReviewForm slug={t.slug} firstName={first} /></div>
              </details>
            </section>
          ) : (
            <details id="reviews" className="scroll-mt-24 border-t border-line pt-5">
              <summary className="cursor-pointer font-semibold">Trained with {first}? Write a review</summary>
              <div className="mt-4"><ReviewForm slug={t.slug} firstName={first} /></div>
            </details>
          )}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-8 hidden lg:block">
            <p className="eyebrow mb-2 text-muted">On this page</p>
            <SectionIndex items={[...sections.map((s) => ({ id: s.id, label: s.label })), { id: "contact", label: `Contact ${first}` }]} />
          </div>
          <div id="contact" className="scroll-mt-24 border-t-4 border-accent bg-soft p-6">
            <p className="display text-2xl [overflow-wrap:anywhere] sm:text-3xl">Contact {first}</p>
            <p className="mb-4 mt-2 text-sm text-muted">Ask {first} about {hasPrices ? "availability" : "prices and availability"}.</p>
            <EnquiryForm slug={t.slug} firstName={first} />
            {links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {links.map((l) => <a key={l.label} href={l.href} target="_blank" rel="nofollow noopener" data-track={l.track} className="btn-ghost text-sm">{l.label}</a>)}
              </div>
            )}
          </div>
        </aside>
      </div>

      {reading}
    </>
  );
}
