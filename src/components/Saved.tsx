"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Avatar } from "./Avatar";
import { Arrow } from "./Arrow";
import { FITNESS_GOALS, TRAINING_STYLES, nameFor } from "@/lib/taxonomy";
import { clearSaved, isShortlisted, rememberViewed, removeSaved, toggleShortlist, useSaved, type SavedTrainer } from "@/lib/saved";

export function HeartIcon({ filled, className = "h-5 w-5" }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden>
      <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4 7.2 4c2.1 0 3.6 1.1 4.8 2.8C13.2 5.1 14.7 4 16.8 4c3.6 0 5.8 3.6 4.5 7.1-1.8 4.8-9.3 9.4-9.3 9.4Z" />
    </svg>
  );
}

/** Round heart that adds a trainer to the shortlist. `variant="pill"` shows a labelled button for profiles. */
export function HeartButton({ t, variant = "round", className = "" }: { t: SavedTrainer; variant?: "round" | "pill"; className?: string }) {
  const list = useSaved("shortlist");
  const on = isShortlisted(list, t.slug);
  const label = on ? `Remove ${t.name} from your shortlist` : `Add ${t.name} to your shortlist`;
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleShortlist(t);
  };
  if (variant === "pill") {
    return (
      <button type="button" onClick={onClick} aria-pressed={on} aria-label={label} className={`btn-ghost gap-2 text-sm ${on ? "border-accent text-accent" : ""} ${className}`}>
        <HeartIcon filled={on} className="h-4 w-4" />
        {on ? "On your shortlist" : "Save to shortlist"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={on ? "On your shortlist" : "Save to your shortlist"}
      className={`grid h-9 w-9 place-items-center bg-paper/90 backdrop-blur transition hover:scale-110 ${on ? "text-accent" : "text-ink"} ${className}`}
    >
      <HeartIcon filled={on} className="h-[18px] w-[18px]" />
    </button>
  );
}

/** Heart in the top bar with the number saved. */
export function ShortlistNavLink() {
  const n = useSaved("shortlist").length;
  return (
    <Link href="/shortlist" className="relative text-muted hover:text-ink" aria-label={`Your shortlist${n ? `, ${n} saved` : ""}`} title="Your shortlist">
      <HeartIcon filled={n > 0} className={`h-5 w-5 ${n ? "text-accent" : ""}`} />
      {n > 0 && (
        <span className="absolute -right-2.5 -top-2 text-[11px] font-bold tabular-nums text-accent">{n}</span>
      )}
    </Link>
  );
}

/** Put on a profile page: records the visit in "recently viewed". Renders nothing. */
export function RememberViewed({ t }: { t: SavedTrainer }) {
  useEffect(() => {
    rememberViewed(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.slug]);
  return null;
}

const tags = (t: SavedTrainer) => [...t.styles.map((s) => nameFor(TRAINING_STYLES, s)), ...t.goals.map((g) => nameFor(FITNESS_GOALS, g))];

export function MiniCard({ t, onRemove }: { t: SavedTrainer; onRemove?: () => void }) {
  return (
    <div className="group relative flex items-center gap-3 border border-line bg-paper p-2.5 pr-12 transition hover:border-ink">
      <Avatar t={{ name: t.name, image_url: null, styles: t.styles }} className="h-16 w-14 shrink-0 [&_.display]:!text-xl" />
      <Link href={`/trainers/${t.slug}`} className="min-w-0 flex-1 after:absolute after:inset-0">
        <span className="block truncate font-semibold group-hover:text-accent">{t.name}</span>
        <span className="block truncate text-xs text-muted">{[t.city, tags(t).slice(0, 2).join(", ")].filter(Boolean).join(" · ")}</span>
      </Link>
      {onRemove ? (
        <button type="button" onClick={onRemove} aria-label={`Remove ${t.name}`} className="absolute right-3 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center text-muted hover:bg-soft hover:text-ink">
          ✕
        </button>
      ) : (
        <HeartButton t={t} className="absolute right-2 top-1/2 z-10 -translate-y-1/2 !bg-soft" />
      )}
    </div>
  );
}

/** "Carry on where you left off" strip. Hidden until someone has looked at a profile. */
export function RecentlyViewed({ exclude, title = "Pick up where you left off" }: { exclude?: string; title?: string }) {
  const list = useSaved("recent").filter((t) => t.slug !== exclude).slice(0, 6);
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="display text-2xl sm:text-3xl">{title}</h2>
        <Link href="/shortlist" className="text-sm font-semibold text-accent hover:underline">Your shortlist <Arrow className="h-3 w-3" /></Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => <li key={t.slug}><MiniCard t={t} /></li>)}
      </ul>
    </section>
  );
}

/** The whole /shortlist page body. */
export function ShortlistBoard() {
  const list = useSaved("shortlist");
  const recent = useSaved("recent").filter((r) => !isShortlisted(list, r.slug)).slice(0, 6);
  return (
    <>
      {list.length === 0 ? (
        <div className="bg-soft p-8 text-center">
          <HeartIcon className="mx-auto h-10 w-10 text-accent" />
          <p className="display mt-4 text-2xl">Nothing saved yet</p>
          <p className="mx-auto mt-2 max-w-md text-muted">Tap the heart on any trainer to keep them here while you look around. Your shortlist stays on this device, no account needed.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/trainers" className="btn">Browse trainers</Link>
            <Link href="/match" className="btn-ghost">Take the 1-minute quiz</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted">{list.length} {list.length === 1 ? "trainer" : "trainers"} saved on this device.</p>
            <button type="button" onClick={() => clearSaved("shortlist")} className="text-sm font-semibold text-muted underline hover:text-ink">Clear shortlist</button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((t) => <li key={t.slug}><MiniCard t={t} onRemove={() => removeSaved("shortlist", t.slug)} /></li>)}
          </ul>
          <p className="mt-6 bg-zap p-4 text-sm">
            <strong>Tip:</strong> message two or three of them with the same short note about your goal and when you can train. Not sure what to ask?{" "}
            <Link href="/guides/questions-to-ask-a-personal-trainer" className="font-semibold text-accent underline">Questions to ask a trainer</Link>.
          </p>
        </>
      )}
      {recent.length > 0 && (
        <section className="mt-12">
          <h2 className="display text-2xl">Recently viewed</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((t) => <li key={t.slug}><MiniCard t={t} /></li>)}
          </ul>
        </section>
      )}
    </>
  );
}
