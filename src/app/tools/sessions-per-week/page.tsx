import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SessionsTool } from "@/components/Tools";

export const metadata: Metadata = {
  title: "How many personal training sessions do I need?",
  description: "Answer three quick questions and see how many sessions a week with a personal trainer make sense for you, and how much to do on your own.",
  alternates: { canonical: "/tools/sessions-per-week" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Tools", href: "/tools" }, { name: "Sessions per week", href: "/tools/sessions-per-week" }]} className="mb-6" />
      <h1 className="display max-w-3xl text-4xl sm:text-6xl">How many sessions with a trainer do you need?</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Move the slider and pick what fits. It updates as you go.</p>
      <div className="mt-10"><SessionsTool /></div>
      <p className="mt-8 max-w-3xl text-sm text-muted">A rule of thumb, not a prescription. Based on NHS activity guidelines and how trainers commonly structure sessions. Your trainer will tailor it to you.</p>
    </div>
  );
}
