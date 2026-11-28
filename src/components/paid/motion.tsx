"use client";
import { useEffect, useRef, useState } from "react";
import { Runner } from "../FactCarousel";

// Small bits of movement for paid profiles. Everything renders finished on the server (so it reads fine without
// JavaScript and nothing jumps), and nothing moves for anyone who has asked their device to reduce motion.

const still = () => typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Sections below the fold rise gently into place as they scroll into view. Only sections that start off-screen
 * are hidden first, so nothing the visitor can already see ever blinks.
 */
export function Reveal() {
  useEffect(() => {
    if (still() || !("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight,
    );
    els.forEach((el) => el.classList.add("reveal-armed"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("reveal-in");
          io.unobserve(e.target);
        }
      }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

/** A number that counts up from `from` the first time it comes into view. */
export function CountUp({ to, from = 0, prefix = "", ms = 1100 }: { to: number; from?: number; prefix?: string; ms?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || still() || !("IntersectionObserver" in window)) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / ms);
        const eased = 1 - (1 - k) ** 3;
        setV(Math.round(from + (to - from) * eased));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      setV(from);
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, from, ms]);
  return <span ref={ref} className="tabular-nums">{prefix}{v}</span>;
}

/**
 * "On this page", beside the sections: each one has a thin bar that fills as you read it, the one you're on turns
 * blue, and a little runner jogs along the overall progress line while you scroll (and rests when you stop).
 */
export function SectionIndex({ items }: { items: { id: string; label: string }[] }) {
  const [progress, setProgress] = useState<number[]>(() => items.map(() => 0));
  const [overall, setOverall] = useState(0);
  const [running, setRunning] = useState(false);
  const [calm, setCalm] = useState(true);

  useEffect(() => {
    setCalm(still());
    const els = items.map((i) => document.getElementById(i.id));
    let raf = 0;
    let rest: ReturnType<typeof setTimeout>;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * 0.4; // reading line, 40% down the screen
      const p = els.map((el) => {
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        return Math.min(1, Math.max(0, (line - r.top) / Math.max(r.height, 1)));
      });
      setProgress(p);
      const first = els.find(Boolean)?.getBoundingClientRect();
      const last = [...els].reverse().find(Boolean)?.getBoundingClientRect();
      if (first && last) setOverall(Math.min(1, Math.max(0, (line - first.top) / Math.max(last.bottom - first.top, 1))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
      setRunning(true);
      clearTimeout(rest);
      rest = setTimeout(() => setRunning(false), 260);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(rest);
    };
  }, [items]);

  // The section being read: the last one that has started.
  const active = progress.reduce((a, p, i) => (p > 0 ? i : a), 0);
  const pct = Math.round(overall * 100);
  return (
    <nav aria-label="On this page">
      <p className="eyebrow flex items-baseline justify-between text-muted">
        On this page
        <span className="tabular-nums text-ink">{pct === 100 ? "All read" : `${pct}% read`}</span>
      </p>
      {/* Overall progress, with the runner */}
      <div className={`relative mb-1 mt-7 h-0.5 bg-line ${running ? "" : "runner-rest"}`} aria-hidden>
        <div className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-200" style={{ width: `${pct}%` }}>
          {!calm && <Runner className="absolute -right-2.5 bottom-0.5 h-5 w-5 text-accent" />}
        </div>
      </div>
      <ol className="grid grid-cols-2 gap-x-5">
        {items.map((i, n) => {
          const p = progress[n] ?? 0;
          const on = n === active;
          return (
            <li key={i.id}>
              <a href={`#${i.id}`} aria-current={on ? "true" : undefined} className="group block pb-2 pt-3">
                <span className={`flex items-center gap-1.5 text-sm font-semibold leading-tight transition-colors ${on ? "text-accent" : p >= 1 ? "text-ink" : "text-muted group-hover:text-ink"}`}>
                  <span className="min-w-0 truncate">{i.label}</span>
                  {p >= 1 && !on && <span aria-hidden className="text-xs text-accent">✓</span>}
                </span>
                <span className="relative mt-2 block h-[3px] bg-line transition-all group-hover:h-[5px]" aria-hidden>
                  <span className={`absolute inset-y-0 left-0 transition-[width] duration-300 ${on ? "bg-accent" : "bg-ink/70"}`} style={{ width: `${p * 100}%` }} />
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
