import type { Product } from "@/lib/products";

export function PlanCover({ p, className = "" }: { p: Product; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/shop/${p.slug}-cover.jpg`}
      alt={`Cover of the ${p.short}`}
      className={`aspect-[210/297] h-auto w-full max-w-full rounded-2xl border border-line bg-soft object-cover shadow-sm ${className}`}
    />
  );
}
