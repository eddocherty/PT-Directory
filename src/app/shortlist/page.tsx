import type { Metadata } from "next";
import { ShortlistBoard } from "@/components/Saved";

export const metadata: Metadata = {
  title: "Your shortlist",
  robots: { index: false, follow: true },
};

export default function ShortlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <h1 className="display text-4xl sm:text-6xl">Your shortlist</h1>
      <div className="mt-8"><ShortlistBoard /></div>
    </div>
  );
}
