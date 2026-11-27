import Image from "next/image";
import Link from "next/link";
import { readingMinutes, sectionName, type Article } from "@/lib/articles";

/**
 * An article dropped into the trainer results grid. Same size and shape as a trainer card so the grid stays
 * tidy, but clearly marked as reading, not a trainer: a "Read" label, the section, and a ruled footer.
 */
export function ArticleTile({ a }: { a: Article }) {
  return (
    <Link href={`/articles/${a.slug}`} className="group flex h-full flex-col overflow-hidden border border-ink bg-ink text-paper transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image src={`/articles/${a.slug}.jpg`} alt="" fill sizes="(min-width: 1280px) 300px, 50vw" className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90" />
        <span className="absolute left-0 top-0 bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-paper sm:text-xs">Read</span>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/70 to-transparent p-3 pt-20 sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9db8f2] sm:text-xs">{sectionName(a.section)}</p>
          <p className="display mt-1.5 text-base leading-tight sm:text-xl">{a.headline}</p>
        </div>
      </div>
      <p className="mt-auto flex items-center justify-between gap-2 border-t border-paper/15 px-3 py-2.5 text-xs font-semibold sm:px-4">
        <span>{readingMinutes(a)} min read</span>
        <span className="border-b-2 border-accent pb-0.5 group-hover:text-[#9db8f2]">Read it</span>
      </p>
    </Link>
  );
}
