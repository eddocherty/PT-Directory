export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`display text-xl ${light ? "text-paper" : "text-ink"}`}>
      PT Directory<span className={light ? "text-paper/40" : "text-muted"}> UK</span>
    </span>
  );
}
