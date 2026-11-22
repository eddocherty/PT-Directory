"use client";

import { useEffect, useState } from "react";

/** Mobile-only slide-up drawer that holds the filter form. */
export function FilterDrawer({ active, children }: { active: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-ink px-4 py-2.5 text-sm font-semibold"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 5h14M6 10h8M8.5 15h3" strokeLinecap="round" />
        </svg>
        Filters
        {active > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-paper">{active}</span>}
      </button>

      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={`absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-paper shadow-2xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="display text-xl">Filters</p>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-xl leading-none hover:bg-soft" aria-label="Close filters">
              ×
            </button>
          </div>
          <div className="overflow-y-auto px-5">{children}</div>
        </div>
      </div>
    </>
  );
}
