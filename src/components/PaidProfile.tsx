// Sections only paying trainers have. ed fills them in from /admin; each one hides itself when empty.
// Same "timetable" look as the rest of the site: thin rules, values on the right, no boxes.
import type { PaidPrice, PaidReview, PaidSection, PaidVideo, PaidWorkout } from "@/lib/paid";
import { videoEmbed } from "@/lib/paid";
import { Stars } from "./Stars";

const ukDate = (d: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
  d ? new Date(d).toLocaleDateString("en-GB", opts) : null;

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="display mb-4 text-3xl [overflow-wrap:anywhere]">{children}</h2>;
}

const TAKING = {
  yes: { label: "Taking new clients", dot: "bg-emerald-600" },
  waitlist: { label: "Waiting list for new clients", dot: "bg-amber-500" },
  no: { label: "Not taking new clients right now", dot: "bg-muted" },
} as const;

export function TakingClients({ value, updated }: { value: keyof typeof TAKING | null; updated: string | null }) {
  if (!value) return null;
  const t = TAKING[value];
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm font-semibold">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${t.dot}`} aria-hidden />
      {t.label}
      {updated && <span className="font-normal text-muted">· updated {ukDate(updated, { day: "numeric", month: "short" })}</span>}
    </p>
  );
}

export function PaidGallery({ photos, name }: { photos: string[]; name: string }) {
  // The first photo is already the big one at the top of the page.
  const rest = photos.slice(1);
  if (rest.length === 0) return null;
  return (
    <section>
      <H2>Photos</H2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rest.map((src, i) => (
          <a key={src} href={src} target="_blank" rel="noopener" className="block overflow-hidden bg-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${name}, photo ${i + 2}`} loading="lazy" className="aspect-square w-full object-cover transition hover:scale-[1.02]" />
          </a>
        ))}
      </div>
    </section>
  );
}

export function PaidVideos({ videos, first }: { videos: PaidVideo[]; first: string }) {
  const list = videos.filter((v) => v.url);
  if (list.length === 0) return null;
  return (
    <section>
      <H2>{list.length === 1 ? `Meet ${first}` : "Videos"}</H2>
      <div className="flex flex-col gap-6">
        {list.map((v) => {
          const embed = videoEmbed(v.url);
          return (
            <figure key={v.url}>
              {embed ? (
                <div className="relative aspect-video w-full max-w-full overflow-hidden bg-ink">
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
    </section>
  );
}

export function PaidPrices({ prices, updated, first }: { prices: PaidPrice[]; updated: string | null; first: string }) {
  const list = prices.filter((p) => p.label || p.price);
  if (list.length === 0) return null;
  return (
    <section>
      <H2>Prices</H2>
      <div className="border-t border-line">
        {list.map((p, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 border-b border-line py-3">
            <span className="font-semibold">{p.label}</span>
            <span className="display text-right text-lg tabular-nums">{p.price}</span>
            {p.note && <span className="col-span-2 text-sm text-muted">{p.note}</span>}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Prices from {first}{updated ? `, last updated ${ukDate(updated)}` : ""}. Check with {first} before you book.</p>
    </section>
  );
}

export function PaidWorkouts({ workouts }: { workouts: PaidWorkout[] }) {
  const list = workouts.filter((w) => w.title);
  if (list.length === 0) return null;
  return (
    <section>
      <H2>Workouts to try</H2>
      <div className="border-t border-line">
        {list.map((w, i) => (
          <details key={i} className="group border-b border-line py-3" open={list.length === 1}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {w.title}
              <span className="text-muted transition group-open:rotate-45" aria-hidden>+</span>
            </summary>
            {w.body && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{w.body}</p>}
            {w.link && <a href={w.link} target="_blank" rel="nofollow noopener" className="btn-ghost mt-3 inline-block text-sm">Open the full workout</a>}
          </details>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Check with your GP before starting a new exercise routine if you have a health condition or are pregnant.</p>
    </section>
  );
}

export function PaidSections({ sections }: { sections: PaidSection[] }) {
  return (
    <>
      {sections.filter((s) => s.heading && s.body).map((s, i) => (
        <section key={i}>
          <H2>{s.heading}</H2>
          <p className="whitespace-pre-line text-base leading-relaxed">{s.body}</p>
        </section>
      ))}
    </>
  );
}

/**
 * Reviews the trainer has passed on (for example from Google). Labelled as theirs and kept out of
 * our star average and Google's review markup, which only count reviews left on this site.
 */
export function PaidReviews({ reviews, first }: { reviews: PaidReview[]; first: string }) {
  const list = reviews.filter((r) => r.body);
  if (list.length === 0) return null;
  return (
    <section>
      <H2>What clients say</H2>
      <div className="border-t border-line">
        {list.map((r, i) => (
          <figure key={i} className="border-b border-line py-4">
            {r.rating != null && <Stars value={r.rating} />}
            <blockquote className="mt-1 leading-relaxed">“{r.body}”</blockquote>
            <figcaption className="mt-2 text-xs font-semibold text-muted">
              {[r.author, r.source, ukDate(r.date, { month: "long", year: "numeric" })].filter(Boolean).join(" · ")}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Shared by {first} from their clients.</p>
    </section>
  );
}
