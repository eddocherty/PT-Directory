/** The one arrow used across the site, in place of text arrows. */
export function Arrow({ dir = "right", className = "h-3.5 w-3.5" }: { dir?: "right" | "left"; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={`inline-block shrink-0 ${dir === "left" ? "rotate-180" : ""} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
