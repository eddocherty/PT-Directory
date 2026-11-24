import Link from "next/link";
import { CITIES } from "@/lib/taxonomy";
import type { TownStats } from "@/lib/stats";

// Simple equirectangular projection, squashed for the UK's latitude. Good enough to read as the UK.
const W = 60;
const H = 100;
const x = (lng: number) => ((lng + 8.4) / 10.5) * W;
const y = (lat: number) => ((59.4 - lat) / 9.6) * H;

/** Every town we cover, as a dot sized by how many trainers are listed there. Each dot links to its town page. */
export function UkTownMap({ stats, className = "" }: { stats: Record<string, TownStats>; className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label="Map of the UK towns and cities LocalPT covers">
      {CITIES.map((c) => {
        const n = stats[c.slug]?.total ?? 0;
        const r = n ? 0.45 + Math.sqrt(n) * 0.11 : 0.35;
        return (
          <Link key={c.slug} href={`/locations/${c.slug}`}>
            <circle cx={x(c.lng)} cy={y(c.lat)} r={r} className={n ? "fill-accent/70 transition hover:fill-ink" : "fill-ink/15"}>
              <title>{n ? `${c.name}: ${n} trainers` : c.name}</title>
            </circle>
          </Link>
        );
      })}
    </svg>
  );
}
