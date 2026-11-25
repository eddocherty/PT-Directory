"use client";
import { useRef, useState } from "react";

type Tip = { name: string; count: string; x: number; y: number };

/**
 * Wraps the UK map and shows a small floating label for whichever town dot the pointer (or keyboard focus) is on.
 * The dots carry their name and count as data attributes, so the map itself stays a server component.
 */
export function MapHover({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  const show = (target: EventTarget | null) => {
    const el = (target as Element | null)?.closest?.("[data-town]") as HTMLElement | SVGElement | null;
    if (!el || !box.current) return setTip(null);
    const dot = el.querySelector("circle:last-of-type") ?? el;
    const r = dot.getBoundingClientRect();
    const b = box.current.getBoundingClientRect();
    setTip({ name: el.dataset.town ?? "", count: el.dataset.count ?? "", x: r.left + r.width / 2 - b.left, y: r.top - b.top });
  };

  return (
    <div
      ref={box}
      className={className}
      onPointerOver={(e) => show(e.target)}
      onPointerLeave={() => setTip(null)}
      onFocus={(e) => show(e.target)}
      onBlur={() => setTip(null)}
    >
      {children}
      {tip && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap pb-2"
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
