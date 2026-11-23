"use client";

import { useState, useTransition } from "react";
import type { OutreachUpdate } from "@/app/admin/actions";

export const today = () => new Date().toISOString().slice(0, 10);

export const STATUS_STYLE: Record<string, string> = {
  "Not contacted": "bg-paper text-ink ring-1 ring-inset ring-line",
  Messaged: "bg-zap text-accent",
  Replied: "bg-amber-100 text-amber-900",
  Interested: "bg-emerald-100 text-emerald-900",
  "Signed up": "bg-emerald-600 text-white",
  "Not interested": "bg-stone-200 text-stone-700",
  "Do not contact": "bg-red-100 text-red-800",
};

export function StatusPill({ status }: { status: string }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] ?? "bg-soft"}`}>{status}</span>;
}

/** Clickable counts per outreach status: the sales pipeline at a glance. */
export function Pipeline({ statuses, counts, active, onPick }: { statuses: string[]; counts: Map<string, number>; active: string; onPick: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => (
        <button key={s} type="button" onClick={() => onPick(active === s ? "" : s)}
          className={`rounded-2xl px-4 py-2 text-left text-xs font-semibold ring-2 ${active === s ? "ring-ink" : "ring-transparent"} ${STATUS_STYLE[s] ?? "bg-paper"}`}>
          <span className="block text-lg leading-tight">{counts.get(s) ?? 0}</span>{s}
        </button>
      ))}
    </div>
  );
}

export function OutreachEditor({ statuses, value, save, onSaved }: {
  statuses: string[];
  value: OutreachUpdate;
  save: (u: OutreachUpdate) => Promise<{ ok: boolean; error?: string }>;
  onSaved: (u: OutreachUpdate) => void;
}) {
  const [v, setV] = useState<OutreachUpdate>(value);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const submit = (u: OutreachUpdate) =>
    start(async () => {
      const r = await save(u);
      setMsg(r.ok ? "Saved" : r.error ?? "Couldn’t save");
      if (r.ok) onSaved(u);
    });

  return (
    <div className="grid gap-3 text-sm md:grid-cols-[200px_170px_1fr]">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">Outreach status</span>
        <select className="input" value={v.status} onChange={(e) => setV({ ...v, status: e.target.value })}>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">Last contacted</span>
        <input type="date" className="input" value={v.last_contacted ?? ""} onChange={(e) => setV({ ...v, last_contacted: e.target.value || null })} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">Notes</span>
        <textarea rows={3} className="input" value={v.notes} placeholder="What you said, what they said, next step…" onChange={(e) => setV({ ...v, notes: e.target.value })} />
      </label>
      <div className="flex flex-wrap items-center gap-2 md:col-span-3">
        <button type="button" disabled={pending} className="btn px-4 py-2" onClick={() => submit(v)}>{pending ? "Saving…" : "Save"}</button>
        <button type="button" disabled={pending} className="btn-ghost px-4 py-2 text-xs"
          onClick={() => { const u = { ...v, status: v.status === "Not contacted" ? "Messaged" : v.status, last_contacted: today() }; setV(u); submit(u); }}>
          Contacted today
        </button>
        {msg && <span className="text-xs font-semibold text-muted">{msg}</span>}
      </div>
    </div>
  );
}
