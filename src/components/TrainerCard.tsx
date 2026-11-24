import Link from "next/link";
import type { TrainerSummary } from "@/lib/trainers";
import { Arrow } from "./Arrow";
import { StarIcon } from "./Stars";
import { FITNESS_GOALS, TRAINING_STYLES, nameFor } from "@/lib/taxonomy";

export function initials(name: string) {
  const words = name.replace(/[^\p{L}\s'-]/gu, " ").split(/\s+/).filter((w) => w && !/^the$/i.test(w));
  return words.map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "PT";
}


// No-photo state: initials on cobalt, over a faint contour map unique to each trainer, plus a line icon for their main style.
// Real listings have no photos (we never copy photos from trainers' own sites).
const PALETTES = ["bg-[#2457c5]", "bg-[#1f4bb0]", "bg-[#1c3f94]", "bg-[#2f63d6]"];

type IconKind = "weights" | "flow" | "energy" | "run" | "box";
function iconFor(styles: string[] = []): IconKind {
  const s = styles[0];
  if (!s) return "energy";
  if (["pilates", "yoga", "mobility"].includes(s)) return "flow";
  if (["strength", "bodybuilding", "powerlifting", "kettlebells"].includes(s)) return "weights";
  if (s === "running") return "run";
  if (s === "boxing") return "box";
  return "energy";
}

function StyleIcon({ kind }: { kind: IconKind }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "weights":
      return <svg viewBox="0 0 48 48" {...common}><path d="M6 20v8M10 16v16M14 18v12M34 18v12M38 16v16M42 20v8M14 24h20" /></svg>;
    case "flow":
      return <svg viewBox="0 0 48 48" {...common}><circle cx="24" cy="11" r="4" /><path d="M24 15v10M12 22c4 3 8 3 12 3s8 0 12-3M16 38c3-6 5-9 8-13 3 4 5 7 8 13M10 40h28" /></svg>;
    case "run":
      return <svg viewBox="0 0 48 48" {...common}><circle cx="24" cy="26" r="14" /><path d="M24 26V17M21 8h6M24 8v4M35 15l2-2" /></svg>;
    case "box":
      return <svg viewBox="0 0 48 48" {...common}><circle cx="24" cy="24" r="16" /><circle cx="24" cy="24" r="10" /><circle cx="24" cy="24" r="4" /></svg>;
    default:
      return <svg viewBox="0 0 48 48" {...common}><path d="M27 5 11 27h12l-3 16 17-23H25l2-15z" /></svg>;
  }
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({
  t,
  className = "",
  size = "card",
}: {
  t: { name: string; image_url: string | null; styles?: string[] };
  className?: string;
  size?: "card" | "hero";
}) {
  if (t.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={t.image_url} alt={t.name} className={`object-cover ${className}`} loading="lazy" />;
  }
  const h = hash(t.name);
  const palette = PALETTES[h % PALETTES.length];
  // A faint contour map, different for every trainer, so no two cards look the same.
  const cx = 20 + (h % 60);
  const cy = 15 + ((h >> 6) % 50);
  const tilt = (h >> 12) % 180;
  return (
    <div
      role="img"
      aria-label={`${t.name} (no photo yet)`}
      className={`relative overflow-hidden ${palette} text-paper ${className}`}
    >
      <svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-white/[0.13]" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth={0.5} transform={`rotate(${tilt} ${cx} ${cy})`}>
          {[8, 15, 23, 32, 42, 53, 65, 78, 92].map((r, i) => (
            <ellipse key={r} cx={cx + i * 0.8} cy={cy + i * 1.1} rx={r * 1.25} ry={r * (0.7 + ((h >> i) % 3) * 0.08)} />
          ))}
        </g>
      </svg>
      {/* style icon, oversized and faint */}
      <div className="absolute -bottom-[8%] -right-[8%] w-[56%] text-white/15">
        <StyleIcon kind={iconFor(t.styles)} />
      </div>
      <div className={`absolute inset-0 flex items-center justify-center ${size === "card" ? "pb-[22%]" : ""}`}>
        <span className={`display leading-none ${size === "hero" ? "text-8xl sm:text-9xl" : "text-5xl sm:text-6xl"}`}>
          {initials(t.name)}
        </span>
      </div>
    </div>
  );
}

export function milesAway(d: number) {
  if (d < 1) return "Under 1 mile away";
  const n = d < 10 ? Math.round(d * 10) / 10 : Math.round(d);
  return `${n} ${n === 1 ? "mile" : "miles"} away`;
}

export function TrainerCard({ t }: { t: TrainerSummary }) {
  const specialisms = [...t.styles.map((s) => nameFor(TRAINING_STYLES, s)), ...t.goals.map((g) => nameFor(FITNESS_GOALS, g))];
  return (
    <Link href={`/trainers/${t.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-paper transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Avatar t={t} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 top-0 flex flex-wrap gap-1.5 p-2 sm:p-3">

          {t.review_count > 0 && t.rating_avg != null && (
            <span className="rounded-full bg-paper/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              <StarIcon className="mr-0.5 inline h-3 w-3 -translate-y-px text-star" />{t.rating_avg.toFixed(1)} <span className="font-normal text-muted">({t.review_count})</span>
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent p-3 pt-16 text-paper sm:p-4">
          <h3 className="display text-lg sm:text-2xl">{t.name}</h3>
          <p className="mt-1 text-xs font-medium text-paper/85 sm:text-sm">
            {t.city ?? "UK"}
          </p>
          {t.distance_miles != null && (
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[11px] font-semibold text-ink sm:text-xs">
              <svg viewBox="0 0 16 16" className="h-3 w-3 text-accent" fill="currentColor" aria-hidden>
                <path d="M8 1a5 5 0 0 0-5 5c0 3.6 5 9 5 9s5-5.4 5-9a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
              </svg>
              {milesAway(t.distance_miles)}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {specialisms.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-soft px-2.5 py-1 text-xs font-medium">{s}</span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-end gap-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted group-hover:text-ink">View profile <Arrow className="h-3 w-3" /></span>
        </div>
        {t.is_sample && <span className="text-[11px] italic text-muted">Example listing</span>}
      </div>
    </Link>
  );
}
