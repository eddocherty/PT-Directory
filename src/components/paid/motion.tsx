"use client";
import { useEffect, useRef, useState } from "react";

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

/** The ruled list of sections beside the page, with the one you're reading marked. */
export function SectionIndex({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || !("IntersectionObserver" in window)) return;
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        const first = items.find((i) => seen.get(i.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page" className="border-t border-line">
      {items.map((i, n) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          aria-current={active === i.id ? "true" : undefined}
          className={`group flex items-baseline gap-4 border-b border-line py-2.5 text-sm font-semibold transition-colors ${active === i.id ? "text-ink" : "text-muted hover:text-ink"}`}
        >
          <span className={`w-6 text-xs tabular-nums transition-colors ${active === i.id ? "text-accent" : ""}`}>{String(n + 1).padStart(2, "0")}</span>
          <span className="min-w-0 flex-1 truncate">{i.label}</span>
          <span className={`h-[3px] bg-accent transition-all duration-500 ${active === i.id ? "w-6" : "w-0"}`} aria-hidden />
        </a>
      ))}
    </nav>
  );
}
