"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Arrow } from "./Arrow";
import { QUESTIONS, type Answers } from "@/lib/match";

/** Five taps and a postcode. One question at a time, big tap targets, a back button, no sign-up. */
export function Quiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [loc, setLoc] = useState("");
  const total = QUESTIONS.length + 1;
  const q = QUESTIONS[step];

  const finish = (location: string) => {
    const p = new URLSearchParams(Object.entries({ ...answers, loc: location.trim() }).filter(([, v]) => v) as [string, string][]);
    router.push(`/match/result?${p}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="tabular-nums text-muted">{step + 1} of {total}</span>
        <div className="h-1 flex-1 overflow-hidden bg-line" aria-hidden>
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="text-muted hover:text-ink">
            <Arrow dir="left" className="mr-1 h-3 w-3" />Back
          </button>
        )}
      </div>

      {q ? (
        <fieldset key={q.key} className="mt-8">
          <legend className="display text-3xl sm:text-5xl">{q.title}</legend>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {q.choices.map((c) => {
              const on = answers[q.key] === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setAnswers({ ...answers, [q.key]: c.value });
                    setStep(step + 1);
                  }}
                  className={`group rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 hover:border-ink sm:p-5 ${on ? "border-accent bg-zap" : "border-line bg-paper"}`}
                >
                  <span className="block text-lg font-semibold">{c.label}</span>
                  {c.hint && <span className="mt-0.5 block text-sm text-muted">{c.hint}</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            finish(loc);
          }}
        >
          <label htmlFor="quiz-loc" className="display block text-3xl sm:text-5xl">
            {answers.where === "online" ? "Last one. Where are you based?" : "Last one. Where should we look?"}
          </label>
          <p className="mt-3 text-muted">
            {answers.where === "online"
              ? "Online coaches work anywhere in the UK, so this is optional. It just lets us show local trainers too."
              : "Your postcode or town. We only use it to find trainers near you; it isn’t stored."}
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <input
              id="quiz-loc"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              placeholder="e.g. LS6 or Leeds"
              autoComplete="postal-code"
              autoFocus
              className="flex-1 border-b-2 border-ink bg-transparent py-2 text-xl outline-none placeholder:text-muted/70 focus:border-accent"
            />
            <button className="btn self-start text-lg sm:self-auto">Show my match</button>
          </div>
          <button type="button" onClick={() => finish("")} className="mt-4 text-sm font-semibold text-muted underline hover:text-ink">
            Skip, show me trainers across the UK
          </button>
        </form>
      )}
    </div>
  );
}
