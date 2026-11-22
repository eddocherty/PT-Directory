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
      <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
        No trainers match those filters yet. Try a wider radius or fewer filters.
      </div>
    );
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {trainers.map((t) => (
          <TrainerCard key={t.id} t={t} />
        ))}
      </div>
      {pages > 1 && (
        <nav className="flex justify-center gap-2 text-sm">
          {page > 1 && (
            <Link className="rounded-lg border border-line px-3 py-1.5" href={`${basePath}?${toQuery(params, { page: String(page - 1) })}`}>
              Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-muted">Page {page} of {pages}</span>
          {page < pages && (
            <Link className="rounded-lg border border-line px-3 py-1.5" href={`${basePath}?${toQuery(params, { page: String(page + 1) })}`}>
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
