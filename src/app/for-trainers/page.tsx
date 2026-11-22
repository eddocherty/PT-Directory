import type { Metadata } from "next";
import { RequestForm } from "@/components/RequestForm";

export const metadata: Metadata = { title: "For personal trainers" };

export default async function ForTrainers({ searchParams }: { searchParams: Promise<{ listing?: string }> }) {
  const { listing } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Claim your free profile</h1>
      <p className="mt-2 text-sm text-muted">
        Already listed? Claim your profile to add your photo, prices, specialisms and contact details. Not listed yet?
        Send us your details and we’ll add you. It’s free either way.
      </p>
      <div className="mt-6 rounded-xl border border-line bg-surface p-6">
        <RequestForm kind="claim" listing={listing} cta="Send claim request" />
      </div>
    </div>
  );
}
