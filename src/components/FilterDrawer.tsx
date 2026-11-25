"use client";

import { useEffect, useRef, useState } from "react";

/** Mobile-only slide-up drawer that holds the filter form. */
export function FilterDrawer({ active, children }: { active: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closer.current?.focus(); // keyboard and screen-reader users land inside the drawer
    const back = opener.current;
    return () => {
      back?.focus({ preventScroll: true });
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        ref={opener}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 border-y border-ink py-3 text-sm font-semibold"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 5h14M6 10h8M8.5 15h3" strokeLinecap="round" />
        </svg>
        Filters
        {active > 0 && <span className="ml-auto text-xs font-bold tabular-nums text-accent">{active} on</span>}
      </button>

      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} inert={!open}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={`absolute inset-x-0 bottom-0 flex max-h-[88vh] supports-[height:100dvh]:max-h-[88dvh] flex-col border-t-2 border-ink bg-paper shadow-2xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="display text-xl">Filters</p>
            <button ref={closer} type="button" onClick={() => setOpen(false)} className="p-2 text-xl leading-none hover:text-accent" aria-label="Close filters">
              ×
            </button>
          </div>
          <div className="overflow-y-auto px-5">{children}</div>
        </div>
      </div>
    </>
  );
}
