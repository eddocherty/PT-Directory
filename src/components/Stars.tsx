const STAR = "M8 1.2l2 4.3 4.7.6-3.4 3.2.9 4.6L8 11.6l-4.2 2.3.9-4.6L1.3 6.1 6 5.5z";

export function StarIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={`inline-block ${className}`} fill="currentColor">
      <path d={STAR} />
    </svg>
  );
}

export function Stars({ value, size = "text-sm" }: { value: number; size?: string }) {
  const full = Math.round(value);
  return (
    <span className={`${size} inline-flex items-center gap-[0.1em]`} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`h-[1em] w-[1em] ${n <= full ? "text-star" : "text-line"}`} />
      ))}
    </span>
  );
}
