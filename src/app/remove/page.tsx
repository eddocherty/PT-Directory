import type { Metadata } from "next";
import Link from "next/link";
import { RequestForm } from "@/components/RequestForm";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Remove or correct a listing", alternates: { canonical: "/remove" }, robots: { index: false, follow: true } };

export default async function Remove({ searchParams }: { searchParams: Promise<{ listing?: string; type?: string }> }) {
  const { listing, type } = await searchParams;
  const correction = type === "correction";
  const q = (t: string) => `/remove?${new URLSearchParams({ ...(listing ? { listing } : {}), ...(t ? { type: t } : {}) })}`;
  return (
    <>
      <PageHeader eyebrow="Your data" title="Remove or correct a listing">
        If a profile about you is listed here, you can ask us to take it down or fix something that’s wrong. We act on
        removal requests straight away once confirmed, and we won’t re-add you from other sources.
      </PageHeader>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex gap-6 border-b border-line">
          <Link href={q("")} className={`-mb-px border-b-4 py-2 text-sm font-semibold ${!correction ? "border-accent" : "border-transparent text-muted hover:text-ink"}`}>Remove my listing</Link>
          <Link href={q("correction")} className={`-mb-px border-b-4 py-2 text-sm font-semibold ${correction ? "border-accent" : "border-transparent text-muted hover:text-ink"}`}>Correct my listing</Link>
        </div>
        <div className="mt-6 rounded-3xl bg-soft p-6">
          {correction ? (
            <RequestForm key="c" kind="correction" listing={listing} cta="Send correction" />
          ) : (
            <RequestForm key="r" kind="removal" listing={listing} cta="Request removal" />
          )}
        </div>
      </div>
    </>
  );
}
