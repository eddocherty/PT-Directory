"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Arrow } from "./Arrow";
import { formatPrice, getProduct } from "@/lib/products";

function Options<T extends string>({ value, onChange, options, name }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-b border-line">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`-mb-px border-b-4 py-2 text-sm font-semibold transition ${value === o.value ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

type Situation = "new" | "injury" | "event" | "steady" | "experienced";
type Confidence = "low" | "some" | "high";

/** "How many sessions with a trainer do I need?" Based on the advice in our how-often guide. */
export function SessionsTool() {
  const [days, setDays] = useState(3);
  const [situation, setSituation] = useState<Situation>("new");
  const [confidence, setConfidence] = useState<Confidence>("low");

  const r = useMemo(() => {
    const needsMore = situation === "new" || situation === "injury" || situation === "event" || confidence === "low";
    if (situation === "experienced" && confidence !== "low") {
      return {
        pt: "Every 2 to 4 weeks",
        own: `${days} on your own`,
        why: "You already train, so you mainly need fresh eyes on your technique and an updated programme. Online coaching, where a coach writes your plan and checks in weekly, is another good fit.",
      };
    }
    if (days <= 1) {
      return {
        pt: "1 a week",
        own: "plus brisk walks on other days",
        why: "With one day free, make it a session with your trainer and ask them for a few short things to do at home. NHS guidance is at least 150 minutes of moderate activity a week, and walking counts.",
      };
    }
    if (needsMore && days >= 2) {
      const pt = days >= 4 ? 2 : Math.min(2, days);
      return {
        pt: `${pt} a week for the first 8 to 12 weeks`,
        own: `${days - pt > 0 ? `plus ${days - pt} on your own. ` : ""}After that, 1 a week plus ${days - 1} on your own.`,
        why:
          situation === "injury"
            ? "Coming back from an injury goes better with more coaching early on, so someone can check how you’re moving and adjust as you go."
            : situation === "event"
              ? "With a date to work towards, two sessions a week gives you more coaching and accountability. Most people drop back once the event is done."
              : "When you’re new or not yet confident, more coaching early on helps you learn the moves and build the habit. Once it feels familiar, one session a week plus training on your own works well.",
      };
    }
    return {
      pt: "1 a week",
      own: `plus ${days - 1} on your own`,
      why: "One session a week is the most common choice. Your trainer checks your technique, sets your plan and makes it harder over time, and you do the rest on your own.",
    };
  }, [days, situation, confidence]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <div className="space-y-8 border border-line p-6 sm:p-8">
        <div>
          <label htmlFor="days" className="font-semibold">How many days a week could you train?</label>
          <div className="mt-4 flex items-center gap-4">
            <input id="days" type="range" min={1} max={6} value={days} onChange={(e) => setDays(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
            <span className="display w-10 text-right text-4xl tabular-nums">{days}</span>
          </div>
        </div>
        <div>
          <p className="font-semibold">Which fits you best?</p>
          <Options<Situation>
            name="Your situation"
            value={situation}
            onChange={setSituation}
            options={[
              { value: "new", label: "New to exercise" },
              { value: "injury", label: "Coming back from injury" },
              { value: "event", label: "Training for a date" },
              { value: "steady", label: "Just want to get fitter" },
              { value: "experienced", label: "I already train" },
            ]}
          />
        </div>
        <div>
          <p className="font-semibold">How confident are you training on your own?</p>
          <Options<Confidence>
            name="Confidence"
            value={confidence}
            onChange={setConfidence}
            options={[
              { value: "low", label: "Not at all" },
              { value: "some", label: "A bit" },
              { value: "high", label: "Very" },
            ]}
          />
        </div>
      </div>
      <div className="flex flex-col bg-accent p-6 text-paper sm:p-8" aria-live="polite">
        <p className="text-sm font-semibold text-paper/80">Sessions with a trainer</p>
        <p className="display mt-2 text-4xl sm:text-5xl">{r.pt}</p>
        <p className="mt-2 text-lg font-semibold">{r.own}</p>
        <p className="mt-4 text-paper/85">{r.why}</p>
        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          <Link href="/match" className="btn-light">Find a trainer who fits <Arrow /></Link>
          <Link href="/guides/how-often-should-you-see-a-personal-trainer" className="inline-flex items-center px-2 text-sm font-semibold underline">Read the guide</Link>
        </div>
      </div>
    </div>
  );
}

const DAY = 24 * 60 * 60 * 1000;
const fmt = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
/** The Monday on or before a date. */
const monday = (d: Date) => new Date(d.getTime() - ((d.getDay() + 6) % 7) * DAY);

/** Half marathon countdown: weeks to race day and when to start our 12-week plan. */
export function RaceTool() {
  const [date, setDate] = useState("");
  const [can5k, setCan5k] = useState<"yes" | "no">("yes");
  const r = useMemo(() => {
    if (!date) return null;
    const race = new Date(`${date}T09:00:00`);
    if (isNaN(race.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weeks = Math.floor((race.getTime() - today.getTime()) / (7 * DAY));
    const build = can5k === "yes" ? 0 : 9; // NHS Couch to 5K is a 9-week programme
    const need = 12 + build;
    const planStart = monday(new Date(race.getTime() - 12 * 7 * DAY));
    const c25kStart = monday(new Date(planStart.getTime() - 9 * 7 * DAY));
    return { weeks, need, planStart, c25kStart, build, past: race < today };
  }, [date, can5k]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <div className="space-y-8 border border-line p-6 sm:p-8">
        <div>
          <label htmlFor="race" className="font-semibold">When is your race?</label>
          <input id="race" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input mt-3 max-w-xs text-base" />
        </div>
        <div>
          <p className="font-semibold">Can you run 5K (about 30 to 40 minutes) without stopping?</p>
          <Options<"yes" | "no"> name="Can you run 5K" value={can5k} onChange={setCan5k} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "Not yet" }]} />
        </div>
      </div>
      <div className="flex flex-col bg-accent p-6 text-paper sm:p-8" aria-live="polite">
        {!r ? (
          <>
            <p className="display text-3xl">Pick your race date</p>
            <p className="mt-3 text-paper/85">We’ll count the weeks and tell you when to start training, so you reach the start line ready.</p>
          </>
        ) : r.past ? (
          <p className="display text-3xl">That date has passed. Pick an upcoming race.</p>
        ) : (
          <>
            <p className="display text-6xl tabular-nums">{r.weeks}</p>
            <p className="mt-1 text-lg font-semibold">{r.weeks === 1 ? "week" : "weeks"} to race day</p>
            {r.weeks >= r.need ? (
              <p className="mt-4 text-paper/90">
                Plenty of time.{" "}
                {r.build ? <>Start NHS Couch to 5K by <strong>{fmt(r.c25kStart)}</strong>, then a 12-week half marathon plan on <strong>{fmt(r.planStart)}</strong>.</> : <>Start a 12-week half marathon plan on <strong>{fmt(r.planStart)}</strong>. Until then, keep running two or three easy 5Ks a week.</>}
              </p>
            ) : r.weeks >= 8 && !r.build ? (
              <p className="mt-4 text-paper/90">
                It’s tight but doable if you already run regularly: join a 12-week plan at week {13 - r.weeks} and start this week. If 8K feels hard right now, think about a later race.
              </p>
            ) : (
              <p className="mt-4 text-paper/90">
                That’s less time than most first-timers need{r.build ? `, since getting to 5K usually takes about 9 weeks first` : ""}. Aim to get round comfortably, or pick a race {r.need - r.weeks} or more weeks later. A running coach can help you plan it safely.
              </p>
            )}
            <div className="mt-auto flex flex-wrap gap-3 pt-6">
              <Link href="/shop/first-half-marathon-plan" className="btn-light">Get the 12-week plan, {formatPrice(getProduct("first-half-marathon-plan")!.price)} <Arrow /></Link>
              <Link href="/specialisms/running" className="inline-flex items-center px-2 text-sm font-semibold underline">Find a running coach</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
