"use client";

import { useMemo, useState } from "react";
import type { PickTrainer } from "@/lib/admin-paid";

/** Find any listed trainer and copy their own £10 a month payment link, ready to paste in a message. */
export function JoinLinkFinder({ trainers, origin }: { trainers: PickTrainer[]; origin: string }) {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return trainers.filter((t) => t.name.toLowerCase().includes(s) || (t.city ?? "").toLowerCase().includes(s)).slice(0, 8);
  }, [q, trainers]);
  const copy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(link);
    } catch {
      setCopied(null);
    }
  };
  return (
    <div>
      <label htmlFor="join-q" className="text-sm font-semibold">Trainer’s name or town</label>
      <input id="join-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Jo Marsh or Kendal" className="input mt-1 w-full max-w-md" />
      {hits.length > 0 && (
        <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
          {hits.map((t) => {
            const link = `${origin}/join/${t.slug}`;
            return (
              <li key={t.slug} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <span className="min-w-0"><b>{t.name}</b> <span className="text-muted">{t.city}</span><br /><code className="break-all text-xs">{link}</code></span>
                <span className="flex gap-4">
                  <button type="button" onClick={() => copy(link)} className="btn-ghost text-xs">{copied === link ? "Copied" : "Copy link"}</button>
                  <a href={`/admin/paid/${t.slug}`} className="btn-ghost text-xs">Edit page</a>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">
        Not listed yet? Send <code>{origin}/join</code> instead, then link their payment to their listing below once it’s made.
      </p>
    </div>
  );
}
