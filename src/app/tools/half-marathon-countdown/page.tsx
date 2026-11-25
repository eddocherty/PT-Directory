import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RaceTool } from "@/components/Tools";

export const metadata: Metadata = {
  title: "Half marathon countdown: when should I start training?",
  description: "Enter your race date and see how many weeks you have, and the date to start a 12-week half marathon plan so you reach the start line ready.",
  alternates: { canonical: "/tools/half-marathon-countdown" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <Breadcrumbs items={[{ name: "Tools", href: "/tools" }, { name: "Half marathon countdown", href: "/tools/half-marathon-countdown" }]} className="mb-6" />
      <h1 className="display max-w-3xl text-4xl sm:text-6xl">When should you start training for your half marathon?</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Pop in your race date. We’ll count the weeks and give you a start date.</p>
      <div className="mt-10"><RaceTool /></div>
      <p className="mt-8 max-w-3xl text-sm text-muted">General guidance, not medical advice. If you have a health condition, check with your GP before starting a new running programme.</p>
    </div>
  );
}
