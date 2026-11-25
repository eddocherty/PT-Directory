import type { Metadata } from "next";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Find your training match: a 1-minute quiz",
  description: "Five quick questions about your goal and how you like to train. Get the kind of training that suits you, trainers near you who offer it, and a plan to start with.",
  alternates: { canonical: "/match" },
};

export default function MatchPage() {
  return (
    <section className="min-h-[70vh] bg-soft">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <h1 className="eyebrow mx-auto mb-6 max-w-2xl text-accent">Find your training match · about a minute</h1>
        <Quiz />
      </div>
    </section>
  );
}
