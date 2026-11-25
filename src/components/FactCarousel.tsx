"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow } from "./Arrow";
import type { Fact } from "@/lib/facts";

const EVERY_MS = 6250;

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
      {/* Progress rule, fills while each fact is showing */}
      <div className="mt-3 h-0.5 bg-line" aria-hidden>
        {moving && <div key={i} className="fact-progress h-full bg-accent" style={{ animationDuration: `${EVERY_MS}ms` }} />}
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
