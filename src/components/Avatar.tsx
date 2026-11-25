// Trainer image, or (for real listings, which have no photos) an initials card.
// Shared by server components and the client-side shortlist.
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
