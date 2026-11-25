"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Tip = { name: string; count: string; x: number; y: number };

const SHOW_MS = 2600; // how long an automatic label stays up
const GAP_MS = 1400; // pause between automatic labels
const RESUME_MS = 1500; // wait after the pointer leaves before going back to automatic

/**
 * Wraps the UK map and shows a small floating label for a town dot.
 * On its own it drifts slowly between random towns, fading each label in and out. As soon as the
 * pointer (or keyboard focus) is on the map, it stops and follows the visitor instead, then picks up
 * again a moment after they leave. It stays still for anyone who has asked their device to reduce motion.
 * The dots carry their name and count as data attributes, so the map itself stays a server component.
 */
export function MapHover({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const active = useRef<Element | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [visible, setVisible] = useState(false);
  const [manual, setManual] = useState(false);

  const point = useCallback((el: Element | null) => {
    active.current?.classList.remove("is-active");
    active.current = el;
    if (!el || !box.current) return setVisible(false);
    el.classList.add("is-active");
    const dot = el.querySelector("circle:last-of-type") ?? el;
    const r = dot.getBoundingClientRect();
    const b = box.current.getBoundingClientRect();
    const d = (el as HTMLElement).dataset;
    setTip({ name: d.town ?? "", count: d.count ?? "", x: r.left + r.width / 2 - b.left, y: r.top - b.top });
    setVisible(true);
  }, []);

  const fromEvent = (target: EventTarget | null) => {
    setManual(true);
    point((target as Element | null)?.closest?.("[data-town]") ?? null);
  };

  // Automatic tour of random towns with trainers, only while nobody is pointing at the map.
  useEffect(() => {
    if (manual || !box.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dots = Array.from(box.current.querySelectorAll('[data-town][data-has="1"]'));
    if (!dots.length) return;
    let last = -1;
    let hide: ReturnType<typeof setTimeout>;
    const step = () => {
      if (!box.current?.offsetWidth) return; // map hidden on small screens
      let k = Math.floor(Math.random() * dots.length);
      if (k === last && dots.length > 1) k = (k + 1) % dots.length;
      last = k;
      point(dots[k]);
      hide = setTimeout(() => point(null), SHOW_MS);
    };
    const first = setTimeout(step, GAP_MS);
    const loop = setInterval(step, SHOW_MS + GAP_MS);
    return () => {
      clearTimeout(first);
      clearTimeout(hide);
      clearInterval(loop);
    };
  }, [manual, point]);

  // Hand control back to the automatic tour a moment after the visitor leaves.
  const resume = useRef<ReturnType<typeof setTimeout>>(undefined);
  const leave = () => {
    point(null);
    clearTimeout(resume.current);
    resume.current = setTimeout(() => setManual(false), RESUME_MS);
  };
  const enter = () => {
    clearTimeout(resume.current);
    setManual(true);
  };
  useEffect(() => () => clearTimeout(resume.current), []);

  return (
    <div
      ref={box}
      className={className}
      onPointerEnter={enter}
      onPointerOver={(e) => fromEvent(e.target)}
      onPointerLeave={leave}
      onFocus={(e) => fromEvent(e.target)}
      onBlur={leave}
    >
      {children}
      {tip && (
        <div
          aria-hidden
          className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap pb-2 transition-opacity ${manual ? "duration-150" : "duration-700"} ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ left: tip.x, top: tip.y }}
        >
          <div className="border-l-4 border-accent bg-ink px-3 py-1.5 text-paper shadow-lg">
            <span className="block text-sm font-bold leading-tight">{tip.name}</span>
            <span className="block text-[11px] font-medium text-paper/70">{tip.count}</span>
          </div>
          <div className="mx-auto h-2 w-px bg-ink" />
        </div>
      )}
    </div>
  );
}
