export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`display text-xl ${light ? "text-paper" : "text-ink"}`}>
      Train<span className={light ? "text-[#9fc0ff]" : "text-accent"}>Local</span>
    </span>
  );
}
