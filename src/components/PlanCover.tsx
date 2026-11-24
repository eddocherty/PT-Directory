import type { Product } from "@/lib/products";

/** Plan cover. A 320px copy is served where the cover shows small (cards, promos), the full one elsewhere. */
export function PlanCover({ p, className = "", sizes = "(min-width: 768px) 320px, 50vw", eager = false }: { p: Product; className?: string; sizes?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/shop/${p.slug}-cover.jpg`}
      srcSet={`/shop/${p.slug}-cover-sm.jpg 320w, /shop/${p.slug}-cover.jpg 794w`}
      sizes={sizes}
      width={794}
      height={1123}
      loading={eager ? undefined : "lazy"}
      decoding="async"
      alt={`Cover of the ${p.short}`}
      className={`aspect-[210/297] h-auto w-full max-w-full rounded-2xl border border-line bg-soft object-cover shadow-sm ${className}`}
    />
  );
}
