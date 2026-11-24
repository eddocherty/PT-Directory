/** Wordmark: "Local" in type, "PT" on a cobalt tag, like a sign on a studio door. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`display inline-flex items-center gap-1 text-xl ${light ? "text-paper" : "text-ink"}`}>
      Local
      <span className={`rounded-md px-1.5 py-0.5 text-[0.8em] leading-none tracking-normal ${light ? "bg-paper text-ink" : "bg-accent text-paper"}`}>PT</span>
    </span>
  );
}
