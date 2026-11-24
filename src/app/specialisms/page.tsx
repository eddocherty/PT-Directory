import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LinkList } from "@/components/LinkList";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Personal trainers by specialism",
  description: "Pilates, strength, pre and postnatal, injury rehab, running and more. Find an independent trainer who specialises in what you need.",
  alternates: { canonical: "/specialisms" },
};

export default function SpecialismsPage() {
  const link = (kind: "style" | "goal") => TOPICS.filter((t) => t.kind === kind).map((t) => ({ href: `/specialisms/${t.slug}`, label: t.people }));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ name: "Specialisms", href: "/specialisms" }]} />
      <h1 className="display mt-5 text-4xl sm:text-6xl">Find a trainer by specialism</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">Start with how you like to train, or with what you want to work on.</p>
      <LinkList className="mt-12" title="How you train" items={link("style")} />
      <LinkList className="mt-12" title="What you want to work on" items={link("goal")} />
    </div>
  );
}
