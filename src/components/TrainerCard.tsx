import Link from "next/link";
import type { TrainerSummary } from "@/lib/trainers";
import { FITNESS_GOALS, TRAINING_STYLES, nameFor } from "@/lib/taxonomy";

export function initials(name: string) {
  const words = name.replace(/[^\p{L}\s'-]/gu, " ").split(/\s+/).filter((w) => w && !/^the$/i.test(w));
  return words.map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "PT";
}

export function price(t: { price_from: number | null; price_to: number | null }) {
  if (t.price_from == null) return "Price on request";
  return `From £${t.price_from}`;
}

// No-photo state: a monogram on a brand-blue gradient with a faint line icon for the trainer's main style.
// Real listings have no photos until the trainer claims them (we never copy photos from their sites).
const PALETTES = [
  "from-[#2457c5] to-[#163a8a]",
  "from-[#3b6fe0] to-[#1f4bb0]",
  "from-[#1c3f94] to-[#0f2559]",
  "from-[#2f63d6] to-[#5b8df0]",
];

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
  const palette = PALETTES[hash(t.name) % PALETTES.length];
  return (
    <div
      role="img"
      aria-label={`${t.name} (no photo yet)`}
      className={`relative overflow-hidden bg-gradient-to-br ${palette} text-paper ${className}`}
    >
      {/* soft light blobs */}
      <div className="absolute -left-1/4 -top-1/4 h-3/4 w-3/4 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-1/3 -right-1/4 h-3/4 w-3/4 rounded-full bg-[#9fc0ff]/20 blur-2xl" />
      {/* faint dot grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      />
      {/* style icon, oversized and faint */}
      <div className="absolute -bottom-[8%] -right-[8%] w-[62%] text-white/15">
        <StyleIcon kind={iconFor(t.styles)} />
      </div>
      <div className={`absolute inset-0 flex items-center justify-center ${size === "card" ? "pb-[22%]" : ""}`}>
        <span
          className={`display flex aspect-square items-center justify-center rounded-full bg-white/12 ring-1 ring-white/30 backdrop-blur-sm ${
            size === "hero" ? "w-[46%] text-7xl sm:text-8xl" : "w-[52%] text-4xl sm:text-5xl"
          }`}
        >
          {initials(t.name)}
        </span>
      </div>
    </div>
  );
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
              <span className="text-star">★</span> {t.rating_avg.toFixed(1)} <span className="font-normal text-muted">({t.review_count})</span>
            </span>
          )}
          {t.free_consultation && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-paper">Free consult</span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent p-3 pt-16 text-paper sm:p-4">
          <h3 className="display text-lg sm:text-2xl">{t.name}</h3>
          <p className="mt-1 text-xs font-medium text-paper/85 sm:text-sm">
            {t.city ?? "UK"}
            {t.distance_miles != null && ` · ${t.distance_miles.toFixed(1)} mi away`}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {specialisms.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-soft px-2.5 py-1 text-xs font-medium">{s}</span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-1">
          <span className="text-sm font-semibold">{price(t)}</span>
          <span className="hidden text-xs font-semibold text-muted group-hover:text-ink sm:inline">View profile →</span>
        </div>
        {t.is_sample && <span className="text-[11px] italic text-muted">Example listing</span>}
      </div>
    </Link>
  );
}
