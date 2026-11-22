export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`display text-xl sm:text-2xl ${light ? "text-paper" : "text-ink"}`}>
      PT<span className="text-accent">/</span>Directory <span className="text-accent">UK</span>
    </span>
  );
}
