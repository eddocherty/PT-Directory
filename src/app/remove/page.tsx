import type { Metadata } from "next";
import { RequestForm } from "@/components/RequestForm";

export const metadata: Metadata = { title: "Remove a listing" };

export default async function Remove({ searchParams }: { searchParams: Promise<{ listing?: string }> }) {
  const { listing } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Remove a listing</h1>
      <p className="mt-2 text-sm text-muted">
        If a profile about you is listed here and you’d like it taken down, tell us which one. We’ll hide it straight
        away once we’ve confirmed the request, and we won’t re-add it from other sources.
      </p>
      <div className="mt-6 rounded-xl border border-line bg-surface p-6">
        <RequestForm kind="removal" listing={listing} cta="Request removal" />
      </div>
    </div>
  );
}
