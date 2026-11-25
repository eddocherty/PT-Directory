import Link from "next/link";
import type { Metadata } from "next";
import { Arrow } from "@/components/Arrow";

// Temporary page for ed to compare link styles. Not linked anywhere, not indexed.
export const metadata: Metadata = { title: "Link style options", robots: { index: false, follow: false } };

const POPULAR = ["Pilates", "Bootcamps", "Weight loss", "Muscle gain", "Pre & post natal", "Rehab"];
const CITIES: [string, number][] = [["London", 74], ["Manchester", 31], ["Birmingham", 22], ["Leeds", 19], ["Bristol", 24], ["Glasgow", 17], ["Edinburgh", 15], ["Cardiff", 12]];
const TAGS = ["Strength", "Weight loss", "Rehab"];
const FILTERS = ["Pilates", "Home visits", "Within 5 miles"];

function Frame({ id, name, blurb, children }: { id: string; name: string; blurb: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-line py-14">
      <div className="mx-auto max-w-5xl px-4">
        <p className="eyebrow text-accent">{id === "now" ? "What you have now" : `Option ${id.toUpperCase()}`}</p>
        <h2 className="display mt-2 text-4xl">{name}</h2>
        <p className="mt-3 max-w-xl text-muted">{blurb}</p>
        <div className="mt-10 grid gap-10">{children}</div>
      </div>
    </section>
  );
}

function Row({ label, children, dark = false }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <div className={`min-w-0 ${dark ? "rounded-2xl bg-ink p-5 text-paper" : "rounded-2xl bg-soft p-5"}`}>{children}</div>
    </div>
  );
}

