"use client";

import { Fragment, useMemo, useState } from "react";
import type { Lead } from "@/lib/admin-data";
import { saveLeadOutreach } from "@/app/admin/actions";
import { downloadCsv } from "./csv";
import { OutreachEditor, Pipeline, StatusPill } from "./OutreachEditor";

/** facebook.com/SomePage/ → m.me/SomePage (opens a Messenger chat with the page). */
function messengerLink(fb: string | null): string | null {
  if (!fb) return null;
  try {
    const u = new URL(fb);
    const parts = u.pathname.split("/").filter(Boolean);
    if (!parts.length || ["profile.php", "p", "people", "groups", "pages"].includes(parts[0])) return null;
    return `https://m.me/${parts[0]}`;
  } catch {
    return null;
  }
}

const SPECIALISMS = ["PT", "Pilates", "Pre/postnatal", "Bootcamp", "Online", "Studio"];

export function LeadTable({ leads, statuses }: { leads: Lead[]; statuses: string[] }) {
  const [rows, setRows] = useState(leads);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [limit, setLimit] = useState(100);

  const cities = useMemo(() => [...new Set(rows.map((l) => l.list_city))].sort(), [rows]);
  const base = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((l) =>
      (!city || l.list_city === city) &&
      (!spec || (l.specialism ?? "").toLowerCase().includes(spec.toLowerCase())) &&
      (!confirmed || (confirmed === "yes" ? /^yes/i.test(l.area_confirmed ?? "") : !/^yes/i.test(l.area_confirmed ?? ""))) &&
      (!s || [l.name, l.area, l.notes, l.facebook_url, l.instagram_url].some((v) => v?.toLowerCase().includes(s))));
  }, [rows, q, city, spec, confirmed]);
  const filtered = useMemo(() => base.filter((l) => !status || l.status === status), [base, status]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    base.forEach((l) => m.set(l.status, (m.get(l.status) ?? 0) + 1));
    return m;
  }, [base]);

  const exportCsv = () =>
    downloadCsv(`train-local-outreach-${new Date().toISOString().slice(0, 10)}.csv`,
      ["List", "Trainer / business", "Area", "Area confirmed?", "Specialism", "Facebook", "Instagram", "Website", "Contact route", "Outreach status", "Last contacted", "Notes"],
      filtered.map((l) => [l.list_city, l.name, l.area, l.area_confirmed, l.specialism, l.facebook_url, l.instagram_url, l.website, l.contact_route, l.status, l.last_contacted, l.notes]));

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-paper p-5 text-sm">
        <p className="display text-2xl">Outreach pipeline</p>
        <p className="mt-1 text-muted">
          Trainers found on public Facebook and Instagram pages who aren’t on LocalPT yet. This list is private to you:
          don’t list anyone until they’ve said yes. Open a trainer to log notes. “Message” opens a Messenger chat with their page.
        </p>
      </div>
      <Pipeline statuses={statuses} counts={counts} active={status} onPick={setStatus} />
      <div className="grid gap-2 rounded-3xl bg-paper p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" placeholder="Search name, area, notes…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All places ({cities.length})</option>{cities.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input" value={spec} onChange={(e) => setSpec(e.target.value)}>
          <option value="">All specialisms</option>{SPECIALISMS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input" value={confirmed} onChange={(e) => setConfirmed(e.target.value)}>
          <option value="">Area: any</option><option value="yes">Area confirmed</option><option value="check">Area still to check</option>
        </select>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p><strong>{filtered.length.toLocaleString("en-GB")}</strong> leads</p>
        <button type="button" onClick={exportCsv} className="btn px-4 py-2">Download CSV</button>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-paper">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr className="border-b border-line">
              <th className="p-3">Trainer / business</th><th className="p-3">Area</th><th className="p-3">Specialism</th>
              <th className="p-3">Contact</th><th className="p-3">Status</th><th className="p-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.slice(0, limit).map((l) => {
              const m = messengerLink(l.facebook_url);
              return (
                <Fragment key={l.id}>
                  <tr className={`cursor-pointer align-top hover:bg-soft ${open === l.id ? "bg-soft" : ""}`} onClick={() => setOpen(open === l.id ? null : l.id)}>
                    <td className="p-3"><p className="font-semibold">{l.name}</p><p className="text-xs text-muted">{l.list_city} list</p></td>
                    <td className="p-3">{l.area}{!/^yes/i.test(l.area_confirmed ?? "") && <p className="text-xs text-amber-800">Area to check</p>}</td>
                    <td className="p-3 text-xs">{l.specialism}</td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                        {m && <a className="rounded-full bg-accent px-2.5 py-1 text-paper hover:bg-ink" href={m} target="_blank" rel="noopener noreferrer">Message</a>}
                        {l.facebook_url && <a className="rounded-full bg-ink px-2.5 py-1 text-paper hover:bg-accent" href={l.facebook_url} target="_blank" rel="noopener noreferrer">Facebook</a>}
                        {l.instagram_url && <a className="rounded-full bg-ink px-2.5 py-1 text-paper hover:bg-accent" href={l.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</a>}
                        {l.website && <a className="rounded-full bg-ink px-2.5 py-1 text-paper hover:bg-accent" href={l.website} target="_blank" rel="noopener noreferrer">Website</a>}
                      </div>
                    </td>
                    <td className="p-3"><StatusPill status={l.status} />{l.last_contacted && <p className="mt-1 text-xs text-muted">{new Date(l.last_contacted).toLocaleDateString("en-GB")}</p>}</td>
                    <td className="max-w-[260px] p-3 text-xs text-muted"><p className="line-clamp-2">{l.notes}</p></td>
                  </tr>
                  {open === l.id && (
                    <tr className="bg-soft"><td colSpan={6} className="p-4">
                      <OutreachEditor statuses={statuses}
                        value={{ status: l.status, notes: l.notes ?? "", last_contacted: l.last_contacted }}
                        save={(u) => saveLeadOutreach(l.id, u)}
                        onSaved={(u) => setRows((rs) => rs.map((r) => r.id === l.id ? { ...r, status: u.status, notes: u.notes, last_contacted: u.last_contacted } : r))} />
                    </td></tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {filtered.length > limit && (
          <div className="p-4 text-center"><button type="button" className="btn-ghost px-4 py-2 text-xs" onClick={() => setLimit(limit + 200)}>Show more ({filtered.length - limit} left)</button></div>
        )}
      </div>
    </div>
  );
}
