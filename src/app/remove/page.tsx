import type { Metadata } from "next";
import { RequestForm } from "@/components/RequestForm";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Remove a listing" };

export default async function Remove({ searchParams }: { searchParams: Promise<{ listing?: string }> }) {
  const { listing } = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Your data" title="Remove a listing">
        If a profile about you is listed here and you’d like it taken down, tell us which one. We’ll hide it straight
        away once we’ve confirmed the request, and we won’t re-add it from other sources.
      </PageHeader>
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mt-6 rounded-3xl bg-soft p-6">
        <RequestForm kind="removal" listing={listing} cta="Request removal" />
      </div>
    </div>
    </>
  );
}
