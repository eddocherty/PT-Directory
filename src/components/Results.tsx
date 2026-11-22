import Link from "next/link";
import { TrainerCard } from "./TrainerCard";
import { PAGE_SIZE, type TrainerSummary } from "@/lib/trainers";
import { toQuery, type RawParams } from "@/lib/filters";

export function Results({
  trainers, total, page, params, basePath,
}: { trainers: TrainerSummary[]; total: number; page: number; params: RawParams; basePath: string }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (!trainers.length)
    return (
      <div className="rounded-3xl bg-soft p-10 text-center">
        <p className="display text-3xl">No match… yet</p>
        <p className="mt-2 text-sm text-muted">Try a wider radius, or take off a filter or two.</p>
        <Link href={basePath} className="btn-dark mt-5">Reset filters</Link>
      </div>
    );
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
        {trainers.map((t) => <TrainerCard key={t.id} t={t} />)}
      </div>
      {pages > 1 && (
        <nav className="flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link className="btn-ghost" href={`${basePath}?${toQuery(params, { page: String(page - 1) })}`}>← Prev</Link>}
          <span className="font-bold">Page {page} of {pages}</span>
          {page < pages && <Link className="btn-ghost" href={`${basePath}?${toQuery(params, { page: String(page + 1) })}`}>Next →</Link>}
        </nav>
      )}
    </div>
  );
}
