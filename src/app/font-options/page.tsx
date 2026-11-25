import type { Metadata } from "next";
import { Arrow } from "@/components/Arrow";

// Temporary page for ed to compare font pairings. Not linked anywhere, not indexed.
// The candidate fonts load from Google Fonts here only; the chosen one will be bundled like the current fonts.
export const metadata: Metadata = { title: "Font options", robots: { index: false, follow: false } };

const FONTS_CSS =
  "https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=Bodoni+Moda:opsz,wght@6..96,500;6..96,700&family=Manrope:wght@400;500;600;700&family=Archivo:wdth,wght@100..125,400..800&family=Outfit:wght@300..700&family=Urbanist:wght@400..700&family=Sora:wght@300..700&family=Red+Hat+Display:wght@400..700&display=swap";

type Pairing = { id: string; label: string; name: string; fonts: string; blurb: string; display: React.CSSProperties; body: React.CSSProperties; caps?: boolean };

const PAIRINGS: Pairing[] = [
  {
    id: "now",
    label: "What you have now",
    name: "Newspaper",
    fonts: "Schibsted Grotesk + Inter",
    blurb: "A bold newspaper grotesque. Clear, but a little formal.",
    display: { fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.03em" },
    body: { fontFamily: "var(--font-body)" },
  },
  {
    id: "a",
    label: "Option A",
    name: "Dinner jacket",
    fonts: "Jost",
    blurb: "A clean geometric face in the spirit of the 1960s classics. Round O's, sharp points, light and confident. Sleek without trying too hard.",
    display: { fontFamily: "'Jost', sans-serif", fontWeight: 500, letterSpacing: "-0.02em" },
    body: { fontFamily: "'Jost', sans-serif", fontWeight: 400 },
  },
  {
    id: "d",
    label: "Option D",
    name: "Weekend in Monaco",
    fonts: "Outfit",
    blurb: "Same clean geometric shapes as A, but rounder and softer, with friendlier letters. Relaxed and cool rather than formal.",
    display: { fontFamily: "'Outfit', sans-serif", fontWeight: 500, letterSpacing: "-0.03em" },
    body: { fontFamily: "'Outfit', sans-serif", fontWeight: 400 },
  },
  {
    id: "e",
    label: "Option E",
    name: "Night drive",
    fonts: "Urbanist",
    blurb: "A slim, slightly condensed geometric face. Tall and sleek, with a modern city feel.",
    display: { fontFamily: "'Urbanist', sans-serif", fontWeight: 600, letterSpacing: "-0.02em" },
    body: { fontFamily: "'Urbanist', sans-serif", fontWeight: 500 },
  },
  {
    id: "f",
    label: "Option F",
    name: "Control room",
    fonts: "Sora",
    blurb: "Wide, open and techy, with a touch of gadget about it. Very clear on phones.",
    display: { fontFamily: "'Sora', sans-serif", fontWeight: 600, letterSpacing: "-0.04em" },
    body: { fontFamily: "'Sora', sans-serif", fontWeight: 400 },
  },
  {
    id: "g",
    label: "Option G",
    name: "Private members' club",
    fonts: "Red Hat Display",
    blurb: "Geometric but with a bit of swagger in the curves. Smart-casual: a good suit with no tie.",
    display: { fontFamily: "'Red Hat Display', sans-serif", fontWeight: 700, letterSpacing: "-0.03em" },
    body: { fontFamily: "'Red Hat Display', sans-serif", fontWeight: 400 },
  },
  {
    id: "b",
    label: "Option B",
    name: "Casino royale",
    fonts: "Bodoni Moda + Manrope",
    blurb: "A high-contrast fashion serif for headings, with a crisp modern face for everything else. The most luxurious, like a magazine cover or a watch advert.",
    display: { fontFamily: "'Bodoni Moda', serif", fontWeight: 500, letterSpacing: "-0.01em" },
    body: { fontFamily: "'Manrope', sans-serif" },
  },
  {
    id: "c",
    label: "Option C",
    name: "Gadget lab",
    fonts: "Archivo Expanded + Archivo",
    blurb: "Wide, low and fast headings, like the badge on a sports car, with the same family at normal width for reading. The most modern and sporty.",
    display: { fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontStretch: "125%", letterSpacing: "-0.02em" },
    body: { fontFamily: "'Archivo', sans-serif", fontStretch: "100%" },
  },
];

const TOWNS: [string, number][] = [["London", 74], ["Manchester", 31], ["Bristol", 24], ["Birmingham", 22], ["Leeds", 19], ["Glasgow", 17]];

function Sample({ p }: { p: Pairing }) {
  const d = p.display;
  return (
    <section id={p.id} className="border-t border-line py-14" style={p.body}>
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{p.label}</p>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-3xl" style={d}>{p.name}</h2>
          <p className="text-sm font-semibold text-muted">{p.fonts}</p>
        </div>
        <p className="mt-3 max-w-xl text-muted">{p.blurb}</p>

        {/* Hero */}
        <div className="mt-8 bg-soft px-6 py-10 sm:px-10">
          <h3 className="text-5xl leading-[1.02] sm:text-7xl" style={d}>
            Your local PT,<br /><span className="text-accent">found in seconds.</span>
          </h3>
          <div className="mt-8 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Where</p>
              <p className="mt-1 border-b-2 border-ink py-2 text-xl text-muted/70">Postcode or town</p>
            </div>
            <span className="inline-flex items-center gap-2.5 self-start border-b-4 border-accent pb-1.5 pt-2 text-[15px] font-bold sm:self-auto">Search <Arrow /></span>
          </div>
          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-wider">
            {["Pilates", "Bootcamps", "Weight loss", "Pre & post natal"].map((t) => <span key={t}><span className="text-accent">/</span> {t}</span>)}
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {/* Facts + paragraph */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Did you know?</p>
            <p className="mt-4 text-6xl text-accent tabular-nums" style={d}>619</p>
            <p className="mt-2 max-w-sm text-[15px] leading-snug">independent trainers, Pilates instructors and small studios listed, across 300 UK towns and cities. No big gym chains.</p>
            <h4 className="mt-10 text-3xl" style={d}>About strength training</h4>
            <p className="mt-3 text-muted">Strength training means lifting progressively heavier weights in a few basic movements: squats, hinges, presses and pulls. It suits complete beginners as much as experienced lifters.</p>
          </div>
          {/* Towns list + trainer name */}
          <div>
            <h4 className="text-3xl" style={d}>Trainers near you</h4>
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {TOWNS.map(([c, n]) => (
                <li key={c} className="flex items-baseline justify-between border-b border-line py-3 font-semibold">
                  {c}<span className="text-sm font-medium tabular-nums text-muted">{n} trainers</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-end justify-between gap-4 bg-ink p-5 text-paper">
              <div>
                <p className="text-2xl" style={d}>Alex Morgan</p>
                <p className="mt-1 text-sm text-paper/80">Leeds · Strength and conditioning</p>
              </div>
              <span className="inline-flex items-center gap-2 border-b-4 border-[#9db8f2] pb-1 text-sm font-bold">Contact Alex <Arrow /></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FontOptions() {
  return (
    <div className="pb-20">
      <link rel="stylesheet" href={FONTS_CSS} precedence="default" />
      <div className="mx-auto max-w-6xl px-4 pt-14">
        <h1 className="display text-5xl sm:text-6xl">Font options</h1>
        <p className="mt-4 max-w-xl text-muted">The same bits of the site in different typefaces. Scroll down and tell me a letter, or keep what you have.</p>
        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          {PAIRINGS.map((p) => <a key={p.id} href={`#${p.id}`} className="border-b-2 border-accent pb-0.5">{p.id === "now" ? "Now" : p.label}</a>)}
        </nav>
      </div>
      {PAIRINGS.map((p) => <Sample key={p.id} p={p} />)}
    </div>
  );
}