/* ---------------- Current look (pills) ---------------- */
function Now() {
  return (
    <Frame id="now" name="Rounded pills" blurb="Every link sits inside its own rounded capsule. This is what you said you don't like.">
      <Row label="Main buttons">
        <div className="flex flex-wrap gap-3">
          <span className="btn">Search</span>
          <span className="btn-ghost">Contact trainer</span>
        </div>
      </Row>
      <Row label="Hero links">
        <div className="flex flex-col items-start gap-3">
          <span className="inline-flex items-center gap-3 rounded-full border-2 border-ink bg-paper py-1.5 pl-1.5 pr-5 text-sm font-semibold">
            <span className="rounded-full bg-ink px-3 py-1 text-xs text-paper">1 min</span>Not sure what you need? Find your training match <Arrow />
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-paper">Or train online with a UK coach, wherever you live <Arrow /></span>
        </div>
      </Row>
      <Row label="Popular searches">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="text-muted">Popular:</span>
          {POPULAR.map((p) => <span key={p} className="rounded-full border border-line bg-paper px-3 py-1">{p}</span>)}
        </div>
      </Row>
      <Row label="Towns">
        <div className="flex flex-wrap gap-2">
          {CITIES.map(([c, n]) => <span key={c} className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium">{c}<span className="ml-2 tabular-nums text-muted">{n}</span></span>)}
          <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">All 300 towns by county</span>
        </div>
      </Row>
      <Row label="Trainer tags">
        <div className="flex flex-wrap gap-1.5">{TAGS.map((t) => <span key={t} className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium">{t}</span>)}</div>
      </Row>
      <Row label="Active filters">
        <div className="flex flex-wrap gap-1.5">{FILTERS.map((f) => <span key={f} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper">{f} ×</span>)}</div>
      </Row>
    </Frame>
  );
}

/* ---------------- Option A: underlined text links ---------------- */
function OptionA() {
  const u = "underline decoration-accent decoration-2 underline-offset-[6px] hover:text-accent";
  return (
    <Frame id="a" name="Underlined, like a magazine" blurb="No boxes at all. Links are plain words with a blue underline, separated by thin slashes. Buttons become crisp square blocks. Feels editorial and calm, like a good newspaper website.">
      <Row label="Main buttons">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-3 bg-ink px-6 py-3 text-sm font-semibold text-paper">Search <Arrow /></span>
          <span className="inline-flex items-center gap-3 border-2 border-ink px-6 py-2.5 text-sm font-semibold">Contact trainer <Arrow /></span>
        </div>
      </Row>
      <Row label="Hero links">
        <div className="flex flex-col items-start gap-4 text-base font-semibold">
          <span className={`inline-flex items-center gap-2 ${u}`}>Not sure what you need? Find your training match in 1 minute <Arrow /></span>
          <span className={`inline-flex items-center gap-2 text-accent ${u}`}>Or train online with a UK coach, wherever you live <Arrow /></span>
        </div>
      </Row>
      <Row label="Popular searches">
        <p className="text-sm font-medium">
          <span className="text-muted">Popular: </span>
          {POPULAR.map((p, i) => (
            <span key={p}>{i > 0 && <span className="mx-2 text-line" aria-hidden>/</span>}{" "}<span className={u}>{p}</span>{" "}</span>
          ))}
        </p>
      </Row>
      <Row label="Towns">
        <p className="text-lg font-semibold leading-loose">
          {CITIES.map(([c, n], i) => (
            <span key={c}>{i > 0 && <span className="mx-2.5 font-normal text-muted" aria-hidden>/</span>}{" "}<span className={u}>{c}</span><sup className="ml-0.5 text-xs font-medium tabular-nums text-muted">{n}</sup>{" "}</span>
          ))}
          <span className="mx-2.5 font-normal text-muted" aria-hidden>/</span>
          <span className={`inline-flex items-center gap-1.5 text-accent ${u}`}>All 300 towns by county <Arrow /></span>
        </p>
      </Row>
      <Row label="Trainer tags">
        <p className="text-xs font-medium text-muted">{TAGS.join("  ·  ")}</p>
      </Row>
      <Row label="Active filters">
        <p className="text-sm">
          <span className="text-muted">Showing: </span>
          {FILTERS.map((f, i) => (
            <span key={f}>{i > 0 && ", "}<span className="font-semibold">{f}</span> <span className="text-xs text-accent underline">remove</span></span>
          ))}
        </p>
      </Row>
    </Frame>
  );
}

/* ---------------- Option B: square-edged labels ---------------- */
function OptionB() {
  const tag = "inline-flex items-center border border-ink/25 bg-paper px-2.5 py-1 text-xs font-semibold uppercase tracking-wider hover:border-accent hover:bg-accent hover:text-paper";
  return (
    <Frame id="b" name="Square labels, like kit tags" blurb="Keeps a shape around links so they're easy to tap, but with sharp corners, small capitals and a blue fill on hover. Buttons get a separate blue arrow block. Sporty and a bit technical, like a label on gym kit.">
      <Row label="Main buttons">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-stretch text-sm font-semibold text-paper"><span className="bg-ink px-6 py-3">Search</span><span className="grid place-items-center bg-accent px-3.5"><Arrow /></span></span>
          <span className="inline-flex items-stretch border-2 border-ink text-sm font-semibold"><span className="px-6 py-2.5">Contact trainer</span><span className="grid place-items-center border-l-2 border-ink px-3"><Arrow /></span></span>
        </div>
      </Row>
      <Row label="Hero links">
        <div className="flex flex-col items-start gap-3">
          <span className="inline-flex items-stretch border-2 border-ink bg-paper text-sm font-semibold">
            <span className="grid place-items-center bg-ink px-2.5 text-[11px] uppercase tracking-wider text-paper">1 min</span>
            <span className="inline-flex items-center gap-2 px-4 py-2">Not sure what you need? Find your training match <Arrow /></span>
          </span>
          <span className="inline-flex items-center gap-2 bg-accent px-4 py-2 text-sm font-semibold text-paper">Or train online with a UK coach, wherever you live <Arrow /></span>
        </div>
      </Row>
      <Row label="Popular searches">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted">Popular:</span>
          {POPULAR.map((p) => <span key={p} className={tag}>{p}</span>)}
        </div>
      </Row>
      <Row label="Towns">
        <div className="flex flex-wrap gap-1.5">
          {CITIES.map(([c, n]) => <span key={c} className={`${tag} gap-2 px-3 py-2 text-sm normal-case tracking-normal`}>{c}<span className="font-medium tabular-nums opacity-60">{n}</span></span>)}
          <span className="inline-flex items-center gap-2 bg-ink px-3 py-2 text-sm font-semibold text-paper">All 300 towns by county <Arrow /></span>
        </div>
      </Row>
      <Row label="Trainer tags">
        <div className="flex flex-wrap gap-1">{TAGS.map((t) => <span key={t} className="border-l-2 border-accent bg-paper px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider">{t}</span>)}</div>
      </Row>
      <Row label="Active filters">
        <div className="flex flex-wrap gap-1.5">{FILTERS.map((f) => <span key={f} className="inline-flex items-stretch text-xs font-semibold text-paper"><span className="bg-ink px-2.5 py-1">{f}</span><span className="bg-accent px-2 py-1">×</span></span>)}</div>
      </Row>
    </Frame>
  );
}

/* ---------------- Option C: index lists with rules ---------------- */
function OptionC() {
  return (
    <Frame id="c" name="Lists with lines, like a timetable" blurb="Links become rows separated by thin lines, with counts and arrows lined up on the right, like a departures board or a race results sheet. Buttons become bold text with a thick blue bar underneath. The most distinctive of the three.">
      <Row label="Main buttons">
        <div className="flex flex-wrap items-end gap-8">
          <span className="inline-flex items-center gap-3 border-b-4 border-accent pb-1 text-lg font-bold">Search <Arrow className="h-4 w-4" /></span>
          <span className="inline-flex items-center gap-3 border-b-4 border-ink pb-1 text-lg font-bold">Contact trainer <Arrow className="h-4 w-4" /></span>
        </div>
      </Row>
      <Row label="Hero links">
        <ul className="max-w-xl divide-y divide-line border-y border-ink">
          <li className="flex items-center justify-between gap-4 py-3 font-semibold hover:text-accent"><span>Not sure what you need? Find your training match</span><span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted">1 min <Arrow /></span></li>
          <li className="flex items-center justify-between gap-4 py-3 font-semibold text-accent"><span>Or train online with a UK coach, wherever you live</span><Arrow /></li>
        </ul>
      </Row>
      <Row label="Popular searches">
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
          {POPULAR.map((p, i) => (
            <span key={p} className="flex items-baseline gap-3 border-b border-line py-2 text-sm font-medium hover:border-accent hover:text-accent">
              <span className="w-5 text-xs tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>{p}
            </span>
          ))}
        </div>
      </Row>
      <Row label="Towns">
        <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map(([c, n]) => (
            <span key={c} className="flex items-baseline justify-between border-b border-line py-2.5 font-semibold hover:border-accent hover:text-accent">
              {c}<span className="text-sm font-medium tabular-nums text-muted">{n} trainers</span>
            </span>
          ))}
          <span className="flex items-center justify-between border-b-2 border-accent py-2.5 font-semibold text-accent">All 300 towns by county <Arrow /></span>
        </div>
      </Row>
      <Row label="Trainer tags">
        <p className="text-xs font-semibold uppercase tracking-wider">{TAGS.map((t) => <span key={t} className="mr-3"><span className="text-accent">/</span> {t}</span>)}</p>
      </Row>
      <Row label="Active filters">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Filters</span>
          {FILTERS.map((f) => <span key={f} className="inline-flex items-center gap-1.5 font-semibold">{f}<span className="text-accent">×</span></span>)}
        </div>
      </Row>
    </Frame>
  );
}

export default function StyleOptions() {
  return (
    <div className="pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-14">
        <h1 className="display text-5xl sm:text-6xl">Link style options</h1>
        <p className="mt-4 max-w-xl text-muted">The same links shown four ways. Scroll down, then tell me A, B or C (or mix, for example A for links and B for buttons).</p>
        <nav className="mt-6 flex gap-6 text-sm font-semibold">
          {["now", "a", "b", "c"].map((x) => <Link key={x} href={`#${x}`} className="underline decoration-accent decoration-2 underline-offset-4">{x === "now" ? "Now" : `Option ${x.toUpperCase()}`}</Link>)}
        </nav>
      </div>
      <Now />
      <OptionA />
      <OptionB />
      <OptionC />
    </div>
  );
}
