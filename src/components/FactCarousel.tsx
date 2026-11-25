"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow } from "./Arrow";
import type { Fact } from "@/lib/facts";

const EVERY_MS = 7500;

/**
 * Slides one fact along every few seconds (three visible on wide screens, one on phones).
 * Pauses while hovered or focused, and stays still for anyone who has asked their device to reduce motion.
 */
export function FactCarousel({ facts }: { facts: Fact[] }) {
  const n = facts.length;
  const [i, setI] = useState(0); // index of the first visible fact, can run past n onto the cloned tail
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const moving = n > 1 && !paused && !still;
  useEffect(() => {
    if (!moving) return;
    const t = setInterval(() => {
      setAnimate(true);
      setI((v) => v + 1);
    }, EVERY_MS);
    return () => clearInterval(t);
  }, [moving]);

  // After sliding onto the cloned copy of the first fact, jump back to the real one without animating.
  const onEnd = () => {
    if (i >= n) {
      setAnimate(false);
      setI(i - n);
    }
  };

  const go = (d: number) => {
    setAnimate(!still);
    setI((v) => (((v + d) % n) + n) % n);
  };

  const track = n > 1 ? [...facts, ...facts.slice(0, 3)] : facts;
  const shown = (i % n) + 1;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="eyebrow text-muted">
          Did you know?
        </p>
        {n > 1 && (
          <div className="flex items-center gap-4 text-xs font-semibold tabular-nums text-muted">
            <span aria-live="polite">{String(shown).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
            <button type="button" onClick={() => go(-1)} aria-label="Previous fact" className="hover:text-accent"><Arrow dir="left" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next fact" className="hover:text-accent"><Arrow /></button>
          </div>
        )}
      </div>
      {/* Timer: a little runner jogs along the rule while each fact is showing */}
      <div className="relative mt-5 h-0.5 bg-line" aria-hidden>
        {moving && (
          <div key={i} className="fact-progress absolute inset-y-0 left-0 bg-accent" style={{ animationDuration: `${EVERY_MS}ms` }}>
            <Runner className="absolute -right-2.5 bottom-0.5 h-5 w-5 text-accent" />
          </div>
        )}
      </div>
      <div className="mt-5 overflow-hidden">
        <ul
          className="flex [--k:1] md:-ml-[25px] md:w-[calc(100%+25px)] md:[--k:3]"
          style={{ transform: `translateX(calc(${-i} * 100% / var(--k)))`, transition: animate ? "transform 875ms cubic-bezier(.2,.7,.2,1)" : "none" }}
          onTransitionEnd={onEnd}
        >
          {track.map((f, k) => (
            <li key={k} className="w-full shrink-0 md:w-1/3 md:border-l md:border-line md:px-6" aria-hidden={k < i || k >= i + 3 ? true : undefined}>
              <Link href={f.href} tabIndex={k < i || k >= i + 3 ? -1 : undefined} className="group block">
                <span className="display block text-4xl text-accent tabular-nums sm:text-5xl">{f.big}</span>
                <span className="mt-2 block text-[15px] leading-snug">{f.text}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-muted group-hover:text-ink">{f.cta} <Arrow className="h-3 w-3 transition group-hover:translate-x-0.5" /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Small two-frame stick runner; the frames swap to make the legs and arms move. */
function Runner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="3.4" r="1.9" fill="currentColor" stroke="none" />
      <path d="M12 6.2 9.2 12" />
      <g className="runner-a">
        <path d="M11.2 7.6 14 9.6l2.2-1.4M11.2 7.6 8.4 8.4 6.6 6.8" />
        <path d="M9.2 12l3 2.4-.8 4M9.2 12l-2.8 2.8-3 .6" />
      </g>
      <g className="runner-b">
        <path d="M11.2 7.6 13 10.4l2 .8M11.2 7.6 9.4 9.8 9 11.6" />
        <path d="M9.2 12l1.4 3.4-2.4 3.2M9.2 12l2.4 2 2.6 1" />
      </g>
    </svg>
  );
}
