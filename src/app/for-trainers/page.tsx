import type { Metadata } from "next";
import { RequestForm } from "@/components/RequestForm";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "For personal trainers" };

export default async function ForTrainers({ searchParams }: { searchParams: Promise<{ listing?: string }> }) {
  const { listing } = await searchParams;
  return (
    <>
      <PageHeader eyebrow="For personal trainers" title="Claim your free profile">
        Already listed? Claim your profile to add your photo, prices, specialisms and contact details. Not listed yet?
        Send us your details and we’ll add you. It’s free either way.
      </PageHeader>
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mt-6 rounded-3xl bg-soft p-6">
        <RequestForm kind="claim" listing={listing} cta="Send claim request" />
      </div>
    </div>
    </>
  );
}
